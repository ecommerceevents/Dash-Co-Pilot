import fs from "fs";
import { marked } from "marked";
import path from "path";

export async function getMdxContent(fileName: string): Promise<string> {
  const filePath = path.join("./", "./app/blog/" + fileName + ".mdx");
  const content = fs.readFileSync(filePath, "utf8");
  return content;
}

export async function getMdxPosts(): Promise<{ slug: string; markdown: string }[]> {
  const items: { slug: string; markdown: string }[] = [];
  const dir = path.join("./", "./app/blog");
  const fileNames = fs.readdirSync(dir);
  fileNames.forEach((file) => {
    if (path.parse(file).ext === ".mdx") {
      const slug = path.parse(file).name;
      const content = fs.readFileSync(path.join(dir, file), "utf8");
      items.push({
        slug,
        markdown: marked(content),
      });
    }
  });
  return items;
}
