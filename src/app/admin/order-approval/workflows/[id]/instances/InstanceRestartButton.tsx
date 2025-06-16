import { restartWorkflow } from "@/actions/orderWorkflow/misc";
import { ButtonWithLoading } from "@/components/ButtonWithLoading";
import { useToast } from "@/components/ToastProvider";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  id: number;
};
export function InstanceRestartButton({ id }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  async function onClickRestart() {
    setLoading(true);
    try {
      await restartWorkflow(id);
      toast.toast("Workflow restarted.", "success");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.toast("Failed to restart workflow.", "error");
    }
    setLoading(false);
  }

  return (
    <ButtonWithLoading
      loading={loading}
      onClick={() => onClickRestart()}
      style={{ width: "80px" }}
    >
      Restart
    </ButtonWithLoading>
  );
}
