import {
  getProductSettingsWithIncludes,
  getQuoteRequest,
} from "@/db/access/customizer";
import {
  isCartStateValid,
  validateCartState,
} from "@/types/validations/customizer";
import { CustomProductsDisplay } from "./CustomProductsDisplay";
import { populateProductData } from "@/app/customizer/handleData";
import { inspect } from "util";
import { VERSIONS } from "@/constants";
import { InvalidCart } from "./InvalidCart";

type Props = {
  params: Promise<{
    id: string;
  }>;
};
export default async function Page(props: Props) {
  const params = await props.params;
  const id = +params.id;
  if (isNaN(id)) return <h1>Invalid ID.</h1>;

  const lead = await getQuoteRequest(id);
  if (!lead) return <h1>Lead {id} not found.</h1>;

  const parsedJson = JSON.parse(lead.cartJson);
  if (!isCartStateValid(parsedJson).success)
    return <InvalidCart parsedJson={parsedJson} />;

  const parsedCart = validateCartState(parsedJson);

  const settings = await getProductSettingsWithIncludes();
  const populatedSettings = await populateProductData(settings);

  return (
    <>
      <h1>
        Lead from {lead.firstName} {lead.lastName}
      </h1>
      <div className="vert-flex-group">
        <div>
          <div className="data-label">First Name</div>
          <div>{lead.firstName}</div>
        </div>
        <div>
          <div className="data-label">Last Name</div>
          <div>{lead.lastName}</div>
        </div>
        <div>
          <div className="data-label">Email</div>
          <div>{lead.email}</div>
        </div>
        <div>
          <div className="data-label">Company</div>
          <div>{lead.company}</div>
        </div>
        <div>
          <div className="data-label">Local</div>
          <div>{lead.local || "N/A"}</div>
        </div>
        <div>
          <div className="data-label">Phone</div>
          <div>{lead.phone || "N/A"}</div>
        </div>
        <div>
          <div className="data-label">Submitted On</div>
          <div>{lead.createdAt.toLocaleString()}</div>
        </div>
        <div>
          <div className="data-label">Comments</div>
          <div style={{ maxWidth: "500px" }}>{lead.comments || "N/A"}</div>
        </div>
      </div>
      <CustomProductsDisplay
        cart={parsedCart}
        productSettings={populatedSettings}
      />
    </>
  );
}
