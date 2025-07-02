"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemindersUtils = void 0;
class RemindersUtils {
    static async searchLists(context, filter) {
        const returnData = [];
        try {
            const response = await context.helpers.httpRequestWithAuthentication.call(context, 'remindersApi', {
                method: 'GET',
                url: '/lists',
                json: true,
            });
            const lists = Array.isArray(response) ? response : [];
            for (const list of lists) {
                const listName = typeof list === 'string' ? list : list.name || list.title || String(list);
                const listUUID = typeof list === 'object' ? list.uuid : null;
                if (!filter || listName.toLowerCase().includes(filter.toLowerCase())) {
                    returnData.push({
                        name: listName,
                        value: listName,
                        url: listUUID ? `/lists/${listUUID}` : `/lists/${encodeURIComponent(listName)}`,
                    });
                }
            }
        }
        catch (error) {
        }
        return { results: returnData };
    }
    static async preFetchReminders(context, options = {}) {
        try {
            const { limit = 20, completed = false, includePrivateFields = true } = options;
            const queryParams = {
                completed: completed.toString(),
                limit: limit.toString(),
            };
            const response = await context.helpers.httpRequestWithAuthentication.call(context, 'remindersApi', {
                method: 'GET',
                url: '/reminders',
                qs: queryParams,
                json: true,
            });
            const reminders = Array.isArray(response) ? response : [];
            return reminders.map((reminder) => {
                const enriched = {
                    uuid: reminder.uuid,
                    title: reminder.title,
                    notes: reminder.notes,
                    isCompleted: reminder.isCompleted,
                    priority: reminder.priority,
                    list: reminder.list,
                    dueDate: reminder.dueDate,
                };
                if (includePrivateFields) {
                    enriched.isSubtask = reminder.isSubtask || false;
                    enriched.parentId = reminder.parentId;
                    enriched.attachedUrl = reminder.attachedUrl;
                    enriched.mailUrl = reminder.mailUrl;
                    enriched.hasAttachments = !!(reminder.attachedUrl || reminder.mailUrl);
                }
                return enriched;
            });
        }
        catch (error) {
            return [];
        }
    }
    static async preFetchListsWithMetadata(context) {
        try {
            const response = await context.helpers.httpRequestWithAuthentication.call(context, 'remindersApi', {
                method: 'GET',
                url: '/lists',
                json: true,
            });
            return Array.isArray(response) ? response : [];
        }
        catch (error) {
            return [];
        }
    }
    static getBaseRequestDefaults() {
        return {
            baseURL: '={{$credentials.baseUrl}}',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: '={{$credentials.apiToken ? "Bearer " + $credentials.apiToken : ""}}',
            },
        };
    }
    static getCredentialsConfig() {
        return [
            {
                name: 'remindersApi',
                required: true,
            },
        ];
    }
    static getListNameResourceLocator(required = true) {
        return {
            displayName: 'List Name',
            name: 'listName',
            type: 'resourceLocator',
            default: { mode: 'list', value: '' },
            required,
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
                {
                    displayName: 'By UUID',
                    name: 'uuid',
                    type: 'string',
                    placeholder: 'ABC123-DEF456-GHI789',
                },
            ],
            description: 'Name or UUID of the reminder list',
        };
    }
    static buildSearchQueryParams(context, requestOptions) {
        const searchOptions = context.getNodeParameter('searchOptions', 0, {});
        const query = {};
        if (searchOptions.query)
            query.query = searchOptions.query;
        if (searchOptions.lists)
            query.lists = searchOptions.lists;
        if (searchOptions.listUUIDs)
            query.listUUIDs = searchOptions.listUUIDs;
        if (searchOptions.completed !== undefined && searchOptions.completed !== 'all') {
            query.completed = searchOptions.completed;
        }
        if (searchOptions.dueBefore)
            query.dueBefore = new Date(searchOptions.dueBefore).toISOString();
        if (searchOptions.dueAfter)
            query.dueAfter = new Date(searchOptions.dueAfter).toISOString();
        if (searchOptions.modifiedAfter)
            query.modifiedAfter = new Date(searchOptions.modifiedAfter).toISOString();
        if (searchOptions.createdAfter)
            query.createdAfter = new Date(searchOptions.createdAfter).toISOString();
        if (searchOptions.hasNotes !== undefined)
            query.hasNotes = searchOptions.hasNotes;
        if (searchOptions.hasDueDate !== undefined)
            query.hasDueDate = searchOptions.hasDueDate;
        if (searchOptions.isSubtask !== undefined)
            query.isSubtask = searchOptions.isSubtask;
        if (searchOptions.hasAttachedUrl !== undefined)
            query.hasAttachedUrl = searchOptions.hasAttachedUrl;
        if (searchOptions.hasMailUrl !== undefined)
            query.hasMailUrl = searchOptions.hasMailUrl;
        if (searchOptions.priority && searchOptions.priority !== '')
            query.priority = searchOptions.priority;
        if (searchOptions.priorityMin !== undefined && searchOptions.priorityMin !== 0)
            query.priorityMin = searchOptions.priorityMin;
        if (searchOptions.priorityMax !== undefined && searchOptions.priorityMax !== 9)
            query.priorityMax = searchOptions.priorityMax;
        if (searchOptions.sortBy)
            query.sortBy = searchOptions.sortBy;
        if (searchOptions.sortOrder)
            query.sortOrder = searchOptions.sortOrder;
        if (searchOptions.limit)
            query.limit = searchOptions.limit;
        requestOptions.qs = query;
        return requestOptions;
    }
    static buildQueryParams(context, requestOptions, paramName = 'includeCompleted') {
        const includeCompleted = context.getNodeParameter(paramName, 0);
        const query = {};
        if (includeCompleted) {
            query.completed = 'true';
        }
        requestOptions.qs = query;
        return requestOptions;
    }
    static getPriorityMapping() {
        return [
            { name: 'None (0)', value: 0 },
            { name: 'Low (1)', value: 1 },
            { name: 'Medium (5)', value: 5 },
            { name: 'High (9)', value: 9 },
        ];
    }
    static buildWebhookFilter(context) {
        const filter = {};
        const filterOptions = context.getNodeParameter('filterOptions', 0, {});
        if (filterOptions.listNames) {
            filter.listNames = filterOptions.listNames.split(',').map((name) => name.trim());
        }
        if (filterOptions.listUUIDs) {
            filter.listUUIDs = filterOptions.listUUIDs.split(',').map((uuid) => uuid.trim());
        }
        if (filterOptions.completed && filterOptions.completed !== 'all') {
            filter.completed = filterOptions.completed;
        }
        if (filterOptions.priorityLevels && filterOptions.priorityLevels.length > 0) {
            filter.priorityLevels = filterOptions.priorityLevels;
        }
        if (filterOptions.hasQuery) {
            filter.hasQuery = filterOptions.hasQuery;
        }
        return filter;
    }
    static extractListIdentifier(listParam) {
        if (typeof listParam === 'string') {
            return listParam;
        }
        if (typeof listParam === 'object') {
            return listParam.value || listParam.name || listParam.uuid || '';
        }
        return '';
    }
    static isValidUUID(uuid) {
        const uuidRegex = /^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}$/;
        return uuidRegex.test(uuid);
    }
    static enrichReminderData(reminder) {
        return {
            ...reminder,
            hasAttachments: !!(reminder.attachedUrl || reminder.mailUrl),
            priorityLevel: this.getPriorityLevelName(reminder.priority),
            isOverdue: reminder.dueDate ? new Date(reminder.dueDate) < new Date() : false,
            hasParent: !!reminder.parentId,
            hasSubtasks: false,
        };
    }
    static getPriorityLevelName(priority) {
        if (priority === 0)
            return 'none';
        if (priority >= 1 && priority <= 3)
            return 'low';
        if (priority >= 4 && priority <= 6)
            return 'medium';
        if (priority >= 7 && priority <= 9)
            return 'high';
        return 'unknown';
    }
    static getAIParameter(inputData, paramName) {
        var _a, _b;
        if (!(inputData === null || inputData === void 0 ? void 0 : inputData.json))
            return undefined;
        const json = inputData.json;
        if (json[paramName] !== undefined)
            return json[paramName];
        if (((_a = json.params) === null || _a === void 0 ? void 0 : _a[paramName]) !== undefined)
            return json.params[paramName];
        if (((_b = json.parameters) === null || _b === void 0 ? void 0 : _b[paramName]) !== undefined)
            return json.parameters[paramName];
        return undefined;
    }
}
exports.RemindersUtils = RemindersUtils;
//# sourceMappingURL=RemindersUtils.js.map