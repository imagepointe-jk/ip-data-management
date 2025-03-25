import {
  getDesignCategoryHierarchy,
  getSingleDesign,
} from "@/db/access/designs";
import { prisma } from "../../../../../prisma/client";
import { notFound } from "next/navigation";
import { DesignEditForm } from "./DesignEditForm/DesignEditForm";

type Props = {
  params: {
    id: string;
  };
};
export default async function Design({ params }: Props) {
  const id = +params.id;

  if (!id) notFound();

  const existingDesign = await getSingleDesign(id);

  if (!existingDesign) notFound();

  const designTypes = await prisma.designType.findMany();
  const colors = await prisma.color.findMany();
  const categories = await getDesignCategoryHierarchy();
  const tags = await prisma.designTag.findMany();

  return (
    <>
      <DesignEditForm
        existingDesign={existingDesign}
        designTypes={designTypes}
        colors={colors}
        categories={categories}
        tags={tags}
      />
    </>
  );
}
