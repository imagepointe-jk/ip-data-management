"use client";

import { deleteWebstore } from "@/actions/orderWorkflow/delete";
import GenericTable from "@/components/GenericTable";
import { useToast } from "@/components/ToastProvider";
import styles from "@/styles/orderApproval/admin/main.module.css";
import { WebstoreDataFull } from "@/types/dto/orderApproval";
import { deduplicateArray } from "@/utility/misc";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Props = {
  webstores: WebstoreDataFull[];
};
export function ResultsTable({ webstores }: Props) {
  const toast = useToast();
  const router = useRouter();

  async function onClickDelete(id: number) {
    if (!confirm("Are you sure you want to delete this webstore?")) return;

    try {
      await deleteWebstore(id);
      toast.toast("Webstore deleted.", "success");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.toast("Error deleting webstore.", "error");
    }
  }

  return (
    <GenericTable
      dataset={webstores}
      columns={[
        {
          headerName: "ID",
          createCell: (webstore) => webstore.id,
        },
        {
          headerName: "Name",
          createCell: (webstore) => (
            <Link href={`webstores/${webstore.id}`}>{webstore.name}</Link>
          ),
        },
        {
          headerName: "URL",
          createCell: (webstore) => <a href={webstore.url}>{webstore.url}</a>,
        },
        {
          headerName: "Organization Name",
          createCell: (webstore) => webstore.organizationName,
        },
        {
          headerName: "Active Workflows",
          createCell: (webstore) =>
            webstore.workflows.reduce(
              (accum, item) =>
                accum +
                item.instances.filter(
                  (instance) => instance.status !== "finished"
                ).length,
              0
            ),
        },
        {
          headerName: "Total Workflows",
          createCell: (webstore) =>
            webstore.workflows.reduce(
              (accum, item) => accum + item.instances.length,
              0
            ),
        },
        {
          headerName: "Associated Users",
          createCell: (webstore) => {
            const deduplicatedUsers = deduplicateArray(
              webstore.roles.flatMap((role) => role.users),
              (user) => `${user.id}`
            );
            return (
              <>
                {deduplicatedUsers.length}{" "}
                <Link href={`webstores/${webstore.id}/users`}>(View)</Link>
              </>
            );
          },
        },
        {
          headerName: "",
          createCell: (webstore) => (
            <button
              className="button-danger"
              onClick={() => onClickDelete(webstore.id)}
            >
              DELETE
            </button>
          ),
        },
      ]}
      className={styles["basic-table"]}
    />
  );
}
