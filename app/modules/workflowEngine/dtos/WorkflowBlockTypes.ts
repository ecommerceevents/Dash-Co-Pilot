import { ApplicationEvents } from "~/modules/events/types/ApplicationEvent";
import WorkflowBlockActionIcon from "../components/icons/WorkflowBlockActionIcon";
import ConditionalIcon from "../components/nodes/flow/conditional/ConditionalIcon";
import DoNothingIcon from "../components/nodes/helpers/doNothing/DoNothingIcon";
import HttpRequestIcon from "../components/nodes/helpers/httpRequest/HttpRequestIcon";
import LogIcon from "../components/nodes/helpers/log/LogIcon";
import TriggerManualIcon from "../components/nodes/triggers/manual/TriggerManualIcon";

export const WorkflowBlockTypes: WorkflowBlockTypeDto[] = [
  {
    type: "trigger",
    category: "Misc",
    name: "Manual Trigger",
    value: "manual",
    icon: TriggerManualIcon,
    inputs: [
      { name: "validation", type: "monaco", label: "Validation", required: false, href: { url: "https://github.com/ajv-validator/ajv", label: "Learn more" } },
    ],
    outputs: [],
  },
  {
    type: "trigger",
    category: "App",
    name: "App Event",
    value: "event",
    icon: WorkflowBlockActionIcon,
    appliesToAllTenants: true,
    inputs: [
      {
        name: "event",
        type: "select",
        label: "Event",
        required: true,
        options: ApplicationEvents.map((f) => ({ value: f.value, label: `${f.value} (${f.value})`, adminOnly: f.adminOnly })),
      },
      { name: "entity", type: "string", label: "Entity name", required: false, if: { name: "event", values: ["row.created", "row.updated", "row.deleted"] } },
    ],
    outputs: [{ name: "data", label: "Data" }],
  },
  {
    type: "action",
    category: "Flow",
    name: "IF",
    value: "if",
    icon: ConditionalIcon,
    inputs: [],
    outputs: [],
  },
  {
    type: "action",
    category: "Flow",
    name: "Switch",
    value: "switch",
    icon: ConditionalIcon,
    inputs: [],
    outputs: [],
  },
  {
    type: "action",
    category: "Helpers",
    name: "HTTP Request",
    value: "httpRequest",
    icon: HttpRequestIcon,
    inputs: [
      { name: "url", type: "string", label: "URL", required: true, placeholder: "https://api.example.com" },
      {
        name: "method",
        type: "select",
        label: "Method",
        required: true,
        options: [
          { label: "GET", value: "GET" },
          { label: "POST", value: "POST" },
          { label: "PUT", value: "PUT" },
          { label: "DELETE", value: "DELETE" },
          { label: "PATCH", value: "PATCH" },
          { label: "HEAD", value: "HEAD" },
          { label: "OPTIONS", value: "OPTIONS" },
        ],
      },
      { name: "body", type: "monaco", label: "Body", required: false },
      { name: "headers", type: "keyValue", label: "Headers", required: false },
      { name: "throwsError", type: "boolean", label: "Throws error", defaultValue: true },
    ],
    outputs: [
      { name: "statusCode", label: "Status Code" },
      { name: "body", label: "Body" },
      { name: "error", label: "Error" },
    ],
  },
  {
    type: "action",
    category: "Helpers",
    name: "Log",
    value: "log",
    icon: LogIcon,
    inputs: [{ name: "message", type: "string", label: "Message", required: true, placeholder: "Message to log..." }],
    outputs: [],
  },
  {
    type: "action",
    category: "Helpers",
    name: "Alert User",
    value: "alertUser",
    icon: LogIcon,
    inputs: [
      { name: "message", type: "string", label: "Message", required: true, placeholder: "Message to alert..." },
      {
        name: "type",
        type: "select",
        label: "Type",
        required: false,
        defaultValue: "success",
        options: [
          { label: "Success", value: "success" },
          { label: "Error", value: "error" },
        ],
      },
    ],
    outputs: [],
  },
  {
    type: "action",
    category: "Helpers",
    name: "Do Nothing",
    value: "doNothing",
    icon: DoNothingIcon,
    inputs: [],
    outputs: [],
  },
  {
    type: "action",
    category: "Interaction",
    name: "Wait for Input",
    value: "waitForInput",
    icon: WorkflowBlockActionIcon,
    inputs: [
      { name: "title", type: "string", label: "Title", required: false },
      { name: "placeholder", type: "string", label: "Placeholder", required: false },
    ],
    outputs: [{ name: "input", label: "Input" }],
  },
  {
    type: "action",
    category: "AI",
    name: "GPT Chat Completion",
    value: "gpt",
    icon: WorkflowBlockActionIcon,
    inputs: [
      { name: "model", type: "string", label: "Model", required: true, placeholder: "gpt-4-1106-preview", defaultValue: "gpt-4" },
      { name: "prompt", type: "string", label: "Prompt", required: true },
      { name: "apiKey", type: "string", label: "API Key", required: true },
    ],
    outputs: [{ name: "result", label: "Result" }],
  },
  {
    type: "action",
    category: "Entities",
    name: "Row Get",
    value: "rowGet",
    icon: WorkflowBlockActionIcon,
    inputs: [
      { name: "entity", type: "string", label: "Entity name", required: true },
      { name: "id", type: "string", label: "Row ID", required: true },
    ],
    outputs: [{ name: "row", label: "Row" }],
  },
  {
    type: "action",
    category: "Entities",
    name: "Row Create",
    value: "rowCreate",
    icon: WorkflowBlockActionIcon,
    inputs: [
      { name: "entity", type: "string", label: "Entity name", required: true },
      { name: "row", type: "monaco", label: "Row", required: true },
    ],
    outputs: [{ name: "row", label: "Row" }],
  },
  {
    type: "action",
    category: "Entities",
    name: "Row Update",
    value: "rowUpdate",
    icon: WorkflowBlockActionIcon,
    inputs: [
      { name: "entity", type: "string", label: "Entity name", required: true },
      { name: "id", type: "string", label: "Row ID", required: true },
      { name: "data", type: "monaco", label: "Data", required: true },
    ],
    outputs: [{ name: "row", label: "Row" }],
  },
  {
    type: "action",
    category: "Entities",
    name: "Row Delete",
    value: "rowDelete",
    icon: WorkflowBlockActionIcon,
    inputs: [
      { name: "entity", type: "string", label: "Entity name", required: true },
      { name: "id", type: "string", label: "Row ID", required: true },
    ],
    outputs: [{ name: "row", label: "Row" }],
  },
  {
    type: "action",
    category: "Flow",
    name: "Iterator",
    value: "iterator",
    icon: WorkflowBlockActionIcon,
    inputs: [{ name: "variableName", type: "string", label: "Variable Name", required: true }],
    outputs: [
      { name: "index", label: "Index" },
      { name: "item", label: "Item" },
      { name: "isFirst", label: "Is First" },
      { name: "isLast", label: "Is Last" },
    ],
  },
  {
    type: "action",
    category: "Flow",
    name: "Variable",
    value: "variable",
    icon: WorkflowBlockActionIcon,
    inputs: [
      { name: "variableName", type: "string", label: "Variable Name", required: true },
      { name: "value", type: "string", label: "Value", required: true },
    ],
    outputs: [],
  },
  {
    type: "action",
    category: "App",
    name: "Email",
    value: "email",
    icon: WorkflowBlockActionIcon,
    inputs: [
      {
        name: "provider",
        type: "select",
        label: "Provider",
        required: true,
        options: [
          { label: "Postmark", value: "postmark" },
          { label: "Resend", value: "resend" },
        ],
      },
      { name: "from", type: "string", label: "From", required: true },
      { name: "to", type: "string", label: "To", required: true },
      { name: "subject", type: "string", label: "Subject", required: true },
      { name: "body", type: "string", label: "Body", required: true },
      { name: "apiKey", type: "string", label: "API Key", required: true },
    ],
    outputs: [],
  },
];
export type WorkflowBlockType =
  | "manual"
  | "if"
  | "switch"
  | "httpRequest"
  | "log"
  | "alertUser"
  | "doNothing"
  | "waitForInput"
  | "gpt"
  | "rowGet"
  | "rowCreate"
  | "rowUpdate"
  | "rowDelete"
  | "iterator"
  | "variable"
  | "event"
  | "email";
export type WorkflowBlockTypeDto = {
  type: "trigger" | "action";
  category: "Misc" | "Flow" | "Helpers" | "Interaction" | "AI" | "Entities" | "App";
  name: string;
  value: WorkflowBlockType;
  icon: any;
  inputs: WorkflowBlockInput[];
  outputs: WorkflowBlockOutput[];
  appliesToAllTenants?: boolean;
};
export type WorkflowBlockInput = {
  name: string;
  type: "string" | "monaco" | "keyValue" | "select" | "boolean";
  label: string;
  required?: boolean;
  placeholder?: string;
  options?: {
    label: string;
    value: string;
    adminOnly?: boolean;
  }[];
  defaultValue?: string | boolean;
  href?: { url: string; label: string };
  if?: { name: string; values: string[] };
};
export type WorkflowBlockOutput = {
  name: string;
  label: string;
};
