import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';
import { z } from 'zod';
export declare const inputSchema: z.ZodObject<{
    operation: z.ZodEnum<["getAll", "get", "create", "update", "delete", "complete", "createSubtask"]>;
    listName: z.ZodOptional<z.ZodString>;
    reminderId: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    dueDate: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodString>;
    priority: z.ZodOptional<z.ZodEnum<["none", "low", "medium", "high"]>>;
    isCompleted: z.ZodOptional<z.ZodBoolean>;
    parentId: z.ZodOptional<z.ZodString>;
    attachedUrl: z.ZodOptional<z.ZodString>;
    includeCompleted: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    operation: "getAll" | "get" | "create" | "update" | "delete" | "complete" | "createSubtask";
    listName?: string | undefined;
    includeCompleted?: boolean | undefined;
    dueDate?: string | undefined;
    priority?: "none" | "low" | "medium" | "high" | undefined;
    title?: string | undefined;
    reminderId?: string | undefined;
    notes?: string | undefined;
    startDate?: string | undefined;
    isCompleted?: boolean | undefined;
    parentId?: string | undefined;
    attachedUrl?: string | undefined;
}, {
    operation: "getAll" | "get" | "create" | "update" | "delete" | "complete" | "createSubtask";
    listName?: string | undefined;
    includeCompleted?: boolean | undefined;
    dueDate?: string | undefined;
    priority?: "none" | "low" | "medium" | "high" | undefined;
    title?: string | undefined;
    reminderId?: string | undefined;
    notes?: string | undefined;
    startDate?: string | undefined;
    isCompleted?: boolean | undefined;
    parentId?: string | undefined;
    attachedUrl?: string | undefined;
}>;
export declare class RemindersTask implements INodeType {
    description: INodeTypeDescription;
    methods: {
        listSearch: {
            searchLists(this: any, filter?: string): Promise<any>;
        };
    };
    execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]>;
}
