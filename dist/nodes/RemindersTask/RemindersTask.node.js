"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemindersTask = exports.inputSchema = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const zod_1 = require("zod");
const RemindersUtils_1 = require("../shared/RemindersUtils");
exports.inputSchema = zod_1.z.object({
    operation: zod_1.z.enum(['getAll', 'get', 'create', 'update', 'delete', 'complete', 'createSubtask'])
        .describe('The operation to perform on reminders'),
    listName: zod_1.z.string().optional()
        .describe('Name or UUID of the reminder list (for create operations)'),
    reminderId: zod_1.z.string().optional()
        .describe('UUID of the specific reminder (for get, update, delete, complete operations)'),
    title: zod_1.z.string().optional()
        .describe('Title/name of the reminder'),
    notes: zod_1.z.string().optional()
        .describe('Additional notes or description for the reminder'),
    dueDate: zod_1.z.string().optional()
        .describe('Due date in ISO format (e.g., 2024-01-15T10:00:00Z)'),
    startDate: zod_1.z.string().optional()
        .describe('Start date in ISO format'),
    priority: zod_1.z.enum(['none', 'low', 'medium', 'high']).optional()
        .describe('Priority level of the reminder'),
    isCompleted: zod_1.z.boolean().optional()
        .describe('Whether the reminder is completed'),
    parentId: zod_1.z.string().optional()
        .describe('UUID of parent reminder (for creating subtasks)'),
    attachedUrl: zod_1.z.string().optional()
        .describe('URL to attach to the reminder'),
    includeCompleted: zod_1.z.boolean().optional()
        .describe('Whether to include completed reminders in results'),
});
class RemindersTask {
    constructor() {
        this.description = {
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
                            name: 'Complete',
                            value: 'complete',
                            description: 'Mark a reminder as completed',
                            action: 'Complete a reminder',
                        },
                        {
                            name: 'Create',
                            value: 'create',
                            description: 'Create a new reminder',
                            action: 'Create a reminder',
                        },
                        {
                            name: 'Create Subtask',
                            value: 'createSubtask',
                            description: 'Create a subtask under a parent reminder',
                            action: 'Create a subtask',
                        },
                        {
                            name: 'Delete',
                            value: 'delete',
                            description: 'Delete a reminder',
                            action: 'Delete a reminder',
                        },
                        {
                            name: 'Get',
                            value: 'get',
                            description: 'Get a specific reminder by UUID',
                            action: 'Get a reminder',
                        },
                        {
                            name: 'Get Many',
                            value: 'getAll',
                            description: 'Get many reminders across lists',
                            action: 'Get many reminders',
                        },
                        {
                            name: 'Update',
                            value: 'update',
                            description: 'Update an existing reminder',
                            action: 'Update a reminder',
                        },
                    ],
                    default: 'getAll',
                },
                {
                    ...RemindersUtils_1.RemindersUtils.getListNameResourceLocator(),
                    displayOptions: {
                        show: {
                            operation: ['create'],
                        },
                    },
                },
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
                {
                    ...RemindersUtils_1.RemindersUtils.getListNameResourceLocator(),
                    displayOptions: {
                        show: {
                            operation: ['createSubtask'],
                        },
                    },
                },
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
                    case 'getAll': {
                        const includeCompleted = getParam('includeCompleted', i, inputJson, false);
                        responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'remindersApi', {
                            method: 'GET',
                            url: '/reminders',
                            qs: {
                                completed: includeCompleted.toString(),
                            },
                            json: true,
                        });
                        responseData = Array.isArray(responseData) ? responseData : [];
                        break;
                    }
                    case 'get': {
                        const reminderId = getParam('reminderId', i, inputJson);
                        if (!reminderId) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Reminder ID is required');
                        }
                        responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'remindersApi', {
                            method: 'GET',
                            url: `/reminders/${encodeURIComponent(reminderId)}`,
                            json: true,
                        });
                        break;
                    }
                    case 'create': {
                        const data = {};
                        const title = getParam('title', i, inputJson);
                        if (title)
                            data.title = title;
                        const additionalFields = getParam('additionalFields', i, inputJson, {});
                        const notes = getParam('notes', i, inputJson) ||
                            additionalFields.notes ||
                            getParam('description', i, inputJson);
                        if (notes)
                            data.notes = notes;
                        const dueDate = getParam('dueDate', i, inputJson) || additionalFields.dueDate;
                        if (dueDate)
                            data.dueDate = dueDate;
                        const startDate = getParam('startDate', i, inputJson) || additionalFields.startDate;
                        if (startDate)
                            data.startDate = startDate;
                        const priority = getParam('priority', i, inputJson) || additionalFields.priority;
                        if (priority && priority !== 'none') {
                            const priorityMap = { low: 1, medium: 5, high: 9 };
                            data.priority = priorityMap[priority] || priority;
                        }
                        const privateFeatures = getParam('privateFeatures', i, inputJson, {});
                        const attachedUrl = getParam('attachedUrl', i, inputJson) ||
                            privateFeatures.attachedUrl ||
                            getParam('url', i, inputJson);
                        if (attachedUrl)
                            data.attachedUrl = attachedUrl;
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
                        responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'remindersApi', {
                            method: 'POST',
                            url: `/lists/${encodeURIComponent(listIdentifier)}/reminders`,
                            json: true,
                            body: data,
                        });
                        break;
                    }
                    case 'createSubtask': {
                        const data = {};
                        const title = getParam('title', i, inputJson);
                        if (title)
                            data.title = title;
                        const additionalFields = getParam('additionalFields', i, inputJson, {});
                        const notes = getParam('notes', i, inputJson) ||
                            additionalFields.notes ||
                            getParam('description', i, inputJson);
                        if (notes)
                            data.notes = notes;
                        const dueDate = getParam('dueDate', i, inputJson) || additionalFields.dueDate;
                        if (dueDate)
                            data.dueDate = dueDate;
                        const startDate = getParam('startDate', i, inputJson) || additionalFields.startDate;
                        if (startDate)
                            data.startDate = startDate;
                        const priority = getParam('priority', i, inputJson) || additionalFields.priority;
                        if (priority && priority !== 'none') {
                            const priorityMap = { low: 1, medium: 5, high: 9 };
                            data.priority = priorityMap[priority] || priority;
                        }
                        const privateFeatures = getParam('privateFeatures', i, inputJson, {});
                        const parentId = getParam('parentId', i, inputJson) || privateFeatures.parentId;
                        if (!parentId) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Parent ID is required for creating subtasks');
                        }
                        data.parentId = parentId;
                        const attachedUrl = getParam('attachedUrl', i, inputJson) ||
                            privateFeatures.attachedUrl ||
                            getParam('url', i, inputJson);
                        if (attachedUrl)
                            data.attachedUrl = attachedUrl;
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
                        responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'remindersApi', {
                            method: 'POST',
                            url: `/lists/${encodeURIComponent(listIdentifier)}/reminders`,
                            json: true,
                            body: data,
                        });
                        break;
                    }
                    case 'update': {
                        const reminderId = getParam('reminderId', i, inputJson);
                        if (!reminderId) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Reminder ID is required');
                        }
                        const data = {};
                        const title = getParam('title', i, inputJson);
                        if (title)
                            data.title = title;
                        const additionalFields = getParam('additionalFields', i, inputJson, {});
                        const notes = getParam('notes', i, inputJson) ||
                            additionalFields.notes ||
                            getParam('description', i, inputJson);
                        if (notes)
                            data.notes = notes;
                        const dueDate = getParam('dueDate', i, inputJson) || additionalFields.dueDate;
                        if (dueDate)
                            data.dueDate = dueDate;
                        const startDate = getParam('startDate', i, inputJson) || additionalFields.startDate;
                        if (startDate)
                            data.startDate = startDate;
                        const priority = getParam('priority', i, inputJson) || additionalFields.priority;
                        if (priority && priority !== 'none') {
                            const priorityMap = { low: 1, medium: 5, high: 9 };
                            data.priority = priorityMap[priority] || priority;
                        }
                        const isCompleted = getParam('isCompleted', i, inputJson) || additionalFields.isCompleted;
                        if (isCompleted !== undefined)
                            data.isCompleted = isCompleted;
                        const privateFeatures = getParam('privateFeatures', i, inputJson, {});
                        const attachedUrl = getParam('attachedUrl', i, inputJson) ||
                            privateFeatures.attachedUrl ||
                            getParam('url', i, inputJson);
                        if (attachedUrl)
                            data.attachedUrl = attachedUrl;
                        const filteredData = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined && v !== ''));
                        responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'remindersApi', {
                            method: 'PATCH',
                            url: `/reminders/${encodeURIComponent(reminderId)}`,
                            json: true,
                            body: filteredData,
                        });
                        break;
                    }
                    case 'delete': {
                        const reminderId = getParam('reminderId', i, inputJson);
                        if (!reminderId) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Reminder ID is required');
                        }
                        await this.helpers.httpRequestWithAuthentication.call(this, 'remindersApi', {
                            method: 'DELETE',
                            url: `/reminders/${encodeURIComponent(reminderId)}`,
                            json: true,
                        });
                        responseData = { success: true, deleted: reminderId };
                        break;
                    }
                    case 'complete': {
                        const reminderId = getParam('reminderId', i, inputJson);
                        if (!reminderId) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Reminder ID is required');
                        }
                        await this.helpers.httpRequestWithAuthentication.call(this, 'remindersApi', {
                            method: 'PATCH',
                            url: `/reminders/${encodeURIComponent(reminderId)}/complete`,
                            json: true,
                        });
                        responseData = { success: true, completed: reminderId };
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
exports.RemindersTask = RemindersTask;
//# sourceMappingURL=RemindersTask.node.js.map