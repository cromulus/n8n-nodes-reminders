"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemindersTask = void 0;
const RemindersUtils_1 = require("../shared/RemindersUtils");
class RemindersTask {
    constructor() {
        this.description = {
            displayName: 'Reminders Task',
            name: 'remindersTask',
            icon: 'file:reminders.svg',
            group: ['productivity'],
            version: 1,
            subtitle: '={{$parameter["operation"]}}',
            description: 'Manage individual reminders - create, update, complete, delete, and get reminders',
            defaults: {
                name: 'Reminders Task',
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
                            name: 'Create Reminder',
                            value: 'create',
                            action: 'Create a new reminder',
                            description: 'Create a new reminder in a specific list',
                            routing: {
                                request: {
                                    method: 'POST',
                                    url: '=/lists/{{encodeURIComponent($parameter.listName.value || $parameter.listName)}}/reminders',
                                },
                                send: {
                                    type: 'body',
                                    property: 'title,notes,dueDate,priority',
                                },
                            },
                        },
                        {
                            name: 'Get Reminder',
                            value: 'get',
                            action: 'Get a specific reminder',
                            description: 'Get a reminder by its UUID',
                            routing: {
                                request: {
                                    method: 'GET',
                                    url: '=/reminders/{{$parameter.uuid}}',
                                },
                            },
                        },
                        {
                            name: 'Get Many',
                            value: 'getAll',
                            action: 'Get many reminders',
                            description: 'Get many reminders across many lists',
                            routing: {
                                request: {
                                    method: 'GET',
                                    url: '/reminders',
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
                        {
                            name: 'Update Reminder',
                            value: 'update',
                            action: 'Update a reminder',
                            description: 'Update an existing reminder by UUID',
                            routing: {
                                request: {
                                    method: 'PATCH',
                                    url: '=/reminders/{{$parameter.uuid}}',
                                },
                                send: {
                                    type: 'body',
                                    property: 'title,notes,dueDate,priority,isCompleted,listName',
                                    preSend: [
                                        function (requestOptions) {
                                            const newListName = this.getNodeParameter('newListName', 0, undefined);
                                            if (newListName) {
                                                const listValue = typeof newListName === 'object' ? newListName.value : newListName;
                                                if (listValue) {
                                                    requestOptions.body.listName = listValue;
                                                }
                                            }
                                            return requestOptions;
                                        },
                                    ],
                                },
                            },
                        },
                        {
                            name: 'Complete Reminder',
                            value: 'complete',
                            action: 'Mark reminder as completed',
                            description: 'Mark a reminder as completed',
                            routing: {
                                request: {
                                    method: 'PATCH',
                                    url: '=/reminders/{{$parameter.uuid}}/complete',
                                },
                                output: {
                                    postReceive: [
                                        {
                                            type: 'set',
                                            properties: {
                                                value: '={{ { "success": true, "uuid": $parameter.uuid, "completed": true } }}',
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                        {
                            name: 'Uncomplete Reminder',
                            value: 'uncomplete',
                            action: 'Mark reminder as incomplete',
                            description: 'Mark a reminder as not completed',
                            routing: {
                                request: {
                                    method: 'PATCH',
                                    url: '=/reminders/{{$parameter.uuid}}/uncomplete',
                                },
                                output: {
                                    postReceive: [
                                        {
                                            type: 'set',
                                            properties: {
                                                value: '={{ { "success": true, "uuid": $parameter.uuid, "completed": false } }}',
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                        {
                            name: 'Delete Reminder',
                            value: 'delete',
                            action: 'Delete a reminder',
                            description: 'Delete a reminder permanently by UUID',
                            routing: {
                                request: {
                                    method: 'DELETE',
                                    url: '=/reminders/{{$parameter.uuid}}',
                                },
                                output: {
                                    postReceive: [
                                        {
                                            type: 'set',
                                            properties: {
                                                value: '={{ { "success": true, "uuid": $parameter.uuid } }}',
                                            },
                                        },
                                    ],
                                },
                            },
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
exports.RemindersTask = RemindersTask;
//# sourceMappingURL=RemindersTask.node.js.map