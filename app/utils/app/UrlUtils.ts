import { Params } from "react-router";
import slugify from "@sindresorhus/slugify";

const stripTrailingSlash = (str: string) => {
  return str.endsWith("/") ? str.slice(0, -1) : str;
};

const currentTenantUrl = (params: Params, path?: string) => {
  const { tenant } = params;
  if (path) {
    const appPath = path.startsWith("/") ? path.substring(1, path.length - 1) : path;
    // console.log({ appPath });
    return `/app/${tenant}/${appPath}`;
  }
  return `/app/${tenant}/`;
};

const currentEntityUrl = (params: Params) => {
  const currentTenant = stripTrailingSlash(currentTenantUrl(params));
  return `${currentTenant}/${params.entity}`;
};

const replaceVariables = (params: Params, path?: string) => {
  return path?.replace(":tenant", params.tenant ?? "");
};

// https://mhagemann.medium.com/the-ultimate-way-to-slugify-a-url-string-in-javascript-b8e4a0d849e1
// const slugify = (str: string, max: number = 100) => {
//   const a = "àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìıİłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;";
//   const b = "aaaaaaaaaacccddeeeeeeeegghiiiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------";
//   const p = new RegExp(a.split("").join("|"), "g");

//   return (
//     str
//       .toString()
//       .toLowerCase()
//       .replace(/\s+/g, "-") // Replace spaces with -
//       .replace(p, (c) => b.charAt(a.indexOf(c))) // Replace special characters
//       .replace(/&/g, "-and-") // Replace & with 'and'
//       // .replace(/[^\w\-]+/g, "") // Remove all non-word characters
//       // eslint-disable-next-line no-useless-escape
//       .replace(/\-\-+/g, "-") // Replace multiple - with single -
//       .replace(/^-+/, "") // Trim - from start of text
//       .replace(/-+$/, "")
//   ); // Trim - from end of text
// };

function getParentRoute(pathname: string) {
  const url = stripTrailingSlash(pathname);
  const parentRoute = url.substring(0, url.lastIndexOf("/"));
  return parentRoute;
}

function getModulePath(params: Params, path: string) {
  if (params.tenant) {
    if (path.startsWith("integrations")) {
      return `/app/${params.tenant}/settings/${path}`;
    } else if (path.startsWith("entities")) {
      return `/app/${params.tenant}/settings/${path}`;
    } else if (path.startsWith("api")) {
      return `/app/${params.tenant}/settings/${path}`;
    } else if (path.startsWith("blog")) {
      return `/app/${params.tenant}/${path}`;
    } else if (path.startsWith("workflow-engine")) {
      return `/app/${params.tenant}/${path}`;
    } else if (path.startsWith("logs")) {
      return `/app/${params.tenant}/settings/${path}`;
    } else {
      return `/app/${params.tenant}/${path}`;
    }
  }
  return `/admin/${path}`;
}

function getBlogPath(params: Params, path?: string) {
  if (params.tenant) {
    return !path ? `/b/${params.tenant}` : `/b/${params.tenant}/${path}`;
  }
  return !path ? `/blog` : `/blog/${path}`;
}

function join(...paths: string[]) {
  return paths.join("/").replace(/\/+/g, "/");
}

function searchParamsToString({ type, searchParams }: { type: "string" | "object"; searchParams: URLSearchParams }) {
  searchParams.delete("entity");
  searchParams.delete("id");
  function paramsToObject(entries: any) {
    const result: any = {};
    for (const [key, value] of entries) {
      // each 'entry' is a [key, value] tupple
      result[key] = value;
    }
    return result;
  }
  const entries = searchParams.entries();
  if (type === "object") {
    //{abc:"foo",def:"[asf]",xyz:"5"}
    const asObject = paramsToObject(entries);
    return JSON.stringify(asObject);
  }
  // abc=foo&def=[asf]&xyz=5
  return searchParams.toString();
}

export default {
  currentTenantUrl,
  currentEntityUrl,
  stripTrailingSlash,
  slugify,
  replaceVariables,
  getParentRoute,
  getModulePath,
  join,
  getBlogPath,
  searchParamsToString,
};
