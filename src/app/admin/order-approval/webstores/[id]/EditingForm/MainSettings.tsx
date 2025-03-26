import { WebstoreEditorData } from "@/types/schema/orderApproval";
import { Updater } from "use-immer";

type Props = {
  webstoreState: WebstoreEditorData;
  setWebstoreState: Updater<WebstoreEditorData>;
  apiKey: string;
  setApiKey: (val: string) => void;
  apiSecret: string;
  setApiSecret: (val: string) => void;
  shippingEmailFilenames: string[];
};
export function MainSettings({
  webstoreState,
  setWebstoreState,
  apiKey,
  setApiKey,
  apiSecret,
  setApiSecret,
  shippingEmailFilenames,
}: Props) {
  const creatingNew = webstoreState.id === 0;

  return (
    <>
      <div>
        <h2 style={{ marginBottom: 0 }}>Name</h2>
        <input
          type="text"
          name="name"
          id="name"
          required
          className="input-major"
          value={webstoreState.name}
          onChange={(e) =>
            setWebstoreState((draft) => {
              draft.name = e.target.value;
            })
          }
        />
      </div>
      <div>
        <label className="input-label">Organization Name</label>
        <input
          type="text"
          name="org-name"
          id="org-name"
          value={webstoreState.organizationName}
          required
          onChange={(e) =>
            setWebstoreState((draft) => {
              draft.organizationName = e.target.value;
            })
          }
        />
      </div>
      <div>
        <label className="input-label">URL</label>
        <input
          type="text"
          name="url"
          id="url"
          value={webstoreState.url}
          required
          onChange={(e) =>
            setWebstoreState((draft) => {
              draft.url = e.target.value;
            })
          }
        />
      </div>
      <div>
        <label className="input-label">Sales Person Name</label>
        <input
          type="text"
          name="sales-person-name"
          id="sales-person-name"
          value={webstoreState.salesPersonName}
          required
          onChange={(e) =>
            setWebstoreState((draft) => {
              draft.salesPersonName = e.target.value;
            })
          }
        />
      </div>
      <div>
        <label className="input-label">Sales Person Email</label>
        <input
          type="email"
          name="sales-person-email"
          id="sales-person-email"
          value={webstoreState.salesPersonEmail}
          required
          onChange={(e) =>
            setWebstoreState((draft) => {
              draft.salesPersonEmail = e.target.value;
            })
          }
        />
      </div>
      <div>
        <label className="input-label">
          Other support emails (separate with {";"})
        </label>
        <input
          type="text"
          name="other-support-emails"
          id="other-support-emails"
          value={webstoreState.otherSupportEmails || ""}
          style={{ width: "600px" }}
          onChange={(e) =>
            setWebstoreState((draft) => {
              draft.otherSupportEmails = e.target.value;
            })
          }
        />
      </div>
      <div>
        <label className="input-label">
          Order updated emails (separate with {";"})
        </label>
        <input
          type="text"
          name="order-updated-emails"
          id="order-updated-emails"
          value={webstoreState.orderUpdatedEmails || ""}
          style={{ width: "600px" }}
          onChange={(e) =>
            setWebstoreState((draft) => {
              draft.orderUpdatedEmails = e.target.value;
            })
          }
        />
      </div>
      <div>
        <label className="input-label">
          {!creatingNew ? "Change API Key " : "Set API Key "}
        </label>
        <input
          type="text"
          name="api-key"
          id="api-key"
          required={creatingNew}
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
      </div>
      <div>
        <label className="input-label">
          {!creatingNew ? "Change API Secret " : "Set API Secret "}
        </label>
        <input
          type="text"
          name="api-secret"
          id="api-secret"
          required={creatingNew}
          value={apiSecret}
          onChange={(e) => setApiSecret(e.target.value)}
        />
      </div>
      <div>
        <label className="input-label">Shipping Email Filename</label>
        <select
          value={webstoreState.shippingEmailFilename}
          onChange={(e) =>
            setWebstoreState((draft) => {
              draft.shippingEmailFilename = e.target.value;
            })
          }
        >
          {["NO_SHIPPING_EMAIL"].concat(shippingEmailFilenames).map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
