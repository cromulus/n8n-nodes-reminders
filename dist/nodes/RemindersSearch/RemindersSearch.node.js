"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemindersSearch = void 0;
const RemindersUtils_1 = require("../shared/RemindersUtils");
class RemindersSearch {
    constructor() {
        this.description = {
            displayName: 'Reminders Search',
            name: 'remindersSearch',
            icon: 'file:reminders.svg',
            group: ['productivity'],
            version: 1,
            subtitle: 'Advanced search',
            description: 'Search reminders with advanced filtering options across all lists',
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
                    type: 'options',
                    noDataExpression: true,
                    options: [
                        {
                            name: 'Search Reminders',
                            value: 'search',
                            action: 'Search reminders with filters',
                            description: 'Search reminders with advanced filtering options',
                            routing: {
                                request: {
                                    method: 'GET',
                                    url: '/search',
                                },
                                send: {
                                    preSend: [
                                        function (requestOptions) {
                                            const searchOptions = this.getNodeParameter('searchOptions', 0, {});
                                            const query = {};
                                            if (searchOptions.query)
                                                query.query = searchOptions.query;
                                            if (searchOptions.lists)
                                                query.lists = searchOptions.lists;
                                            if (searchOptions.listUUIDs)
                                                query.listUUIDs = searchOptions.listUUIDs;
                                            if (searchOptions.completed !== undefined && searchOptions.completed !== 'all')
                                                query.completed = searchOptions.completed;
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
                                            if (searchOptions.limit && searchOptions.limit !== 50)
                                                query.limit = searchOptions.limit;
                                            requestOptions.qs = query;
                                            return requestOptions;
                                        },
                                    ],
                                },
                            },
                        },
                    ],
                    default: 'search',
                },
                {
                    displayName: 'Search Options',
                    name: 'searchOptions',
                    type: 'collection',
                    placeholder: 'Add Search Option',
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
                                    name: 'Completed Only',
                                    value: 'true',
                                },
                                {
                                    name: 'Incomplete Only',
                                    value: 'false',
                                },
                            ],
                            default: 'all',
                            description: 'Filter by completion status',
                        },
                        {
                            displayName: 'Created After',
                            name: 'createdAfter',
                            type: 'dateTime',
                            default: '',
                            description: 'Show only reminders created after this date',
                        },
                        {
                            displayName: 'Due After',
                            name: 'dueAfter',
                            type: 'dateTime',
                            default: '',
                            description: 'Show only reminders due after this date',
                        },
                        {
                            displayName: 'Due Before',
                            name: 'dueBefore',
                            type: 'dateTime',
                            default: '',
                            description: 'Show only reminders due before this date',
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
                            displayName: 'Limit Results',
                            name: 'limit',
                            type: 'number',
                            typeOptions: {
                                minValue: 1,
                            },
                            default: 50,
                            description: 'Max number of results to return',
                        },
                        {
                            displayName: 'List Names',
                            name: 'lists',
                            type: 'string',
                            default: '',
                            description: 'Comma-separated list of list names to search in',
                            placeholder: 'Shopping,Work',
                        },
                        {
                            displayName: 'List UUIDs',
                            name: 'listUUIDs',
                            type: 'string',
                            default: '',
                            description: 'Comma-separated list of list UUIDs to search in',
                            placeholder: 'uuid1,uuid2',
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
                            displayName: 'Modified After',
                            name: 'modifiedAfter',
                            type: 'dateTime',
                            default: '',
                            description: 'Show only reminders modified after this date',
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
                                    name: 'High',
                                    value: 'high',
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
                                    name: 'None',
                                    value: 'none',
                                },
                            ],
                            default: '',
                            description: 'Filter by exact priority level',
                        },
                        {
                            displayName: 'Search Text',
                            name: 'query',
                            type: 'string',
                            default: '',
                            description: 'Text to search for in reminder titles and notes',
                            placeholder: 'groceries',
                        },
                        {
                            displayName: 'Sort By',
                            name: 'sortBy',
                            type: 'options',
                            options: [
                                {
                                    name: 'Created Date',
                                    value: 'created',
                                },
                                {
                                    name: 'Due Date',
                                    value: 'duedate',
                                },
                                {
                                    name: 'List',
                                    value: 'list',
                                },
                                {
                                    name: 'Modified Date',
                                    value: 'modified',
                                },
                                {
                                    name: 'Priority',
                                    value: 'priority',
                                },
                                {
                                    name: 'Title',
                                    value: 'title',
                                },
                            ],
                            default: 'created',
                            description: 'Field to sort results by',
                        },
                        {
                            displayName: 'Sort Order',
                            name: 'sortOrder',
                            type: 'options',
                            options: [
                                {
                                    name: 'Ascending',
                                    value: 'asc',
                                },
                                {
                                    name: 'Descending',
                                    value: 'desc',
                                },
                            ],
                            default: 'desc',
                            description: 'Sort order for results',
                        },
                    ],
                },
            ],
        };
    }
}
exports.RemindersSearch = RemindersSearch;
//# sourceMappingURL=RemindersSearch.node.js.map