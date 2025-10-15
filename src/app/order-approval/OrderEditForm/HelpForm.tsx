import { receiveOrderHelpForm } from "@/actions/orderWorkflow/misc";
import { ButtonWithLoading } from "@/components/ButtonWithLoading";
import { CONTACT_US_URL } from "@/constants";
import styles from "@/styles/orderApproval/approverArea/orderEditForm/helpForm.module.css";
import stylesMain from "@/styles/orderApproval/approverArea/orderEditForm/main.module.css";
import {
  faCheckCircle,
  faChevronLeft,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

type Props = {
  setHelpMode: (b: boolean) => void;
};
export function HelpForm({ setHelpMode }: Props) {
  const [comments, setComments] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "error" | "success"
  >("idle");

  async function onClickSubmit() {
    if (status === "loading") return;

    setStatus("loading");
    try {
      const searchParams = new URLSearchParams(window.location.search);
      await receiveOrderHelpForm({
        comments,
        code: searchParams.get("code") || "",
      });
      setStatus("success");
    } catch (error) {
      setStatus("error");
      console.error(error);
    }
  }

  return (
    <div className={styles["main"]}>
      <h3>Request Order Help</h3>
      <div className={styles["form"]}>
        <div>Question/comments</div>
        <textarea
          rows={10}
          cols={30}
          className={stylesMain["field"]}
          value={comments}
          onChange={(e) => setComments(e.target.value)}
        ></textarea>
        {status !== "success" && (
          <ButtonWithLoading
            className={stylesMain["button-primary"]}
            style={{ width: "150px" }}
            loading={status === "loading"}
            onClick={onClickSubmit}
          >
            Submit
          </ButtonWithLoading>
        )}
        {status === "error" && (
          <div style={{ color: "red" }}>
            There was an error submitting your help request. Please{" "}
            <a href={CONTACT_US_URL}>contact us</a>.
          </div>
        )}
        {status === "success" && (
          <div>
            <FontAwesomeIcon
              icon={faCheckCircle}
              className={styles["success"]}
            />
            Your help request has been submitted.
          </div>
        )}
      </div>
      <button className={styles["back"]} onClick={() => setHelpMode(false)}>
        <FontAwesomeIcon icon={faChevronLeft} />
        {" Back"}
      </button>
    </div>
  );
}
