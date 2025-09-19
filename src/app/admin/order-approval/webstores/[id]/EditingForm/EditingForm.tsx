"use client";

import { updateWebstore } from "@/actions/orderWorkflow/update";
import { useToast } from "@/components/ToastProvider";
import { FormEvent, ReactNode, useState } from "react";
import { useImmer } from "use-immer";
import { CheckoutFields } from "./CheckoutFields";
import { MainSettings } from "./MainSettings";
import { ShippingSettings } from "./ShippingSettings";
import { WebstoreEditorData } from "@/types/dto/orderApproval";

type Props = {
  webstoreData: WebstoreEditorData;
  shippingMethods: {
    id: number;
    name: string;
    serviceCode: number | null;
  }[];
  shortcodeReference: ReactNode;
  shippingEmailFilenames: string[];
};
export function EditingForm({
  webstoreData,
  shippingMethods,
  shippingEmailFilenames,
}: Props) {
  const [webstoreState, setWebstoreState] = useImmer(webstoreData);
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const toast = useToast();

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    await updateWebstore(webstoreState);
    toast.changesSaved();
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
        shippingEmailFilenames={shippingEmailFilenames}
      />
      <CheckoutFields
        webstoreState={webstoreState}
        setWebstoreState={setWebstoreState}
      />
      <ShippingSettings
        webstoreState={webstoreState}
        setWebstoreState={setWebstoreState}
        shippingMethods={shippingMethods}
      />
      <button type="submit">{"Save Changes"}</button>
    </form>
  );
}
