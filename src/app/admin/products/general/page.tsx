import { getWebstores } from "@/db/access/general";
import { GeneralProductUploadForm } from "./GeneralProductUploadForm";
import { prisma } from "@/prisma";
import { decryptWebstoreData } from "@/order-approval/encryption";

export default async function Page() {
  const webstores = await prisma.webstore.findMany();
  const decrypted = webstores.map((store) => {
    const decryptedData = decryptWebstoreData(store);
    return {
      id: store.id,
      name: store.name,
      url: store.url,
      apiKey: decryptedData.key,
      apiSecret: decryptedData.secret,
    };
  });

  return (
    <>
      <h1>General Product Sync</h1>
      <GeneralProductUploadForm webstores={decrypted} />
    </>
  );
}
