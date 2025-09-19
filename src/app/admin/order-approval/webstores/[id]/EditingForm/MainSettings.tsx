import { WebstoreEditorData } from "@/types/dto/orderApproval";
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
  return (
    <div className="vert-flex-group">
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
          Reminder email addresses (separate with {";"})
        </label>
        <input
          type="text"
          name="reminder-emails"
          id="reminder-emails"
          value={webstoreState.reminderEmailTargets || ""}
          style={{ width: "600px" }}
          onChange={(e) =>
            setWebstoreState((draft) => {
              draft.reminderEmailTargets = e.target.value;
            })
          }
        />
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={webstoreState.sendReminderEmails}
            onChange={(e) =>
              setWebstoreState((draft) => {
                draft.sendReminderEmails = e.target.checked;
              })
            }
          />
          Send reminder emails
        </label>
      </div>
      <div>
        <label className="input-label">{"Change API Key "}</label>
        <input
          type="text"
          name="api-key"
          id="api-key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
      </div>
      <div>
        <label className="input-label">{"Change API Secret "}</label>
        <input
          type="text"
          name="api-secret"
          id="api-secret"
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
      <div>
        <label className="input-label">
          Shipping Team Email Override (intended for testing only)
        </label>
        <input
          type="text"
          value={webstoreState.shippingEmailDestOverride || ""}
          onChange={(e) =>
            setWebstoreState((draft) => {
              draft.shippingEmailDestOverride = e.target.value;
            })
          }
        />
      </div>
      <div>
        <label className="input-label">Approver Dashboard Viewing Email</label>
        <input
          type="text"
          value={webstoreState.approverDashboardViewerEmail}
          onChange={(e) =>
            setWebstoreState((draft) => {
              draft.approverDashboardViewerEmail = e.target.value;
            })
          }
        />
      </div>
      <div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={webstoreState.requirePinForApproval}
              onChange={(e) =>
                setWebstoreState((draft) => {
                  draft.requirePinForApproval = e.target.checked;
                })
              }
            />
            Require PIN for order approval
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={webstoreState.allowOrderHelpRequest}
              onChange={(e) =>
                setWebstoreState((draft) => {
                  draft.allowOrderHelpRequest = e.target.checked;
                })
              }
            />
            Show &quot;I need help with my order&quot; button
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={webstoreState.autoCreateApprover}
              onChange={(e) =>
                setWebstoreState((draft) => {
                  draft.autoCreateApprover = e.target.checked;
                })
              }
            />
            Auto-create new approvers from &quot;approver&quot; field
          </label>
        </div>
      </div>
    </div>
  );
}
