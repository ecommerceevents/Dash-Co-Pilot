// var AdmZip = require("adm-zip");
import AdmZip from "adm-zip";
import fs from "fs";

export async function saveZip(path: string, data: { type: string; content: string }) {
  try {
    const dir = path.replace(/\/\w+\.\w+$/, "");
    if (dir) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
    const utf = _decodeBase64ToUtf8(data.content);
    var blob = new Blob([utf], { type: data.type });
    const buffer = Buffer.from(await blob.arrayBuffer());
    fs.writeFileSync(path, buffer);
    // eslint-disable-next-line no-console
    console.log("[saveFile] success", path);
    return path;
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.log("[saveFile] error", e.message);
    throw new Error("Error saving file: " + e.message);
  }
}

export function deleteFile(path: string) {
  try {
    if (fs.existsSync(path)) {
      fs.unlinkSync(path);
      // eslint-disable-next-line no-console
      console.log("[deleteFile] success", path);
    }
    return path;
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.log("[deleteFile] error", e.message);
    throw new Error("Error deleting file: " + e.message);
  }
}

export function deleteFolder(path: string, options: { recursive: boolean; force: boolean }) {
  try {
    if (fs.existsSync(path)) {
      fs.rmSync(path, options);
      // eslint-disable-next-line no-console
      console.log("[deleteFolder] success", path);
    }
    return path;
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.log("[deleteFolder] error", e.message);
    throw new Error("Error deleting folder: " + e.message);
  }
}

export async function extractZip(source: string, target?: string) {
  try {
    if (target) {
      const dir = target?.replace(/\/\w+\.\w+$/, "");
      if (dir) {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
      }
    }
    var zip = new AdmZip(source);
    const entries = zip.getEntries();
    // eslint-disable-next-line no-console
    console.log("[extractZip] success", source, target);
    return entries;
  } catch (e: any) {
    // handle any errors
    // eslint-disable-next-line no-console
    console.log("[extractZip] error", { target, error: e.message });
    throw new Error("Error extracting zip file: " + e.message);
  }
}

export async function createBlobFromBase64(type: string, content: string) {
  const response = await fetch(`data:${type};base64,${content}`);
  return await response.blob();
}

export async function getBase64FromBlob(blob: Blob) {
  let buffer = Buffer.from(await blob.text());
  return buffer.toString("base64");
}

function _decodeBase64ToUtf8(base64: string) {
  var buffer;
  if (typeof Buffer.from === "function") {
    // Node 5.10+
    buffer = Buffer.from(base64, "base64");
  } else {
    // older Node versions
    buffer = new Buffer(base64, "base64");
  }

  return buffer;
}
