import { WorkflowsTemplateDto } from "../dtos/WorkflowsTemplateDto";

const templates: WorkflowsTemplateDto[] = [
  {
    adminOnly: true,
    title: "Sample HTTP Requests",
    workflows: [
      {
        name: "Get JSONPlaceholder TODO Item",
        description: "Uses HTTP Request, IF, Switch, and Alert User blocks",
        blocks: [
          {
            id: "manualTrigger",
            type: "manual",
            description: "Triggers the workflow",
            input: {
              validation: JSON.stringify(
                {
                  type: "object",
                  properties: {
                    id: { type: "number" },
                  },
                  required: ["id"],
                },
                null,
                2
              ),
            },
          },
          {
            id: "httpRequest",
            type: "httpRequest",
            description: "Fetches a todo item from JSONPlaceholder",
            input: {
              url: "{{$vars.jsonPlaceholderUrl}}/todos/{{$params.id}}",
              method: "GET",
              // body: "",
              // headers: {},
              throwsError: true,
            },
          },
          {
            id: "if",
            type: "if",
            description: "Checks if the request was successful",
            conditionGroups: [
              {
                type: "AND",
                conditions: [
                  {
                    variable: "{{httpRequest.statusCode}}",
                    operator: "=",
                    value: "200",
                  },
                ],
              },
            ],
          },
          {
            id: "logNotFound",
            type: "alertUser",
            description: "Logs not found",
            input: {
              type: "error",
              message: "Error: {{httpRequest.error}}",
            },
          },
          {
            id: "logFound",
            type: "alertUser",
            description: "Logs HTTP Request body",
            input: {
              message: `ID: {{httpRequest.body.id}},
  Title ({{httpRequest.body.title}},
  Completed: {{httpRequest.body.completed}}),
  User ID: {{httpRequest.body.userId}}`,
            },
          },
          {
            id: "switchTitle",
            type: "switch",
            description: "Switches based on the title",
            conditionGroups: [
              {
                type: "AND",
                case: "case1",
                conditions: [
                  {
                    variable: "{{httpRequest.body.title}}",
                    operator: "=",
                    value: "delectus aut autem",
                  },
                ],
              },
              {
                type: "AND",
                case: "case2",
                conditions: [
                  {
                    variable: "{{httpRequest.body.title}}",
                    operator: "contains",
                    value: "quis",
                  },
                ],
              },
            ],
          },
          {
            id: "switchCase1",
            type: "alertUser",
            description: "Logs equals: delectus aut autem",
            input: {
              message: "Case 1: {{httpRequest.body.title}}",
            },
          },
          {
            id: "switchCase2",
            type: "alertUser",
            description: "Logs contains: quis",
            input: {
              message: "Case 2: {{httpRequest.body.title}}",
            },
          },
          {
            id: "switchDefault",
            type: "alertUser",
            description: "Logs default case",
            input: {
              message: "Default case: {{httpRequest.body.title}}",
            },
          },
          {
            id: "alertUser",
            type: "alertUser",
            description: "Alerts user once the workflow is done",
            input: {
              message: `Workflow done!`,
            },
          },
        ],
        toBlocks: [
          { fromBlockId: "manualTrigger", toBlockId: "httpRequest" },
          { fromBlockId: "httpRequest", toBlockId: "if" },
          { fromBlockId: "if", toBlockId: "logNotFound", condition: "false" },
          { fromBlockId: "if", toBlockId: "logFound", condition: "true" },
          { fromBlockId: "logFound", toBlockId: "switchTitle" },
          { fromBlockId: "switchTitle", toBlockId: "switchCase1", condition: "case1" },
          { fromBlockId: "switchTitle", toBlockId: "switchCase2", condition: "case2" },
          { fromBlockId: "switchTitle", toBlockId: "switchDefault", condition: "default" },
          { fromBlockId: "switchCase1", toBlockId: "alertUser" },
          { fromBlockId: "switchCase2", toBlockId: "alertUser" },
          { fromBlockId: "switchDefault", toBlockId: "alertUser" },
        ],
        inputExamples: [
          { title: "Existing item", input: { id: 10 } },
          { title: "Non-existing item", input: { id: -1 } },
          {
            title: "ID parameter not provided",
            input: {},
          },
          {
            title: "ID parameter is not a number",
            input: { id: "abc" },
          },
          {
            title: "Case 1: is equal to 'delectus aut autem'",
            input: { id: 1 },
          },
          {
            title: "Case 2: contains 'quis'",
            input: { id: 2 },
          },
          {
            title: "Default case",
            input: { id: 3 },
          },
        ],
      },
    ],
    variables: [{ name: "jsonPlaceholderUrl", value: "https://jsonplaceholder.typicode.com" }],
  },
  {
    adminOnly: true,
    title: "Alert User",
    workflows: [
      {
        name: "Alert User",
        description: "Alerts the user",
        blocks: [
          {
            id: "manualTrigger",
            type: "manual",
            description: "Triggers the workflow",
            input: {
              validation: JSON.stringify(
                {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                  },
                  required: ["message"],
                },
                null,
                2
              ),
            },
          },
          {
            id: "alertUser",
            type: "alertUser",
            description: "Alerts user once the workflow is done",
            input: {
              message: `{{$params.message}}`,
            },
          },
        ],
        toBlocks: [{ fromBlockId: "manualTrigger", toBlockId: "alertUser" }],
        inputExamples: [{ title: "Existing item", input: { message: "Hello world!" } }],
      },
    ],
    variables: [],
  },
  {
    adminOnly: true,
    title: "OpenAI Workflows",
    workflows: [
      {
        name: "GPT Simulator",
        description: 'Loops GPT API calls until user types "bye"',
        blocks: [
          {
            id: "manual",
            type: "manual",
            description: "User starts the 'chat'",
            input: {},
            conditionGroups: [],
          },
          {
            id: "waitForInput",
            type: "waitForInput",
            description: "User types a message",
            input: {
              placeholder: "Message...",
            },
            conditionGroups: [],
          },
          {
            id: "if",
            type: "if",
            description: 'If user types "bye"',
            input: {},
            conditionGroups: [
              {
                type: "AND",
                conditions: [
                  {
                    variable: "{{waitForInput.input}}",
                    operator: "=",
                    value: "bye",
                  },
                ],
              },
            ],
          },
          {
            id: "log",
            type: "log",
            description: "User typed bye",
            input: {
              message: "User typed bye",
            },
            conditionGroups: [],
          },
          {
            id: "gpt",
            type: "gpt",
            description: 'Calls OpenAI API and back to "Wait for Input"',
            input: {
              model: "gpt-4-1106-preview",
              prompt: "{{waitForInput.input}}",
              apiKey: "{{$credentials.OPENAI_API_KEY}}",
            },
            conditionGroups: [],
          },
        ],
        toBlocks: [
          {
            fromBlockId: "manual",
            toBlockId: "waitForInput",
          },
          {
            fromBlockId: "waitForInput",
            toBlockId: "if",
          },
          {
            fromBlockId: "if",
            toBlockId: "log",
            condition: "true",
          },
          {
            fromBlockId: "if",
            toBlockId: "gpt",
            condition: "false",
          },
          {
            fromBlockId: "gpt",
            toBlockId: "waitForInput",
          },
        ],
        inputExamples: [],
      },
    ],
    variables: [],
    credentialsRequired: ["OPENAI_API_KEY"],
  },
  {
    adminOnly: true,
    title: "Iterator",
    workflows: [
      {
        name: "Loop items",
        description: "Iterate a string array",
        blocks: [
          {
            id: "iterator",
            type: "iterator",
            description: "Gets the array from {{$params.array}}",
            input: {
              variableName: "{{$params.array}}",
            },
            conditionGroups: [],
          },
          {
            id: "manual",
            type: "manual",
            description: "Send $params.array",
            input: {},
            conditionGroups: [],
          },
          {
            id: "log1",
            type: "log",
            description: "Logs item and index",
            input: {
              message: "{{iterator.index}}: {{iterator.item}}",
            },
            conditionGroups: [],
          },
          {
            id: "log2",
            type: "log",
            description: "Logs ended",
            input: {
              message: "Ended",
            },
            conditionGroups: [],
          },
        ],
        toBlocks: [
          {
            fromBlockId: "iterator",
            toBlockId: "log1",
            condition: "loopNext",
          },
          {
            fromBlockId: "iterator",
            toBlockId: "log2",
            condition: "loopEnd",
          },
          {
            fromBlockId: "manual",
            toBlockId: "iterator",
          },
        ],
        inputExamples: [
          {
            title: "String array",
            input: {
              array: ["value 1", "value 2"],
            },
          },
          {
            title: "Object array",
            input: {
              array: [
                {
                  name: "Value 1",
                  value: "value 1",
                },
                {
                  name: "Value 2",
                  value: "value 2",
                },
              ],
            },
          },
        ],
      },
    ],
    variables: [],
    credentialsRequired: [],
  },
  {
    title: "Row Events (Employee)",
    workflows: [
      // {
      //   name: "Row Get: Employee",
      //   description: "Gets employee or null",
      //   blocks: [
      //     {
      //       id: "manual",
      //       type: "manual",
      //       input: {},
      //       conditionGroups: [],
      //     },
      //     {
      //       id: "rowGet",
      //       type: "rowGet",
      //       input: {
      //         entity: "employee",
      //         id: "{{$params.id}}",
      //       },
      //       conditionGroups: [],
      //     },
      //     {
      //       id: "if",
      //       type: "if",
      //       input: {},
      //       conditionGroups: [
      //         {
      //           type: "AND",
      //           conditions: [
      //             {
      //               variable: "{{rowGet.row}}",
      //               operator: "isNotEmpty",
      //               value: "",
      //             },
      //           ],
      //         },
      //       ],
      //     },
      //     {
      //       id: "log1",
      //       type: "log",
      //       description: "Found",
      //       input: {
      //         message:
      //           "Employee: {{rowGet.row.firstName}}. Last name: {{rowGet.row.lastName}}. Email: {{rowGet.row.email}}.Employee: {{rowGet.row.firstName}}. Last name: {{rowGet.row.lastName}}. Email: {{rowGet.row.email}}.",
      //       },
      //       conditionGroups: [],
      //     },
      //     {
      //       id: "log2",
      //       type: "log",
      //       description: "Not found",
      //       input: {
      //         message: "Not found",
      //       },
      //       conditionGroups: [],
      //     },
      //   ],
      //   toBlocks: [
      //     {
      //       fromBlockId: "manual",
      //       toBlockId: "rowGet",
      //     },
      //     {
      //       fromBlockId: "rowGet",
      //       toBlockId: "if",
      //     },
      //     {
      //       fromBlockId: "if",
      //       toBlockId: "log1",
      //       condition: "true",
      //     },
      //     {
      //       fromBlockId: "if",
      //       toBlockId: "log2",
      //       condition: "false",
      //     },
      //   ],
      //   inputExamples: [
      //     {
      //       title: "Valid request",
      //       input: {
      //         id: "ROW_ID_HERE",
      //       },
      //     },
      //   ],
      // },
      {
        name: "Row Event: Created Employee",
        blocks: [
          {
            id: "event",
            type: "event",
            description: "Created employee triggered",
            input: {
              event: "row.created",
              entity: "employee",
            },
            conditionGroups: [],
          },
          {
            id: "log",
            type: "log",
            description: "Logs employee row",
            input: {
              message: "Employee: {{event.data.row.firstName}} {{event.data.row.lastName}} ({{event.data.row.email}})",
            },
            conditionGroups: [],
          },
        ],
        toBlocks: [
          {
            fromBlockId: "event",
            toBlockId: "log",
          },
        ],
        inputExamples: [
          {
            title: "Fake employee",
            input: {
              event: "created",
              entity: "employee",
              row: {
                id: "fake-id",
                firstName: "Alex",
                lastName: "Martinez",
                email: "alex.martinez@absys.com.mx",
              },
            },
          },
          {
            title: "Invalid event",
            input: {
              event: "updated",
              entity: "employee",
              row: {
                id: "fake-id",
                firstName: "Alex",
                lastName: "Martinez",
                email: "alex.martinez@absys.com.mx",
              },
            },
          },
          {
            title: "Invalid entity",
            input: {
              event: "created",
              entity: "sale",
              row: {
                id: "fake-id",
              },
            },
          },
        ],
      },
      // {
      //   name: "Row Create: Employee",
      //   description: "Creates John Doe employee",
      //   blocks: [
      //     {
      //       id: "rowCreate",
      //       type: "rowCreate",
      //       description: "Creates John Doe employee",
      //       input: {
      //         entity: "employee",
      //         row: '{\n  "firstName": "John",\n  "lastName": "Doe",\n  "email": "john@doe.com"\n}',
      //       },
      //       conditionGroups: [],
      //     },
      //     {
      //       id: "manual",
      //       type: "manual",
      //       input: {},
      //       conditionGroups: [],
      //     },
      //   ],
      //   toBlocks: [
      //     {
      //       fromBlockId: "manual",
      //       toBlockId: "rowCreate",
      //     },
      //   ],
      //   inputExamples: [],
      // },
      {
        name: "Row Event: Updated Employee",
        description: "Updated employee triggered",
        blocks: [
          {
            id: "event",
            type: "event",
            description: "Updated employee triggered",
            input: {
              event: "row.updated",
              entity: "employee",
            },
            conditionGroups: [],
          },
          {
            id: "log",
            type: "log",
            description: "Logs updated employee",
            input: {
              message: "Employee: {{event.data.row.firstName}} {{event.data.row.lastName}} ({{event.data.row.email}})",
            },
            conditionGroups: [],
          },
        ],
        toBlocks: [
          {
            fromBlockId: "event",
            toBlockId: "log",
          },
        ],
        inputExamples: [],
      },
      // {
      //   name: "Row Update: Employee",
      //   description: "Updates employee",
      //   blocks: [
      //     {
      //       id: "manual",
      //       type: "manual",
      //       input: {},
      //       conditionGroups: [],
      //     },
      //     {
      //       id: "rowUpdate",
      //       type: "rowUpdate",
      //       input: {
      //         data: '{\n  "firstName": "Updated first name",\n  "lastName": "Updated last name"\n}',
      //         id: "{{$params.id}}",
      //         entity: "employee",
      //       },
      //       conditionGroups: [],
      //     },
      //   ],
      //   toBlocks: [
      //     {
      //       fromBlockId: "manual",
      //       toBlockId: "rowUpdate",
      //     },
      //   ],
      //   inputExamples: [
      //     {
      //       title: "Valid request",
      //       input: {
      //         id: "ROW_ID_HERE",
      //       },
      //     },
      //   ],
      // },
      {
        name: "Row Event: Deleted Employee",
        description: "Deleted employee triggered",
        blocks: [
          {
            id: "log",
            type: "log",
            description: "Logs employee row",
            input: {
              message: "Employee: {{event.data.row.firstName}}. Last name: {{event.data.row.lastName}}. Email: {{event.data.row.email}}.",
            },
            conditionGroups: [],
          },
          {
            id: "event",
            type: "event",
            description: "Deleted employee triggered",
            input: {
              event: "row.deleted",
              entity: "employee",
            },
            conditionGroups: [],
          },
        ],
        toBlocks: [
          {
            fromBlockId: "event",
            toBlockId: "log",
          },
        ],
        inputExamples: [],
      },
      // {
      //   name: "Row Delete: Employee",
      //   description: "Deletes employee",
      //   blocks: [
      //     {
      //       id: "manual",
      //       type: "manual",
      //       input: {},
      //       conditionGroups: [],
      //     },
      //     {
      //       id: "rowDelete",
      //       type: "rowDelete",
      //       input: {
      //         entity: "employee",
      //         id: "{{$params.id}}",
      //       },
      //       conditionGroups: [],
      //     },
      //   ],
      //   toBlocks: [
      //     {
      //       fromBlockId: "manual",
      //       toBlockId: "rowDelete",
      //     },
      //   ],
      //   inputExamples: [
      //     {
      //       title: "Valid request",
      //       input: {
      //         id: "ROW_ID_HERE",
      //       },
      //     },
      //   ],
      // },
    ],
  },
  {
    title: "Emails",
    workflows: [
      {
        name: "Resend Email",
        blocks: [
          {
            id: "manual",
            type: "manual",
            input: {},
            conditionGroups: [],
          },
          {
            id: "email",
            type: "email",
            description: "Resend email",
            input: {
              provider: "resend",
              from: "Acme <onboarding@resend.dev>",
              to: "{{$session.user.email}}",
              subject: "Hello from Resend!",
              body: "<strong>It works!</strong>",
              apiKey: "{{$credentials.RESEND_API_KEY}}",
            },
            conditionGroups: [],
          },
        ],
        toBlocks: [
          {
            fromBlockId: "manual",
            toBlockId: "email",
          },
        ],
        inputExamples: [],
      },
      {
        name: "Postmark Email",
        blocks: [
          {
            id: "manual",
            type: "manual",
            input: {},
            conditionGroups: [],
          },
          {
            id: "email",
            type: "email",
            description: "Resend email",
            input: {
              provider: "postmark",
              from: "{{$vars.POSTMARK_FROM_EMAIL}}",
              to: "{{$session.user.email}}",
              subject: "Hello from Postmark!",
              body: "<strong>It works!</strong>",
              apiKey: "{{$credentials.POSTMARK_SERVER_TOKEN}}",
            },
            conditionGroups: [],
          },
        ],
        toBlocks: [
          {
            fromBlockId: "manual",
            toBlockId: "email",
          },
        ],
        inputExamples: [],
      },
    ],
  },
];

export default templates;
