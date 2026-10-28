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

  //fallback values
  let key = "<UNABLE TO DECRYPT API KEY>";
  let secret = "<UNABLE TO DECRYPT API SECRET>";

  try {
    key = decrypt(apiKey, apiKeyEncryptIv, apiKeyEncryptTag);
  } catch (_) {}

  try {
    secret = decrypt(apiSecret, apiSecretEncryptIv, apiSecretEncryptTag);
  } catch (_) {}

  return { key, secret };
}
