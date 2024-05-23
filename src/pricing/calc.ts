import { DecorationLocation, DecorationType, ProductType } from "@/types/types";
import { roundDownToAllowedValue } from "../utility/misc";
import {
  markupTable,
  markupTableHeaderNumbers,
  markupTableRowNames,
  printUpchargeRowNames,
  printUpchargeTable,
} from "./data";

type CalculatePriceParams = {
  productData: { type: ProductType; net: number };
  decorationType: DecorationType;
  quantity: number;
  locations: DecorationLocation[];
};

export function calculatePrice(params: CalculatePriceParams) {
  const { decorationType, productData, locations, quantity } = params;

  if (productData.type !== "T-Shirts") return 0;

  try {
    const quantityToUse = roundDownToAllowedValue(
      quantity,
      markupTableHeaderNumbers
    );
    const markup = markupTable.get(
      `${quantityToUse}`,
      markupTableRowNames.tshirts
    );
    if (!markup)
      throw new Error(`Markup not found for quantity ${quantityToUse}`);

    const locationPrices = calculateTshirtLocationPrices(
      quantityToUse,
      locations
    );
    return productData.net * markup + locationPrices;
  } catch (error) {
    console.error(error);
  }
}

function calculateTshirtLocationPrices(
  garmentQuantity: number,
  locations: DecorationLocation[]
) {
  let sum = 0;

  for (const location of locations) {
    if (location.colorCount === undefined)
      throw new Error(
        "Undefined location color count when calculating t-shirt location prices"
      );
    const colorCountName =
      location.colorCount === 1
        ? printUpchargeRowNames.oneColor
        : location.colorCount === 2
        ? printUpchargeRowNames.twoColor
        : location.colorCount >= 3
        ? printUpchargeRowNames.multiColor
        : "unknown";

    const locationPrice = printUpchargeTable.get(
      `${garmentQuantity}`,
      colorCountName
    );
    if (!locationPrice)
      throw new Error(
        `No t-shirt print upcharge found for quantity ${garmentQuantity} and colorCountName ${colorCountName}`
      );

    sum += locationPrice;
  }

  const oneColorCost = printUpchargeTable.get(
    `${garmentQuantity}`,
    printUpchargeRowNames.oneColor
  );
  if (!oneColorCost)
    throw new Error(
      `No one-color cost found for quantity ${garmentQuantity} in the t-shirt print upcharge table`
    );
  sum -= oneColorCost;

  return sum;
}
