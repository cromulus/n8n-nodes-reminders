import { INodeType, INodeTypeDescription } from 'n8n-workflow';
export declare class RemindersList implements INodeType {
    description: INodeTypeDescription;
    methods: {
        listSearch: {
            searchLists(this: any, filter?: string): Promise<any>;
        };
    };
}
