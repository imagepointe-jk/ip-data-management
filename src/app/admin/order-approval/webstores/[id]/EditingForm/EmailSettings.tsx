import { WebstoreEditorData } from "@/types/schema/orderApproval";
import { ReactNode } from "react";
import { Updater } from "use-immer";

type Props = {
  webstoreState: WebstoreEditorData;
  setWebstoreState: Updater<WebstoreEditorData>;
  shortcodeReference: ReactNode;
};
export function EmailSettings({
  webstoreState,
  setWebstoreState,
  shortcodeReference,
}: Props) {
  return (
    <>
      <div>
        <label
          htmlFor="use-custom-order-approved-email"
          className="input-label"
        >
          <input
            type="checkbox"
            name="use-custom-order-approved-email"
            id="use-custom-order-approved-email"
            checked={webstoreState.useCustomOrderApprovedEmail}
            onChange={(e) =>
              setWebstoreState((draft) => {
                draft.useCustomOrderApprovedEmail = e.target.checked;
              })
            }
          />
          Use custom &quot;order approved&quot; email
        </label>
      </div>
      {webstoreState.useCustomOrderApprovedEmail && (
        <>
          <div>
            <label
              htmlFor="custom-order-approved-email"
              className="input-label"
            >
              Custom &quot;order approved&quot; email
            </label>
            <textarea
              name="custom-order-approved-email"
              id="custom-order-approved-email"
              cols={60}
              rows={10}
              value={webstoreState.customOrderApprovedEmail || ""}
              onChange={(e) =>
                setWebstoreState((draft) => {
                  draft.customOrderApprovedEmail = e.target.value;
                })
              }
            ></textarea>
          </div>
          {shortcodeReference}
        </>
      )}
    </>
  );
}
