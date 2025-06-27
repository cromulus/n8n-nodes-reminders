import type {
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class RemindersApi implements ICredentialType {
	name = 'remindersApi';
	displayName = 'Reminders API';
	documentationUrl = 'https://github.com/your-repo/reminders-cli';
	properties: INodeProperties[] = [
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
			displayName: 'API Token',
			name: 'apiToken',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'API token for authentication (optional)',
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
				Authorization: '={{$credentials.apiToken ? "Bearer " + $credentials.apiToken : ""}}',
			},
		},
	};
}