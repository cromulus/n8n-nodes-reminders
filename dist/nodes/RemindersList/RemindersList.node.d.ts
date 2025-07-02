import { ILoadOptionsFunctions, INodeListSearchResult, INodeType, INodeTypeDescription } from 'n8n-workflow';
export declare class RemindersList implements INodeType {
    description: INodeTypeDescription;
    methods: {
        listSearch: {
            searchLists(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult>;
        };
    };
}
