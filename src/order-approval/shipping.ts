import { RatedShippingMethod } from "@/app/order-approval/OrderEditForm/OrderEditForm";
import {
  getUpsRate,
  getUspsDomesticPrice,
  getUspsInternationalPrice,
} from "@/fetch/client/shipping";
import {
  WooCommerceOrder,
  WooCommerceProduct,
} from "@/types/schema/woocommerce";
import {
  validateUpsRateResponse,
  validateUspsPriceResponse,
} from "@/types/validations/shipping";

//we have to do string matching because we're relying on the string we get back from woocommerce to determine what shipping was chosen for the order.
const upsShippingCodes: { exactString: string; code: string }[] = [
  //domestic
  {
    exactString: "UPS 3 Day Select&#174;",
    code: "12",
  },
  {
    exactString: "UPS&#174; Ground",
    code: "03",
  },
  {
    exactString: "UPS 2nd Day Air&#174;",
    code: "02",
  },
  {
    exactString: "UPS Next Day Air&#174;",
    code: "01",
  },
  //intl
  {
    exactString: "UPS Worldwide Express&#8482;",
    code: "07",
  },
  {
    exactString: "UPS Worldwide Express Plus&#8482;",
    code: "54",
  },
  {
    exactString: "UPS Worldwide Expedited",
    code: "08",
  },
  {
    exactString: "UPS Worldwide Saver",
    code: "65",
  },
  {
    exactString: "UPS&#174; Standard",
    code: "11",
  },
];
const uspsShippingCodes: { exactString: string; code: string }[] = [
  {
    exactString: "Priority Mail&#174; (USPS)",
    code: "PRIORITY_MAIL",
  },
  {
    exactString: "Ground Advantage&#8482; (USPS)",
    code: "USPS_GROUND_ADVANTAGE",
  },
  {
    exactString: "Priority Mail International&#174; (USPS)",
    code: "PRIORITY_MAIL_INTERNATIONAL",
  },
  {
    exactString: "Priority Mail Express International&#8482; (USPS)",
    code: "PRIORITY_MAIL_EXPRESS_INTERNATIONAL",
  },
];

export function compareShippingMethodTitles(title1: string, title2: string) {
  const cleaned1 = title1.replace("™", "&#8482;").replace("®", "&#174;");
  const cleaned2 = title2.replace("™", "&#8482;").replace("®", "&#174;");
  return cleaned1 === cleaned2;
}
