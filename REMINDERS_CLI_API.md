# Reminders CLI n8n Node Development Guide

## Overview

This guide provides comprehensive documentation for creating n8n nodes for the Reminders CLI HTTP API using the **declarative style**. The declarative approach uses configuration objects to define node behavior, making it easier to maintain and extend.

## Project Structure

```
n8n-nodes-reminders/
├── package.json
├── tsconfig.json
├── gulpfile.js
├── credentials/
│   └── RemindersApi.credentials.ts
├── nodes/
│   ├── Reminders/
│   │   ├── Reminders.node.ts
│   │   ├── Reminders.node.json
│   │   └── reminders.svg
│   └── RemindersAiTool/
│       ├── RemindersAiTool.node.ts
│       ├── RemindersAiTool.node.json
│       └── reminders-ai.svg
├── test/
│   └── nodes/
└── dist/
```

## Credentials Configuration

### RemindersApi.credentials.ts
```typescript
import type {
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class RemindersApi implements ICredentialType {
  name = 'remindersApi';
  displayName = 'Reminders API';
  documentationUrl = 'https://github.com/your-repo/reminders-cli';
  properties: INodeProperties[] = [
    {
      displayName: 'API Token',
      name: 'apiToken',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      required: true,
      description: 'API token for authentication. Generate with: reminders-api --generate-token',
    },
    {
      displayName: 'Base URL',
      name: 'baseUrl',
      type: 'string',
      default: 'http://127.0.0.1:8080',
      required: true,
      description: 'Base URL of the Reminders API server',
      placeholder: 'http://127.0.0.1:8080',
    },
    {
      displayName: 'Ignore SSL Issues',
      name: 'allowUnauthorizedCerts',
      type: 'boolean',
      default: false,
      description: 'Whether to connect even if SSL certificate validation fails',
    },
  ];

  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials.baseUrl}}',
      url: '/lists',
      method: 'GET',
      headers: {
        Authorization: 'Bearer ={{$credentials.apiToken}}',
      },
    },
  };
}
```

## Traditional Declarative Node

