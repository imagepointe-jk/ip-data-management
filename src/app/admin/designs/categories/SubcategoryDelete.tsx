import { deleteSubcategory } from "@/actions/designs/delete";
import { useToast } from "@/components/ToastProvider";
import { CategoryDTO } from "@/types/dto/designs";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  categories: CategoryDTO[];
};
export function SubcategoryDelete({ categories }: Props) {
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<
    number | null
  >(null);
  const router = useRouter();
  const toast = useToast();

  async function onClickDelete() {
    const categoryWithSubcategory = categories.find(
      (cat) =>
        !!cat.designSubcategories.find(
          (sub) => sub.id === selectedSubcategoryId
        )
    );
    const subcategory = categoryWithSubcategory?.designSubcategories.find(
      (sub) => sub.id === selectedSubcategoryId
    );

    if (!subcategory) return;
    if (
      !confirm(
        `Are you sure you want to delete subcategory ${subcategory.name}?`
      )
    )
      return;

    try {
      await deleteSubcategory(subcategory.id);
      setSelectedSubcategoryId(null);
      toast.toast("Subcategory deleted.", "success");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.toast("Error deleting subcategory.", "error");
    }
  }

  return (
    <div className="content-frame" style={{ width: "500px" }}>
      <div>
        <label className="input-label">Delete Subcategory</label>
        <select
          value={`${selectedSubcategoryId}`}
          onChange={(e) => setSelectedSubcategoryId(+e.target.value)}
        >
          {[
            <option key={0} value={"null"}></option>,
            ...categories.flatMap((cat) =>
              cat.designSubcategories.map((sub) => (
                <option key={sub.id} value={`${sub.id}`}>
                  {sub.name}
                </option>
              ))
            ),
          ]}
        </select>
      </div>
      <button className="button-danger" onClick={onClickDelete}>
        Delete
      </button>
    </div>
  );
}
