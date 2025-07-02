import {
	IExecuteSingleFunctions,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
} from 'n8n-workflow';

import { RemindersUtils } from '../shared/RemindersUtils';

export class RemindersWebhook implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Reminders Webhook',
		name: 'remindersWebhook',
		icon: 'file:reminders.svg',
		group: ['productivity'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Manage webhook configurations for real-time reminder notifications with advanced filtering and testing capabilities',
		defaults: {
			name: 'Reminders Webhook',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		usableAsTool: true,
		credentials: RemindersUtils.getCredentialsConfig(),
		requestDefaults: RemindersUtils.getBaseRequestDefaults(),
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'List Webhooks',
						value: 'list',
						action: 'List all webhooks',
						description: 'Get all configured webhooks',
						routing: {
							request: {
								method: 'GET',
								url: '/webhooks',
							},
						},
					},
					{
						name: 'Get Webhook',
						value: 'get',
						action: 'Get webhook by ID',
						description: 'Get a specific webhook configuration',
						routing: {
							request: {
								method: 'GET',
								url: '=/webhooks/{{$parameter.webhookId}}',
							},
						},
					},
					{
						name: 'Create Webhook',
						value: 'create',
						action: 'Create a new webhook',
						description: 'Create a new webhook configuration for notifications',
						routing: {
							request: {
								method: 'POST',
								url: '/webhooks',
							},
							send: {
								type: 'body',
								preSend: [
									function (this: IExecuteSingleFunctions, requestOptions: any) {
										const body: any = {
											url: this.getNodeParameter('url', 0) as string,
											name: this.getNodeParameter('name', 0) as string,
											filter: RemindersUtils.buildWebhookFilter(this),
										};

										requestOptions.body = body;
										return requestOptions;
									},
								],
							},
						},
					},
					{
						name: 'Update Webhook',
						value: 'update',
						action: 'Update a webhook',
						description: 'Update an existing webhook configuration',
						routing: {
							request: {
								method: 'PATCH',
								url: '=/webhooks/{{$parameter.webhookId}}',
							},
							send: {
								type: 'body',
								preSend: [
									function (this: IExecuteSingleFunctions, requestOptions: any) {
										const body: any = {};

										const url = this.getNodeParameter('url', 0, undefined) as string;
										if (url) body.url = url;

										const name = this.getNodeParameter('name', 0, undefined) as string;
										if (name) body.name = name;

										const isActive = this.getNodeParameter('isActive', 0, undefined) as boolean;
										if (isActive !== undefined) body.isActive = isActive;

										const filterOptions = this.getNodeParameter('filterOptions', 0, {}) as any;
										if (Object.keys(filterOptions).length > 0) {
											body.filter = RemindersUtils.buildWebhookFilter(this);
										}

										requestOptions.body = body;
										return requestOptions;
									},
								],
							},
						},
					},
					{
						name: 'Delete Webhook',
						value: 'delete',
						action: 'Delete a webhook',
						description: 'Delete a webhook configuration',
						routing: {
							request: {
								method: 'DELETE',
								url: '=/webhooks/{{$parameter.webhookId}}',
							},
							output: {
								postReceive: [
									{
										type: 'set',
										properties: {
											value: '={{ { "success": true, "webhookId": $parameter.webhookId } }}',
										},
									},
								],
							},
						},
					},
					{
						name: 'Test Webhook',
						value: 'test',
						action: 'Test webhook delivery',
						description: 'Send a test notification to verify webhook is working',
						routing: {
							request: {
								method: 'POST',
								url: '=/webhooks/{{$parameter.webhookId}}/test',
							},
						},
					},
				],
				default: 'list',
			},

			// Webhook ID for operations that need it
			{
				displayName: 'Webhook ID',
				name: 'webhookId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['get', 'update', 'delete', 'test'],
					},
				},
				default: '',
				description: 'ID of the webhook',
				placeholder: 'webhook-uuid-123',
			},

			// URL for Create and Update
			{
				displayName: 'Webhook URL',
				name: 'url',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['create'],
					},
				},
				default: '',
				description: 'URL where webhook notifications will be sent',
				placeholder: 'https://your-server.com/webhook',
			},

			{
				displayName: 'Webhook URL',
				name: 'url',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['update'],
					},
				},
				default: '',
				description: 'New URL for webhook notifications (leave empty to keep current)',
				placeholder: 'https://your-server.com/webhook',
			},

			// Name for Create and Update
			{
				displayName: 'Webhook Name',
				name: 'name',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['create'],
					},
				},
				default: '',
				description: 'Descriptive name for the webhook',
				placeholder: 'Task Notifications',
			},

			{
				displayName: 'Webhook Name',
				name: 'name',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['update'],
					},
				},
				default: '',
				description: 'New name for the webhook (leave empty to keep current)',
				placeholder: 'Task Notifications',
			},

			// Active status for Update
			{
				displayName: 'Is Active',
				name: 'isActive',
				type: 'boolean',
				displayOptions: {
					show: {
						operation: ['update'],
					},
				},
				default: true,
				description: 'Whether the webhook is active',
			},

			// Filter Options for Create and Update
			{
				displayName: 'Filter Options',
				name: 'filterOptions',
				type: 'collection',
				placeholder: 'Add Filter Option',
				default: {},
				displayOptions: {
					show: {
						operation: ['create', 'update'],
					},
				},
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
								name: 'Complete Only',
								value: 'complete',
							},
							{
								name: 'Incomplete Only',
								value: 'incomplete',
							},
						],
						default: 'all',
						description: 'Which completion status to monitor',
					},
					{
						displayName: 'List Names',
						name: 'listNames',
						type: 'string',
						default: '',
						description: 'Comma-separated list of list names to monitor',
						placeholder: 'Work,Personal,Shopping',
					},
					{
						displayName: 'List UUIDs',
						name: 'listUUIDs',
						type: 'string',
						default: '',
						description: 'Comma-separated list of list UUIDs to monitor (more reliable than names)',
						placeholder: 'uuid1,uuid2,uuid3',
					},
					{
						displayName: 'Priority Levels',
						name: 'priorityLevels',
						type: 'multiOptions',
						options: [
							{
								name: 'None (0)',
								value: 0,
							},
							{
								name: 'Low (1)',
								value: 1,
							},
							{
								name: 'Medium (5)',
								value: 5,
							},
							{
								name: 'High (9)',
								value: 9,
							},
						],
						default: [],
						description: 'Priority levels to monitor (empty = all priorities)',
					},
					{
						displayName: 'Text Filter',
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
