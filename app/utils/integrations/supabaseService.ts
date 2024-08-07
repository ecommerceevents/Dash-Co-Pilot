import { EmailAttachment } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import { MediaDto } from "~/application/dtos/entities/MediaDto";

function getClient() {
  const supabaseUrl = process.env.SUPABASE_API_URL?.toString() ?? "";
  const supabaseKey = process.env.SUPABASE_KEY?.toString() ?? "";
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
  });
}

export async function getOrCreateSupabaseBucket(id: string, isPublic: boolean) {
  const client = getClient();

  const existingBucket = await client.storage.getBucket(id);
  if (existingBucket.data) {
    return {
      data: existingBucket.data,
      error: existingBucket.error,
    };
  }
  const newBucketId = await client.storage.createBucket(id, {
    public: isPublic,
  });
  if (newBucketId.data) {
    const newBucket = await client.storage.getBucket(newBucketId.data.name);
    if (newBucket.data) {
      return {
        data: newBucket.data,
        error: newBucket.error,
      };
    }
  }
  return {
    data: null,
    error: newBucketId.error,
  };
}

export async function createSupabaseFile(
  bucketId: string,
  path: string,
  file:
    | File
    | ReadableStream<Uint8Array>
    | ArrayBuffer
    | ArrayBufferView
    | Blob
    | Buffer
    | FormData
    | NodeJS.ReadableStream
    | ReadableStream<Uint8Array>
    | URLSearchParams
    | string,
  contentType?: string
): Promise<{
  id: string;
  publicUrl: string | null;
}> {
  const client = getClient();
  const bucket = await getOrCreateSupabaseBucket(bucketId, true);
  if (!bucket.data) {
    if (bucket.error) {
      throw Error("Could not create supabase bucket: " + bucket.error.message);
    } else {
      throw Error("Could not create supabase bucket: Unknown error");
    }
  }

  const createdSupabaseFile = await client.storage.from(bucket.data.id).upload(path, file, {
    contentType,
    duplex: "half",
  });
  if (!createdSupabaseFile.data) {
    if (createdSupabaseFile.error) {
      throw Error("Could not create supabase file: " + JSON.stringify({ error: createdSupabaseFile.error.message, path }));
    } else {
      throw Error("Could not create supabase file: Unknown error");
    }
  }

  return {
    id: createdSupabaseFile.data.path,
    publicUrl: await getSupabaseFilePublicUrl(bucketId, path),
  };
}

export async function getSupabaseFilePublicUrl(bucketId: string, path: string): Promise<string | null> {
  const client = getClient();

  const supabaseFile = client.storage.from(bucketId).getPublicUrl(path);
  if (!supabaseFile.data.publicUrl) {
    throw Error("Could not get supabase file: Unknown error");
  }
  return supabaseFile.data.publicUrl;
}

export function getSupabaseAttachmentBucket() {
  return "email-attachments";
}

export async function getSupabaseFileDownload(bucketId: string, path: string): Promise<Blob | null> {
  const client = getClient();

  const supabaseFile = await client.storage.from(bucketId).download(path);
  if (!supabaseFile.data) {
    if (supabaseFile.error) {
      throw Error("Could not download supabase file: " + supabaseFile.error.message);
    } else {
      throw Error("Could not download supabase file: Unknown error");
    }
  }
  return supabaseFile.data;
}

export function getSupabaseAttachmentPath(attachment: EmailAttachment) {
  return attachment.id + "-" + attachment.name;
}

export async function createSupabaseFileFromMedia(bucketId: string, id: string, data: MediaDto) {
  const blobFile = await fetch(`${data.file}`);
  const file = new File([await blobFile.blob()], data.name, { type: data.type });
  try {
    return await createSupabaseFile(bucketId, `${id}`, file);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  }
}

export async function deleteSupabaseFile(bucketId: string, path: string) {
  const client = getClient();
  return await client.storage.from(bucketId).remove([path]);
}

export async function storeSupabaseFile({ bucket, content, id, replace }: { bucket: string; content: string; id: string; replace?: boolean }) {
  if (!process.env.SUPABASE_API_URL || !process.env.SUPABASE_KEY) {
    // eslint-disable-next-line no-console
    console.log("No supabase credentials, skipping file upload");
    return content;
  }
  const client = getClient();
  if (content.startsWith("http") && !replace) {
    return content;
  }
  if (!process.env.SUPABASE_API_URL || !process.env.SUPABASE_KEY) {
    return content;
  }
  try {
    const blob = await (await fetch(content)).blob();
    const file = new File([blob], id);

    const existingFile = client.storage.from(bucket).getPublicUrl(id);
    if (existingFile) {
      const updatedSupabaseFile = await client.storage.from(bucket).update(id, file);
      const publicUrl = await getSupabaseFilePublicUrl(bucket, id);
      if (updatedSupabaseFile.data?.path && publicUrl) {
        return publicUrl;
      }
    }
    const createdFile = await createSupabaseFile(bucket, id, file);
    if (createdFile.publicUrl) {
      return createdFile.publicUrl;
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log("Could not create supabase file: " + e);
  }
  return content;
}

export async function getSupabaseBuckets() {
  const client = getClient();
  return await client.storage.listBuckets();
}

export async function updateSupabaseBucket(id: string, data: { public: boolean }) {
  const client = getClient();
  return await client.storage.updateBucket(id, { public: data.public });
}

export async function deleteSupabaseBucket(bucketId: string) {
  const client = getClient();
  return await client.storage.deleteBucket(bucketId);
}

export async function getSupabaseFiles(bucketId: string) {
  const client = getClient();
  return await client.storage.from(bucketId).list();
}
