import fs from "fs";
import { EntityWithDetails } from "~/utils/db/entities/entities.db.server";
import DateUtils from "~/utils/shared/DateUtils";
import CodeTemplateForm from "../templates/components/CodeTemplate.Form";
import CodeTemplateDto from "../templates/dtos/CodeTemplate.Dto";
import CodeTemplateDtoCreate from "../templates/dtos/CodeTemplate.Dto.Create";
import CodeTemplateHelper from "../templates/helpers/CodeTemplate.Helper";
import CodeTemplateRoutesActivityApi from "../templates/routes/api/CodeTemplate.Routes.Activity.Api";
import CodeTemplateRoutesEditApi from "../templates/routes/api/CodeTemplate.Routes.Edit.Api";
import CodeTemplateRoutesIndexApi from "../templates/routes/api/CodeTemplate.Routes.Index.Api";
import CodeTemplateRoutesNewApi from "../templates/routes/api/CodeTemplate.Routes.New.Api";
import CodeTemplateRoutesShareApi from "../templates/routes/api/CodeTemplate.Routes.Share.Api";
import CodeTemplateRoutesTagsApi from "../templates/routes/api/CodeTemplate.Routes.Tags.Api";
import CodeTemplateRoutesActivityComponent from "../templates/routes/components/CodeTemplate.Routes.Activity.Component";
import CodeTemplateRoutesEditComponent from "../templates/routes/components/CodeTemplate.Routes.Edit.Component";
import CodeTemplateRoutesIndexComponent from "../templates/routes/components/CodeTemplate.Routes.Index.Component";
import CodeTemplateRoutesNewComponent from "../templates/routes/components/CodeTemplate.Routes.New.Component";
import CodeTemplateRoutesShareComponent from "../templates/routes/components/CodeTemplate.Routes.Share.Component";
import CodeTemplateRoutesTagsComponent from "../templates/routes/components/CodeTemplate.Routes.Tags.Component";
import CodeTemplateRoutesActivityView from "../templates/routes/views/CodeTemplate.Routes.Activity.View";
import CodeTemplateRoutesEditView from "../templates/routes/views/CodeTemplate.Routes.Edit.View";
import CodeTemplateRoutesIndexView from "../templates/routes/views/CodeTemplate.Routes.Index.View";
import CodeTemplateRoutesNewView from "../templates/routes/views/CodeTemplate.Routes.New.View";
import CodeTemplateRoutesShareView from "../templates/routes/views/CodeTemplate.Routes.Share.View";
import CodeTemplateRoutesTagsView from "../templates/routes/views/CodeTemplate.Routes.Tags.View";
import CodeTemplateModelSchemaPrisma from "../templates/schemas/CodeTemplate.Model.Schema.Prisma";
import CodeTemplateService from "../templates/services/CodeTemplate.Service";
import CodeGeneratorHelper from "../utils/CodeGeneratorHelper";
import Constants from "~/application/Constants";

export type CodeGeneratorOptions = {
  entity: EntityWithDetails;
  type: string;
  moduleDirectory: string;
  routesDirectory: string;
  deleteFilesOnFinish: boolean;
};

export type CodeGeneratorFileDto = {
  type: "module" | "route" | "model";
  directory?: string;
  file: string;
  content: string;
  description: string;
};

async function generate(options: CodeGeneratorOptions) {
  const moduleFiles = getModuleFiles(options);
  await writeFiles(moduleFiles, options.moduleDirectory);

  if (options.routesDirectory) {
    const routeFiles = getRouteFiles(options);
    await writeFiles(routeFiles, options.routesDirectory);
  }

  // if (options.generateZip) {
  //   var zipPath = `${options.moduleDirectory}/${options.entity.slug}.zip`;
  //   var zip = new AdmZip();
  //   moduleFiles.forEach((file) => {
  //     zip.addLocalFile(`${options.moduleDirectory}/${file.directory}/${file.file}`, file.directory);
  //   });
  //   zip.writeZip(zipPath);

  //   const file = fs.readFileSync(zipPath);
  //   return file;
  // }

  if (options.deleteFilesOnFinish) {
    fs.rmdirSync(options.moduleDirectory, { recursive: true });
  }
}

