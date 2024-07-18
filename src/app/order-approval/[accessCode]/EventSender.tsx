"use client";

import { useParams } from "next/navigation";
import { receiveWorkflowEvent } from "@/actions/orderWorkflow";
import { useEffect, useState } from "react";
import { OrderWorkflowEventType } from "@/types/types";

type Props = {
  type: OrderWorkflowEventType;
};
export default function EventSender({ type }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const params = useParams();

  async function sendEvent() {
    try {
      await receiveWorkflowEvent(`${params.accessCode}`, type);
    } catch (error) {
      console.error(error);
      setError(true);
    }
    setLoading(false);
  }

  useEffect(() => {
    sendEvent();
  }, []);

  return (
    <>
      {loading && <h1>Loading...</h1>}
      {!loading && error && <h1>There was an error. Please contact us.</h1>}
      {!loading && !error && <h1>Success</h1>}
    </>
  );
}
