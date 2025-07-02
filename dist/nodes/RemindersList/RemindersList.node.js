"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemindersList = exports.inputSchema = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const zod_1 = require("zod");
const RemindersUtils_1 = require("../shared/RemindersUtils");
exports.inputSchema = zod_1.z.object({
    operation: zod_1.z.enum(['getAllLists', 'getListReminders'])
        .describe('The operation to perform'),
    listName: zod_1.z.string().optional()
        .describe('Name or UUID of the list to get reminders from'),
    list: zod_1.z.string().optional()
        .describe('Alias for listName'),
    listUUID: zod_1.z.string().optional()
        .describe('Alias for listName - UUID of the list'),
    includeCompleted: zod_1.z.boolean().optional()
        .describe('Whether to include completed reminders in results'),
    completed: zod_1.z.boolean().optional()
        .describe('Alias for includeCompleted'),
    includeAIContext: zod_1.z.boolean().optional()
        .describe('Include pre-fetched reminders for AI context'),
});
class RemindersList {
    constructor() {
        this.description = {
            displayName: 'Reminders List',
            name: 'remindersList',
            icon: 'file:reminders.svg',
            group: ['productivity'],
            version: 1,
            subtitle: '={{$parameter["operation"]}}',
            description: 'Get reminder lists and their reminders from macOS Reminders',
            defaults: {
                name: 'Reminders List',
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
                            name: 'Get All Lists',
                            value: 'getAllLists',
                            action: 'Get all reminder lists',
                            description: 'Retrieve all available reminder lists',
                        },
                        {
                            name: 'Get List Reminders',
                            value: 'getListReminders',
                            action: 'Get reminders from a specific list',
                            description: 'Get all reminders from a specific list',
                        },
                    ],
                    default: 'getAllLists',
                },
                {
                    ...RemindersUtils_1.RemindersUtils.getListNameResourceLocator(false),
                    displayOptions: {
                        show: {
                            operation: ['getListReminders'],
                        },
                    },
                },
                {
                    displayName: 'Include Completed',
                    name: 'includeCompleted',
                    type: 'boolean',
                    displayOptions: {
                        show: {
                            operation: ['getListReminders'],
                        },
                    },
                    default: false,
                    description: 'Whether to include completed reminders in results',
                },
                {
                    displayName: 'AI Context Options',
                    name: 'aiContextOptions',
                    type: 'collection',
                    placeholder: 'Add Option',
                    default: {},
                    description: 'Options for providing AI context and pre-fetched data',
                    options: [
                        {
                            displayName: 'Include AI Context',
                            name: 'includeAIContext',
                            type: 'boolean',
                            default: false,
                            description: 'Whether to include pre-fetched reminders for AI context',
                        },
                    ],
                },
            ],
        };
        this.methods = {
            listSearch: {
                async searchLists(filter) {
                    return RemindersUtils_1.RemindersUtils.searchLists(this, filter);
                },
            },
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
            try {
                return this.getNodeParameter(paramName, itemIndex, defaultValue);
            }
            catch {
                return defaultValue;
            }
        };
        for (let i = 0; i < items.length; i++) {
            try {
                const inputJson = items[i].json;
                const operation = inputJson.operation || this.getNodeParameter('operation', i);
                let responseData;
                switch (operation) {
                    case 'getAllLists': {
                        responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'remindersApi', {
                            method: 'GET',
                            url: '/lists',
                            json: true,
                        });
                        const aiContextOptions = getParam('aiContextOptions', i, inputJson, {});
                        const includeAIContext = getParam('includeAIContext', i, inputJson, false) || aiContextOptions.includeAIContext;
                        if (includeAIContext) {
                            const contextHelper = {
                                ...this,
                                getItemIndex: () => i,
                            };
                            const contextReminders = await RemindersUtils_1.RemindersUtils.preFetchReminders(contextHelper, {
                                limit: 10,
                                completed: false,
                                includePrivateFields: true,
                            });
                            if (Array.isArray(responseData)) {
                                responseData.forEach((list) => {
                                    list.aiContext = {
                                        totalLists: responseData.length,
                                        sampleReminders: contextReminders.slice(0, 5),
                                    };
                                });
                            }
                        }
                        responseData = Array.isArray(responseData) ? responseData : [];
                        break;
                    }
                    case 'getListReminders': {
                        const aiListName = getParam('listName', i, inputJson) ||
                            getParam('list', i, inputJson) ||
                            getParam('listUUID', i, inputJson);
                        let listIdentifier;
                        if (aiListName) {
                            listIdentifier = RemindersUtils_1.RemindersUtils.extractListIdentifier(aiListName);
                        }
                        else {
                            const listParam = this.getNodeParameter('listName', i, '');
                            listIdentifier = RemindersUtils_1.RemindersUtils.extractListIdentifier(listParam);
                        }
                        if (!listIdentifier) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'List name is required for getListReminders operation');
                        }
                        const includeCompleted = getParam('includeCompleted', i, inputJson) ||
                            getParam('completed', i, inputJson, false);
                        responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'remindersApi', {
                            method: 'GET',
                            url: `/lists/${encodeURIComponent(listIdentifier)}`,
                            qs: {
                                completed: includeCompleted.toString(),
                            },
                            json: true,
                        });
                        const aiContextOptions = getParam('aiContextOptions', i, inputJson, {});
                        const includeAIContext = getParam('includeAIContext', i, inputJson, false) || aiContextOptions.includeAIContext;
                        if (includeAIContext) {
                            const contextHelper = {
                                ...this,
                                getItemIndex: () => i,
                            };
                            const listsMetadata = await RemindersUtils_1.RemindersUtils.preFetchListsWithMetadata(contextHelper);
                            if (Array.isArray(responseData)) {
                                responseData.forEach((reminder) => {
                                    reminder.aiContext = {
                                        listName: listIdentifier,
                                        totalReminders: responseData.length,
                                        availableLists: listsMetadata.map((list) => list.title),
                                    };
                                });
                            }
                        }
                        responseData = Array.isArray(responseData) ? responseData : [];
                        break;
                    }
                    default:
                        throw new n8n_workflow_1.NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
                }
                if (Array.isArray(responseData)) {
                    responseData.forEach((item) => {
                        returnData.push({
                            json: RemindersUtils_1.RemindersUtils.enrichReminderData(item),
                            pairedItem: { item: i },
                        });
                    });
                }
                else if (responseData) {
                    returnData.push({
                        json: RemindersUtils_1.RemindersUtils.enrichReminderData(responseData),
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
exports.RemindersList = RemindersList;
//# sourceMappingURL=RemindersList.node.js.map