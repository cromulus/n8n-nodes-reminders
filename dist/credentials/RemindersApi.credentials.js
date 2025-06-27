"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemindersApi = void 0;
class RemindersApi {
    constructor() {
        this.name = 'remindersApi';
        this.displayName = 'Reminders API';
        this.documentationUrl = 'https://github.com/your-repo/reminders-cli';
        this.properties = [
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
        this.test = {
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
}
exports.RemindersApi = RemindersApi;
//# sourceMappingURL=RemindersApi.credentials.js.map