import {
  getDesignCategoryHierarchy,
  getDesignTypes,
} from "@/db/access/designs";
import { CategoryEditor } from "./CategoryEditor";

export default async function Page() {
  const categories = await getDesignCategoryHierarchy();
  const designTypes = await getDesignTypes();

  return (
    <>
      <h1>Categories</h1>
      <CategoryEditor categories={categories} designTypes={designTypes} />
    </>
  );
}
