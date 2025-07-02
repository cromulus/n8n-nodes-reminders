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
            description: 'Manage webhook configurations for reminder notifications',
            defaults: {
                name: 'Reminders Webhook',
            },
            inputs: ["main"],
            outputs: ["main"],
            usableAsTool: true,
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
                            description: 'Create a new webhook configuration for notifications',
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
                            name: 'Test Webhook',
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
                            name: 'Update Webhook',
                            value: 'update',
                            action: 'Update a webhook',
                            description: 'Update an existing webhook configuration',
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
                    displayName: 'Webhook ID',
                    name: 'webhookId',
                    type: 'string',
                    required: true,
                    displayOptions: {
                        show: {
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
                            operation: ['update'],
                        },
                    },
                    default: '',
                    description: 'New URL to send webhook notifications to (leave empty to keep current)',
                    placeholder: 'https://your-server.com/webhook',
                },
                {
                    displayName: 'Webhook Name',
                    name: 'name',
                    type: 'string',
                    required: true,
                    displayOptions: {
                        show: {
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
                            operation: ['update'],
                        },
                    },
                    default: '',
                    description: 'New name for the webhook configuration (leave empty to keep current)',
                    placeholder: 'Task Notifications',
                },
                {
                    displayName: 'Active',
                    name: 'isActive',
                    type: 'boolean',
                    displayOptions: {
                        show: {
                            operation: ['update'],
                        },
                    },
                    default: true,
                    description: 'Whether the webhook is active',
                },
                {
                    displayName: 'Filter Configuration',
                    name: 'filter',
                    type: 'json',
                    displayOptions: {
                        show: {
                            operation: ['create', 'update'],
                        },
                    },
                    default: '{}',
                    description: 'JSON filter configuration for webhook events',
                    placeholder: '{"listNames": ["Shopping", "Work"], "completed": "all"}',
                    typeOptions: {
                        rows: 5,
                    },
                },
            ],
        };
    }
}
exports.RemindersWebhook = RemindersWebhook;
//# sourceMappingURL=RemindersWebhook.node.js.map