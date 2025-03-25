"use client";

import { createDesign } from "@/actions/designs/create";
import { ButtonWithLoading } from "@/components/ButtonWithLoading";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function CreateDesignButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onClick() {
    setLoading(true);
    const created = await createDesign({ localDate: new Date() });
    setLoading(false);
    router.push(`designs/${created.id}`);
  }

  return (
    <ButtonWithLoading
      loading={loading}
      onClick={onClick}
      style={{ width: "150px" }}
    >
      + Create Design
    </ButtonWithLoading>
  );
}
