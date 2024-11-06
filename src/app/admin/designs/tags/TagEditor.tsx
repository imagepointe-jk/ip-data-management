"use client";

import { createTag } from "@/actions/designs/create";
import { ButtonWithLoading } from "@/components/ButtonWithLoading";
import GenericTable from "@/components/GenericTable";
import { DesignTag } from "@prisma/client";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type Props = {
  tags: (DesignTag & {
    designIds: number[];
    designVariationIds: number[];
  })[];
};
export function TagEditor({ tags }: Props) {
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  async function onSubmitCreateForm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const name = formData.get("name");
    if (!name) return;

    setCreating(true);
    await createTag(`${name}`);
    setCreating(false);
    router.refresh();
  }

  return (
    <>
      <GenericTable
        dataset={tags}
        columns={[
          {
            headerName: "ID",
            createCell: (data) => data.id,
          },
          {
            headerName: "Name",
            createCell: (data) => data.name,
          },
          {
            headerName: "Designs",
            createCell: (data) => data.designIds.length,
          },
          {
            headerName: "Design Variations",
            createCell: (data) => data.designVariationIds.length,
          },
        ]}
      />
      <form onSubmit={onSubmitCreateForm}>
        <label className="input-label">Create Tag</label>
        <input type="text" name="name" id="name" />
        <ButtonWithLoading loading={creating} normalText="+ Create" />
      </form>
    </>
  );
}
