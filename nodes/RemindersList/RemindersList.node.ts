import {
	IExecuteSingleFunctions,
	ILoadOptionsFunctions,
	INodeListSearchResult,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
} from 'n8n-workflow';

import { RemindersUtils } from '../shared/RemindersUtils';

export class RemindersList implements INodeType {
	description: INodeTypeDescription = {
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
									function (this: IExecuteSingleFunctions, requestOptions: any) {
										return RemindersUtils.buildQueryParams(this, requestOptions);
									},
								],
							},
						},
					},
				],
				default: 'getAllLists',
			},

			{
				...RemindersUtils.getListNameResourceLocator(),
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

	methods = {
		listSearch: {
			async searchLists(
				this: ILoadOptionsFunctions,
				filter?: string,
			): Promise<INodeListSearchResult> {
				return RemindersUtils.searchLists(this, filter);
			},
		},
	};
}