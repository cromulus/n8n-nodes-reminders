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
				
				if (!filter || listName.toLowerCase().includes(filter.toLowerCase())) {
					returnData.push({
						name: listName,
						value: listName,
					});
				}
			}
		} catch (error) {
			// Return empty array if lists can't be loaded
		}

		return { results: returnData };
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
			],
			description: 'Name of the reminder list',
		};
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
}