function getModuleFiles(options: CodeGeneratorOptions): CodeGeneratorFileDto[] {
  const { entity } = options;
  const { capitalized } = CodeGeneratorHelper.getNames(entity);

  const files: CodeGeneratorFileDto[] = [
    {
      type: "module",
      directory: `dtos`,
      file: `${capitalized}Dto.ts`,
      content: CodeTemplateDto.generate({ entity }),
      description: "DTO: Server <-> Client row interface",
    },
    {
      type: "module",
      directory: `dtos`,
      file: `${capitalized}CreateDto.ts`,
      content: CodeTemplateDtoCreate.generate({ entity }),
      description: "DTO: Create Object with required properties",
    },
    {
      type: "module",
      directory: `components`,
      file: `${capitalized}Form.tsx`,
      content: CodeTemplateForm.generate({ entity }),
      description: "Component: Form with creating, reading, updating, and deleting states",
    },
    {
      type: "module",
      directory: `helpers`,
      file: `${capitalized}Helpers.ts`,
      content: CodeTemplateHelper.generate({ entity }),
      description: "Helper: FormData and RowWithDetails transformer functions to Dto",
    },
    {
      type: "module",
      directory: `services`,
      file: `${capitalized}Service.ts`,
      content: CodeTemplateService.generate({ entity }),
      description: "Service: CRUD operations",
    },
    {
      type: "module",
      directory: `routes/api`,
      file: `${capitalized}Routes.Index.Api.ts`,
      content: CodeTemplateRoutesIndexApi.generate({ entity }),
      description: "Route API (Loader and Action): Get all rows with pagination and filtering",
    },
    {
      type: "module",
      directory: `routes/api`,
      file: `${capitalized}Routes.New.Api.ts`,
      content: CodeTemplateRoutesNewApi.generate({ entity }),
      description: "Route API (Loader and Action): Create new row",
    },
    {
      type: "module",
      directory: `routes/api`,
      file: `${capitalized}Routes.Edit.Api.ts`,
      content: CodeTemplateRoutesEditApi.generate({ entity }),
      description: "Route API (Loader and Action): Update row, and tasks",
    },
    {
      type: "module",
      directory: `routes/api`,
      file: `${capitalized}Routes.Activity.Api.ts`,
      content: CodeTemplateRoutesActivityApi.generate({ entity }),
      description: "Route API (Loader and Action): Get row history and comments",
    },
    {
      type: "module",
      directory: `routes/api`,
      file: `${capitalized}Routes.Share.Api.ts`,
      content: CodeTemplateRoutesShareApi.generate({ entity }),
      description: "Route API (Loader and Action): Share row with other accounts, users, roles, and groups",
    },
    {
      type: "module",
      directory: `routes/api`,
      file: `${capitalized}Routes.Tags.Api.ts`,
      content: CodeTemplateRoutesTagsApi.generate({ entity }),
      description: "Route API (Loader and Action): Set row tags",
    },
    {
      type: "module",
      directory: `routes/views`,
      file: `${capitalized}Routes.Index.View.tsx`,
      content: CodeTemplateRoutesIndexView.generate({ entity }),
      description: "Route View (Client component): Table with rows and quick row overview",
    },
    {
      type: "module",
      directory: `routes/views`,
      file: `${capitalized}Routes.New.View.tsx`,
      content: CodeTemplateRoutesNewView.generate({ entity }),
      description: "Route View (Client component): Form for creating new row",
    },
    {
      type: "module",
      directory: `routes/views`,
      file: `${capitalized}Routes.Edit.View.tsx`,
      content: CodeTemplateRoutesEditView.generate({ entity }),
      description: "Route View (Client component): Form for overview and editing row",
    },
    {
      type: "module",
      directory: `routes/views`,
      file: `${capitalized}Routes.Activity.View.tsx`,
      content: CodeTemplateRoutesActivityView.generate({ entity }),
      description: "Route View (Client component): History and comments for row",
    },
    {
      type: "module",
      directory: `routes/views`,
      file: `${capitalized}Routes.Share.View.tsx`,
      content: CodeTemplateRoutesShareView.generate({ entity }),
      description: "Route View (Client component): Share row with other accounts, users, roles, and groups",
    },
    {
      type: "module",
      directory: `routes/views`,
      file: `${capitalized}Routes.Tags.View.tsx`,
      content: CodeTemplateRoutesTagsView.generate({ entity }),
      description: "Route View (Client component): Set row tags",
    },
  ];

  if (options.type === "custom") {
    files.unshift({
      type: "model",
      file: `schema.prisma`,
      content: CodeTemplateModelSchemaPrisma.generate({ entity }),
      description: "Update your schema.prisma",
    });
  }

  addTopComments(files);
  return files;
}