### Reminders.node.ts
```typescript
import type {
  IExecuteFunctions,
  INodeType,
  INodeTypeDescription,
  IHttpRequestMethods,
  IRequestOptions,
} from 'n8n-workflow';

export class Reminders implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Reminders',
    name: 'reminders',
    icon: 'file:reminders.svg',
    group: ['productivity'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with macOS Reminders',
    defaults: {
      name: 'Reminders',
    },
    inputs: ['main'],
    outputs: ['main'],
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
        Authorization: 'Bearer ={{$credentials.apiToken}}',
      },
    },
    properties: [
      // Resource Selection
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'List',
            value: 'list',
          },
          {
            name: 'Reminder',
            value: 'reminder',
          },
          {
            name: 'Search',
            value: 'search',
          },
          {
            name: 'Webhook',
            value: 'webhook',
          },
        ],
        default: 'reminder',
      },

      // List Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['list'],
          },
        },
        options: [
          {
            name: 'Get All',
            value: 'getAll',
            action: 'Get all lists',
            description: 'Retrieve all reminder lists',
            routing: {
              request: {
                method: 'GET',
                url: '/lists',
              },
            },
          },
          {
            name: 'Get Reminders',
            value: 'getReminders',
            action: 'Get reminders from list',
            description: 'Get all reminders from a specific list',
            routing: {
              request: {
                method: 'GET',
                url: '=/lists/{{encodeURIComponent($parameter.listName)}}',
              },
              send: {
                preSend: [
                  async function(this: IExecuteFunctions, requestOptions: IRequestOptions): Promise<IRequestOptions> {
                    const includeCompleted = this.getNodeParameter('includeCompleted', 0) as boolean;
                    if (includeCompleted) {
                      requestOptions.qs = { completed: 'true' };
                    }
                    return requestOptions;
                  },
                ],
              },
            },
          },
        ],
        default: 'getAll',
      },

      // Reminder Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['reminder'],
          },
        },
        options: [
          {
            name: 'Create',
            value: 'create',
            action: 'Create a reminder',
            description: 'Create a new reminder',
            routing: {
              request: {
                method: 'POST',
                url: '=/lists/{{encodeURIComponent($parameter.listName)}}/reminders',
              },
              send: {
                type: 'body',
                properties: ['title', 'notes', 'dueDate', 'priority'],
                propertyInDotNotation: false,
              },
            },
          },
          {
            name: 'Delete',
            value: 'delete',
            action: 'Delete a reminder',
            description: 'Delete a reminder by UUID',
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
          {
            name: 'Get',
            value: 'get',
            action: 'Get a reminder',
            description: 'Get a reminder by UUID',
            routing: {
              request: {
                method: 'GET',
                url: '=/reminders/{{$parameter.uuid}}',
              },
            },
          },
          {
            name: 'Get All',
            value: 'getAll',
            action: 'Get all reminders',
            description: 'Get all reminders across all lists',
            routing: {
              request: {
                method: 'GET',
                url: '/reminders',
              },
              send: {
                preSend: [
                  async function(this: IExecuteFunctions, requestOptions: IRequestOptions): Promise<IRequestOptions> {
                    const includeCompleted = this.getNodeParameter('includeCompleted', 0) as boolean;
                    if (includeCompleted) {
                      requestOptions.qs = { completed: 'true' };
                    }
                    return requestOptions;
                  },
                ],
              },
            },
          },
          {
            name: 'Update',
            value: 'update',
            action: 'Update a reminder',
            description: 'Update a reminder by UUID',
            routing: {
              request: {
                method: 'PATCH',
                url: '=/reminders/{{$parameter.uuid}}',
              },
              send: {
                type: 'body',
                properties: ['title', 'notes', 'dueDate', 'priority', 'isCompleted'],
                propertyInDotNotation: false,
              },
            },
          },
          {
            name: 'Complete',
            value: 'complete',
            action: 'Complete a reminder',
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
            name: 'Uncomplete',
            value: 'uncomplete',
            action: 'Uncomplete a reminder',
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
        ],
        default: 'getAll',
      },

      // Search Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['search'],
          },
        },
        options: [
          {
            name: 'Search Reminders',
            value: 'search',
            action: 'Search reminders',
            description: 'Search reminders with advanced filtering',
            routing: {
              request: {
                method: 'GET',
                url: '/search',
              },
              send: {
                preSend: [
                  async function(this: IExecuteFunctions, requestOptions: IRequestOptions): Promise<IRequestOptions> {
                    const searchOptions = this.getNodeParameter('searchOptions', 0) as any;
                    const query: any = {};
                    
                    // Build query parameters from searchOptions
                    if (searchOptions.query) query.query = searchOptions.query;
                    if (searchOptions.lists) query.lists = Array.isArray(searchOptions.lists) ? searchOptions.lists.join(',') : searchOptions.lists;
                    if (searchOptions.completed !== undefined) query.completed = searchOptions.completed;
                    if (searchOptions.dueBefore) query.dueBefore = new Date(searchOptions.dueBefore).toISOString();
                    if (searchOptions.dueAfter) query.dueAfter = new Date(searchOptions.dueAfter).toISOString();
                    if (searchOptions.modifiedAfter) query.modifiedAfter = new Date(searchOptions.modifiedAfter).toISOString();
                    if (searchOptions.createdAfter) query.createdAfter = new Date(searchOptions.createdAfter).toISOString();
                    if (searchOptions.hasNotes !== undefined) query.hasNotes = searchOptions.hasNotes;
                    if (searchOptions.hasDueDate !== undefined) query.hasDueDate = searchOptions.hasDueDate;
                    if (searchOptions.priority) query.priority = searchOptions.priority;
                    if (searchOptions.priorityMin !== undefined) query.priorityMin = searchOptions.priorityMin;
                    if (searchOptions.priorityMax !== undefined) query.priorityMax = searchOptions.priorityMax;
                    if (searchOptions.sortBy) query.sortBy = searchOptions.sortBy;
                    if (searchOptions.sortOrder) query.sortOrder = searchOptions.sortOrder;
                    if (searchOptions.limit) query.limit = searchOptions.limit;
                    
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

      // Webhook Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['webhook'],
          },
        },
        options: [
          {
            name: 'Create',
            value: 'create',
            action: 'Create a webhook',
            description: 'Create a new webhook configuration',
            routing: {
              request: {
                method: 'POST',
                url: '/webhooks',
              },
              send: {
                type: 'body',
                properties: ['url', 'name', 'filter'],
              },
            },
          },
          {
            name: 'Delete',
            value: 'delete',
            action: 'Delete a webhook',
            description: 'Delete a webhook configuration',
            routing: {
              request: {
                method: 'DELETE',
                url: '=/webhooks/{{$parameter.webhookId}}',
              },
            },
          },
          {
            name: 'Get All',
            value: 'getAll',
            action: 'Get all webhooks',
            description: 'Get all webhook configurations',
            routing: {
              request: {
                method: 'GET',
                url: '/webhooks',
              },
            },
          },
          {
            name: 'Test',
            value: 'test',
            action: 'Test a webhook',
            description: 'Send a test event to a webhook',
            routing: {
              request: {
                method: 'POST',
                url: '=/webhooks/{{$parameter.webhookId}}/test',
              },
            },
          },
          {
            name: 'Update',
            value: 'update',
            action: 'Update a webhook',
            description: 'Update a webhook configuration',
            routing: {
              request: {
                method: 'PATCH',
                url: '=/webhooks/{{$parameter.webhookId}}',
              },
              send: {
                type: 'body',
                properties: ['url', 'name', 'isActive', 'filter'],
              },
            },
          },
        ],
        default: 'getAll',
      },

      // Shared Parameters
      
      // List Name (for various operations)
      {
        displayName: 'List Name',
        name: 'listName',
        type: 'string',
        required: true,
        displayOptions: {
          show: {
            resource: ['list', 'reminder'],
            operation: ['getReminders', 'create'],
          },
        },
        default: '',
        description: 'Name of the reminder list',
        placeholder: 'Shopping',
      },

      // Include Completed
      {
        displayName: 'Include Completed',
        name: 'includeCompleted',
        type: 'boolean',
        displayOptions: {
          show: {
            resource: ['list', 'reminder'],
            operation: ['getReminders', 'getAll'],
          },
        },
        default: false,
        description: 'Whether to include completed reminders in results',
      },

      // Reminder UUID
      {
        displayName: 'Reminder UUID',
        name: 'uuid',
        type: 'string',
        required: true,
        displayOptions: {
          show: {
            resource: ['reminder'],
            operation: ['get', 'update', 'delete', 'complete', 'uncomplete'],
          },
        },
        default: '',
        description: 'UUID of the reminder',
        placeholder: 'ABC123-DEF456-GHI789',
      },

      // Reminder Title
      {
        displayName: 'Title',
        name: 'title',
        type: 'string',
        required: true,
        displayOptions: {
          show: {
            resource: ['reminder'],
            operation: ['create'],
          },
        },
        default: '',
        description: 'Title of the reminder',
        placeholder: 'Buy groceries',
      },

      // Optional title for update
      {
        displayName: 'Title',
        name: 'title',
        type: 'string',
        displayOptions: {
          show: {
            resource: ['reminder'],
            operation: ['update'],
          },
        },
        default: '',
        description: 'New title for the reminder (leave empty to keep current)',
        placeholder: 'Buy groceries',
      },

      // Reminder Notes
      {
        displayName: 'Notes',
        name: 'notes',
        type: 'string',
        typeOptions: {
          rows: 3,
        },
        displayOptions: {
          show: {
            resource: ['reminder'],
            operation: ['create', 'update'],
          },
        },
        default: '',
        description: 'Notes for the reminder',
        placeholder: 'Milk, bread, eggs',
      },

      // Due Date
      {
        displayName: 'Due Date',
        name: 'dueDate',
        type: 'dateTime',
        displayOptions: {
          show: {
            resource: ['reminder'],
            operation: ['create', 'update'],
          },
        },
        default: '',
        description: 'Due date for the reminder',
      },

      // Priority
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
            resource: ['reminder'],
            operation: ['create', 'update'],
          },
        },
        default: 'none',
        description: 'Priority level of the reminder',
      },

      // Completed Status (for update)
      {
        displayName: 'Completed',
        name: 'isCompleted',
        type: 'boolean',
        displayOptions: {
          show: {
            resource: ['reminder'],
            operation: ['update'],
          },
        },
        default: false,
        description: 'Whether the reminder is completed',
      },

      // Search Options
      {
        displayName: 'Search Options',
        name: 'searchOptions',
        type: 'collection',
        placeholder: 'Add Option',
        displayOptions: {
          show: {
            resource: ['search'],
            operation: ['search'],
          },
        },
        default: {},
        options: [
          {
            displayName: 'Query',
            name: 'query',
            type: 'string',
            default: '',
            description: 'Text to search for in reminder titles and notes',
            placeholder: 'groceries',
          },
          {
            displayName: 'Lists',
            name: 'lists',
            type: 'string',
            default: '',
            description: 'Comma-separated list of list names to search in',
            placeholder: 'Shopping,Work',
          },
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
            displayName: 'Due Before',
            name: 'dueBefore',
            type: 'dateTime',
            default: '',
            description: 'Show only reminders due before this date',
          },
          {
            displayName: 'Due After',
            name: 'dueAfter',
            type: 'dateTime',
            default: '',
            description: 'Show only reminders due after this date',
          },
          {
            displayName: 'Modified After',
            name: 'modifiedAfter',
            type: 'dateTime',
            default: '',
            description: 'Show only reminders modified after this date',
          },
          {
            displayName: 'Created After',
            name: 'createdAfter',
            type: 'dateTime',
            default: '',
            description: 'Show only reminders created after this date',
          },
          {
            displayName: 'Has Notes',
            name: 'hasNotes',
            type: 'boolean',
            default: false,
            description: 'Filter by presence of notes',
          },
          {
            displayName: 'Has Due Date',
            name: 'hasDueDate',
            type: 'boolean',
            default: false,
            description: 'Filter by presence of due date',
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
                name: 'Title',
                value: 'title',
              },
              {
                name: 'Due Date',
                value: 'duedate',
              },
              {
                name: 'Created Date',
                value: 'created',
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
                name: 'List',
                value: 'list',
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
          {
            displayName: 'Limit',
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

      // Webhook Parameters
      {
        displayName: 'Webhook ID',
        name: 'webhookId',
        type: 'string',
        required: true,
        displayOptions: {
          show: {
            resource: ['webhook'],
            operation: ['update', 'delete', 'test'],
          },
        },
        default: '',
        description: 'UUID of the webhook configuration',
        placeholder: 'webhook-uuid-123',
      },

      {
        displayName: 'Webhook URL',
        name: 'url',
        type: 'string',
        required: true,
        displayOptions: {
          show: {
            resource: ['webhook'],
            operation: ['create'],
          },
        },
        default: '',
        description: 'URL to send webhook notifications to',
        placeholder: 'https://your-server.com/webhook',
      },

      {
        displayName: 'Webhook URL',
        name: 'url',
        type: 'string',
        displayOptions: {
          show: {
            resource: ['webhook'],
            operation: ['update'],
          },
        },
        default: '',
        description: 'New URL to send webhook notifications to',
        placeholder: 'https://your-server.com/webhook',
      },

      {
        displayName: 'Webhook Name',
        name: 'name',
        type: 'string',
        required: true,
        displayOptions: {
          show: {
            resource: ['webhook'],
            operation: ['create'],
          },
        },
        default: '',
        description: 'Name for the webhook configuration',
        placeholder: 'Task Notifications',
      },

      {
        displayName: 'Webhook Name',
        name: 'name',
        type: 'string',
        displayOptions: {
          show: {
            resource: ['webhook'],
            operation: ['update'],
          },
        },
        default: '',
        description: 'New name for the webhook configuration',
        placeholder: 'Task Notifications',
      },

      {
        displayName: 'Active',
        name: 'isActive',
        type: 'boolean',
        displayOptions: {
          show: {
            resource: ['webhook'],
            operation: ['update'],
          },
        },
        default: true,
        description: 'Whether the webhook is active',
      },

      {
        displayName: 'Filter Options',
        name: 'filter',
        type: 'collection',
        placeholder: 'Add Filter',
        displayOptions: {
          show: {
            resource: ['webhook'],
            operation: ['create', 'update'],
          },
        },
        default: {},
        options: [
          {
            displayName: 'List Names',
            name: 'listNames',
            type: 'string',
            default: '',
            description: 'Comma-separated list of list names to monitor',
            placeholder: 'Shopping,Work',
          },
          {
            displayName: 'List UUIDs',
            name: 'listUUIDs',
            type: 'string',
            default: '',
            description: 'Comma-separated list of list UUIDs to monitor',
            placeholder: 'uuid1,uuid2',
          },
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
                name: 'Complete',
                value: 'complete',
              },
              {
                name: 'Incomplete',
                value: 'incomplete',
              },
            ],
            default: 'all',
            description: 'Monitor reminders with this completion status',
          },
          {
            displayName: 'Priority Levels',
            name: 'priorityLevels',
            type: 'string',
            default: '',
            description: 'Comma-separated priority levels to monitor (0-9)',
            placeholder: '2,3,9',
          },
          {
            displayName: 'Text Query',
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
```

