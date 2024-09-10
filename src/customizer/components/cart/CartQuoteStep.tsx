import styles from "@/styles/customizer/CustomProductDesigner/cart.module.css";

export function CartQuoteStep() {
  return (
    <>
      <div>
        <h2>Contact Information</h2>
        <div className={styles["contact-form"]}>
          <div>
            <label htmlFor="first-name">First Name</label>
            <input type="text" name="first-name" id="first-name" />
          </div>
          <div>
            <label htmlFor="last-name">Last Name</label>
            <input type="text" name="last-name" id="last-name" />
          </div>
          <div>
            <label htmlFor="email">Email</label>
            <input type="email" name="email" id="email" />
          </div>
          <div>
            <label htmlFor="company">Union/Organization</label>
            <input type="email" name="company" id="company" />
          </div>
          <div>
            <label htmlFor="local">Union Local</label>
            <input type="email" name="local" id="local" />
          </div>
          <div>
            <label htmlFor="comments">Comments/Questions</label>
            <textarea
              name="comments"
              id="comments"
              cols={50}
              rows={6}
            ></textarea>
          </div>
        </div>
      </div>
    </>
  );
}
