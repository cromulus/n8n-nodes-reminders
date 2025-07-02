import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';
import { z } from 'zod';
export declare const inputSchema: z.ZodObject<{
    operation: z.ZodEnum<["list", "get", "create", "update", "delete", "test"]>;
    webhookId: z.ZodOptional<z.ZodString>;
    url: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodBoolean>;
    listNames: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    lists: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    listUUIDs: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    listIds: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    completed: z.ZodOptional<z.ZodEnum<["all", "complete", "incomplete"]>>;
    priorityLevels: z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodArray<z.ZodNumber, "many">]>>;
    priorities: z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodArray<z.ZodNumber, "many">]>>;
    hasQuery: z.ZodOptional<z.ZodString>;
    textFilter: z.ZodOptional<z.ZodString>;
    query: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    operation: "list" | "get" | "create" | "update" | "delete" | "test";
    url?: string | undefined;
    completed?: "all" | "incomplete" | "complete" | undefined;
    name?: string | undefined;
    query?: string | undefined;
    lists?: string | string[] | undefined;
    listNames?: string | string[] | undefined;
    listUUIDs?: string | string[] | undefined;
    webhookId?: string | undefined;
    isActive?: boolean | undefined;
    listIds?: string | string[] | undefined;
    priorityLevels?: number | number[] | undefined;
    priorities?: number | number[] | undefined;
    hasQuery?: string | undefined;
    textFilter?: string | undefined;
}, {
    operation: "list" | "get" | "create" | "update" | "delete" | "test";
    url?: string | undefined;
    completed?: "all" | "incomplete" | "complete" | undefined;
    name?: string | undefined;
    query?: string | undefined;
    lists?: string | string[] | undefined;
    listNames?: string | string[] | undefined;
    listUUIDs?: string | string[] | undefined;
    webhookId?: string | undefined;
    isActive?: boolean | undefined;
    listIds?: string | string[] | undefined;
    priorityLevels?: number | number[] | undefined;
    priorities?: number | number[] | undefined;
    hasQuery?: string | undefined;
    textFilter?: string | undefined;
}>;
export declare class RemindersWebhook implements INodeType {
    description: INodeTypeDescription;
    execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]>;
}
