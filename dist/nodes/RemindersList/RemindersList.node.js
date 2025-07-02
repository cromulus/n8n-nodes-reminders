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
            description: 'Manage reminder lists - get all lists or get reminders from a specific list',
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
                                },
                                send: {
                                    preSend: [
                                        function (requestOptions) {
                                            return RemindersUtils_1.RemindersUtils.buildQueryParams(this, requestOptions);
                                        },
                                    ],
                                },
                            },
                        },
                    ],
                    default: 'getAllLists',
                },
                {
                    ...RemindersUtils_1.RemindersUtils.getListNameResourceLocator(),
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