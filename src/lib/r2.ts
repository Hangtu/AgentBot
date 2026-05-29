import { S3Client } from "@aws-sdk/client-s3";

import { serverEnv } from "@/lib/env";

export const r2 =
  serverEnv.R2_ACCOUNT_ID &&
  serverEnv.R2_ACCESS_KEY_ID &&
  serverEnv.R2_SECRET_ACCESS_KEY
    ? new S3Client({
        region: "auto",
        endpoint: `https://${serverEnv.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: serverEnv.R2_ACCESS_KEY_ID,
          secretAccessKey: serverEnv.R2_SECRET_ACCESS_KEY,
        },
      })
    : null;

export const R2_BUCKET_NAME = serverEnv.R2_BUCKET_NAME;
