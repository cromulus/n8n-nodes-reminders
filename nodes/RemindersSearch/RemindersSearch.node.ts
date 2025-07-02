import {
	IExecuteSingleFunctions,
	ILoadOptionsFunctions,
	INodeListSearchResult,
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
		subtitle: '={{$parameter["operation"]}}',
		description: 'Advanced search through reminders with comprehensive filtering, including private API features like subtasks and URL attachments',
		defaults: {
			name: 'Reminders Search',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		usableAsTool: true,
		credentials: RemindersUtils.getCredentialsConfig(),
		requestDefaults: RemindersUtils.getBaseRequestDefaults(),
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Search Reminders',
						value: 'search',
						action: 'Search reminders with filters',
						description: 'Search reminders with advanced filtering options including private API features',
						routing: {
							request: {
								method: 'GET',
								url: '/search',
							},
							send: {
								preSend: [
									function (this: IExecuteSingleFunctions, requestOptions: any) {
										return RemindersUtils.buildSearchQueryParams(this, requestOptions);
									},
								],
							},
							output: {
								postReceive: [
									{
										type: 'set',
										properties: {
											value: '={{ $response.body.map(item => $("RemindersUtils").enrichReminderData(item)) }}',
										},
									},
								],
							},
						},
					},
					{
						name: 'Find Subtasks',
						value: 'findSubtasks',
						action: 'Find all subtasks',
						description: 'Find all reminders that are subtasks (requires private API)',
						routing: {
							request: {
								method: 'GET',
								url: '/search',
								qs: {
									isSubtask: 'true',
									sortBy: 'list',
									sortOrder: 'asc',
								},
							},
							output: {
								postReceive: [
									{
										type: 'set',
										properties: {
											value: '={{ $response.body.map(item => $("RemindersUtils").enrichReminderData(item)) }}',
										},
									},
								],
							},
						},
					},
					{
						name: 'Find Reminders with Attachments',
						value: 'findWithAttachments',
						action: 'Find reminders with attachments',
						description: 'Find reminders with URL attachments or mail links (private API)',
						routing: {
							request: {
								method: 'GET',
								url: '/search',
								qs: {
									hasAttachedUrl: 'true',
									sortBy: 'lastModified',
									sortOrder: 'desc',
								},
							},
							output: {
								postReceive: [
									{
										type: 'set',
										properties: {
											value: '={{ $response.body.map(item => $("RemindersUtils").enrichReminderData(item)) }}',
										},
									},
								],
							},
						},
					},
					{
						name: 'Find Overdue Tasks',
						value: 'findOverdue',
						action: 'Find overdue reminders',
						description: 'Find incomplete reminders that are past their due date',
						routing: {
							request: {
								method: 'GET',
								url: '/search',
								qs: {
									dueBefore: '={{ new Date().toISOString() }}',
									completed: 'false',
									sortBy: 'dueDate',
									sortOrder: 'asc',
								},
							},
							output: {
								postReceive: [
									{
										type: 'set',
										properties: {
											value: '={{ $response.body.map(item => $("RemindersUtils").enrichReminderData(item)) }}',
										},
									},
								],
							},
						},
					},
				],
				default: 'search',
			},

			// Pre-fetch option for AI context
			{
				displayName: 'AI Context Options',
				name: 'aiContextOptions',
				type: 'collection',
				placeholder: 'Add AI Context Option',
				default: {},
				displayOptions: {
					show: {
						operation: ['search'],
					},
				},
				options: [
					{
						displayName: 'Pre-Fetch Recent Reminders',
						name: 'preFetchRecent',
						type: 'boolean',
						default: true,
						description: 'Pre-fetch recent reminders to provide AI with context about current tasks',
					},
					{
						displayName: 'Pre-Fetch Lists Metadata',
						name: 'preFetchLists',
						type: 'boolean',
						default: true,
						description: 'Pre-fetch list information to help AI understand available lists',
					},
					{
						displayName: 'Include Private API Fields',
						name: 'includePrivateFields',
						type: 'boolean',
						default: true,
						description: 'Include subtask, URL attachment, and mail link information in results',
					},
					{
						displayName: 'Context Limit',
						name: 'contextLimit',
						type: 'number',
						default: 20,
						typeOptions: {
							minValue: 5,
							maxValue: 100,
						},
						description: 'Number of recent reminders to include in AI context',
					},
				],
			},

			// Advanced search options
			{
				displayName: 'Search Options',
				name: 'searchOptions',
				type: 'collection',
				placeholder: 'Add Search Option',
				default: {},
				displayOptions: {
					show: {
						operation: ['search'],
					},
				},
				options: [
					{
						displayName: 'Search Text',
						name: 'query',
						type: 'string',
						default: '',
						description: 'Text to search for in reminder titles and notes',
						placeholder: 'urgent OR meeting',
					},
					{
						displayName: 'Completion Status',
						name: 'completed',
						type: 'options',
						options: [
							{
								name: 'All',
								value: 'all',
							},
							{
								name: 'Completed Only',
								value: 'true',
							},
							{
								name: 'Incomplete Only',
								value: 'false',
							},
						],
						default: 'all',
						description: 'Filter by completion status',
					},
					{
						displayName: 'List Names',
						name: 'lists',
						type: 'string',
						default: '',
						description: 'Comma-separated list of list names to search in',
						placeholder: 'Shopping,Work,Personal',
					},
					{
						displayName: 'List UUIDs',
						name: 'listUUIDs',
						type: 'string',
						default: '',
						description: 'Comma-separated list of list UUIDs to search in (more reliable than names)',
						placeholder: 'uuid1,uuid2,uuid3',
					},

					// Date filters
					{
						displayName: 'Due Before',
						name: 'dueBefore',
						type: 'dateTime',
						default: '',
						description: 'Show only reminders due before this date',
					},
					{
						displayName: 'Due After',
						name: 'dueAfter',
						type: 'dateTime',
						default: '',
						description: 'Show only reminders due after this date',
					},
					{
						displayName: 'Created After',
						name: 'createdAfter',
						type: 'dateTime',
						default: '',
						description: 'Show only reminders created after this date',
					},
					{
						displayName: 'Modified After',
						name: 'modifiedAfter',
						type: 'dateTime',
						default: '',
						description: 'Show only reminders modified after this date',
					},

					// Boolean filters
					{
						displayName: 'Has Due Date',
						name: 'hasDueDate',
						type: 'boolean',
						default: false,
						description: 'Whether to filter reminders that have a due date',
					},
					{
						displayName: 'Has Notes',
						name: 'hasNotes',
						type: 'boolean',
						default: false,
						description: 'Whether to filter reminders that have notes',
					},

					// NEW Private API filters
					{
						displayName: 'Has Mail Links',
						name: 'hasMailUrl',
						type: 'options',
						options: [
							{
								name: 'All',
								value: 'all',
							},
							{
								name: 'With Mail Links',
								value: 'true',
							},
							{
								name: 'Without Mail Links',
								value: 'false',
							},
						],
						default: 'all',
						description: 'Whether to filter by mail link presence (private API)',
					},
					{
						displayName: 'Has URL Attachments',
						name: 'hasAttachedUrl',
						type: 'options',
						options: [
							{
								name: 'All',
								value: 'all',
							},
							{
								name: 'With URL Attachments',
								value: 'true',
							},
							{
								name: 'Without URL Attachments',
								value: 'false',
							},
						],
						default: 'all',
						description: 'Whether to filter by URL attachment presence (private API)',
					},
					{
						displayName: 'Is Subtask',
						name: 'isSubtask',
						type: 'options',
						options: [
							{
								name: 'All',
								value: 'all',
							},
							{
								name: 'Main Tasks Only',
								value: 'false',
							},
							{
								name: 'Subtasks Only',
								value: 'true',
							},
						],
						default: 'all',
						description: 'Whether to filter by subtask status (requires private API)',
					},

					// Priority filters
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
						displayName: 'Priority Level',
						name: 'priority',
						type: 'options',
						options: [
							{
								name: 'Any',
								value: '',
							},
							{
								name: 'High',
								value: 'high',
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
								name: 'None',
								value: 'none',
							},
						],
						default: '',
						description: 'Filter by exact priority level',
					},

					// Sorting and pagination
					{
						displayName: 'Limit Results',
						name: 'limit',
						type: 'number',
						typeOptions: {
							minValue: 1,
							maxValue: 1000,
						},
						default: 50,
						description: 'Maximum number of results to return',
					},
					{
						displayName: 'Sort By',
						name: 'sortBy',
						type: 'options',
						options: [
							{
								name: 'Title',
								value: 'title',
							},
							{
								name: 'Due Date',
								value: 'dueDate',
							},
							{
								name: 'Creation Date',
								value: 'creationDate',
							},
							{
								name: 'Last Modified',
								value: 'lastModified',
							},
							{
								name: 'Priority',
								value: 'priority',
							},
							{
								name: 'List',
								value: 'list',
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
				],
			},

			// Quick search options for predefined searches
			{
				displayName: 'Quick Search Options',
				name: 'quickSearchOptions',
				type: 'collection',
				placeholder: 'Add Quick Search Option',
				default: {},
				displayOptions: {
					show: {
						operation: ['findSubtasks', 'findWithAttachments', 'findOverdue'],
					},
				},
				options: [
					{
						displayName: 'Limit Results',
						name: 'limit',
						type: 'number',
						typeOptions: {
							minValue: 1,
							maxValue: 1000,
						},
						default: 50,
						description: 'Maximum number of results to return',
					},
					{
						displayName: 'Include Completed',
						name: 'includeCompleted',
						type: 'boolean',
						default: false,
						description: 'Include completed reminders in results',
						displayOptions: {
							show: {
								'/operation': ['findSubtasks', 'findWithAttachments'],
							},
						},
					},
				],
			},
		],
	};

	methods = {
		listSearch: {
			async searchLists(
				this: ILoadOptionsFunctions,
				filter?: string,
			): Promise<INodeListSearchResult> {
				return RemindersUtils.searchLists(this, filter);
			},
		},
	};
}
