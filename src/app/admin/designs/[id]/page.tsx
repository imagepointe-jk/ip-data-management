import {
  getDesignCategoryHierarchy,
  getSingleDesign,
} from "@/db/access/designs";
import DesignDataForm from "./DesignDataForm";
import { prisma } from "../../../../../prisma/client";
import DesignDelete from "./DesignDelete";
import { notFound } from "next/navigation";
import { DesignEditForm } from "./DesignEditForm/DesignEditForm";

type Props = {
  params: {
    id: string;
  };
};
export default async function Design({ params }: Props) {
  const id = +params.id;
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

  // if (!existingDesign && id !== 0) return <h1>Design not found.</h1>;

  // const designTypes = await prisma.designType.findMany();
  // const colors = await prisma.color.findMany();
  // const categories = await getDesignCategoryHierarchy();
  // const tags = await prisma.designTag.findMany();

  // return (
  //   <>
  //     <DesignDataForm
  //       existingDesign={existingDesign}
  //       designTypes={designTypes}
  //       colors={colors}
  //       categories={categories}
  //       tags={tags}
  //     />
  //     {existingDesign && <DesignDelete design={existingDesign} />}
  //   </>
  // );
}
