import { updateProductSettings } from "@/actions/customizer/update";
import { Dispatch, SetStateAction } from "react";
import styles from "@/styles/customizer/CustomProductAdminEditor.module.css";
import { ButtonWithLoading } from "@/components/ButtonWithLoading";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";
import { FullProductSettingsDTO } from "@/types/dto/customizer";

type SaveAreaProps = {
  errors: string[];
  saving: boolean;
  setSaving: Dispatch<SetStateAction<boolean>>;
  settingsState: FullProductSettingsDTO;
};
export function SaveArea({
  errors,
  saving,
  setSaving,
  settingsState,
}: SaveAreaProps) {
  const router = useRouter();
  const toast = useToast();

  async function onClickSave() {
    if (saving) return;

    setSaving(true);
    try {
      await updateProductSettings(settingsState);
      router.refresh();
      toast.changesSaved();
    } catch (error) {
      console.error(error);
      toast.toast("Error saving changes.", "error");
    }
    setSaving(false);
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
