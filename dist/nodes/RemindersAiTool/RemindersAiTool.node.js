"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemindersAiTool = void 0;
class RemindersAiTool {
    constructor() {
        this.description = {
            displayName: 'Reminders AI Tool',
            name: 'remindersAiTool',
            icon: 'file:reminders-ai.svg',
            group: ['ai'],
            version: 1,
            description: 'AI-powered tool for managing macOS Reminders',
            defaults: {
                name: 'Reminders AI Tool',
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
                    displayName: 'This is an AI Tool node. It expects input from an AI Agent node and returns structured responses.',
                    name: 'notice',
                    type: 'notice',
                    default: '',
                },
                {
                    displayName: 'Tool Configuration',
                    name: 'toolConfig',
                    type: 'collection',
                    placeholder: 'Add Configuration',
                    default: {},
                    options: [
                        {
                            displayName: 'Default List',
                            name: 'defaultList',
                            type: 'string',
                            default: 'Reminders',
                            description: 'Default list to use when none specified',
                        },
                        {
                            displayName: 'Auto-Parse Dates',
                            name: 'autoParseDates',
                            type: 'boolean',
                            default: true,
                            description: 'Whether to automatically parse natural language dates',
                        },
                        {
                            displayName: 'Include Context',
                            name: 'includeContext',
                            type: 'boolean',
                            default: true,
                            description: 'Whether to include list context and metadata in responses',
                        },
                    ],
                },
            ],
        };
    }
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        for (let i = 0; i < items.length; i++) {
            const toolInput = items[i].json;
            const { action, ...params } = toolInput;
            try {
                let result;
                switch (action) {
                    case 'get_lists':
                        result = await this.handleGetLists.call(this);
                        break;
                    case 'get_reminders':
                        result = await this.handleGetReminders.call(this, params);
                        break;
                    case 'create_reminder':
                        result = await this.handleCreateReminder.call(this, params);
                        break;
                    case 'update_reminder':
                        result = await this.handleUpdateReminder.call(this, params);
                        break;
                    case 'delete_reminder':
                        result = await this.handleDeleteReminder.call(this, params);
                        break;
                    case 'search_reminders':
                        result = await this.handleSearchReminders.call(this, params);
                        break;
                    case 'complete_reminder':
                        result = await this.handleCompleteReminder.call(this, params);
                        break;
                    case 'setup_webhook':
                        result = await this.handleSetupWebhook.call(this, params);
                        break;
                    default:
                        result = {
                            success: false,
                            action: action || 'unknown',
                            error: `Unknown action: ${action}`,
                            summary: `Error: Unknown action "${action}"`,
                        };
                }
                returnData.push({
                    json: result,
                    pairedItem: { item: i },
                });
            }
            catch (error) {
                const errorResult = {
                    success: false,
                    action: action || 'unknown',
                    error: error.message,
                    summary: `Error: ${error.message}`,
                };
                if (this.continueOnFail()) {
                    returnData.push({
                        json: errorResult,
                        pairedItem: { item: i },
                    });
                    continue;
                }
                throw error;
            }
        }
        return [returnData];
    }
    async handleGetLists() {
        const credentials = await this.getCredentials('remindersApi');
        const response = await this.helpers.httpRequest({
            method: 'GET',
            url: `${credentials.baseUrl}/lists`,
            headers: {
                Authorization: credentials.apiToken ? `Bearer ${credentials.apiToken}` : '',
            },
        });
        return {
            success: true,
            action: 'get_lists',
            data: { lists: response, count: response.length },
            summary: `Found ${response.length} reminder lists: ${response.map((l) => l.title).join(', ')}`,
        };
    }
    async handleGetReminders(params) {
        const credentials = await this.getCredentials('remindersApi');
        let url = `${credentials.baseUrl}/reminders`;
        const query = {};
        if (params.list_name) {
            url = `${credentials.baseUrl}/lists/${encodeURIComponent(params.list_name)}`;
        }
        if (params.include_completed) {
            query.completed = 'true';
        }
        const response = await this.helpers.httpRequest({
            method: 'GET',
            url,
            qs: query,
            headers: {
                Authorization: credentials.apiToken ? `Bearer ${credentials.apiToken}` : '',
            },
        });
        const contextInfo = params.list_name ? ` from ${params.list_name} list` : ' across all lists';
        return {
            success: true,
            action: 'get_reminders',
            data: { reminders: response, count: response.length },
            summary: `Found ${response.length} reminders${contextInfo}`,
        };
    }
    async handleCreateReminder(params) {
        if (!params.title || !params.list_name) {
            throw new Error('Title and list_name are required for creating reminders');
        }
        const credentials = await this.getCredentials('remindersApi');
        const body = { title: params.title };
        if (params.notes)
            body.notes = params.notes;
        if (params.due_date)
            body.dueDate = params.due_date;
        if (params.priority)
            body.priority = params.priority;
        const response = await this.helpers.httpRequest({
            method: 'POST',
            url: `${credentials.baseUrl}/lists/${encodeURIComponent(params.list_name)}/reminders`,
            body,
            headers: {
                Authorization: credentials.apiToken ? `Bearer ${credentials.apiToken}` : '',
                'Content-Type': 'application/json',
            },
        });
        const dueDateInfo = params.due_date ? ` due ${new Date(params.due_date).toLocaleDateString()}` : '';
        return {
            success: true,
            action: 'create_reminder',
            data: response,
            summary: `Created reminder "${params.title}" in ${params.list_name} list${dueDateInfo}`,
        };
    }
    async handleUpdateReminder(params) {
        if (!params.uuid) {
            throw new Error('UUID is required for updating reminders');
        }
        const credentials = await this.getCredentials('remindersApi');
        const body = {};
        if (params.title)
            body.title = params.title;
        if (params.notes !== undefined)
            body.notes = params.notes;
        if (params.due_date)
            body.dueDate = params.due_date;
        if (params.priority)
            body.priority = params.priority;
        if (params.is_completed !== undefined)
            body.isCompleted = params.is_completed;
        const response = await this.helpers.httpRequest({
            method: 'PATCH',
            url: `${credentials.baseUrl}/reminders/${params.uuid}`,
            body,
            headers: {
                Authorization: credentials.apiToken ? `Bearer ${credentials.apiToken}` : '',
                'Content-Type': 'application/json',
            },
        });
        return {
            success: true,
            action: 'update_reminder',
            data: response,
            summary: `Updated reminder "${response.title}"`,
        };
    }
    async handleDeleteReminder(params) {
        if (!params.uuid) {
            throw new Error('UUID is required for deleting reminders');
        }
        const credentials = await this.getCredentials('remindersApi');
        await this.helpers.httpRequest({
            method: 'DELETE',
            url: `${credentials.baseUrl}/reminders/${params.uuid}`,
            headers: {
                Authorization: credentials.apiToken ? `Bearer ${credentials.apiToken}` : '',
            },
        });
        return {
            success: true,
            action: 'delete_reminder',
            data: { uuid: params.uuid },
            summary: `Deleted reminder with UUID ${params.uuid}`,
        };
    }
    async handleSearchReminders(params) {
        const credentials = await this.getCredentials('remindersApi');
        const query = {};
        if (params.search_query)
            query.query = params.search_query;
        if (params.filters) {
            Object.assign(query, params.filters);
            if (params.filters.lists && Array.isArray(params.filters.lists)) {
                query.lists = params.filters.lists.join(',');
            }
        }
        const response = await this.helpers.httpRequest({
            method: 'GET',
            url: `${credentials.baseUrl}/search`,
            qs: query,
            headers: {
                Authorization: credentials.apiToken ? `Bearer ${credentials.apiToken}` : '',
            },
        });
        const queryInfo = params.search_query ? ` matching "${params.search_query}"` : '';
        return {
            success: true,
            action: 'search_reminders',
            data: { reminders: response, count: response.length },
            summary: `Found ${response.length} reminders${queryInfo}`,
        };
    }
    async handleCompleteReminder(params) {
        if (!params.uuid) {
            throw new Error('UUID is required for completing reminders');
        }
        const credentials = await this.getCredentials('remindersApi');
        const endpoint = params.completed === false ? 'uncomplete' : 'complete';
        await this.helpers.httpRequest({
            method: 'PATCH',
            url: `${credentials.baseUrl}/reminders/${params.uuid}/${endpoint}`,
            headers: {
                Authorization: credentials.apiToken ? `Bearer ${credentials.apiToken}` : '',
            },
        });
        const action = params.completed === false ? 'unmarked as completed' : 'marked as completed';
        return {
            success: true,
            action: 'complete_reminder',
            data: { uuid: params.uuid, completed: params.completed !== false },
            summary: `Reminder ${action}`,
        };
    }
    async handleSetupWebhook(params) {
        var _a;
        if (!((_a = params.webhook_config) === null || _a === void 0 ? void 0 : _a.url)) {
            throw new Error('Webhook URL is required in webhook_config');
        }
        const credentials = await this.getCredentials('remindersApi');
        const webhookConfig = params.webhook_config;
        const body = {
            url: webhookConfig.url,
            name: webhookConfig.name || 'AI Tool Webhook',
            filter: {
                listNames: webhookConfig.lists,
                completed: 'all',
            },
        };
        const response = await this.helpers.httpRequest({
            method: 'POST',
            url: `${credentials.baseUrl}/webhooks`,
            body,
            headers: {
                Authorization: credentials.apiToken ? `Bearer ${credentials.apiToken}` : '',
                'Content-Type': 'application/json',
            },
        });
        return {
            success: true,
            action: 'setup_webhook',
            data: response,
            summary: `Created webhook "${response.name}" for URL ${response.url}`,
        };
    }
}
exports.RemindersAiTool = RemindersAiTool;
//# sourceMappingURL=RemindersAiTool.node.js.map