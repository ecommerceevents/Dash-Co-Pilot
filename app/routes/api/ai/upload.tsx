import { ActionFunctionArgs, json } from "@remix-run/node";
import { createSupabaseFile } from "~/utils/integrations/supabaseService";

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const requiredEnvVars = ["SUPABASE_API_URL", "SUPABASE_KEY"];
  const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);
  if (missingEnvVars.length) {
    return json("Missing env vars: " + missingEnvVars.join(", "), {
      status: 401,
    });
  }
  try {
    const file = request.body || "";
    const filename = request.headers.get("x-filename") || "file.txt";
    const contentType = request.headers.get("content-type") || "text/plain";
    const fileType = `.${contentType.split("/")[1]}`;

    const finalName = filename.includes(fileType) ? filename : `${filename}${fileType}`;

    const now = new Date().getTime();
    const path = `${now}-${finalName}`;

    const response = await createSupabaseFile("novel", path, file, contentType);

    return json({ success: true, url: response.publicUrl });
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error("Error uploading file", error.message);
    return new Response(error.message, { status: 500 });
  }
};
