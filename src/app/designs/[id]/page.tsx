import {
  getDesignCategoryHierarchy,
  getSingleDesign,
} from "@/db/access/designs";
import DesignDataForm from "./DesignDataForm";
import { prisma } from "../../../../prisma/client";
import DesignDelete from "./DesignDelete";

type Props = {
  params: {
    id: string;
  };
};
export default async function Design({ params }: Props) {
  const id = +params.id;
  const existingDesign = await getSingleDesign(id);

  if (!existingDesign && id !== 0) return <h1>Design not found.</h1>;

  const designTypes = await prisma.designType.findMany();
  const colors = await prisma.color.findMany();
  const categories = await getDesignCategoryHierarchy();
  const tags = await prisma.designTag.findMany();

  return (
    <>
      <DesignDataForm
        existingDesign={existingDesign}
        designTypes={designTypes}
        colors={colors}
        categories={categories}
        tags={tags}
      />
      {existingDesign && <DesignDelete design={existingDesign} />}
      {/* <div>
        <img
          src={existingDesign.image?.url}
          alt="design image"
          style={{
            width: "300px",
            height: "300px",
            backgroundColor: `#${existingDesign.defaultBackgroundColor.hexCode}`,
          }}
        />
      </div>
      <h4>Description</h4>
      <p>
        {existingDesign.description
          ? existingDesign.description
          : "(No description)"}
      </p>
      <h4>Featured?</h4>
      <p>{existingDesign.featured ? "Yes" : "No"}</p>
      <h4>Date</h4>
      <p>{existingDesign.date.toLocaleDateString()}</p>
      <h4>Status</h4>
      <p>{existingDesign.status}</p>
      <h4>Categories</h4>
      <ul>
        {existingDesign.designSubcategories.map((cat) => (
          <li key={cat.id}>{cat.name}</li>
        ))}
      </ul>
      <h4>Design Type</h4>
      <p>{existingDesign.designType.name}</p>
      <h4>Tags</h4>
      <ul>
        {existingDesign.designTags.map((tag) => (
          <li key={tag.id}>{tag.name}</li>
        ))}
      </ul>
      <h4>Default Background Color</h4>
      <p>{existingDesign.defaultBackgroundColor.name}</p> */}
    </>
  );
}