## AI Tool Declarative Node

### RemindersAiTool.node.ts
```typescript
import type {
  IExecuteFunctions,
  INodeType,
  INodeTypeDescription,
  IDataObject,
  INodeExecutionData,
} from 'n8n-workflow';

interface ReminderAiToolResponse {
  success: boolean;
  action: string;
  data?: any;
  error?: string;
  summary: string;
}

export class RemindersAiTool implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Reminders AI Tool',
    name: 'remindersAiTool',
    icon: 'file:reminders-ai.svg',
    group: ['ai'],
    version: 1,
    description: 'AI-powered tool for managing macOS Reminders',
    defaults: {
      name: 'Reminders AI Tool',
    },
    inputs: ['main'],
    outputs: ['main'],
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
        Authorization: 'Bearer ={{$credentials.apiToken}}',
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
            displayName: 'Auto-parse Dates',
            name: 'autoParseDates',
            type: 'boolean',
            default: true,
            description: 'Automatically parse natural language dates',
          },
          {
            displayName: 'Include Context',
            name: 'includeContext',
            type: 'boolean',
            default: true,
            description: 'Include list context and metadata in responses',
          },
        ],
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const credentials = await this.getCredentials('remindersApi');
    const baseUrl = credentials.baseUrl as string;

    for (let i = 0; i < items.length; i++) {
      const toolInput = items[i].json as any;
      const { action, ...params } = toolInput;

      try {
        let result: ReminderAiToolResponse;

        switch (action) {
          case 'get_lists':
            result = await this.handleGetLists();
            break;

          case 'get_reminders':
            result = await this.handleGetReminders(params);
            break;

          case 'create_reminder':
            result = await this.handleCreateReminder(params);
            break;

          case 'update_reminder':
            result = await this.handleUpdateReminder(params);
            break;

          case 'delete_reminder':
            result = await this.handleDeleteReminder(params);
            break;

          case 'search_reminders':
            result = await this.handleSearchReminders(params);
            break;

          case 'complete_reminder':
            result = await this.handleCompleteReminder(params);
            break;

          case 'setup_webhook':
            result = await this.handleSetupWebhook(params);
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

      } catch (error) {
        const errorResult: ReminderAiToolResponse = {
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

  private async handleGetLists(this: IExecuteFunctions): Promise<ReminderAiToolResponse> {
    const response = await this.helpers.httpRequest({
      method: 'GET',
      url: `${await this.getCredentials('remindersApi').then(c => c.baseUrl)}/lists`,
      headers: {
        Authorization: `Bearer ${await this.getCredentials('remindersApi').then(c => c.apiToken)}`,
      },
    });

    return {
      success: true,
      action: 'get_lists',
      data: { lists: response, count: response.length },
      summary: `Found ${response.length} reminder lists: ${response.map((l: any) => l.title).join(', ')}`,
    };
  }

  private async handleGetReminders(this: IExecuteFunctions, params: any): Promise<ReminderAiToolResponse> {
    const credentials = await this.getCredentials('remindersApi');
    let url = `${credentials.baseUrl}/reminders`;
    const query: any = {};

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
        Authorization: `Bearer ${credentials.apiToken}`,
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

  private async handleCreateReminder(this: IExecuteFunctions, params: any): Promise<ReminderAiToolResponse> {
    if (!params.title || !params.list_name) {
      throw new Error('Title and list_name are required for creating reminders');
    }

    const credentials = await this.getCredentials('remindersApi');
    const body: any = { title: params.title };

    if (params.notes) body.notes = params.notes;
    if (params.due_date) body.dueDate = params.due_date;
    if (params.priority) body.priority = params.priority;

    const response = await this.helpers.httpRequest({
      method: 'POST',
      url: `${credentials.baseUrl}/lists/${encodeURIComponent(params.list_name)}/reminders`,
      body,
      headers: {
        Authorization: `Bearer ${credentials.apiToken}`,
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

  private async handleUpdateReminder(this: IExecuteFunctions, params: any): Promise<ReminderAiToolResponse> {
    if (!params.uuid) {
      throw new Error('UUID is required for updating reminders');
    }

    const credentials = await this.getCredentials('remindersApi');
    const body: any = {};

    if (params.title) body.title = params.title;
    if (params.notes !== undefined) body.notes = params.notes;
    if (params.due_date) body.dueDate = params.due_date;
    if (params.priority) body.priority = params.priority;
    if (params.is_completed !== undefined) body.isCompleted = params.is_completed;

    const response = await this.helpers.httpRequest({
      method: 'PATCH',
      url: `${credentials.baseUrl}/reminders/${params.uuid}`,
      body,
      headers: {
        Authorization: `Bearer ${credentials.apiToken}`,
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

  private async handleDeleteReminder(this: IExecuteFunctions, params: any): Promise<ReminderAiToolResponse> {
    if (!params.uuid) {
      throw new Error('UUID is required for deleting reminders');
    }

    const credentials = await this.getCredentials('remindersApi');
    await this.helpers.httpRequest({
      method: 'DELETE',
      url: `${credentials.baseUrl}/reminders/${params.uuid}`,
      headers: {
        Authorization: `Bearer ${credentials.apiToken}`,
      },
    });

    return {
      success: true,
      action: 'delete_reminder',
      data: { uuid: params.uuid },
      summary: `Deleted reminder with UUID ${params.uuid}`,
    };
  }

  private async handleSearchReminders(this: IExecuteFunctions, params: any): Promise<ReminderAiToolResponse> {
    const credentials = await this.getCredentials('remindersApi');
    const query: any = {};

    if (params.search_query) query.query = params.search_query;
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
        Authorization: `Bearer ${credentials.apiToken}`,
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

  private async handleCompleteReminder(this: IExecuteFunctions, params: any): Promise<ReminderAiToolResponse> {
    if (!params.uuid) {
      throw new Error('UUID is required for completing reminders');
    }

    const credentials = await this.getCredentials('remindersApi');
    const endpoint = params.completed === false ? 'uncomplete' : 'complete';
    
    await this.helpers.httpRequest({
      method: 'PATCH',
      url: `${credentials.baseUrl}/reminders/${params.uuid}/${endpoint}`,
      headers: {
        Authorization: `Bearer ${credentials.apiToken}`,
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

  private async handleSetupWebhook(this: IExecuteFunctions, params: any): Promise<ReminderAiToolResponse> {
    if (!params.webhook_config?.url) {
      throw new Error('Webhook URL is required in webhook_config');
    }

    const credentials = await this.getCredentials('remindersApi');
    const webhookConfig = params.webhook_config;
    
    const body: any = {
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
        Authorization: `Bearer ${credentials.apiToken}`,
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
```

