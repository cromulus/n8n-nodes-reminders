"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Reminders = void 0;
class Reminders {
    constructor() {
        this.description = {
            displayName: 'Reminders',
            name: 'reminders',
            icon: 'file:reminders.svg',
            group: ['productivity'],
            version: 1,
            subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
            description: 'Interact with macOS Reminders',
            defaults: {
                name: 'Reminders',
            },
            inputs: ["main"],
            outputs: ["main"],
            usableAsTool: true,
            credentials: [
                {
                    name: 'remindersApi',
                    required: true,
                },
            ],
            requestDefaults: {
                baseURL: '={{$credentials.baseUrl}}',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: '={{$credentials.apiToken ? "Bearer " + $credentials.apiToken : ""}}',
                },
            },
            properties: [
                {
                    displayName: 'Resource',
                    name: 'resource',
                    type: 'options',
                    noDataExpression: true,
                    options: [
                        {
                            name: 'List',
                            value: 'list',
                        },
                        {
                            name: 'Reminder',
                            value: 'reminder',
                        },
                        {
                            name: 'Search',
                            value: 'search',
                        },
                        {
                            name: 'Webhook',
                            value: 'webhook',
                        },
                    ],
                    default: 'reminder',
                },
                {
                    displayName: 'Operation',
                    name: 'operation',
                    type: 'options',
                    noDataExpression: true,
                    displayOptions: {
                        show: {
                            resource: ['list'],
                        },
                    },
                    options: [
                        {
                            name: 'Get Many',
                            value: 'getAll',
                            action: 'Get many lists',
                            description: 'Retrieve many reminder lists',
                            routing: {
                                request: {
                                    method: 'GET',
                                    url: '/lists',
                                },
                            },
                        },
                        {
                            name: 'Get Reminders',
                            value: 'getReminders',
                            action: 'Get reminders from list',
                            description: 'Get all reminders from a specific list',
                            routing: {
                                request: {
                                    method: 'GET',
                                    url: '=/lists/{{encodeURIComponent($parameter.listName)}}',
                                },
                            },
                        },
                    ],
                    default: 'getAll',
                },
                {
                    displayName: 'Operation',
                    name: 'operation',
                    type: 'options',
                    noDataExpression: true,
                    displayOptions: {
                        show: {
                            resource: ['reminder'],
                        },
                    },
                    options: [
                        {
                            name: 'Complete',
                            value: 'complete',
                            action: 'Complete a reminder',
                            description: 'Mark a reminder as completed',
                            routing: {
                                request: {
                                    method: 'PATCH',
                                    url: '=/reminders/{{$parameter.uuid}}/complete',
                                },
                                output: {
                                    postReceive: [
                                        {
                                            type: 'set',
                                            properties: {
                                                value: '={{ { "success": true, "uuid": $parameter.uuid, "completed": true } }}',
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                        {
                            name: 'Create',
                            value: 'create',
                            action: 'Create a reminder',
                            description: 'Create a new reminder',
                            routing: {
                                request: {
                                    method: 'POST',
                                    url: '=/lists/{{encodeURIComponent($parameter.listName)}}/reminders',
                                },
                                send: {
                                    type: 'body',
                                    property: 'title,notes,dueDate,priority',
                                },
                            },
                        },
                        {
                            name: 'Delete',
                            value: 'delete',
                            action: 'Delete a reminder',
                            description: 'Delete a reminder by UUID',
                            routing: {
                                request: {
                                    method: 'DELETE',
                                    url: '=/reminders/{{$parameter.uuid}}',
                                },
                                output: {
                                    postReceive: [
                                        {
                                            type: 'set',
                                            properties: {
                                                value: '={{ { "success": true, "uuid": $parameter.uuid } }}',
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                        {
                            name: 'Get',
                            value: 'get',
                            action: 'Get a reminder',
                            description: 'Get a reminder by UUID',
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
                            action: 'Get many reminders',
                            description: 'Get many reminders across',
                            routing: {
                                request: {
                                    method: 'GET',
                                    url: '/reminders',
                                },
                            },
                        },
                        {
                            name: 'Uncomplete',
                            value: 'uncomplete',
                            action: 'Uncomplete a reminder',
                            description: 'Mark a reminder as not completed',
                            routing: {
                                request: {
                                    method: 'PATCH',
                                    url: '=/reminders/{{$parameter.uuid}}/uncomplete',
                                },
                                output: {
                                    postReceive: [
                                        {
                                            type: 'set',
                                            properties: {
                                                value: '={{ { "success": true, "uuid": $parameter.uuid, "completed": false } }}',
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                        {
                            name: 'Update',
                            value: 'update',
                            action: 'Update a reminder',
                            description: 'Update a reminder by UUID',
                            routing: {
                                request: {
                                    method: 'PATCH',
                                    url: '=/reminders/{{$parameter.uuid}}',
                                },
                                send: {
                                    type: 'body',
                                    property: 'title,notes,dueDate,priority,isCompleted',
                                },
                            },
                        },
                    ],
                    default: 'getAll',
                },
                {
                    displayName: 'Operation',
                    name: 'operation',
                    type: 'options',
                    noDataExpression: true,
                    displayOptions: {
                        show: {
                            resource: ['search'],
                        },
                    },
                    options: [
                        {
                            name: 'Search Reminders',
                            value: 'search',
                            action: 'Search reminders',
                            description: 'Search reminders with advanced filtering',
                            routing: {
                                request: {
                                    method: 'GET',
                                    url: '/search',
                                },
                            },
                        },
                    ],
                    default: 'search',
                },
                {
                    displayName: 'Operation',
                    name: 'operation',
                    type: 'options',
                    noDataExpression: true,
                    displayOptions: {
                        show: {
                            resource: ['webhook'],
                        },
                    },
                    options: [
                        {
                            name: 'Create',
                            value: 'create',
                            action: 'Create a webhook',
                            description: 'Create a new webhook configuration',
                            routing: {
                                request: {
                                    method: 'POST',
                                    url: '/webhooks',
                                },
                                send: {
                                    type: 'body',
                                    property: 'url,name,filter',
                                },
                            },
                        },
                        {
                            name: 'Delete',
                            value: 'delete',
                            action: 'Delete a webhook',
                            description: 'Delete a webhook configuration',
                            routing: {
                                request: {
                                    method: 'DELETE',
                                    url: '=/webhooks/{{$parameter.webhookId}}',
                                },
                            },
                        },
                        {
                            name: 'Get Many',
                            value: 'getAll',
                            action: 'Get many webhooks',
                            description: 'Get many webhook configurations',
                            routing: {
                                request: {
                                    method: 'GET',
                                    url: '/webhooks',
                                },
                            },
                        },
                        {
                            name: 'Test',
                            value: 'test',
                            action: 'Test a webhook',
                            description: 'Send a test event to a webhook',
                            routing: {
                                request: {
                                    method: 'POST',
                                    url: '=/webhooks/{{$parameter.webhookId}}/test',
                                },
                            },
                        },
                        {
                            name: 'Update',
                            value: 'update',
                            action: 'Update a webhook',
                            description: 'Update a webhook configuration',
                            routing: {
                                request: {
                                    method: 'PATCH',
                                    url: '=/webhooks/{{$parameter.webhookId}}',
                                },
                                send: {
                                    type: 'body',
                                    property: 'url,name,isActive,filter',
                                },
                            },
                        },
                    ],
                    default: 'getAll',
                },
                {
                    displayName: 'List Name',
                    name: 'listName',
                    type: 'string',
                    required: true,
                    displayOptions: {
                        show: {
                            resource: ['list', 'reminder'],
                            operation: ['getReminders', 'create'],
                        },
                    },
                    default: '',
                    description: 'Name of the reminder list',
                    placeholder: 'Shopping',
                },
                {
                    displayName: 'Include Completed',
                    name: 'includeCompleted',
                    type: 'boolean',
                    displayOptions: {
                        show: {
                            resource: ['list', 'reminder'],
                            operation: ['getReminders', 'getAll'],
                        },
                    },
                    default: false,
                    description: 'Whether to include completed reminders in results',
                },
                {
                    displayName: 'Reminder UUID',
                    name: 'uuid',
                    type: 'string',
                    required: true,
                    displayOptions: {
                        show: {
                            resource: ['reminder'],
                            operation: ['get', 'update', 'delete', 'complete', 'uncomplete'],
                        },
                    },
                    default: '',
                    description: 'UUID of the reminder',
                    placeholder: 'ABC123-DEF456-GHI789',
                },
                {
                    displayName: 'Title',
                    name: 'title',
                    type: 'string',
                    required: true,
                    displayOptions: {
                        show: {
                            resource: ['reminder'],
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
                            resource: ['reminder'],
                            operation: ['update'],
                        },
                    },
                    default: '',
                    description: 'New title for the reminder (leave empty to keep current)',
                    placeholder: 'Buy groceries',
                },
                {
                    displayName: 'Notes',
                    name: 'notes',
                    type: 'string',
                    typeOptions: {
                        rows: 3,
                    },
                    displayOptions: {
                        show: {
                            resource: ['reminder'],
                            operation: ['create', 'update'],
                        },
                    },
                    default: '',
                    description: 'Notes for the reminder',
                    placeholder: 'Milk, bread, eggs',
                },
                {
                    displayName: 'Due Date',
                    name: 'dueDate',
                    type: 'dateTime',
                    displayOptions: {
                        show: {
                            resource: ['reminder'],
                            operation: ['create', 'update'],
                        },
                    },
                    default: '',
                    description: 'Due date for the reminder',
                },
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
                            resource: ['reminder'],
                            operation: ['create', 'update'],
                        },
                    },
                    default: 'none',
                    description: 'Priority level of the reminder',
                },
                {
                    displayName: 'Completed',
                    name: 'isCompleted',
                    type: 'boolean',
                    displayOptions: {
                        show: {
                            resource: ['reminder'],
                            operation: ['update'],
                        },
                    },
                    default: false,
                    description: 'Whether the reminder is completed',
                },
                {
                    displayName: 'Query',
                    name: 'query',
                    type: 'string',
                    displayOptions: {
                        show: {
                            resource: ['search'],
                            operation: ['search'],
                        },
                    },
                    default: '',
                    description: 'Text to search for in reminder titles and notes',
                    placeholder: 'groceries',
                },
                {
                    displayName: 'Lists',
                    name: 'lists',
                    type: 'string',
                    displayOptions: {
                        show: {
                            resource: ['search'],
                            operation: ['search'],
                        },
                    },
                    default: '',
                    description: 'Comma-separated list of list names to search in',
                    placeholder: 'Shopping,Work',
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
                    displayOptions: {
                        show: {
                            resource: ['search'],
                            operation: ['search'],
                        },
                    },
                    default: 'all',
                    description: 'Filter by completion status',
                },
                {
                    displayName: 'Webhook ID',
                    name: 'webhookId',
                    type: 'string',
                    required: true,
                    displayOptions: {
                        show: {
                            resource: ['webhook'],
                            operation: ['update', 'delete', 'test'],
                        },
                    },
                    default: '',
                    description: 'UUID of the webhook configuration',
                    placeholder: 'webhook-uuid-123',
                },
                {
                    displayName: 'Webhook URL',
                    name: 'url',
                    type: 'string',
                    required: true,
                    displayOptions: {
                        show: {
                            resource: ['webhook'],
                            operation: ['create'],
                        },
                    },
                    default: '',
                    description: 'URL to send webhook notifications to',
                    placeholder: 'https://your-server.com/webhook',
                },
                {
                    displayName: 'Webhook URL',
                    name: 'url',
                    type: 'string',
                    displayOptions: {
                        show: {
                            resource: ['webhook'],
                            operation: ['update'],
                        },
                    },
                    default: '',
                    description: 'New URL to send webhook notifications to',
                    placeholder: 'https://your-server.com/webhook',
                },
                {
                    displayName: 'Webhook Name',
                    name: 'name',
                    type: 'string',
                    required: true,
                    displayOptions: {
                        show: {
                            resource: ['webhook'],
                            operation: ['create'],
                        },
                    },
                    default: '',
                    description: 'Name for the webhook configuration',
                    placeholder: 'Task Notifications',
                },
                {
                    displayName: 'Webhook Name',
                    name: 'name',
                    type: 'string',
                    displayOptions: {
                        show: {
                            resource: ['webhook'],
                            operation: ['update'],
                        },
                    },
                    default: '',
                    description: 'New name for the webhook configuration',
                    placeholder: 'Task Notifications',
                },
                {
                    displayName: 'Active',
                    name: 'isActive',
                    type: 'boolean',
                    displayOptions: {
                        show: {
                            resource: ['webhook'],
                            operation: ['update'],
                        },
                    },
                    default: true,
                    description: 'Whether the webhook is active',
                },
                {
                    displayName: 'Filter',
                    name: 'filter',
                    type: 'json',
                    displayOptions: {
                        show: {
                            resource: ['webhook'],
                            operation: ['create', 'update'],
                        },
                    },
                    default: '{}',
                    description: 'JSON filter configuration for webhook',
                    placeholder: '{"listNames": ["Shopping", "Work"], "completed": "all"}',
                },
            ],
        };
    }
}
exports.Reminders = Reminders;
//# sourceMappingURL=Reminders.node.js.map