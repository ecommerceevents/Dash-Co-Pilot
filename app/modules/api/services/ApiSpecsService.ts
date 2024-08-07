import { EntityWithDetails, getAllEntities } from "~/utils/db/entities/entities.db.server";
import { ApiEndpointDto } from "../dtos/ApiEndpointDto";
import { TFunction } from "i18next";
import ApiHelper from "~/utils/helpers/ApiHelper";
import { getAppConfiguration } from "~/utils/db/appConfiguration.db.server";
import { getTranslations } from "~/locale/i18next.server";

export type ApiSpecsDto = {
  endpoints?: ApiEndpointDto[];
  openApi: any;
  postmanCollection?: any;
};
async function generateSpecs({ request }: { request: Request }): Promise<ApiSpecsDto> {
  const { t } = await getTranslations(request);
  let entities = (await getAllEntities({ tenantId: null, active: true })).filter((f) => f.hasApi);
  entities = entities.filter((f) => f.hasApi);
  let endpoints: ApiEndpointDto[] = [];
  entities.forEach((entity) => {
    endpoints = [...endpoints, ...getEntityEndpoints({ entity, t })];
  });
  return {
    endpoints,
    openApi: generateOpenApiSpecs({ entities, t }),
    postmanCollection: generatePostmanCollection({ request, entities, t }),
  };
}

function getEntityEndpoints({ entity, t }: { entity: EntityWithDetails; t: TFunction }) {
  const endpoints: ApiEndpointDto[] = [];
  let body = {};
  let schema = {};
  entity.properties
    .filter((f) => !f.isDefault)
    .forEach((property) => {
      let value = ApiHelper.getSampleValue({ property });
      body = {
        ...body,
        [property.name]: value ?? "",
      };
      let type = ApiHelper.getSchemaType({ property });
      schema = {
        ...schema,
        [property.name]: type ?? "",
      };
    });
  endpoints.push({
    entity,
    route: `/api/${entity.slug}`,
    method: "GET",
    description: `Get all ${t(entity.titlePlural)}`,
    responseSchema: JSON.stringify(schema, null, 2),
    bodyExample: "",
  });
  endpoints.push({
    entity,
    route: `/api/${entity.slug}/:id`,
    method: "GET",
    description: `Get ${t(entity.title)}`,
    responseSchema: JSON.stringify(schema, null, 2),
    bodyExample: "",
  });
  endpoints.push({
    entity,
    route: `/api/${entity.slug}`,
    method: "POST",
    description: `Create ${t(entity.title)}`,
    responseSchema: JSON.stringify(schema, null, 2),
    bodyExample: JSON.stringify(body, null, 2),
  });
  endpoints.push({
    entity,
    route: `/api/${entity.slug}/:id`,
    method: "PUT",
    description: `Update ${t(entity.title)}`,
    responseSchema: JSON.stringify(schema, null, 2),
    bodyExample: JSON.stringify(body, null, 2),
  });
  endpoints.push({
    entity,
    route: `/api/${entity.slug}/:id`,
    method: "DELETE",
    description: `Delete ${t(entity.title)}`,
    responseSchema: "",
    bodyExample: "",
  });
  return endpoints;
}

