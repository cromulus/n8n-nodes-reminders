import {
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
} from 'n8n-workflow';

import { RemindersUtils } from '../shared/RemindersUtils';

export class RemindersTask implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Reminders Task',
		name: 'remindersTask',
		icon: 'file:reminders.svg',
		group: ['productivity'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Manage individual reminders with full CRUD operations and private API features',
		defaults: {
			name: 'Reminders Task',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
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
						name: 'Complete',
						value: 'complete',
						description: 'Mark a reminder as completed',
						action: 'Complete a reminder',
						routing: {
							request: {
								method: 'PATCH',
								url: '=/reminders/{{$parameter.uuid}}/complete',
							},
						},
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new reminder',
						action: 'Create a reminder',
						routing: {
							request: {
								method: 'POST',
								url: '=/lists/{{$parameter.listName.value || $parameter.listName}}/reminders',
								body: {
									title: '={{$parameter.title}}',
									notes: '={{$parameter.notes}}',
									dueDate: '={{$parameter.dueDate}}',
									priority: '={{$parameter.priority}}',
									startDate: '={{$parameter.startDate}}',
									parentId: '={{$parameter.privateFeatures?.parentId}}',
									attachedUrl: '={{$parameter.privateFeatures?.attachedUrl}}',
								},
							},
							output: {
								postReceive: [
									{
										type: 'rootProperty',
										properties: {
											property: 'data',
										},
									},
								],
							},
						},
					},
					{
						name: 'Create Subtask',
						value: 'createSubtask',
						description: 'Create a subtask under a parent reminder',
						action: 'Create a subtask',
						routing: {
							request: {
								method: 'POST',
								url: '=/lists/{{$parameter.listName.value || $parameter.listName}}/reminders',
								body: {
									title: '={{$parameter.title}}',
									notes: '={{$parameter.notes}}',
									dueDate: '={{$parameter.dueDate}}',
									priority: '={{$parameter.priority}}',
									startDate: '={{$parameter.startDate}}',
									parentId: '={{$parameter.parentUuid}}',
								},
							},
							output: {
								postReceive: [
									{
										type: 'rootProperty',
										properties: {
											property: 'data',
										},
									},
								],
							},
						},
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a reminder',
						action: 'Delete a reminder',
						routing: {
							request: {
								method: 'DELETE',
								url: '=/reminders/{{$parameter.uuid}}',
							},
						},
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a specific reminder by UUID',
						action: 'Get a reminder',
						routing: {
							request: {
								method: 'GET',
								url: '=/reminders/{{$parameter.uuid}}',
							},
						},
					},
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get many reminders across lists',
						action: 'Get many reminders',
						routing: {
							request: {
								method: 'GET',
								url: '/reminders',
								qs: {
									completed: '={{$parameter.includeCompleted}}',
								},
							},
						},
					},
					{
						name: 'Uncomplete',
						value: 'uncomplete',
						description: 'Mark a reminder as incomplete',
						action: 'Uncomplete a reminder',
						routing: {
							request: {
								method: 'PATCH',
								url: '=/reminders/{{$parameter.uuid}}/uncomplete',
							},
						},
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update an existing reminder',
						action: 'Update a reminder',
						routing: {
							request: {
								method: 'PATCH',
								url: '=/reminders/{{$parameter.uuid}}',
								body: {
									title: '={{$parameter.title}}',
									notes: '={{$parameter.notes}}',
									dueDate: '={{$parameter.dueDate}}',
									priority: '={{$parameter.priority}}',
									startDate: '={{$parameter.startDate}}',
									isCompleted: '={{$parameter.isCompleted}}',
									newListName: '={{$parameter.newListName?.value || $parameter.newListName}}',
									parentId: '={{$parameter.privateFeatures?.parentId}}',
									attachedUrl: '={{$parameter.privateFeatures?.attachedUrl}}',
								},
								ignoreHttpStatusErrors: false,
							},
						},
					},
				],
				default: 'getAll',
			},

			// List Name for Create operation
			{
				...RemindersUtils.getListNameResourceLocator(),
				displayOptions: {
					show: {
						operation: ['create'],
					},
				},
			},

			// UUID for operations that need it
			{
				displayName: 'Reminder UUID',
				name: 'uuid',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['get', 'update', 'delete', 'complete', 'uncomplete'],
					},
				},
				default: '',
				description: 'UUID of the reminder',
				placeholder: 'ABC123-DEF456-GHI789',
			},

			// Title for Create and Update
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['create'],
					},
				},
				default: '',
				description: 'Title of the reminder',
				placeholder: 'Buy groceries',
			},

			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['update'],
					},
				},
				default: '',
				description: 'New title for the reminder (leave empty to keep current)',
				placeholder: 'Buy groceries',
			},

			// Notes for Create and Update
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				typeOptions: {
					rows: 3,
				},
				displayOptions: {
					show: {
						operation: ['create', 'update'],
					},
				},
				default: '',
				description: 'Notes for the reminder',
				placeholder: 'Milk, bread, eggs',
			},

			// Due Date for Create and Update
			{
				displayName: 'Due Date',
				name: 'dueDate',
				type: 'dateTime',
				displayOptions: {
					show: {
						operation: ['create', 'update'],
					},
				},
				default: '',
				description: 'Due date for the reminder',
			},

			// Priority for Create and Update
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
				displayOptions: {
					show: {
						operation: ['create', 'update'],
					},
				},
				default: 'none',
				description: 'Priority level of the reminder',
			},

			// Completed status for Update
			{
				displayName: 'Completed',
				name: 'isCompleted',
				type: 'boolean',
				displayOptions: {
					show: {
						operation: ['update'],
					},
				},
				default: false,
				description: 'Whether the reminder is completed',
			},

			// New list name for Update (move reminder)
			{
				displayName: 'Move to List',
				name: 'newListName',
				type: 'resourceLocator',
				default: { mode: 'list', value: '' },
				displayOptions: {
					show: {
						operation: ['update'],
					},
				},
				modes: [
					{
						displayName: 'From List',
						name: 'list',
						type: 'list',
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
						type: 'string',
						placeholder: 'Shopping',
					},
				],
				description: 'Move reminder to this list (optional)',
			},

			// Include Completed for Get All
			{
				displayName: 'Include Completed',
				name: 'includeCompleted',
				type: 'boolean',
				displayOptions: {
					show: {
						operation: ['getAll'],
					},
				},
				default: false,
				description: 'Whether to include completed reminders in the results',
			},

			// Parent UUID for Create Subtask
			{
				displayName: 'Parent Reminder UUID',
				name: 'parentUuid',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['createSubtask'],
					},
				},
				default: '',
				description: 'UUID of the parent reminder to create subtask under',
				placeholder: 'ABC123-DEF456-GHI789',
			},

			// List Name for Create Subtask operation
			{
				...RemindersUtils.getListNameResourceLocator(),
				displayOptions: {
					show: {
						operation: ['createSubtask'],
					},
				},
			},

			// Title for Create Subtask
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['createSubtask'],
					},
				},
				default: '',
				description: 'Title of the subtask',
				placeholder: 'Research options',
			},

			// Notes for Create Subtask
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				typeOptions: {
					rows: 3,
				},
				displayOptions: {
					show: {
						operation: ['createSubtask'],
					},
				},
				default: '',
				description: 'Notes for the subtask',
				placeholder: 'Additional details',
			},

			// Due Date for Create Subtask
			{
				displayName: 'Due Date',
				name: 'dueDate',
				type: 'dateTime',
				displayOptions: {
					show: {
						operation: ['createSubtask'],
					},
				},
				default: '',
				description: 'Due date for the subtask',
			},

			// Priority for Create Subtask
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
				displayOptions: {
					show: {
						operation: ['createSubtask'],
					},
				},
				default: 'none',
				description: 'Priority level of the subtask',
			},

			// Private API Features for Create and Update
			{
				displayName: 'Private API Features',
				name: 'privateFeatures',
				type: 'collection',
				placeholder: 'Add Private API Feature',
				default: {},
				displayOptions: {
					show: {
						operation: ['create', 'update'],
					},
				},
				options: [
					{
						displayName: 'Parent Reminder UUID',
						name: 'parentId',
						type: 'string',
						default: '',
						description: 'UUID of parent reminder to make this a subtask (only for create)',
						placeholder: 'ABC123-DEF456-GHI789',
						displayOptions: {
							show: {
								'/operation': ['create'],
							},
						},
					},
					{
						displayName: 'Parent Reminder UUID',
						name: 'parentId',
						type: 'string',
						default: '',
						description: 'UUID of parent reminder (set to empty to remove subtask relationship)',
						placeholder: 'ABC123-DEF456-GHI789 or leave empty',
						displayOptions: {
							show: {
								'/operation': ['update'],
							},
						},
					},
					{
						displayName: 'Attached URL',
						name: 'attachedUrl',
						type: 'string',
						default: '',
						description: 'URL to attach to the reminder (private API feature)',
						placeholder: 'https://example.com/document',
					},
				],
			},

			// Start Date for Create and Update (newer API feature)
			{
				displayName: 'Start Date',
				name: 'startDate',
				type: 'dateTime',
				displayOptions: {
					show: {
						operation: ['create', 'update', 'createSubtask'],
					},
				},
				default: '',
				description: 'Start date for the reminder',
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