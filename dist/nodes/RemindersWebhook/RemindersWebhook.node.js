"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemindersWebhook = exports.inputSchema = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const zod_1 = require("zod");
const RemindersUtils_1 = require("../shared/RemindersUtils");
exports.inputSchema = zod_1.z.object({
    operation: zod_1.z.enum(['list', 'get', 'create', 'update', 'delete', 'test'])
        .describe('The webhook operation to perform'),
    webhookId: zod_1.z.string().optional()
        .describe('UUID of the webhook (for get, update, delete, test operations)'),
    url: zod_1.z.string().optional()
        .describe('Webhook URL endpoint to receive notifications'),
    name: zod_1.z.string().optional()
        .describe('Name/description for the webhook'),
    isActive: zod_1.z.boolean().optional()
        .describe('Whether the webhook is active'),
    listNames: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional()
        .describe('List names to monitor (comma-separated string or array)'),
    lists: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional()
        .describe('Alias for listNames'),
    listUUIDs: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional()
        .describe('List UUIDs to monitor (comma-separated string or array)'),
    listIds: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional()
        .describe('Alias for listUUIDs'),
    completed: zod_1.z.enum(['all', 'complete', 'incomplete']).optional()
        .describe('Completion status filter for webhook notifications'),
    priorityLevels: zod_1.z.union([zod_1.z.number(), zod_1.z.array(zod_1.z.number())]).optional()
        .describe('Priority levels to monitor (0-9, single number or array)'),
    priorities: zod_1.z.union([zod_1.z.number(), zod_1.z.array(zod_1.z.number())]).optional()
        .describe('Alias for priorityLevels'),
    hasQuery: zod_1.z.string().optional()
        .describe('Text that must be present in reminder title/notes'),
    textFilter: zod_1.z.string().optional()
        .describe('Alias for hasQuery'),
    query: zod_1.z.string().optional()
        .describe('Alias for hasQuery'),
});
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
                            name: 'List Webhooks',
                            value: 'list',
                            action: 'List all webhooks',
                            description: 'Retrieve all configured webhook endpoints',
                        },
                        {
                            name: 'Get Webhook',
                            value: 'get',
                            action: 'Get a specific webhook',
                            description: 'Get details of a specific webhook configuration',
                        },
                        {
                            name: 'Create Webhook',
                            value: 'create',
                            action: 'Create a new webhook',
                            description: 'Create a new webhook endpoint with filtering options',
                        },
                        {
                            name: 'Update Webhook',
                            value: 'update',
                            action: 'Update webhook configuration',
                            description: 'Update an existing webhook configuration',
                        },
                        {
                            name: 'Delete Webhook',
                            value: 'delete',
                            action: 'Delete a webhook',
                            description: 'Delete a webhook configuration',
                        },
                        {
                            name: 'Test Webhook',
                            value: 'test',
                            action: 'Test webhook delivery',
                            description: 'Send a test notification to verify webhook is working',
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
                    description: 'URL where webhook notifications will be sent',
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
                    description: 'New URL for webhook notifications (leave empty to keep current)',
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
                    description: 'Descriptive name for the webhook',
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
                    description: 'New name for the webhook (leave empty to keep current)',
                    placeholder: 'Task Notifications',
                },
                {
                    displayName: 'Is Active',
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
                    displayName: 'Filter Options',
                    name: 'filterOptions',
                    type: 'collection',
                    placeholder: 'Add Filter Option',
                    default: {},
                    displayOptions: {
                        show: {
                            operation: ['create', 'update'],
                        },
                    },
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
                            description: 'Which completion status to monitor',
                        },
                        {
                            displayName: 'List Names',
                            name: 'listNames',
                            type: 'string',
                            default: '',
                            description: 'Comma-separated list of list names to monitor',
                            placeholder: 'Work,Personal,Shopping',
                        },
                        {
                            displayName: 'List UUIDs',
                            name: 'listUUIDs',
                            type: 'string',
                            default: '',
                            description: 'Comma-separated list of list UUIDs to monitor (more reliable than names)',
                            placeholder: 'uuid1,uuid2,uuid3',
                        },
                        {
                            displayName: 'Priority Levels',
                            name: 'priorityLevels',
                            type: 'multiOptions',
                            options: [
                                {
                                    name: 'None (0)',
                                    value: 0,
                                },
                                {
                                    name: 'Low (1)',
                                    value: 1,
                                },
                                {
                                    name: 'Medium (5)',
                                    value: 5,
                                },
                                {
                                    name: 'High (9)',
                                    value: 9,
                                },
                            ],
                            default: [],
                            description: 'Priority levels to monitor (empty = all priorities)',
                        },
                        {
                            displayName: 'Text Filter',
                            name: 'hasQuery',
                            type: 'string',
                            default: '',
                            description: 'Text that must be present in reminder title or notes',
                            placeholder: 'urgent',
                        },
                    ],
                },
            ],
        };
    }
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        const getParam = (paramName, itemIndex, inputJson, defaultValue) => {
            var _a, _b;
            if (inputJson[paramName] !== undefined)
                return inputJson[paramName];
            if (((_a = inputJson.params) === null || _a === void 0 ? void 0 : _a[paramName]) !== undefined)
                return inputJson.params[paramName];
            if (((_b = inputJson.parameters) === null || _b === void 0 ? void 0 : _b[paramName]) !== undefined)
                return inputJson.parameters[paramName];
            const aliases = {
                listNames: ['lists'],
                listUUIDs: ['listIds'],
                priorityLevels: ['priorities'],
                hasQuery: ['textFilter', 'query'],
            };
            for (const [mainParam, aliasArray] of Object.entries(aliases)) {
                if (paramName === mainParam) {
                    for (const alias of aliasArray) {
                        if (inputJson[alias] !== undefined)
                            return inputJson[alias];
                    }
                }
            }
            try {
                return this.getNodeParameter(paramName, itemIndex, defaultValue);
            }
            catch {
                return defaultValue;
            }
        };
        const buildWebhookFilter = (inputJson, filterOptions, itemIndex) => {
            const filter = {};
            const getFilterParam = (paramName, defaultValue) => {
                if (inputJson[paramName] !== undefined)
                    return inputJson[paramName];
                if (filterOptions[paramName] !== undefined)
                    return filterOptions[paramName];
                try {
                    return this.getNodeParameter(`filterOptions.${paramName}`, itemIndex, defaultValue);
                }
                catch {
                    return defaultValue;
                }
            };
            const listNames = getFilterParam('listNames') || getFilterParam('lists');
            if (listNames) {
                filter.listNames = Array.isArray(listNames) ? listNames : listNames.split(',').map((s) => s.trim());
            }
            const listUUIDs = getFilterParam('listUUIDs') || getFilterParam('listIds');
            if (listUUIDs) {
                filter.listUUIDs = Array.isArray(listUUIDs) ? listUUIDs : listUUIDs.split(',').map((s) => s.trim());
            }
            const completed = getFilterParam('completed');
            if (completed && completed !== 'all') {
                filter.completed = completed;
            }
            const priorityLevels = getFilterParam('priorityLevels') || getFilterParam('priorities');
            if (priorityLevels && priorityLevels.length > 0) {
                filter.priorityLevels = Array.isArray(priorityLevels) ? priorityLevels : [priorityLevels];
            }
            const hasQuery = getFilterParam('hasQuery') || getFilterParam('textFilter') || getFilterParam('query');
            if (hasQuery) {
                filter.hasQuery = hasQuery;
            }
            return filter;
        };
        for (let i = 0; i < items.length; i++) {
            try {
                const inputJson = items[i].json;
                const operation = inputJson.operation || this.getNodeParameter('operation', i);
                let responseData;
                switch (operation) {
                    case 'list': {
                        responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'remindersApi', {
                            method: 'GET',
                            url: '/webhooks',
                            json: true,
                        });
                        break;
                    }
                    case 'get': {
                        const webhookId = getParam('webhookId', i, inputJson);
                        if (!webhookId) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Webhook ID is required for get operation');
                        }
                        responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'remindersApi', {
                            method: 'GET',
                            url: `/webhooks/${webhookId}`,
                            json: true,
                        });
                        break;
                    }
                    case 'create': {
                        const url = getParam('url', i, inputJson);
                        const name = getParam('name', i, inputJson);
                        if (!url || !name) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'URL and name are required for create operation');
                        }
                        const filterOptions = getParam('filterOptions', i, inputJson, {});
                        const filter = buildWebhookFilter(inputJson, filterOptions, i);
                        const body = { url, name };
                        if (filter && Object.keys(filter).length > 0) {
                            body.filter = filter;
                        }
                        responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'remindersApi', {
                            method: 'POST',
                            url: '/webhooks',
                            body,
                            json: true,
                        });
                        break;
                    }
                    case 'update': {
                        const webhookId = getParam('webhookId', i, inputJson);
                        if (!webhookId) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Webhook ID is required for update operation');
                        }
                        const body = {};
                        const url = getParam('url', i, inputJson);
                        const name = getParam('name', i, inputJson);
                        const isActive = getParam('isActive', i, inputJson);
                        if (url)
                            body.url = url;
                        if (name)
                            body.name = name;
                        if (isActive !== undefined)
                            body.isActive = isActive;
                        const filterOptions = getParam('filterOptions', i, inputJson, {});
                        const filter = buildWebhookFilter(inputJson, filterOptions, i);
                        if (filter && Object.keys(filter).length > 0) {
                            body.filter = filter;
                        }
                        responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'remindersApi', {
                            method: 'PATCH',
                            url: `/webhooks/${webhookId}`,
                            body,
                            json: true,
                        });
                        break;
                    }
                    case 'delete': {
                        const webhookId = getParam('webhookId', i, inputJson);
                        if (!webhookId) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Webhook ID is required for delete operation');
                        }
                        await this.helpers.httpRequestWithAuthentication.call(this, 'remindersApi', {
                            method: 'DELETE',
                            url: `/webhooks/${webhookId}`,
                            json: true,
                        });
                        responseData = { success: true, webhookId };
                        break;
                    }
                    case 'test': {
                        const webhookId = getParam('webhookId', i, inputJson);
                        if (!webhookId) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Webhook ID is required for test operation');
                        }
                        responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'remindersApi', {
                            method: 'POST',
                            url: `/webhooks/${webhookId}/test`,
                            json: true,
                        });
                        break;
                    }
                    default:
                        throw new n8n_workflow_1.NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
                }
                if (Array.isArray(responseData)) {
                    responseData.forEach((item) => {
                        returnData.push({
                            json: item,
                            pairedItem: { item: i },
                        });
                    });
                }
                else if (responseData) {
                    returnData.push({
                        json: responseData,
                        pairedItem: { item: i },
                    });
                }
                else {
                    returnData.push({
                        json: { success: true, operation },
                        pairedItem: { item: i },
                    });
                }
            }
            catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({
                        json: { error: error.message },
                        pairedItem: { item: i },
                    });
                }
                else {
                    throw error;
                }
            }
        }
        return [returnData];
    }
}
exports.RemindersWebhook = RemindersWebhook;
//# sourceMappingURL=RemindersWebhook.node.js.map