## Tool Description for AI Agents

### reminders-tool-description.json
```json
{
  "name": "reminders_manager",
  "description": "Manage macOS Reminders - create, update, search, and organize reminders across lists. Supports real-time webhook notifications for reminder changes.",
  "parameters": {
    "type": "object",
    "properties": {
      "action": {
        "type": "string",
        "enum": [
          "get_lists",
          "get_reminders", 
          "create_reminder",
          "update_reminder",
          "delete_reminder",
          "search_reminders",
          "complete_reminder",
          "setup_webhook"
        ],
        "description": "The action to perform with reminders"
      },
      "list_name": {
        "type": "string",
        "description": "Name of the reminder list (required for create_reminder, get_reminders from specific list)"
      },
      "title": {
        "type": "string",
        "description": "Title of the reminder (required for create_reminder)"
      },
      "notes": {
        "type": "string",
        "description": "Notes/description for the reminder (optional)"
      },
      "due_date": {
        "type": "string",
        "format": "date-time",
        "description": "Due date in ISO8601 format (optional)"
      },
      "priority": {
        "type": "string",
        "enum": ["none", "low", "medium", "high"],
        "description": "Priority level of the reminder"
      },
      "uuid": {
        "type": "string",
        "description": "UUID of the reminder (required for update, delete, complete operations)"
      },
      "search_query": {
        "type": "string",
        "description": "Text to search for in reminder titles and notes"
      },
      "include_completed": {
        "type": "boolean",
        "description": "Include completed reminders in results"
      },
      "completed": {
        "type": "boolean",
        "description": "Mark reminder as completed (true) or incomplete (false)"
      },
      "is_completed": {
        "type": "boolean",
        "description": "Set completion status when updating reminder"
      },
      "filters": {
        "type": "object",
        "properties": {
          "completed": {
            "type": "string",
            "enum": ["all", "true", "false"],
            "description": "Filter by completion status"
          },
          "due_before": {
            "type": "string",
            "format": "date-time",
            "description": "Only show reminders due before this date"
          },
          "due_after": {
            "type": "string",
            "format": "date-time", 
            "description": "Only show reminders due after this date"
          },
          "has_notes": {
            "type": "boolean",
            "description": "Filter by presence of notes"
          },
          "has_due_date": {
            "type": "boolean",
            "description": "Filter by presence of due date"
          },
          "lists": {
            "type": "array",
            "items": { "type": "string" },
            "description": "List names to search within"
          },
          "priority": {
            "type": "string",
            "enum": ["none", "low", "medium", "high"],
            "description": "Filter by priority level"
          },
          "sort_by": {
            "type": "string",
            "enum": ["title", "duedate", "created", "modified", "priority", "list"],
            "description": "Field to sort results by"
          },
          "sort_order": {
            "type": "string",
            "enum": ["asc", "desc"],
            "description": "Sort order"
          },
          "limit": {
            "type": "integer",
            "minimum": 1,
            "maximum": 1000,
            "description": "Maximum number of results"
          }
        },
        "description": "Additional filters for search operations"
      },
      "webhook_config": {
        "type": "object",
        "properties": {
          "url": {
            "type": "string",
            "format": "uri",
            "description": "Webhook URL to receive notifications"
          },
          "name": {
            "type": "string",
            "description": "Name for the webhook configuration"
          },
          "lists": {
            "type": "array",
            "items": { "type": "string" },
            "description": "List names to monitor for changes"
          }
        },
        "required": ["url"],
        "description": "Webhook configuration for real-time notifications"
      }
    },
    "required": ["action"]
  }
}
```

