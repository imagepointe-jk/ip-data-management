"use client";

import { createWebstore } from "@/actions/orderWorkflow/create";
import { updateWebstore } from "@/actions/orderWorkflow/update";
import { useToast } from "@/components/ToastProvider";
import { WebstoreEditorData } from "@/types/schema/orderApproval";
import { useRouter } from "next/navigation";
import { FormEvent, ReactNode, useState } from "react";
import { useImmer } from "use-immer";
import { CheckoutFields } from "./CheckoutFields";
import { EmailSettings } from "./EmailSettings";
import { MainSettings } from "./MainSettings";
import { ShippingSettings } from "./ShippingSettings";

const blankState: WebstoreEditorData = {
  id: 0,
  name: "",
  customOrderApprovedEmail: "",
  orderUpdatedEmails: "",
  organizationName: "",
  otherSupportEmails: "",
  salesPersonEmail: "",
  salesPersonName: "",
  url: "",
  checkoutFields: [],
  shippingMethods: [],
  shippingSettings: null,
  useCustomOrderApprovedEmail: false,
};
type Props = {
  webstoreData: WebstoreEditorData | null;
  shippingMethods: {
    id: number;
    name: string;
    serviceCode: number | null;
  }[];
  shortcodeReference: ReactNode;
};
export function EditingForm({
  webstoreData,
  shippingMethods,
  shortcodeReference,
}: Props) {
  const [webstoreState, setWebstoreState] = useImmer(
    webstoreData ? webstoreData : blankState
  );
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const toast = useToast();
  const router = useRouter();
  const creatingNew = webstoreState.id === 0;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!creatingNew) {
      await updateWebstore(webstoreState);
      toast.changesSaved();
    } else {
      const created = await createWebstore({
        ...webstoreState,
        apiKey,
        apiSecret,
      });
      toast.changesSaved();
      router.push(`${created.id}`);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <MainSettings
        webstoreState={webstoreState}
        setWebstoreState={setWebstoreState}
        apiKey={apiKey}
        setApiKey={setApiKey}
        apiSecret={apiSecret}
        setApiSecret={setApiSecret}
      />
      <EmailSettings
        webstoreState={webstoreState}
        setWebstoreState={setWebstoreState}
        shortcodeReference={shortcodeReference}
      />
      {!creatingNew && (
        <CheckoutFields
          webstoreState={webstoreState}
          setWebstoreState={setWebstoreState}
        />
      )}
      <ShippingSettings
        webstoreState={webstoreState}
        setWebstoreState={setWebstoreState}
        shippingMethods={shippingMethods}
      />
      <button type="submit">
        {!creatingNew ? "Save Changes" : "Create Webstore"}
      </button>
    </form>
  );
}
