import { ButtonWithLoading } from "@/components/ButtonWithLoading";
import { OrderWorkflowUser } from "@prisma/client";
import { useState } from "react";

type Props = {
  user: OrderWorkflowUser;
};
export function SingleUser({ user }: Props) {
  const [loading, setLoading] = useState(false);

  return (
    <div>
      <input type="text" value={user.name} onChange={() => {}} />
      <ButtonWithLoading loading={loading} normalText="Save" />
    </div>
  );
}