function getRouteFiles({ type, entity, moduleDirectory }: CodeGeneratorOptions) {
  let moduleLocation = moduleDirectory.replace("./app", "");
  if (moduleLocation.startsWith("/")) {
    moduleLocation = moduleLocation.substring(1);
  }
  const files: CodeGeneratorFileDto[] = [
    {
      type: "route",
      file: `index.tsx`,
      content: CodeTemplateRoutesIndexComponent.generate({ entity, moduleLocation }),
      description: "Route: Orchestrates Index API and View",
    },
    {
      type: "route",
      file: `new.tsx`,
      content: CodeTemplateRoutesNewComponent.generate({ entity, moduleLocation }),
      description: "Route: Orchestrates New API and View",
    },
    {
      type: "route",
      file: `$id.tsx`,
      content: CodeTemplateRoutesEditComponent.generate({ entity, moduleLocation }),
      description: "Route: Orchestrates Edit API and View",
    },
    {
      type: "route",
      file: `activity.tsx`,
      directory: "$id",
      content: CodeTemplateRoutesActivityComponent.generate({ entity, moduleLocation }),
      description: "Route: Orchestrates Activity API and View",
    },
    {
      type: "route",
      file: `share.tsx`,
      directory: "$id",
      content: CodeTemplateRoutesShareComponent.generate({ entity, moduleLocation }),
      description: "Route: Orchestrates Share API and View",
    },
    {
      type: "route",
      file: `tags.tsx`,
      directory: "$id",
      content: CodeTemplateRoutesTagsComponent.generate({ entity, moduleLocation }),
      description: "Route: Orchestrates Tags API and View",
    },
  ];

  addTopComments(files);
  return files;
}

function addTopComments(files: CodeGeneratorFileDto[]) {
  files.forEach((file) => {
    const comments: string[] = [];
    comments.push(file.description);
    comments.push("Date: " + DateUtils.dateYMD(new Date()));
    comments.push("Version: SaasRock v" + Constants.VERSION);
    file.content = comments.map((comment) => `// ${comment}`).join("\n") + "\n\n" + file.content;
  });
}

async function writeFiles(files: CodeGeneratorFileDto[], parentDirectory: string) {
  const promises = files.map(async (file) => {
    const fileDirectory = file.directory ? `${parentDirectory}/${file.directory}` : parentDirectory;
    const filePath = `${fileDirectory}/${file.file}`;
    if (!fs.existsSync(fileDirectory)) {
      fs.mkdirSync(fileDirectory, { recursive: true });
    }
    fs.writeFileSync(filePath, file.content);
  });
  await Promise.all(promises);
}

function moduleDirectoryOptions(entity: EntityWithDetails) {
  let tests = `./app/modules/codeGeneratorTests/` + entity.slug;
  let app = `./app/modules/` + entity.slug;
  return [
    { name: tests, value: tests },
    { name: app, value: app },
  ];
}

function routeDirectoryOptions(entity: EntityWithDetails) {
  let tests = `./app/routes/admin/entities/code-generator/tests/` + entity.slug;
  let app = `./app/routes/app.$tenant/` + entity.slug;
  return [
    { name: tests, value: tests },
    { name: app, value: app },
  ];
}

export default {
  generate,
  getModuleFiles,
  getRouteFiles,
  moduleDirectoryOptions,
  routeDirectoryOptions,
};