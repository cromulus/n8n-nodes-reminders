"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemindersSearch = exports.inputSchema = void 0;
const zod_1 = require("zod");
const RemindersUtils_1 = require("../shared/RemindersUtils");
exports.inputSchema = zod_1.z.object({
    operation: zod_1.z.literal('search').default('search').optional()
        .describe('Search operation (always "search")'),
    query: zod_1.z.string().optional()
        .describe('Text to search for in reminder titles and notes'),
    search: zod_1.z.string().optional()
        .describe('Alias for query - text to search for'),
    text: zod_1.z.string().optional()
        .describe('Alias for query - text to search for'),
    reminderId: zod_1.z.string().optional()
        .describe('Search for a specific reminder by UUID'),
    uuid: zod_1.z.string().optional()
        .describe('Alias for reminderId - reminder UUID to find'),
    reminderUUID: zod_1.z.string().optional()
        .describe('Alias for reminderId - reminder UUID to find'),
    lists: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional()
        .describe('List names to search in (comma-separated string or array)'),
    listNames: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional()
        .describe('Alias for lists - list names to search in'),
    listUUIDs: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional()
        .describe('List UUIDs to search in (comma-separated string or array)'),
    completed: zod_1.z.enum(['all', 'true', 'false', 'incomplete', 'complete']).default('false').optional()
        .describe('Filter by completion status (defaults to incomplete only)'),
    dueBefore: zod_1.z.string().optional()
        .describe('Find reminders due before this date (ISO format)'),
    dueAfter: zod_1.z.string().optional()
        .describe('Find reminders due after this date (ISO format)'),
    dueBy: zod_1.z.string().optional()
        .describe('Alias for dueBefore'),
    dueFrom: zod_1.z.string().optional()
        .describe('Alias for dueAfter'),
    modifiedAfter: zod_1.z.string().optional()
        .describe('Find reminders modified after this date (ISO format)'),
    createdAfter: zod_1.z.string().optional()
        .describe('Find reminders created after this date (ISO format)'),
    hasNotes: zod_1.z.boolean().default(false).optional()
        .describe('Filter by presence of notes (defaults to all)'),
    hasDueDate: zod_1.z.boolean().default(false).optional()
        .describe('Filter by presence of due date (defaults to all)'),
    isSubtask: zod_1.z.boolean().default(false).optional()
        .describe('Filter for subtasks only (defaults to all)'),
    hasAttachedUrl: zod_1.z.boolean().default(false).optional()
        .describe('Filter for reminders with URL attachments (defaults to all)'),
    hasMailUrl: zod_1.z.boolean().default(false).optional()
        .describe('Filter for reminders with mail links (defaults to all)'),
    priority: zod_1.z.enum(['none', 'low', 'medium', 'high']).optional()
        .describe('Exact priority level to match (none=0, low=1, medium=5, high=9)'),
    priorityMin: zod_1.z.number().min(0).max(9).default(0).optional()
        .describe('Minimum priority level (0-9, defaults to 0)'),
    priorityMax: zod_1.z.number().min(0).max(9).default(9).optional()
        .describe('Maximum priority level (0-9, defaults to 9)'),
    minPriority: zod_1.z.number().min(0).max(9).optional()
        .describe('Alias for priorityMin'),
    maxPriority: zod_1.z.number().min(0).max(9).optional()
        .describe('Alias for priorityMax'),
    sortBy: zod_1.z.enum(['title', 'dueDate', 'creationDate', 'lastModified', 'priority', 'list']).default('lastModified').optional()
        .describe('Field to sort results by (defaults to lastModified)'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc').optional()
        .describe('Sort direction (defaults to desc)'),
    limit: zod_1.z.number().min(1).max(1000).default(50).optional()
        .describe('Maximum number of results to return (defaults to 50)'),
    count: zod_1.z.number().min(1).max(1000).optional()
        .describe('Alias for limit'),
    maxResults: zod_1.z.number().min(1).max(1000).optional()
        .describe('Alias for limit'),
    includeAIContext: zod_1.z.boolean().default(false).optional()
        .describe('Include pre-fetched reminders for AI context'),
});
class RemindersSearch {
    constructor() {
        this.description = {
            displayName: 'Reminders Search',
            name: 'remindersSearch',
            icon: 'file:reminders.svg',
            group: ['productivity'],
            version: 1,
            subtitle: '={{$parameter["operation"]}}',
            description: 'Advanced search capabilities for macOS Reminders with private API filters',
            defaults: {
                name: 'Reminders Search',
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
                    type: 'hidden',
                    default: 'search',
                    description: 'The operation to perform',
                },
                {
                    displayName: 'Search Text',
                    name: 'query',
                    type: 'string',
                    default: '',
                    description: 'Text to search for in reminder titles and notes (leave empty to find all)',
                    placeholder: 'meeting notes',
                },
                {
                    displayName: 'Reminder UUID',
                    name: 'reminderId',
                    type: 'string',
                    default: '',
                    description: 'Search for a specific reminder by UUID (overrides other search criteria)',
                    placeholder: 'ABC123-DEF456-GHI789',
                },
                {
                    displayName: 'List Names',
                    name: 'lists',
                    type: 'string',
                    default: '',
                    description: 'Comma-separated list names to search in (leave empty for all lists)',
                    placeholder: 'Work,Personal,Shopping',
                },
                {
                    displayName: 'Search Options',
                    name: 'searchOptions',
                    type: 'collection',
                    placeholder: 'Add Search Option',
                    default: {},
                    description: 'Additional search filters and options',
                    options: [
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
                                    name: 'All',
                                    value: 'all',
                                },
                                {
                                    name: 'Complete Only',
                                    value: 'true',
                                },
                            ],
                            default: 'false',
                            description: 'Which reminders to include based on completion status',
                        },
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
                            displayName: 'Created After',
                            name: 'createdAfter',
                            type: 'dateTime',
                            default: '',
                            description: 'Find reminders created after this date',
                        },
                        {
                            displayName: 'Modified After',
                            name: 'modifiedAfter',
                            type: 'dateTime',
                            default: '',
                            description: 'Find reminders modified after this date',
                        },
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
                            description: 'Whether to filter by subtask status',
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
                            description: 'Whether to filter by URL attachment presence',
                        },
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
                            description: 'Whether to filter by mail link presence',
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
                            default: '',
                            description: 'Filter by exact priority level',
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
                        {
                            displayName: 'Sort By',
                            name: 'sortBy',
                            type: 'options',
                            options: [
                                {
                                    name: 'Last Modified',
                                    value: 'lastModified',
                                },
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
                                    name: 'Descending',
                                    value: 'desc',
                                },
                                {
                                    name: 'Ascending',
                                    value: 'asc',
                                },
                            ],
                            default: 'desc',
                            description: 'Sort direction',
                        },
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
                    ],
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
            const aliases = {
                query: ['search', 'text'],
                reminderId: ['uuid', 'reminderUUID'],
                lists: ['listNames'],
                dueBefore: ['dueBy'],
                dueAfter: ['dueFrom'],
                priorityMin: ['minPriority'],
                priorityMax: ['maxPriority'],
                limit: ['count', 'maxResults'],
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
        for (let i = 0; i < items.length; i++) {
            try {
                const inputJson = items[i].json;
                const queryParams = {};
                const reminderId = getParam('reminderId', i, inputJson, '');
                if (reminderId) {
                    const responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'remindersApi', {
                        method: 'GET',
                        url: `/reminders/${reminderId}`,
                        json: true,
                    });
                    if (responseData) {
                        returnData.push({
                            json: RemindersUtils_1.RemindersUtils.enrichReminderData(responseData),
                            pairedItem: { item: i },
                        });
                    }
                    continue;
                }
                const query = getParam('query', i, inputJson, '');
                if (query)
                    queryParams.query = query;
                const lists = getParam('lists', i, inputJson, '');
                if (lists) {
                    if (Array.isArray(lists)) {
                        queryParams.lists = lists.join(',');
                    }
                    else {
                        queryParams.lists = lists;
                    }
                }
                const searchOptions = getParam('searchOptions', i, inputJson, {});
                queryParams.completed = getParam('completed', i, inputJson, searchOptions.completed || 'false');
                const dueBefore = getParam('dueBefore', i, inputJson, searchOptions.dueBefore);
                if (dueBefore)
                    queryParams.dueBefore = dueBefore;
                const dueAfter = getParam('dueAfter', i, inputJson, searchOptions.dueAfter);
                if (dueAfter)
                    queryParams.dueAfter = dueAfter;
                const createdAfter = getParam('createdAfter', i, inputJson, searchOptions.createdAfter);
                if (createdAfter)
                    queryParams.createdAfter = createdAfter;
                const modifiedAfter = getParam('modifiedAfter', i, inputJson, searchOptions.modifiedAfter);
                if (modifiedAfter)
                    queryParams.modifiedAfter = modifiedAfter;
                const hasDueDate = getParam('hasDueDate', i, inputJson, searchOptions.hasDueDate);
                if (hasDueDate)
                    queryParams.hasDueDate = 'true';
                const hasNotes = getParam('hasNotes', i, inputJson, searchOptions.hasNotes);
                if (hasNotes)
                    queryParams.hasNotes = 'true';
                const isSubtask = getParam('isSubtask', i, inputJson, searchOptions.isSubtask || 'all');
                if (isSubtask !== 'all')
                    queryParams.isSubtask = isSubtask;
                const hasAttachedUrl = getParam('hasAttachedUrl', i, inputJson, searchOptions.hasAttachedUrl || 'all');
                if (hasAttachedUrl !== 'all')
                    queryParams.hasAttachedUrl = hasAttachedUrl;
                const hasMailUrl = getParam('hasMailUrl', i, inputJson, searchOptions.hasMailUrl || 'all');
                if (hasMailUrl !== 'all')
                    queryParams.hasMailUrl = hasMailUrl;
                const priority = getParam('priority', i, inputJson, searchOptions.priority);
                if (priority)
                    queryParams.priority = priority;
                const priorityMin = getParam('priorityMin', i, inputJson, searchOptions.priorityMin || 0);
                if (priorityMin > 0)
                    queryParams.priorityMin = priorityMin;
                const priorityMax = getParam('priorityMax', i, inputJson, searchOptions.priorityMax || 9);
                if (priorityMax < 9)
                    queryParams.priorityMax = priorityMax;
                queryParams.sortBy = getParam('sortBy', i, inputJson, searchOptions.sortBy || 'lastModified');
                queryParams.sortOrder = getParam('sortOrder', i, inputJson, searchOptions.sortOrder || 'desc');
                queryParams.limit = getParam('limit', i, inputJson, searchOptions.limit || 50);
                const responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'remindersApi', {
                    method: 'GET',
                    url: '/search',
                    qs: queryParams,
                    json: true,
                });
                const results = Array.isArray(responseData) ? responseData : [];
                results.forEach((reminder) => {
                    returnData.push({
                        json: RemindersUtils_1.RemindersUtils.enrichReminderData(reminder),
                        pairedItem: { item: i },
                    });
                });
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
exports.RemindersSearch = RemindersSearch;
//# sourceMappingURL=RemindersSearch.node.js.map