import { getDesignTags } from "@/db/access/designs";
import { TagEditor } from "./TagEditor";

export default async function Page() {
  const tags = await getDesignTags();
  const dataForEditor = tags.map((tag) => ({
    ...tag,
    designIds: tag.designs.map((design) => design.id),
    designVariationIds: tag.designVariations.map((variation) => variation.id),
  }));

  return (
    <>
      <h1>Tags</h1>
      <TagEditor tags={dataForEditor} />
    </>
  );
}
