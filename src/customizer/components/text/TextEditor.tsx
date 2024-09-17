import { addText } from "@/customizer/redux/slices/cart";
import {
  setSelectedEditorGuid,
  useEditorSelectors,
} from "@/customizer/redux/slices/editor";
import { StoreType } from "@/customizer/redux/store";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { v4 as uuidv4 } from "uuid";

export function TextEditor() {
  const dispatch = useDispatch();
  const { selectedProductData } = useEditorSelectors();
  const selectedLocationId = useSelector(
    (store: StoreType) => store.editorState.selectedLocationId
  );

  function onClickAdd() {
    const newGuid = uuidv4();
    dispatch(
      addText({
        newGuid,
        targetLocationId: selectedLocationId,
        targetProductData: selectedProductData,
      })
    );
    dispatch(setSelectedEditorGuid(newGuid));
  }

  return (
    <div>
      <h2>Edit Text</h2>
      <button onClick={onClickAdd}>Add Text</button>
    </div>
  );
}
