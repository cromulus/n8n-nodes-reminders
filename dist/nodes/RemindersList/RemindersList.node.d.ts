import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';
import { z } from 'zod';
export declare const inputSchema: z.ZodObject<{
    operation: z.ZodEnum<["getAllLists", "getListReminders"]>;
    listName: z.ZodOptional<z.ZodString>;
    list: z.ZodOptional<z.ZodString>;
    listUUID: z.ZodOptional<z.ZodString>;
    includeCompleted: z.ZodOptional<z.ZodBoolean>;
    completed: z.ZodOptional<z.ZodBoolean>;
    includeAIContext: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    operation: "getAllLists" | "getListReminders";
    completed?: boolean | undefined;
    listName?: string | undefined;
    list?: string | undefined;
    includeCompleted?: boolean | undefined;
    listUUID?: string | undefined;
    includeAIContext?: boolean | undefined;
}, {
    operation: "getAllLists" | "getListReminders";
    completed?: boolean | undefined;
    listName?: string | undefined;
    list?: string | undefined;
    includeCompleted?: boolean | undefined;
    listUUID?: string | undefined;
    includeAIContext?: boolean | undefined;
}>;
export declare class RemindersList implements INodeType {
    description: INodeTypeDescription;
    methods: {
        listSearch: {
            searchLists(this: any, filter?: string): Promise<any>;
        };
    };
    execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]>;
}
