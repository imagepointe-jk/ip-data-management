"use client";

import { createCustomizableProduct } from "@/actions/customizer/create";
import { ButtonWithLoading } from "@/components/ButtonWithLoading";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function CreateProduct() {
  const [id, setId] = useState(0);
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(false);
  const router = useRouter();

  async function onClickCreate() {
    if (id < 1) return;

    setCreated(false);
    setLoading(true);
    await createCustomizableProduct(id);
    router.refresh();
    setCreated(true);
    setLoading(false);
  }

  return (
    <div className="content-frame vert-flex-group" style={{ width: "300px" }}>
      <div className="input-group-heading">Create Customizable Product</div>
      <div>
        <label className="input-label">WooCommerce Product ID</label>
        <input type="number" onChange={(e) => setId(+e.target.value)} />
      </div>
      <div>
        <ButtonWithLoading
          loading={loading}
          onClick={onClickCreate}
          normalText="+ Create"
          style={{ width: "100px" }}
        />
      </div>
      {created && (
        <div>
          Product record created. It may take a few more moments to get data
          from WooCommerce.
        </div>
      )}
    </div>
  );
}