## Package Configuration

### package.json
```json
{
  "name": "n8n-nodes-reminders",
  "version": "1.0.0",
  "description": "n8n nodes for macOS Reminders API with AI tool support",
  "license": "MIT",
  "homepage": "https://github.com/your-username/n8n-nodes-reminders",
  "author": {
    "name": "Your Name",
    "email": "your.email@example.com"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/your-username/n8n-nodes-reminders.git"
  },
  "engines": {
    "node": ">=18.10",
    "pnpm": ">=8.1"
  },
  "packageManager": "pnpm@8.1.0",
  "main": "index.js",
  "scripts": {
    "build": "tsc && gulp build:icons",
    "dev": "tsc --watch",
    "format": "prettier --write .",
    "lint": "eslint . --ext .ts",
    "lintfix": "eslint . --ext .ts --fix",
    "test": "jest",
    "package": "npm run build && npm pack"
  },
  "files": [
    "dist"
  ],
  "n8n": {
    "n8nNodesApiVersion": 1,
    "nodes": [
      "dist/nodes/Reminders/Reminders.node.js",
      "dist/nodes/RemindersAiTool/RemindersAiTool.node.js"
    ],
    "credentials": [
      "dist/credentials/RemindersApi.credentials.js"
    ]
  },
  "keywords": [
    "n8n-community-node-package",
    "n8n",
    "reminders",
    "macos",
    "productivity",
    "ai-tool",
    "automation",
    "task-management"
  ],
  "dependencies": {},
  "devDependencies": {
    "@types/jest": "^29.4.0",
    "@types/node": "^18.14.6",
    "@typescript-eslint/eslint-plugin": "^5.55.0",
    "@typescript-eslint/parser": "^5.55.0",
    "eslint": "^8.36.0",
    "eslint-plugin-n8n-nodes-base": "^1.11.0",
    "gulp": "^4.0.2",
    "jest": "^29.5.0",
    "n8n-workflow": "^1.0.0",
    "prettier": "^2.8.4",
    "ts-jest": "^29.0.5",
    "typescript": "^4.9.5"
  },
  "peerDependencies": {
    "n8n-workflow": "*"
  }
}
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2019",
    "module": "commonjs",
    "lib": ["ES2019"],
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./",
    "strict": true,
    "noImplicitAny": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": [
    "credentials/**/*",
    "nodes/**/*"
  ],
  "exclude": [
    "node_modules/**/*",
    "dist/**/*",
    "test/**/*"
  ]
}
```

