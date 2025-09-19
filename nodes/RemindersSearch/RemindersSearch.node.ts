import {
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
} from 'n8n-workflow';

import { RemindersUtils } from '../shared/RemindersUtils';

export class RemindersSearch implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Reminders Search',
		name: 'remindersSearch',
		icon: 'file:reminders.svg',
		group: ['productivity'],
		version: 1,
		subtitle: 'Search Reminders',
		description: 'Advanced search capabilities for macOS Reminders with private API filters',
		defaults: {
			name: 'Reminders Search',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: RemindersUtils.getCredentialsConfig(),
		requestDefaults: RemindersUtils.getBaseRequestDefaults(),
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'hidden',
				default: 'search',
			},

			// Search text
			{
				displayName: 'Search Text',
				name: 'query',
				type: 'string',
				default: '',
				description: 'Text to search for in reminder titles and notes (leave empty to find all)',
				placeholder: 'meeting notes',
				routing: {
					request: {
						method: 'GET',
						url: '/search',
						qs: {
							query: '={{$parameter.query}}',
							reminderId: '={{$parameter.reminderId}}',
							lists: '={{$parameter.filterOptions?.lists}}',
							listUUIDs: '={{$parameter.filterOptions?.listUUIDs}}',
							completed: '={{$parameter.filterOptions?.completed || "false"}}',
							dueBefore: '={{$parameter.dateFilters?.dueBefore}}',
							dueAfter: '={{$parameter.dateFilters?.dueAfter}}',
							modifiedAfter: '={{$parameter.dateFilters?.modifiedAfter}}',
							createdAfter: '={{$parameter.dateFilters?.createdAfter}}',
							hasNotes: '={{$parameter.presenceFilters?.hasNotes}}',
							hasDueDate: '={{$parameter.presenceFilters?.hasDueDate}}',
							isSubtask: '={{$parameter.privateApiFilters?.isSubtask}}',
							hasAttachedUrl: '={{$parameter.privateApiFilters?.hasAttachedUrl}}',
							hasMailUrl: '={{$parameter.privateApiFilters?.hasMailUrl}}',
							priority: '={{$parameter.priorityFilter?.priority}}',
							priorityMin: '={{$parameter.priorityFilter?.priorityMin}}',
							priorityMax: '={{$parameter.priorityFilter?.priorityMax}}',
							sortBy: '={{$parameter.sortingOptions?.sortBy || "lastModified"}}',
							sortOrder: '={{$parameter.sortingOptions?.sortOrder || "desc"}}',
							limit: '={{$parameter.sortingOptions?.limit || 50}}',
						},
					},
				},
			},

			// Reminder UUID search
			{
				displayName: 'Reminder UUID',
				name: 'reminderId',
				type: 'string',
				default: '',
				description: 'Search for a specific reminder by UUID (overrides other search criteria)',
				placeholder: 'ABC123-DEF456-GHI789',
			},

			// Filter Options collection
			{
				displayName: 'Filter Options',
				name: 'filterOptions',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				options: [
					{
						displayName: 'Lists',
						name: 'lists',
						type: 'string',
						default: '',
						description: 'Comma-separated list names to search in (leave empty for all lists)',
						placeholder: 'Work, Personal, Shopping',
					},
					{
						displayName: 'List UUIDs',
						name: 'listUUIDs',
						type: 'string',
						default: '',
						description: 'Comma-separated list UUIDs to search in',
						placeholder: 'UUID1, UUID2, UUID3',
					},
					{
						displayName: 'Completion Status',
						name: 'completed',
						type: 'options',
						options: [
							{
								name: 'Incomplete Only',
								value: 'false',
							},
							{
								name: 'Complete Only',
								value: 'true',
							},
							{
								name: 'All',
								value: 'all',
							},
						],
						default: 'false',
						description: 'Filter by completion status',
					},
				],
			},

			// Date Filters collection
			{
				displayName: 'Date Filters',
				name: 'dateFilters',
				type: 'collection',
				placeholder: 'Add Date Filter',
				default: {},
				options: [
					{
						displayName: 'Due Before',
						name: 'dueBefore',
						type: 'dateTime',
						default: '',
						description: 'Find reminders due before this date',
					},
					{
						displayName: 'Due After',
						name: 'dueAfter',
						type: 'dateTime',
						default: '',
						description: 'Find reminders due after this date',
					},
					{
						displayName: 'Modified After',
						name: 'modifiedAfter',
						type: 'dateTime',
						default: '',
						description: 'Find reminders modified after this date',
					},
					{
						displayName: 'Created After',
						name: 'createdAfter',
						type: 'dateTime',
						default: '',
						description: 'Find reminders created after this date',
					},
				],
			},

			// Presence Filters collection
			{
				displayName: 'Presence Filters',
				name: 'presenceFilters',
				type: 'collection',
				placeholder: 'Add Presence Filter',
				default: {},
				options: [
					{
						displayName: 'Has Notes',
						name: 'hasNotes',
						type: 'boolean',
						default: false,
						description: 'Whether to filter for reminders with notes',
					},
					{
						displayName: 'Has Due Date',
						name: 'hasDueDate',
						type: 'boolean',
						default: false,
						description: 'Whether to filter for reminders with due dates',
					},
				],
			},

			// Priority Filter collection
			{
				displayName: 'Priority Filter',
				name: 'priorityFilter',
				type: 'collection',
				placeholder: 'Add Priority Filter',
				default: {},
				options: [
					{
						displayName: 'Priority',
						name: 'priority',
						type: 'options',
						options: [
							{
								name: 'None',
								value: 'none',
							},
							{
								name: 'Low',
								value: 'low',
							},
							{
								name: 'Medium',
								value: 'medium',
							},
							{
								name: 'High',
								value: 'high',
							},
						],
						default: 'none',
						description: 'Exact priority level to match',
					},
					{
						displayName: 'Minimum Priority',
						name: 'priorityMin',
						type: 'number',
						typeOptions: {
							minValue: 0,
							maxValue: 9,
						},
						default: 0,
						description: 'Minimum priority level (0-9)',
					},
					{
						displayName: 'Maximum Priority',
						name: 'priorityMax',
						type: 'number',
						typeOptions: {
							minValue: 0,
							maxValue: 9,
						},
						default: 9,
						description: 'Maximum priority level (0-9)',
					},
				],
			},

			// Private API Filters collection
			{
				displayName: 'Private API Filters',
				name: 'privateApiFilters',
				type: 'collection',
				placeholder: 'Add Private API Filter',
				default: {},
				options: [
					{
						displayName: 'Is Subtask',
						name: 'isSubtask',
						type: 'boolean',
						default: false,
						description: 'Whether to filter for subtasks only',
					},
					{
						displayName: 'Has Attached URL',
						name: 'hasAttachedUrl',
						type: 'boolean',
						default: false,
						description: 'Whether to filter for reminders with URL attachments',
					},
					{
						displayName: 'Has Mail URL',
						name: 'hasMailUrl',
						type: 'boolean',
						default: false,
						description: 'Whether to filter for reminders with mail links',
					},
				],
			},

			// Sorting Options collection
			{
				displayName: 'Sorting Options',
				name: 'sortingOptions',
				type: 'collection',
				placeholder: 'Add Sorting Option',
				default: {},
				options: [
					{
						displayName: 'Sort By',
						name: 'sortBy',
						type: 'options',
						options: [
							{
								name: 'Creation Date',
								value: 'creationDate',
							},
							{
								name: 'Due Date',
								value: 'dueDate',
							},
							{
								name: 'Last Modified',
								value: 'lastModified',
							},
							{
								name: 'List',
								value: 'list',
							},
							{
								name: 'Priority',
								value: 'priority',
							},
							{
								name: 'Title',
								value: 'title',
							},
						],
						default: 'lastModified',
						description: 'Field to sort results by',
					},
					{
						displayName: 'Sort Order',
						name: 'sortOrder',
						type: 'options',
						options: [
							{
								name: 'Ascending',
								value: 'asc',
							},
							{
								name: 'Descending',
								value: 'desc',
							},
						],
						default: 'desc',
						description: 'Sort direction',
					},
					{
						displayName: 'Limit',
						name: 'limit',
						type: 'number',
						typeOptions: {
							minValue: 1,
						},
						default: 50,
						description: 'Max number of results to return',
					},
				],
			},
		],
	};

	methods = {
		listSearch: {
			async searchLists(
				this: any,
				filter?: string,
			): Promise<any> {
				return RemindersUtils.searchLists(this, filter);
			},
		},
	};
}