function generateOpenApiSpecs({ entities, t }: { entities: EntityWithDetails[]; t: TFunction }) {
  let paths: any = {};

  const responses = {
    "200": { description: `OK` },
    "400": { description: `Bad Request` },
    "404": { description: `Not Found` },
    "500": { description: `Internal Server Error` },
  };

  paths["/api/auth/login"] = {
    post: {
      tags: ["Auth"],
      description: `Authenticate a user and get a token`,
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                email: { type: "string" },
                password: { type: "string" },
              },
              required: ["email", "password"],
            },
          },
        },
      },
      responses: {
        "200": {
          description: "User logged in successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  token: { type: "string" },
                  user: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      email: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
        "400": { description: "Invalid email or password" },
      },
    },
  };

  entities.forEach((entity) => {
    let properties: any = {};

    entity.properties
      .filter((f) => !f.isDefault)
      .forEach((property) => {
        properties[property.name] = ApiHelper.getSchemaType({ property });
      });

    const entityPath = `/api/${entity.slug}`;
    const entityPathWithId = `/api/${entity.slug}/{id}`;
    const entitySwaggerSpec = generateEntitySwaggerSpec({ entity, properties, t });
    paths[entityPath] = {
      get: entitySwaggerSpec.get,
      post: entitySwaggerSpec.post,
    };
    paths[entityPathWithId] = {
      get: entitySwaggerSpec["/{id}"].get,
      put: entitySwaggerSpec.put,
      delete: entitySwaggerSpec.delete,
    };
  });

  const thereAreRelationships = entities.find((f) => f.childEntities.length > 0 || f.parentEntities.length > 0);
  if (thereAreRelationships) {
    paths["/api/relationships"] = {
      post: {
        tags: ["Relationships"],
        description: `Create a relationship between two rows`,
        responses,
        security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  parent: { type: "string" },
                  child: { type: "string" },
                },
                required: ["parent", "child"],
              },
            },
          },
        },
      },
    };
    paths["/api/relationships/{id}"] = {
      get: {
        tags: ["Relationships"],
        description: `Get a relationship`,
        responses,
        security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            schema: { type: "string" },
            required: true,
            description: `The id of the relationship`,
          },
        ],
      },
      delete: {
        tags: ["Relationships"],
        description: `Delete a relationship`,
        responses,
        security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            schema: { type: "string" },
            required: true,
            description: `The id of the relationship`,
          },
        ],
      },
    };
  }

  return {
    openapi: "3.0.0",
    info: {
      title: `${process.env.APP_NAME} API`,
      version: "1.0.0",
    },
    paths,
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "X-Api-Key",
        },
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  };
}

function generateEntitySwaggerSpec({ entity, properties, t }: { entity: EntityWithDetails; properties: any; t: TFunction }) {
  const responses = {
    "200": { description: `OK` },
    "400": { description: `Bad Request` },
    "404": { description: `Not Found` },
    "500": { description: `Internal Server Error` },
  };

  return {
    get: {
      tags: [t(entity.titlePlural)],
      description: `Get a list of ${entity.titlePlural}`,
      operationId: `get-all-${entity.slug}`,
      security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
      responses,
    },
    post: {
      tags: [t(entity.titlePlural)],
      description: `Create a new ${entity.title}`,
      operationId: `create-${entity.slug}`,
      security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties,
            },
          },
        },
      },
      responses,
    },
    put: {
      tags: [t(entity.titlePlural)],
      description: `Update an existing ${entity.title}`,
      operationId: `update-${entity.slug}`,
      security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties,
            },
          },
        },
      },
      parameters: [
        {
          in: "path",
          name: "id",
          schema: { type: "string" },
          required: true,
          description: `The id of the ${entity.title}`,
        },
      ],
      responses,
    },
    delete: {
      tags: [t(entity.titlePlural)],
      description: `Delete an existing ${entity.title}`,
      operationId: `delete-${entity.slug}`,
      security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "id",
          schema: { type: "string" },
          required: true,
          description: `The id of the ${entity.title}`,
        },
      ],
      responses,
    },
    "/{id}": {
      get: {
        tags: [t(entity.titlePlural)],
        description: `Get a single ${entity.title}`,
        operationId: `get-${entity.slug}`,
        security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            schema: { type: "string" },
            required: true,
            description: `The id of the ${entity.title}`,
          },
        ],
        responses,
      },
    },
  };
}

