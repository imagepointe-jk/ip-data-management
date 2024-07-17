import { decrypt } from "@/utility/misc";
import { Webstore } from "@prisma/client";

export function decryptWebstoreData(webstore: Webstore) {
  const {
    apiKey,
    apiKeyEncryptIv,
    apiKeyEncryptTag,
    apiSecret,
    apiSecretEncryptIv,
    apiSecretEncryptTag,
  } = webstore;
  const key = decrypt(apiKey, apiKeyEncryptIv, apiKeyEncryptTag);
  const secret = decrypt(apiSecret, apiSecretEncryptIv, apiSecretEncryptTag);
  return { key, secret };
}
