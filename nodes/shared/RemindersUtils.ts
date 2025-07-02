import { IExecuteSingleFunctions, ILoadOptionsFunctions, INodeListSearchItems, INodeListSearchResult } from 'n8n-workflow';

export class RemindersUtils {
	static async searchLists(
		context: ILoadOptionsFunctions,
		filter?: string,
	): Promise<INodeListSearchResult> {
		const returnData: INodeListSearchItems[] = [];

		try {
			const response = await context.helpers.httpRequestWithAuthentication.call(
				context,
				'remindersApi',
				{
					method: 'GET',
					url: '/lists',
					json: true,
				},
			);

			const lists = Array.isArray(response) ? response : [];

			for (const list of lists) {
				const listName = typeof list === 'string' ? list : list.name || list.title || String(list);
				const listUUID = typeof list === 'object' ? list.uuid : null;

				if (!filter || listName.toLowerCase().includes(filter.toLowerCase())) {
					returnData.push({
						name: listName,
						value: listName,
						url: listUUID ? `/lists/${listUUID}` : `/lists/${encodeURIComponent(listName)}`,
					});
				}
			}
		} catch (error) {
			// Return empty array if lists can't be loaded
		}

		return { results: returnData };
	}

	// Pre-fetch reminders for AI context
	static async preFetchReminders(
		context: IExecuteSingleFunctions,
		options: {
			limit?: number;
			completed?: boolean;
			includePrivateFields?: boolean;
		} = {}
	): Promise<any[]> {
		try {
			const { limit = 20, completed = false, includePrivateFields = true } = options;

			const queryParams: any = {
				completed: completed.toString(),
				limit: limit.toString(),
			};

			const response = await context.helpers.httpRequestWithAuthentication.call(
				context,
				'remindersApi',
				{
					method: 'GET',
					url: '/reminders',
					qs: queryParams,
					json: true,
				},
			);

			const reminders = Array.isArray(response) ? response : [];

			// Filter and enrich data for AI context
			return reminders.map((reminder: any) => {
				const enriched: any = {
					uuid: reminder.uuid,
					title: reminder.title,
					notes: reminder.notes,
					isCompleted: reminder.isCompleted,
					priority: reminder.priority,
					list: reminder.list,
					dueDate: reminder.dueDate,
				};

				// Include private API fields if requested
				if (includePrivateFields) {
					enriched.isSubtask = reminder.isSubtask || false;
					enriched.parentId = reminder.parentId;
					enriched.attachedUrl = reminder.attachedUrl;
					enriched.mailUrl = reminder.mailUrl;
					enriched.hasAttachments = !!(reminder.attachedUrl || reminder.mailUrl);
				}

				return enriched;
			});
		} catch (error) {
			return [];
		}
	}

	// Pre-fetch lists with metadata for AI context
	static async preFetchListsWithMetadata(
		context: IExecuteSingleFunctions,
	): Promise<any[]> {
		try {
			const response = await context.helpers.httpRequestWithAuthentication.call(
				context,
				'remindersApi',
				{
					method: 'GET',
					url: '/lists',
					json: true,
				},
			);

			return Array.isArray(response) ? response : [];
		} catch (error) {
			return [];
		}
	}

