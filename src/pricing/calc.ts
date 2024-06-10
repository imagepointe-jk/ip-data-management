import {
  getGreatestSum,
  getPermutations,
  roundDownToAllowedValue,
} from "../utility/misc";
import {
  additional5kStitchPrice,
  markupTable,
  markupTableHeaderNumbers,
  markupTableRowNames,
  poloJacketSweatEmbLocationFees,
  poloJacketSweatFleeceUpcharge,
  poloJacketSweatPolyUpcharge,
  polosJacketsSweatsPrintUpchargeTable,
  printUpchargeHeaderNumbers,
  printUpchargeRowNames,
  printUpchargeTable,
} from "./data";
import { CalculatePriceParams, DecorationLocation } from "@/types/schema";

export function calculatePrice(params: CalculatePriceParams) {
  const {
    productData: { type },
    decorationType,
  } = params;

  if (type === "tshirt") {
    return calculateTshirtPrice(params);
  } else if (type === "polo" || type === "jacket" || type === "sweats") {
    if (decorationType === "Screen Print")
      return calculatePoloPrintPrice(params);
    else return calculatePoloEmbroideryPrice(params);
  } else {
    return 0;
  }
}

function calculateTshirtPrice(params: CalculatePriceParams) {
  const { decorationType, productData, locations, quantity } = params;

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

function calculatePoloPrintPrice(params: CalculatePriceParams) {
  const { quantity, productData } = params;

  const quantityToUse = roundDownToAllowedValue(
    quantity,
    markupTableHeaderNumbers
  );
  const markup = markupTable.get(
    `${quantityToUse}`,
    markupTableRowNames.polosPrint
  );
  if (!markup)
    throw new Error(`Markup not found for quantity ${quantityToUse}`);

  const locationPrices = calculatePoloPrintLocationPrices(params);
  const allPolyFee = productData.isAllPoly ? poloJacketSweatPolyUpcharge : 0;
  const sweatshirtFee = productData.isSweatshirt
    ? poloJacketSweatFleeceUpcharge
    : 0;

  return productData.net * markup + locationPrices + allPolyFee + sweatshirtFee;
}

function calculatePoloPrintLocationPrices(params: CalculatePriceParams) {
  const { locations } = params;
  const locationNumbers = Array.from(
    { length: locations.length },
    (_, i) => i + 1
  );
  const indexPermutations = getPermutations(locationNumbers);
  const costPermutations = indexPermutations.map((perm) =>
    perm.map((locationNumber) => {
      const tableHeaderName = `${locationNumber}`;
      const colorCount = locations[locationNumber - 1]!.colorCount;
      const tableRowName =
        colorCount === 1
          ? printUpchargeRowNames.oneColor
          : colorCount === 2
          ? printUpchargeRowNames.twoColor
          : colorCount === 3 || colorCount === 4
          ? printUpchargeRowNames.multiColor
          : "not found";
      const locationColorCountCost = polosJacketsSweatsPrintUpchargeTable.get(
        tableHeaderName,
        tableRowName
      );
      if (locationColorCountCost === undefined)
        throw new Error(
          `Location color count cost not found for location ${locationNumber} and color count ${colorCount}`
        );
      return locationColorCountCost;
    })
  );
  return getGreatestSum(costPermutations);
}

function calculatePoloEmbroideryPrice(params: CalculatePriceParams) {
  const { quantity, productData, locations } = params;

  const quantityToUse = roundDownToAllowedValue(
    quantity,
    markupTableHeaderNumbers
  );
  const markup = markupTable.get(
    `${quantityToUse}`,
    markupTableRowNames.polosEmb
  );
  if (!markup)
    throw new Error(`Markup not found for quantity ${quantityToUse}`);

  const locationStitchPrices = calculatePoloEmbroideryLocationPrices(params);
  const secondLocationFee =
    locations.length > 1 ? poloJacketSweatEmbLocationFees.second : 0;
  const thirdLocationFee =
    locations.length > 2 ? poloJacketSweatEmbLocationFees.third : 0;
  const fourthLocationFee =
    locations.length > 3 ? poloJacketSweatEmbLocationFees.fourth : 0;

  return (
    productData.net * markup +
    locationStitchPrices +
    secondLocationFee +
    thirdLocationFee +
    fourthLocationFee
  );
}

function calculatePoloEmbroideryLocationPrices(params: CalculatePriceParams) {
  const locations = [...params.locations];
  if (locations.length === 4) locations.pop(); //4th location is a flat fee, so ignore it

  const total = locations.reduce((accum, location) => {
    const stitchesToCharge = location.stitchCount
      ? location.stitchCount - 5000
      : 0; //5000 per location is included at no extra charge
    const priceThisLocation =
      Math.ceil(stitchesToCharge / 5000) * additional5kStitchPrice;
    return accum + priceThisLocation;
  }, 0);

  return total;
}
