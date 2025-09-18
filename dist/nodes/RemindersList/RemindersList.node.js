"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemindersList = void 0;
const RemindersUtils_1 = require("../shared/RemindersUtils");
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
            credentials: RemindersUtils_1.RemindersUtils.getCredentialsConfig(),
            requestDefaults: {
                baseURL: '={{$credentials.baseUrl}}',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            },
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
                            routing: {
                                request: {
                                    method: 'GET',
                                    url: '/lists',
                                },
                            },
                        },
                        {
                            name: 'Get List Reminders',
                            value: 'getListReminders',
                            action: 'Get reminders from a specific list',
                            description: 'Get all reminders from a specific list',
                            routing: {
                                request: {
                                    method: 'GET',
                                    url: '=/lists/{{encodeURIComponent($parameter.listName.value || $parameter.listName)}}',
                                    qs: {
                                        completed: '={{$parameter.includeCompleted}}',
                                    },
                                },
                            },
                        },
                        {
                            name: 'Move List',
                            value: 'moveList',
                            action: 'Move reminder from list to another',
                            description: 'Move a reminder from one list to another',
                            routing: {
                                request: {
                                    method: 'PATCH',
                                    url: '=/reminders/{{$parameter.reminderUuid}}',
                                    body: {
                                        newListName: '={{$parameter.targetList.value || $parameter.targetList}}',
                                    },
                                },
                            },
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
                    displayName: 'Reminder UUID',
                    name: 'reminderUuid',
                    type: 'string',
                    required: true,
                    displayOptions: {
                        show: {
                            operation: ['moveList'],
                        },
                    },
                    default: '',
                    description: 'UUID of the reminder to move',
                    placeholder: 'ABC123-DEF456-GHI789',
                },
                {
                    displayName: 'Target List',
                    name: 'targetList',
                    type: 'resourceLocator',
                    default: { mode: 'list', value: '' },
                    required: true,
                    displayOptions: {
                        show: {
                            operation: ['moveList'],
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
                    description: 'The list to move the reminder to',
                },
                {
                    displayName: 'AI Context Options',
                    name: 'aiOptions',
                    type: 'collection',
                    placeholder: 'Add AI Context Option',
                    default: {},
                    displayOptions: {
                        show: {
                            operation: ['getAllLists'],
                        },
                    },
                    options: [
                        {
                            displayName: 'Include AI Context',
                            name: 'includeAIContext',
                            type: 'boolean',
                            default: false,
                            description: 'Whether to include additional context information for AI processing',
                        },
                        {
                            displayName: 'Pre-Fetch Reminders',
                            name: 'preFetchReminders',
                            type: 'boolean',
                            default: false,
                            description: 'Whether to pre-fetch reminders for each list (may impact performance)',
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
}
exports.RemindersList = RemindersList;
//# sourceMappingURL=RemindersList.node.js.map