### gulpfile.js
```javascript
const gulp = require('gulp');

function buildIcons() {
  return gulp.src('nodes/**/*.{png,svg}')
    .pipe(gulp.dest('dist/nodes'));
}

exports.build = buildIcons;
exports['build:icons'] = buildIcons;
exports.default = buildIcons;
```

## Development Workflow

### 1. Setup Development Environment
```bash
# Clone and setup
git clone https://github.com/your-username/n8n-nodes-reminders.git
cd n8n-nodes-reminders
npm install

# Start development mode
npm run dev
```

### 2. Testing Locally
```bash
# Link for local testing
npm run build
npm link

# In your n8n installation
cd ~/.n8n
npm link n8n-nodes-reminders

# Restart n8n
n8n start
```

### 3. Testing the Node
```bash
# Run tests
npm test

# Lint code
npm run lint
npm run lintfix

# Format code
npm run format
```

### 4. Publishing
```bash
# Build and package
npm run build
npm run package

# Publish to npm
npm publish
```

## Usage Examples

### Traditional Node Usage

**Creating a Reminder:**
1. Add Reminders node to workflow
2. Set Resource: Reminder
3. Set Operation: Create
4. Configure:
   - List Name: "Shopping"
   - Title: "Buy groceries"
   - Notes: "Milk, bread, eggs"
   - Due Date: 2024-01-15T10:00:00Z
   - Priority: medium

