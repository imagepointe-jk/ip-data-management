"use client";

import { getWebstoreWithIncludes } from "@/db/access/orderApproval";
import { UnwrapPromise } from "@/types/schema/misc";
import { deduplicateArray } from "@/utility/misc";
import { SingleUser } from "./SingleUser";

type Props = {
  webstore: Exclude<
    UnwrapPromise<ReturnType<typeof getWebstoreWithIncludes>>,
    null
  >;
};
export function Users({ webstore }: Props) {
  const sortedUsers = [...webstore.roles.flatMap((role) => role.users)];
  sortedUsers.sort((a, b) => a.id - b.id);
  const uniqueUsers = deduplicateArray(sortedUsers, (user) => user.id);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {uniqueUsers.map((user) => (
        <SingleUser key={user.id} user={user} />
      ))}
    </div>
  );
}
