import { IExecuteSingleFunctions, ILoadOptionsFunctions, INodeListSearchResult } from 'n8n-workflow';
export declare class RemindersUtils {
    static searchLists(context: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult>;
    static getBaseRequestDefaults(): {
        baseURL: string;
        headers: {
            Accept: string;
            'Content-Type': string;
            Authorization: string;
        };
    };
    static getCredentialsConfig(): {
        name: string;
        required: boolean;
    }[];
    static getListNameResourceLocator(required?: boolean): {
        displayName: string;
        name: string;
        type: "resourceLocator";
        default: {
            mode: string;
            value: string;
        };
        required: boolean;
        modes: ({
            displayName: string;
            name: string;
            type: "list";
            placeholder: string;
            typeOptions: {
                searchListMethod: string;
                searchFilterRequired: boolean;
                searchable: boolean;
            };
        } | {
            displayName: string;
            name: string;
            type: "string";
            placeholder: string;
            typeOptions?: undefined;
        })[];
        description: string;
    };
    static buildQueryParams(context: IExecuteSingleFunctions, requestOptions: any, paramName?: string): any;
}
