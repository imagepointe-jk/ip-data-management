"use client";

import { createDefaultWebstore } from "@/actions/orderWorkflow/create";
import { ButtonWithLoading } from "@/components/ButtonWithLoading";
import { useToast } from "@/components/ToastProvider";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function CreateButton() {
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();

  async function onClick() {
    setLoading(true);
    try {
      const createdWebstore = await createDefaultWebstore();
      router.push(`webstores/${createdWebstore.id}`);
    } catch (error) {
      console.error(error);
      toast.toast("Error creating webstore.", "error");
    }
    setLoading(false);
  }

  return (
    <ButtonWithLoading
      loading={loading}
      style={{ width: "150px" }}
      onClick={onClick}
    >
      + Add Webstore
    </ButtonWithLoading>
  );
}
