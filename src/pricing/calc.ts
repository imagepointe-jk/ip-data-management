import { roundDownToAllowedValue } from "../utility/misc";
import {
  markupTable,
  markupTableHeaderNumbers,
  markupTableRowNames,
  printUpchargeHeaderNumbers,
  printUpchargeRowNames,
  printUpchargeTable,
} from "./data";
import { CalculatePriceParams, DecorationLocation } from "@/types/schema";

export function calculatePrice(params: CalculatePriceParams) {
  const { decorationType, productData, locations, quantity } = params;

  if (productData.type !== "tshirt") return 0;

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
  const quantityToUse = roundDownToAllowedValue(
    garmentQuantity,
    printUpchargeHeaderNumbers
  );

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
      `${quantityToUse}`,
      colorCountName
    );
    if (!locationPrice)
      throw new Error(
        `No t-shirt print upcharge found for quantity ${quantityToUse} and colorCountName ${colorCountName}`
      );

    sum += locationPrice;
  }

  const oneColorCost = printUpchargeTable.get(
    `${quantityToUse}`,
    printUpchargeRowNames.oneColor
  );
  if (!oneColorCost)
    throw new Error(
      `No one-color cost found for quantity ${quantityToUse} in the t-shirt print upcharge table`
    );
  sum -= oneColorCost;

  return sum;
}