**Searching Reminders:**
1. Add Reminders node to workflow
2. Set Resource: Search
3. Set Operation: Search Reminders
4. Configure Search Options:
   - Query: "urgent"
   - Completion Status: Incomplete Only
   - Sort By: Due Date
   - Limit: 10

### AI Tool Usage

**In AI Agent Workflow:**
```json
{
  "action": "create_reminder",
  "list_name": "Work",
  "title": "Prepare presentation",
  "notes": "Include quarterly metrics and future roadmap",
  "due_date": "2024-01-20T14:00:00Z",
  "priority": "high"
}
```

**Search with AI:**
```json
{
  "action": "search_reminders",
  "search_query": "meeting",
  "filters": {
    "completed": "false",
    "due_after": "2024-01-15T00:00:00Z",
    "priority": "high",
    "sort_by": "duedate",
    "limit": 5
  }
}
```

## Best Practices

### 1. Error Handling
- Use declarative routing for automatic error handling
- Implement custom error messages for better UX
- Use `continueOnFail` for batch operations

### 2. Performance
- Use pagination for large result sets
- Implement proper caching for list operations
- Use webhook filters to reduce unnecessary notifications

### 3. Security
- Store API tokens securely in credentials
- Validate all user inputs
- Use HTTPS for webhook URLs

### 4. UX/UI
- Provide clear parameter descriptions
- Use appropriate input types (dateTime, options, etc.)
- Group related parameters with collections
- Add helpful placeholders and examples

This declarative approach makes the nodes easier to maintain and extend while providing a clean, user-friendly interface for both traditional workflows and AI-powered automation.
