import { IExecuteFunctions, INodeType, INodeTypeDescription, INodeExecutionData } from 'n8n-workflow';
export declare class RemindersAiTool implements INodeType {
    description: INodeTypeDescription;
    execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]>;
    private handleGetLists;
    private handleGetReminders;
    private handleCreateReminder;
    private handleUpdateReminder;
    private handleDeleteReminder;
    private handleSearchReminders;
    private handleCompleteReminder;
    private handleSetupWebhook;
}
