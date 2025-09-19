"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemindersWebhook = void 0;
const RemindersUtils_1 = require("../shared/RemindersUtils");
class RemindersWebhook {
    constructor() {
        this.description = {
            displayName: 'Reminders Webhook',
            name: 'remindersWebhook',
            icon: 'file:reminders.svg',
            group: ['productivity'],
            version: 1,
            subtitle: '={{$parameter["operation"]}}',
            description: 'Manage webhook notifications for macOS Reminders events with advanced filtering',
            defaults: {
                name: 'Reminders Webhook',
            },
            inputs: ["main"],
            outputs: ["main"],
            credentials: RemindersUtils_1.RemindersUtils.getCredentialsConfig(),
            requestDefaults: RemindersUtils_1.RemindersUtils.getBaseRequestDefaults(),
            properties: [
                {
                    displayName: 'Operation',
                    name: 'operation',
                    type: 'options',
                    noDataExpression: true,
                    options: [
                        {
                            name: 'Create Webhook',
                            value: 'create',
                            action: 'Create a new webhook',
                            description: 'Create a new webhook endpoint with filtering options',
                            routing: {
                                request: {
                                    method: 'POST',
                                    url: '/webhooks',
                                    body: {
                                        url: '={{$parameter.url}}',
                                        name: '={{$parameter.name}}',
                                        isActive: '={{$parameter.isActive}}',
                                        filters: '={{$parameter.filters}}',
                                    },
                                },
                            },
                        },
                        {
                            name: 'Delete Webhook',
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
                            name: 'Get Webhook',
                            value: 'get',
                            action: 'Get a specific webhook',
                            description: 'Get details of a specific webhook configuration',
                            routing: {
                                request: {
                                    method: 'GET',
                                    url: '=/webhooks/{{$parameter.webhookId}}',
                                },
                            },
                        },
                        {
                            name: 'List Webhooks',
                            value: 'list',
                            action: 'List all webhooks',
                            description: 'Retrieve all configured webhook endpoints',
                            routing: {
                                request: {
                                    method: 'GET',
                                    url: '/webhooks',
                                },
                            },
                        },
                        {
                            name: 'Test Webhook',
                            value: 'test',
                            action: 'Test webhook delivery',
                            description: 'Send a test notification to verify webhook is working',
                            routing: {
                                request: {
                                    method: 'POST',
                                    url: '=/webhooks/{{$parameter.webhookId}}/test',
                                },
                            },
                        },
                        {
                            name: 'Update Webhook',
                            value: 'update',
                            action: 'Update webhook configuration',
                            description: 'Update an existing webhook configuration',
                            routing: {
                                request: {
                                    method: 'PATCH',
                                    url: '=/webhooks/{{$parameter.webhookId}}',
                                    body: {
                                        url: '={{$parameter.url}}',
                                        name: '={{$parameter.name}}',
                                        isActive: '={{$parameter.isActive}}',
                                        filters: '={{$parameter.filters}}',
                                    },
                                },
                            },
                        },
                    ],
                    default: 'list',
                },
                {
                    displayName: 'Webhook ID',
                    name: 'webhookId',
                    type: 'string',
                    required: true,
                    displayOptions: {
                        show: {
                            operation: ['get', 'update', 'delete', 'test'],
                        },
                    },
                    default: '',
                    description: 'ID of the webhook',
                    placeholder: 'webhook-uuid-123',
                },
                {
                    displayName: 'Webhook URL',
                    name: 'url',
                    type: 'string',
                    required: true,
                    displayOptions: {
                        show: {
                            operation: ['create'],
                        },
                    },
                    default: '',
                    description: 'URL endpoint to receive webhook notifications',
                    placeholder: 'https://your-server.com/webhook',
                },
                {
                    displayName: 'Webhook URL',
                    name: 'url',
                    type: 'string',
                    displayOptions: {
                        show: {
                            operation: ['update'],
                        },
                    },
                    default: '',
                    description: 'New URL endpoint (leave empty to keep current)',
                    placeholder: 'https://your-server.com/webhook',
                },
                {
                    displayName: 'Webhook Name',
                    name: 'name',
                    type: 'string',
                    displayOptions: {
                        show: {
                            operation: ['create', 'update'],
                        },
                    },
                    default: '',
                    description: 'Descriptive name for the webhook',
                    placeholder: 'My Reminders Webhook',
                },
                {
                    displayName: 'Active',
                    name: 'isActive',
                    type: 'boolean',
                    displayOptions: {
                        show: {
                            operation: ['create', 'update'],
                        },
                    },
                    default: true,
                    description: 'Whether the webhook should be active',
                },
                {
                    displayName: 'Webhook Filters',
                    name: 'filters',
                    type: 'collection',
                    placeholder: 'Add Filter',
                    displayOptions: {
                        show: {
                            operation: ['create', 'update'],
                        },
                    },
                    default: {},
                    options: [
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
                                    name: 'Complete Only',
                                    value: 'complete',
                                },
                                {
                                    name: 'Incomplete Only',
                                    value: 'incomplete',
                                },
                            ],
                            default: 'all',
                            description: 'Filter by completion status',
                        },
                        {
                            displayName: 'Has Attached URL',
                            name: 'hasAttachedUrl',
                            type: 'boolean',
                            default: false,
                            description: 'Whether to filter for reminders with URL attachments',
                        },
                        {
                            displayName: 'Has Due Date',
                            name: 'hasDueDate',
                            type: 'boolean',
                            default: false,
                            description: 'Whether to filter for reminders with due dates',
                        },
                        {
                            displayName: 'Has Notes',
                            name: 'hasNotes',
                            type: 'boolean',
                            default: false,
                            description: 'Whether to filter for reminders with notes',
                        },
                        {
                            displayName: 'Is Subtask',
                            name: 'isSubtask',
                            type: 'boolean',
                            default: false,
                            description: 'Whether to filter for subtasks only',
                        },
                        {
                            displayName: 'List Names',
                            name: 'listNames',
                            type: 'string',
                            default: '',
                            description: 'Comma-separated list names to monitor (leave empty for all)',
                            placeholder: 'Work, Personal, Shopping',
                        },
                        {
                            displayName: 'List UUIDs',
                            name: 'listUUIDs',
                            type: 'string',
                            default: '',
                            description: 'Comma-separated list UUIDs to monitor',
                            placeholder: 'UUID1, UUID2',
                        },
                        {
                            displayName: 'Priority Levels',
                            name: 'priorityLevels',
                            type: 'string',
                            default: '',
                            description: 'Comma-separated priority levels to monitor (0-9)',
                            placeholder: '1,5,9',
                        },
                        {
                            displayName: 'Text Filter',
                            name: 'hasQuery',
                            type: 'string',
                            default: '',
                            description: 'Only trigger for reminders containing this text',
                            placeholder: 'important',
                        },
                    ],
                },
            ],
        };
    }
}
exports.RemindersWebhook = RemindersWebhook;
//# sourceMappingURL=RemindersWebhook.node.js.map