	static getBaseRequestDefaults() {
		return {
			baseURL: '={{$credentials.baseUrl}}',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				Authorization: '={{$credentials.apiToken ? "Bearer " + $credentials.apiToken : ""}}',
			},
		};
	}

	static getCredentialsConfig() {
		return [
			{
				name: 'remindersApi',
				required: true,
			},
		];
	}

	static getListNameResourceLocator(required: boolean = true) {
		return {
			displayName: 'List Name',
			name: 'listName',
			type: 'resourceLocator' as const,
			default: { mode: 'list', value: '' },
			required,
			modes: [
				{
					displayName: 'From List',
					name: 'list',
					type: 'list' as const,
					placeholder: 'Select a list...',
					typeOptions: {
						searchListMethod: 'searchLists',
						searchFilterRequired: false,
						searchable: true,
					},
				},
				{
					displayName: 'By Name',
					name: 'name',
					type: 'string' as const,
					placeholder: 'Shopping',
				},
				{
					displayName: 'By UUID',
					name: 'uuid',
					type: 'string' as const,
					placeholder: 'ABC123-DEF456-GHI789',
				},
			],
			description: 'Name or UUID of the reminder list',
		};
	}

	// Enhanced query parameter building for search
	static buildSearchQueryParams(context: IExecuteSingleFunctions, requestOptions: any) {
		const searchOptions = context.getNodeParameter('searchOptions', 0, {}) as any;
		const query: any = {};

		// Basic search parameters
		if (searchOptions.query) query.query = searchOptions.query;
		if (searchOptions.lists) query.lists = searchOptions.lists;
		if (searchOptions.listUUIDs) query.listUUIDs = searchOptions.listUUIDs;
		if (searchOptions.completed !== undefined && searchOptions.completed !== 'all') {
			query.completed = searchOptions.completed;
		}

		// Date filters
		if (searchOptions.dueBefore) query.dueBefore = new Date(searchOptions.dueBefore).toISOString();
		if (searchOptions.dueAfter) query.dueAfter = new Date(searchOptions.dueAfter).toISOString();
		if (searchOptions.modifiedAfter) query.modifiedAfter = new Date(searchOptions.modifiedAfter).toISOString();
		if (searchOptions.createdAfter) query.createdAfter = new Date(searchOptions.createdAfter).toISOString();

		// Boolean filters
		if (searchOptions.hasNotes !== undefined) query.hasNotes = searchOptions.hasNotes;
		if (searchOptions.hasDueDate !== undefined) query.hasDueDate = searchOptions.hasDueDate;

		// Private API filters (NEW)
		if (searchOptions.isSubtask !== undefined) query.isSubtask = searchOptions.isSubtask;
		if (searchOptions.hasAttachedUrl !== undefined) query.hasAttachedUrl = searchOptions.hasAttachedUrl;
		if (searchOptions.hasMailUrl !== undefined) query.hasMailUrl = searchOptions.hasMailUrl;

		// Priority filters
		if (searchOptions.priority && searchOptions.priority !== '') query.priority = searchOptions.priority;
		if (searchOptions.priorityMin !== undefined && searchOptions.priorityMin !== 0) query.priorityMin = searchOptions.priorityMin;
		if (searchOptions.priorityMax !== undefined && searchOptions.priorityMax !== 9) query.priorityMax = searchOptions.priorityMax;

		// Sorting and pagination
		if (searchOptions.sortBy) query.sortBy = searchOptions.sortBy;
		if (searchOptions.sortOrder) query.sortOrder = searchOptions.sortOrder;
		if (searchOptions.limit) query.limit = searchOptions.limit;

		requestOptions.qs = query;
		return requestOptions;
	}

	static buildQueryParams(context: IExecuteSingleFunctions, requestOptions: any, paramName: string = 'includeCompleted') {
		const includeCompleted = context.getNodeParameter(paramName, 0) as boolean;
		const query: any = {};

		if (includeCompleted) {
			query.completed = 'true';
		}

		requestOptions.qs = query;
		return requestOptions;
	}

	// Helper for priority level mapping
	static getPriorityMapping() {
		return [
			{ name: 'None (0)', value: 0 },
			{ name: 'Low (1)', value: 1 },
			{ name: 'Medium (5)', value: 5 },
			{ name: 'High (9)', value: 9 },
		];
	}

	// Helper for building webhook filter objects
	static buildWebhookFilter(context: IExecuteSingleFunctions): any {
		const filter: any = {};
		const filterOptions = context.getNodeParameter('filterOptions', 0, {}) as any;

		if (filterOptions.listNames) {
			filter.listNames = filterOptions.listNames.split(',').map((name: string) => name.trim());
		}
		if (filterOptions.listUUIDs) {
			filter.listUUIDs = filterOptions.listUUIDs.split(',').map((uuid: string) => uuid.trim());
		}
		if (filterOptions.completed && filterOptions.completed !== 'all') {
			filter.completed = filterOptions.completed;
		}
		if (filterOptions.priorityLevels && filterOptions.priorityLevels.length > 0) {
			filter.priorityLevels = filterOptions.priorityLevels;
		}
		if (filterOptions.hasQuery) {
			filter.hasQuery = filterOptions.hasQuery;
		}

		return filter;
	}

	// Helper to extract list identifier (name or UUID)
	static extractListIdentifier(listParam: any): string {
		if (typeof listParam === 'string') {
			return listParam;
		}
		if (typeof listParam === 'object') {
			return listParam.value || listParam.name || listParam.uuid || '';
		}
		return '';
	}

	// Helper to validate UUID format
	static isValidUUID(uuid: string): boolean {
		const uuidRegex = /^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}$/;
		return uuidRegex.test(uuid);
	}

	// Helper for reminder data enrichment
	static enrichReminderData(reminder: any): any {
		return {
			...reminder,
			// Add computed fields for AI context
			hasAttachments: !!(reminder.attachedUrl || reminder.mailUrl),
			priorityLevel: this.getPriorityLevelName(reminder.priority),
			isOverdue: reminder.dueDate ? new Date(reminder.dueDate) < new Date() : false,
			hasParent: !!reminder.parentId,
			hasSubtasks: false, // This would need to be computed separately
		};
	}

	// Helper for priority level names
	static getPriorityLevelName(priority: number): string {
		if (priority === 0) return 'none';
		if (priority >= 1 && priority <= 3) return 'low';
		if (priority >= 4 && priority <= 6) return 'medium';
		if (priority >= 7 && priority <= 9) return 'high';
		return 'unknown';
	}

		// Helper to get AI input parameter values
	static getAIParameter(inputData: any, paramName: string): any {
		if (!inputData?.json) return undefined;

		const json = inputData.json;
		// Check direct parameter
		if (json[paramName] !== undefined) return json[paramName];

		// Check nested parameters
		if (json.params?.[paramName] !== undefined) return json.params[paramName];
		if (json.parameters?.[paramName] !== undefined) return json.parameters[paramName];

		return undefined;
	}
}
