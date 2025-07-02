import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	NodeOperationError,
} from 'n8n-workflow';
import { z } from 'zod';

import { RemindersUtils } from '../shared/RemindersUtils';

// AI Tool Input Schema - defines what parameters AI can populate
export const inputSchema = z.object({
	operation: z.enum(['getAllLists', 'getListReminders'])
		.describe('The operation to perform'),

	// List identification (for getListReminders operation)
	listName: z.string().optional()
		.describe('Name or UUID of the list to get reminders from'),
	list: z.string().optional()
		.describe('Alias for listName'),
	listUUID: z.string().optional()
		.describe('Alias for listName - UUID of the list'),

	// Query options
	includeCompleted: z.boolean().optional()
		.describe('Whether to include completed reminders in results'),
	completed: z.boolean().optional()
		.describe('Alias for includeCompleted'),

	// AI context options
	includeAIContext: z.boolean().optional()
		.describe('Include pre-fetched reminders for AI context'),
});

export class RemindersList implements INodeType {
	description: INodeTypeDescription = {
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
					},
					{
						name: 'Get List Reminders',
						value: 'getListReminders',
						action: 'Get reminders from a specific list',
						description: 'Get all reminders from a specific list',
					},
				],
				default: 'getAllLists',
			},

			// List selection for getListReminders
			{
				...RemindersUtils.getListNameResourceLocator(false),
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

			// AI Context Options collection
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

	methods = {
		listSearch: {
			async searchLists(
				this: any,
				filter?: string,
			): Promise<any> {
				return RemindersUtils.searchLists(this, filter);
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		// Helper to get parameter value with AI input support
		const getParam = (paramName: string, itemIndex: number, inputJson: any, defaultValue?: any): any => {
			// Check AI input first
			if (inputJson[paramName] !== undefined) return inputJson[paramName];
			if (inputJson.params?.[paramName] !== undefined) return inputJson.params[paramName];
			if (inputJson.parameters?.[paramName] !== undefined) return inputJson.parameters[paramName];

			// Fall back to node parameter
			try {
				return this.getNodeParameter(paramName, itemIndex, defaultValue);
			} catch {
				return defaultValue;
			}
		};

		for (let i = 0; i < items.length; i++) {
			try {
				// Get operation - check input data first for AI tool usage, then fall back to parameter
				const inputJson = items[i].json;
				const operation = (inputJson.operation as string) || this.getNodeParameter('operation', i) as string;

				let responseData: any;

				switch (operation) {
					case 'getAllLists': {
						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'remindersApi',
							{
								method: 'GET',
								url: '/lists',
								json: true,
							},
						);

						// Check if AI context is requested
						const aiContextOptions = getParam('aiContextOptions', i, inputJson, {});
						const includeAIContext = getParam('includeAIContext', i, inputJson, false) || aiContextOptions.includeAIContext;

						if (includeAIContext) {
							// Pre-fetch some reminders for AI context
							const contextHelper = {
								...this,
								getItemIndex: () => i,
							} as any;
							const contextReminders = await RemindersUtils.preFetchReminders(contextHelper, {
								limit: 10,
								completed: false,
								includePrivateFields: true,
							});

							if (Array.isArray(responseData)) {
								responseData.forEach((list: any) => {
									list.aiContext = {
										totalLists: responseData.length,
										sampleReminders: contextReminders.slice(0, 5),
									};
								});
							}
						}

						responseData = Array.isArray(responseData) ? responseData : [];
						break;
					}

					case 'getListReminders': {
						// Get list identifier with AI input support
						const aiListName = getParam('listName', i, inputJson) ||
										  getParam('list', i, inputJson) ||
										  getParam('listUUID', i, inputJson);

						let listIdentifier: string;
						if (aiListName) {
							listIdentifier = RemindersUtils.extractListIdentifier(aiListName);
						} else {
							const listParam = this.getNodeParameter('listName', i, '') as any;
							listIdentifier = RemindersUtils.extractListIdentifier(listParam);
						}

						if (!listIdentifier) {
							throw new NodeOperationError(this.getNode(), 'List name is required for getListReminders operation');
						}

						const includeCompleted = getParam('includeCompleted', i, inputJson) ||
											   getParam('completed', i, inputJson, false);

						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'remindersApi',
							{
								method: 'GET',
								url: `/lists/${encodeURIComponent(listIdentifier)}`,
								qs: {
									completed: includeCompleted.toString(),
								},
								json: true,
							},
						);

						// Check if AI context is requested
						const aiContextOptions = getParam('aiContextOptions', i, inputJson, {});
						const includeAIContext = getParam('includeAIContext', i, inputJson, false) || aiContextOptions.includeAIContext;

						if (includeAIContext) {
							// Pre-fetch lists metadata for context
							const contextHelper = {
								...this,
								getItemIndex: () => i,
							} as any;
							const listsMetadata = await RemindersUtils.preFetchListsWithMetadata(contextHelper);

							if (Array.isArray(responseData)) {
								responseData.forEach((reminder: any) => {
									reminder.aiContext = {
										listName: listIdentifier,
										totalReminders: responseData.length,
										availableLists: listsMetadata.map((list: any) => list.title),
									};
								});
							}
						}

						responseData = Array.isArray(responseData) ? responseData : [];
						break;
					}

					default:
						throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
				}

				// Handle different response types
				if (Array.isArray(responseData)) {
					responseData.forEach((item: any) => {
						returnData.push({
							json: RemindersUtils.enrichReminderData(item),
							pairedItem: { item: i },
						});
					});
				} else if (responseData) {
					returnData.push({
						json: RemindersUtils.enrichReminderData(responseData),
						pairedItem: { item: i },
					});
				} else {
					// For operations that might not return data
					returnData.push({
						json: { success: true, operation },
						pairedItem: { item: i },
					});
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: error.message },
						pairedItem: { item: i },
					});
				} else {
					throw error;
				}
			}
		}

		return [returnData];
	}
}
