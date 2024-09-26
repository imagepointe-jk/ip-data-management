import { IMAGE_NOT_FOUND_URL } from "@/constants";
import styles from "@/styles/customizer/CustomProductDesigner/help.module.css";

export function Help() {
  return (
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
  );
}
