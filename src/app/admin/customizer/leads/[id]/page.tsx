import {
  getProductSettingsWithIncludes,
  getQuoteRequest,
} from "@/db/access/customizer";
import { validateCartState } from "@/types/validations/customizer";
import { DesignView } from "./DesignView";
import { getDesigns } from "@/db/access/designs";
import { populateProductData } from "@/app/customizer/handleData";

type Props = {
  params: {
    id: string;
  };
};
export default async function Page({ params }: Props) {
  const id = +params.id;
  if (isNaN(id)) return <h1>Invalid ID.</h1>;

  const lead = await getQuoteRequest(id);
  if (!lead) return <h1>Lead {id} not found.</h1>;

  const parsedJson = JSON.parse(lead.cartJson);
  const parsedCart = validateCartState(parsedJson);

  const settings = await getProductSettingsWithIncludes();

  return (
    <>
      <h1>
        Lead from {lead.firstName} {lead.lastName}
      </h1>
      <p>Submitted: {lead.createdAt.toLocaleString()}</p>
      <DesignView cart={parsedCart} productSettings={settings} />
    </>
  );
}
