"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemindersUtils = void 0;
class RemindersUtils {
    static async searchLists(context, filter) {
        const returnData = [];
        try {
            const response = await context.helpers.httpRequestWithAuthentication.call(context, 'remindersApi', {
                method: 'GET',
                url: '/lists',
                json: true,
            });
            const lists = Array.isArray(response) ? response : [];
            for (const list of lists) {
                const listName = typeof list === 'string' ? list : list.name || list.title || String(list);
                if (!filter || listName.toLowerCase().includes(filter.toLowerCase())) {
                    returnData.push({
                        name: listName,
                        value: listName,
                    });
                }
            }
        }
        catch (error) {
        }
        return { results: returnData };
    }
    static getBaseRequestDefaults() {
        return {
            baseURL: '={{$credentials.baseUrl}}',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: '={{$credentials.apiToken ? "Bearer " + $credentials.apiToken : ""}}',
            },
        };
    }
    static getCredentialsConfig() {
        return [
            {
                name: 'remindersApi',
                required: true,
            },
        ];
    }
    static getListNameResourceLocator(required = true) {
        return {
            displayName: 'List Name',
            name: 'listName',
            type: 'resourceLocator',
            default: { mode: 'list', value: '' },
            required,
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
            description: 'Name of the reminder list',
        };
    }
    static buildQueryParams(context, requestOptions, paramName = 'includeCompleted') {
        const includeCompleted = context.getNodeParameter(paramName, 0);
        const query = {};
        if (includeCompleted) {
            query.completed = 'true';
        }
        requestOptions.qs = query;
        return requestOptions;
    }
}
exports.RemindersUtils = RemindersUtils;
//# sourceMappingURL=RemindersUtils.js.map