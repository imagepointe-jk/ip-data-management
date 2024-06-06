import { roundToDecimalPlaces } from "../src/utility/misc";
import { calculatePrice } from "../src/pricing/calc";

describe("T-shirt screen print pricing formula", () => {
  const net = 6.43;
  test("Quantity 48, 1st location 1 color", () => {
    const expectedResult = 15.75;
    const actualResult = calculatePrice({
      productData: {
        net,
        type: "tshirt",
      },
      decorationType: "Screen Print",
      locations: [
        {
          colorCount: 1,
        },
      ],
      quantity: 48,
    });
    const roundedResult = roundToDecimalPlaces(actualResult || 0, 2);
    expect(roundedResult).toBe(expectedResult);
  });

  test("Quantity 72, 1st location 2 colors, 2nd location 1 color", () => {
    const expectedResult = 17.52;
    const actualResult = calculatePrice({
      productData: {
        net,
        type: "tshirt",
      },
      decorationType: "Screen Print",
      locations: [
        {
          colorCount: 2,
        },
        {
          colorCount: 1,
        },
      ],
      quantity: 72,
    });
    const roundedResult = roundToDecimalPlaces(actualResult || 0, 2);
    expect(roundedResult).toBe(expectedResult);
  });

  test("Quantity 144, 1st location 3 colors, 2nd location 2 colors, 3rd location 1 color", () => {
    const expectedResult = 18.68;
    const actualResult = calculatePrice({
      productData: {
        net,
        type: "tshirt",
      },
      decorationType: "Screen Print",
      locations: [
        {
          colorCount: 3,
        },
        {
          colorCount: 2,
        },
        {
          colorCount: 1,
        },
      ],
      quantity: 144,
    });
    const roundedResult = roundToDecimalPlaces(actualResult || 0, 2);
    expect(roundedResult).toBe(expectedResult);
  });

  test("Quantity 288, 1st location 2 colors, 2nd location 2 colors, 3rd location 2 colors", () => {
    const expectedResult = 17.54;
    const actualResult = calculatePrice({
      productData: {
        net,
        type: "tshirt",
      },
      decorationType: "Screen Print",
      locations: [
        {
          colorCount: 2,
        },
        {
          colorCount: 2,
        },
        {
          colorCount: 2,
        },
      ],
      quantity: 288,
    });
    const roundedResult = roundToDecimalPlaces(actualResult || 0, 2);
    expect(roundedResult).toBe(expectedResult);
  });

  test("Quantity 72, 1st location 1 color, 2nd location 1 color", () => {
    const expectedResult = 16.52;
    const actualResult = calculatePrice({
      productData: {
        net,
        type: "tshirt",
      },
      decorationType: "Screen Print",
      locations: [
        {
          colorCount: 1,
        },
        {
          colorCount: 1,
        },
      ],
      quantity: 72,
    });
    const roundedResult = roundToDecimalPlaces(actualResult || 0, 2);
    expect(roundedResult).toBe(expectedResult);
  });
});
