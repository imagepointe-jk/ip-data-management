import { Modal } from "@/components/Modal";
import { IMAGE_NOT_FOUND_URL } from "@/constants";
import stylesModal from "@/styles/customizer/CustomProductDesigner/modal.module.css";
import styles from "@/styles/customizer/CustomProductDesigner/help.module.css";
import { useDispatch } from "react-redux";
import { setModalOpen } from "../redux/slices/editor";

export function HelpModal() {
  const dispatch = useDispatch();

  return (
    <Modal
      windowClassName={stylesModal["modal"]}
      xButtonClassName={stylesModal["x"]}
      bgStyle={{ position: "sticky", height: "100%" }}
      onClickClose={() => dispatch(setModalOpen(null))}
      windowStyle={{ textAlign: "center" }}
    >
      <div className={styles["main"]}>
        <h2>Help</h2>
        <img src={IMAGE_NOT_FOUND_URL} />
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Culpa odio
          delectus sapiente, sit voluptatum sint maxime ipsam velit perspiciatis
          aut nobis amet ab doloremque sequi quam. Aut veritatis fuga quae!
        </p>
        <img src={IMAGE_NOT_FOUND_URL} />
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Culpa odio
          delectus sapiente, sit voluptatum sint maxime ipsam velit perspiciatis
          aut nobis amet ab doloremque sequi quam. Aut veritatis fuga quae!
        </p>
        <img src={IMAGE_NOT_FOUND_URL} />
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Culpa odio
          delectus sapiente, sit voluptatum sint maxime ipsam velit perspiciatis
          aut nobis amet ab doloremque sequi quam. Aut veritatis fuga quae!
        </p>
      </div>
    </Modal>
  );
}
