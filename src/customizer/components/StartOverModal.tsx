import { Modal } from "@/components/Modal";
import styles from "@/styles/customizer/CustomProductDesigner/modal.module.css";
import { useDispatch } from "react-redux";
import { setModalOpen } from "../redux/slices/editor";
import { useIframe } from "@/components/IframeHelper/IframeHelperProvider";

export function StartOverModal() {
  const dispatch = useDispatch();
  const iframe = useIframe();

  return (
    <Modal
      windowClassName={styles["modal"]}
      xButtonClassName={styles["x"]}
      bgStyle={{ position: "sticky", height: "100%" }}
      onClickClose={() => dispatch(setModalOpen(null))}
      windowStyle={{ textAlign: "center", maxWidth: "320px" }}
    >
      If you start over, you will lose any changes you have made to this design.
      <div>
        <button
          className="button-danger"
          style={{ marginTop: "20px" }}
          onClick={() => iframe.parentWindow.requestRefresh()}
        >
          START OVER NOW
        </button>
      </div>
    </Modal>
  );
}
