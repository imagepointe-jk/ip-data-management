"use client";

import { startOrderWorkflowAction } from "@/actions/orderWorkflow/misc";
import { ButtonWithLoading } from "@/components/ButtonWithLoading";
import { useToast } from "@/components/ToastProvider";
import { Webstore } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  webstore: Webstore;
};
export function ManualInstanceTrigger({ webstore }: Props) {
  const [orderId, setOrderId] = useState(0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  async function onClick() {
    try {
      setLoading(true);
      await startOrderWorkflowAction(orderId, webstore.url);
      toast.toast("Instance created.", "success");
      router.refresh();
    } catch (error) {
      toast.toast("Error creating instance.", "error");
      console.error(error);
    }
    setLoading(false);
  }

  return (
    <details>
      <summary className="input-group-heading">
        Manually Create Instance
      </summary>
      <div className="vert-flex-group">
        <div>
          Use this tool to manually trigger the creation of a workflow instance
          for a specific WooCommerce order. It simulates a webhook arriving from
          WooCommerce.
        </div>
        <div>
          This is meant to be used as a fallback measure if something goes wrong
          and our system does not automatically detect that a new order has been
          placed.
        </div>
        <div>
          The order must already exist in the WooCommerce database for the
          webstore <strong>"{webstore.name}"</strong>.
        </div>
        <div>
          <label className="input-label">Order ID</label>
          <input
            type="number"
            value={orderId}
            onChange={(e) => setOrderId(+e.target.value)}
          />
        </div>
        <div>
          <ButtonWithLoading
            loading={loading}
            style={{ width: "100px" }}
            normalText="Create"
            onClick={onClick}
          />
        </div>
      </div>
    </details>
  );
}
