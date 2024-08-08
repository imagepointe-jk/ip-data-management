import { updateProductSettings } from "@/actions/customizer/update";
import { FullProductSettings } from "@/db/access/customizer";
import { Dispatch, SetStateAction } from "react";
import styles from "@/styles/customizer/CustomProductAdminEditor.module.css";
import { ButtonWithLoading } from "@/components/ButtonWithLoading";

type SaveAreaProps = {
  errors: string[];
  saving: boolean;
  setSaving: Dispatch<SetStateAction<boolean>>;
  settingsState: FullProductSettings;
};
export function SaveArea({
  errors,
  saving,
  setSaving,
  settingsState,
}: SaveAreaProps) {
  async function onClickSave() {
    if (saving) return;

    try {
      setSaving(true);
      await updateProductSettings(settingsState);
      setSaving(false);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className={styles["save-container"]}>
      {errors.length > 0 && (
        <div className={styles["error"]}>
          <ul>
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      <ButtonWithLoading
        normalText="Save Changes"
        className={styles["save"]}
        loading={saving}
        onClick={() => onClickSave()}
      />
    </div>
  );
}