async function generatePostmanCollection({ request, entities, t }: { request: Request; entities: EntityWithDetails[]; t: TFunction }) {
  const appConfiguration = await getAppConfiguration({ request });
  const serverUrl = appConfiguration.app.url;

  const item: any[] = [];

  // Add the /api/auth/login endpoint
  const loginEndpoint = {
    route: "/api/auth/login",
    method: "POST",
    description: "User login",
    examples: [
      {
        body: {
          email: "<email>",
          password: "<password>",
        },
      },
    ],
  };

  let loginRequest: any = {
    url: {
      raw: `${serverUrl}${loginEndpoint.route}`,
      protocol: new URL(serverUrl).protocol.replace(":", ""),
      host: [new URL(serverUrl).hostname],
      path: [`${loginEndpoint.route}`],
      port: new URL(serverUrl).port,
    },
    method: `${loginEndpoint.method}`,
    header: [],
    description: `${loginEndpoint.description}`,
  };

  loginRequest.body = {
    mode: "raw",
    raw: JSON.stringify(
      {
        email: "<email>",
        password: "<password>",
      },
      null,
      2
    ),
  };

  item.push({
    name: `${loginEndpoint.method} ${loginEndpoint.route}`,
    request: loginRequest,
  });

  // // Define the authentication object
  // const authObject: any = {
  //   type: "bearer",
  //   bearer: [
  //     {
  //       key: "token",
  //       value: "<token>",
  //       type: "string",
  //     },
  //   ],
  // };

  entities.forEach((entity) => {
    const entityEndpoints = getEntityEndpoints({ entity, t });

    entityEndpoints.forEach((endpoint) => {
      let request: any = {
        url: {
          raw: `${serverUrl}${endpoint.route}`,
          protocol: new URL(serverUrl).protocol.replace(":", ""),
          host: [new URL(serverUrl).hostname],
          path: [`${endpoint.route}`],
          port: new URL(serverUrl).port,
        },
        method: `${endpoint.method}`,
        header: [],
        description: `${endpoint.description}`,
        // auth: authObject, // Include the auth object in each request
      };

      if (endpoint.method === "POST" || endpoint.method === "PUT") {
        request.body = {
          mode: "raw",
          raw: endpoint.bodyExample,
        };
      }

      item.push({
        name: `${endpoint.method} ${endpoint.route}`,
        request: request,
      });
    });
  });

  const thereAreRelationships = entities.find((f) => f.childEntities.length > 0 || f.parentEntities.length > 0);
  if (thereAreRelationships) {
    item.push({
      name: `GET /api/relationships/:id`,
      request: {
        url: {
          raw: `${serverUrl}/api/relationships/:id`,
          protocol: new URL(serverUrl).protocol.replace(":", ""),
          host: [new URL(serverUrl).hostname],
          path: [`/api/relationships/:id`],
          port: new URL(serverUrl).port,
        },
        method: `GET`,
        header: [],
        description: `Get a relationship between two rows`,
      },
    });
    item.push({
      name: `POST /api/relationships`,
      request: {
        url: {
          raw: `${serverUrl}/api/relationships`,
          protocol: new URL(serverUrl).protocol.replace(":", ""),
          host: [new URL(serverUrl).hostname],
          path: [`/api/relationships`],
          port: new URL(serverUrl).port,
        },
        method: `POST`,
        header: [],
        description: `Create a relationship between two rows`,
        body: {
          mode: "raw",
          raw: JSON.stringify(
            {
              parent: "<parentRowId>",
              child: "<childRowId>",
            },
            null,
            2
          ),
        },
      },
    });
    item.push({
      name: `DELETE /api/relationships/:id`,
      request: {
        url: {
          raw: `${serverUrl}/api/relationships/:id`,
          protocol: new URL(serverUrl).protocol.replace(":", ""),
          host: [new URL(serverUrl).hostname],
          path: [`/api/relationships/:id`],
          port: new URL(serverUrl).port,
        },
        method: `DELETE`,
        header: [],
        description: `Delete a relationship between two rows`,
      },
    });
  }

  const postmanCollection = {
    info: {
      _postman_id: "id",
      name: `${process.env.APP_NAME} API`,
      schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    },
    item,
  };

  return postmanCollection;
}

export default {
  generateSpecs,
  getEntityEndpoints,
};
