import {
  CalculatePriceParams,
  DecorationLocation,
  ProductCalcType,
} from "@/types/schema/pricing";
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

type QuantityPriceEstimate = {
  quantity: number;
  result: number;
};
export function calculatePrice(params: CalculatePriceParams) {
  const {
    productData: { type },
    decorationType,
  } = params;

  if (type === "tshirt") {
    return calculateTshirtOrPoloPrice(params, "tshirt");
  } else if (type === "polo" || type === "jacket" || type === "sweats") {
    if (decorationType === "Screen Print")
      return calculateTshirtOrPoloPrice(params, "polo");
    else return calculateEmbroideryPrice(params, "polo");
  } else if (type === "beanie" || type === "hat") {
    return calculateEmbroideryPrice(params, type);
  } else {
    return 0;
  }
}

function calculateTshirtOrPoloPrice(
  params: CalculatePriceParams,
  type: "tshirt" | "polo"
): QuantityPriceEstimate[] {
  const { decorationType, productData, locations, quantities } = params;

  return quantities.map((quantity) => {
    const quantityToUse = roundDownToAllowedValue(
      quantity,
      markupTableHeaderNumbers
    );
    const markup = markupTable.get(
      `${quantityToUse}`,
      type === "tshirt"
        ? markupTableRowNames.tshirts
        : markupTableRowNames.polosPrint
    );
    if (!markup)
      throw new Error(`Markup not found for quantity ${quantityToUse}`);

    const locationPrices = calculateTshirtLocationPrices(
      quantityToUse,
      locations
    );
    return { quantity, result: productData.net * markup + locationPrices };
  });
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

function calculatePoloPrintLocationPrices(params: CalculatePriceParams) {
  const { locations } = params;
  const locationNumbers = Array.from(
    { length: locations.length },
    (_, i) => i + 1
  );
  const colorCountPermutations = getPermutations(locationNumbers);
  const costPermutations = colorCountPermutations.map((perm) =>
    perm.map((locationNumber, i) => {
      const tableHeaderName = `${i + 1}`;
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

function calculateEmbroideryPrice(
  params: CalculatePriceParams,
  type: ProductCalcType
): QuantityPriceEstimate[] {
  const { quantities, productData, locations } = params;

  return quantities.map((quantity) => {
    const quantityToUse = roundDownToAllowedValue(
      quantity,
      markupTableHeaderNumbers
    );
    const rowNameToUse = chooseEmbTableRow(type, productData.net);
    const markup = markupTable.get(`${quantityToUse}`, rowNameToUse);
    if (!markup)
      throw new Error(`Markup not found for quantity ${quantityToUse}`);

    const locationStitchPrices = calculateEmbroideryLocationPrices(params);
    const secondLocationFee =
      locations.length > 1 ? poloJacketSweatEmbLocationFees.second : 0;
    const thirdLocationFee =
      locations.length > 2 ? poloJacketSweatEmbLocationFees.third : 0;
    const fourthLocationFee =
      locations.length > 3 ? poloJacketSweatEmbLocationFees.fourth : 0;

    return {
      quantity,
      result:
        productData.net * markup +
        locationStitchPrices +
        secondLocationFee +
        thirdLocationFee +
        fourthLocationFee,
    };
  });
}

function chooseEmbTableRow(type: ProductCalcType, net: number) {
  if (type === "polo") return markupTableRowNames.polosEmb;
  if (type === "hat" || type === "beanie") {
    if (net >= 2.5 && net <= 3.49)
      return markupTableRowNames.beanie250Min349Max;
    if (net >= 3.5 && net <= 4.99)
      return markupTableRowNames.beanie350Min499Max;
    if (net >= 5.0 && net <= 7.49)
      return markupTableRowNames.beanie500Min749Max;
    if (net >= 7.5 && net <= 10.0) return markupTableRowNames.beanie750Min10Max;
    if (net > 10) return markupTableRowNames.hatsBeanesOver10;
  }

  throw new Error(
    `No valid markup table row for product type ${type} and net ${net}`
  );
}

function calculateEmbroideryLocationPrices(params: CalculatePriceParams) {
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
