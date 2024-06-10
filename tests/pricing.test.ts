import { roundToDecimalPlaces } from "../src/utility/misc";
import { calculatePrice } from "../src/pricing/calc";
import { CalculatePriceParams } from "@/types/schema";

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

describe("Polos/jackets/sweats (print)", () => {
  //correctly choose same formula regardless of polo/jacket/sweat
  const net = 7.5;
  test("Quantity 48, location with 1 color, polo", () => {
    checkResult({
      expectedResult: 15.63,
      calcParams: {
        productData: {
          net,
          type: "polo",
        },
        decorationType: "Screen Print",
        locations: [
          {
            colorCount: 1,
          },
        ],
        quantity: 48,
      },
    });
  });
  test("Quantity 48, location with 1 color, jacket", () => {
    checkResult({
      expectedResult: 15.63,
      calcParams: {
        productData: {
          net,
          type: "jacket",
        },
        decorationType: "Screen Print",
        locations: [
          {
            colorCount: 1,
          },
        ],
        quantity: 48,
      },
    });
  });
  test("Quantity 48, location with 1 color, sweats", () => {
    checkResult({
      expectedResult: 15.63,
      calcParams: {
        productData: {
          net,
          type: "sweats",
        },
        decorationType: "Screen Print",
        locations: [
          {
            colorCount: 1,
          },
        ],
        quantity: 48,
      },
    });
  });

  //correct markup at different quantities
  test("Quantity 72, location with 1 color, sweats", () => {
    checkResult({
      expectedResult: 14.88,
      calcParams: {
        productData: {
          net,
          type: "sweats",
        },
        decorationType: "Screen Print",
        locations: [
          {
            colorCount: 1,
          },
        ],
        quantity: 72,
      },
    });
  });
  test("Quantity 144, location with 1 color, sweats", () => {
    checkResult({
      expectedResult: 14.2,
      calcParams: {
        productData: {
          net,
          type: "sweats",
        },
        decorationType: "Screen Print",
        locations: [
          {
            colorCount: 1,
          },
        ],
        quantity: 144,
      },
    });
  });
  test("Quantity 288, location with 1 color, sweats", () => {
    checkResult({
      expectedResult: 13.75,
      calcParams: {
        productData: {
          net,
          type: "sweats",
        },
        decorationType: "Screen Print",
        locations: [
          {
            colorCount: 1,
          },
        ],
        quantity: 288,
      },
    });
  });
  test("Quantity 500, location with 1 color, sweats", () => {
    checkResult({
      expectedResult: 13.23,
      calcParams: {
        productData: {
          net,
          type: "sweats",
        },
        decorationType: "Screen Print",
        locations: [
          {
            colorCount: 1,
          },
        ],
        quantity: 500,
      },
    });
  });

  //correct print upcharge at different color count/location combos
  test("Quantity 48, location with 1 color, location with 2 colors, polo", () => {
    checkResult({
      expectedResult: 16.88,
      calcParams: {
        productData: {
          net,
          type: "polo",
        },
        decorationType: "Screen Print",
        locations: [
          {
            colorCount: 1,
          },
          {
            colorCount: 2,
          },
        ],
        quantity: 48,
      },
    });
  });
  test("Quantity 48, location with 3 colors, location with 3 colors, polo", () => {
    checkResult({
      expectedResult: 18.03,
      calcParams: {
        productData: {
          net,
          type: "polo",
        },
        decorationType: "Screen Print",
        locations: [
          {
            colorCount: 3,
          },
          {
            colorCount: 3,
          },
        ],
        quantity: 48,
      },
    });
  });
  test("Quantity 48, location with 1 color, location with 2 colors, location with 3 colors, polo", () => {
    checkResult({
      expectedResult: 19.63,
      calcParams: {
        productData: {
          net,
          type: "polo",
        },
        decorationType: "Screen Print",
        locations: [
          {
            colorCount: 1,
          },
          {
            colorCount: 2,
          },
          {
            colorCount: 3,
          },
        ],
        quantity: 48,
      },
    });
  });
  test("Quantity 48, location with 1 color, location with 2 colors, location with 3 colors, polo", () => {
    checkResult({
      expectedResult: 19.33,
      calcParams: {
        productData: {
          net,
          type: "polo",
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
        quantity: 48,
      },
    });
  });
  test("Quantity 48, location with 1 color, location with 2 colors, location with 3 colors, location with 4 colors, polo", () => {
    checkResult({
      expectedResult: 23.38,
      calcParams: {
        productData: {
          net,
          type: "polo",
        },
        decorationType: "Screen Print",
        locations: [
          {
            colorCount: 1,
          },
          {
            colorCount: 2,
          },
          {
            colorCount: 3,
          },
          {
            colorCount: 4,
          },
        ],
        quantity: 48,
      },
    });
  });

  //correct poly fee
  test("Quantity 48, location with 1 color, polo", () => {
    checkResult({
      expectedResult: 16.13,
      calcParams: {
        productData: {
          net,
          type: "polo",
          isAllPoly: true,
        },
        decorationType: "Screen Print",
        locations: [
          {
            colorCount: 1,
          },
        ],
        quantity: 48,
      },
    });
  });

  //correct sweatshirt fee
  test("Quantity 48, location with 1 color, sweatshirt", () => {
    checkResult({
      expectedResult: 16.13,
      calcParams: {
        productData: {
          net,
          type: "polo",
          isSweatshirt: true,
        },
        decorationType: "Screen Print",
        locations: [
          {
            colorCount: 1,
          },
        ],
        quantity: 48,
      },
    });
  });

  test("Quantity 150, location with 2 colors, location with 3 colors, polo, poly", () => {
    checkResult({
      expectedResult: 16.65,
      calcParams: {
        productData: {
          net,
          type: "polo",
          isAllPoly: true,
        },
        decorationType: "Screen Print",
        locations: [
          {
            colorCount: 2,
          },
          {
            colorCount: 3,
          },
        ],
        quantity: 150,
      },
    });
  });
});

describe("Polos/jackets/sweats (emb)", () => {
  const net = 7.5;
  //correct markup at different quantities
  test("Quantity 24, location with 1000 stitches, polo", () => {
    checkResult({
      expectedResult: 16.28,
      calcParams: {
        productData: {
          net,
          type: "polo",
        },
        decorationType: "Embroidery",
        locations: [
          {
            stitchCount: 1000,
          },
        ],
        quantity: 24,
      },
    });
  });
  test("Quantity 48, location with 1000 stitches, polo", () => {
    checkResult({
      expectedResult: 14.33,
      calcParams: {
        productData: {
          net,
          type: "polo",
        },
        decorationType: "Embroidery",
        locations: [
          {
            stitchCount: 1000,
          },
        ],
        quantity: 48,
      },
    });
  });
  test("Quantity 72, location with 1000 stitches, polo", () => {
    checkResult({
      expectedResult: 13.73,
      calcParams: {
        productData: {
          net,
          type: "polo",
        },
        decorationType: "Embroidery",
        locations: [
          {
            stitchCount: 1000,
          },
        ],
        quantity: 72,
      },
    });
  });
  test("Quantity 144, location with 1000 stitches, polo", () => {
    checkResult({
      expectedResult: 13.05,
      calcParams: {
        productData: {
          net,
          type: "polo",
        },
        decorationType: "Embroidery",
        locations: [
          {
            stitchCount: 1000,
          },
        ],
        quantity: 144,
      },
    });
  });
  test("Quantity 288, location with 1000 stitches, polo", () => {
    checkResult({
      expectedResult: 12.9,
      calcParams: {
        productData: {
          net,
          type: "polo",
        },
        decorationType: "Embroidery",
        locations: [
          {
            stitchCount: 1000,
          },
        ],
        quantity: 288,
      },
    });
  });
  test("Quantity 500, location with 1000 stitches, polo", () => {
    checkResult({
      expectedResult: 12.38,
      calcParams: {
        productData: {
          net,
          type: "polo",
        },
        decorationType: "Embroidery",
        locations: [
          {
            stitchCount: 1000,
          },
        ],
        quantity: 500,
      },
    });
  });
  //correctly apply fees for additional locations
  test("Quantity 24, 2 locations with 1000 stitches each, polo", () => {
    checkResult({
      expectedResult: 21.28,
      calcParams: {
        productData: {
          net,
          type: "polo",
        },
        decorationType: "Embroidery",
        locations: [
          {
            stitchCount: 1000,
          },
          {
            stitchCount: 1000,
          },
        ],
        quantity: 24,
      },
    });
  });
  test("Quantity 24, 3 locations with 1000 stitches each, polo", () => {
    checkResult({
      expectedResult: 26.28,
      calcParams: {
        productData: {
          net,
          type: "polo",
        },
        decorationType: "Embroidery",
        locations: [
          {
            stitchCount: 1000,
          },
          {
            stitchCount: 1000,
          },
          {
            stitchCount: 1000,
          },
        ],
        quantity: 24,
      },
    });
  });
  test("Quantity 24, 4 locations with 1000 stitches each, polo", () => {
    checkResult({
      expectedResult: 33.78,
      calcParams: {
        productData: {
          net,
          type: "polo",
        },
        decorationType: "Embroidery",
        locations: [
          {
            stitchCount: 1000,
          },
          {
            stitchCount: 1000,
          },
          {
            stitchCount: 1000,
          },
          {
            stitchCount: 1000,
          },
        ],
        quantity: 24,
      },
    });
  });
  //correctly apply addtl. stitch count fees
  test("Quantity 24, 1 location with 6000 stitches, polo", () => {
    checkResult({
      expectedResult: 17.78,
      calcParams: {
        productData: {
          net,
          type: "polo",
        },
        decorationType: "Embroidery",
        locations: [
          {
            stitchCount: 6000,
          },
        ],
        quantity: 24,
      },
    });
  });
  test("Quantity 24, 1 location with 11000 stitches, polo", () => {
    checkResult({
      expectedResult: 19.28,
      calcParams: {
        productData: {
          net,
          type: "polo",
        },
        decorationType: "Embroidery",
        locations: [
          {
            stitchCount: 11000,
          },
        ],
        quantity: 24,
      },
    });
  });
  test("Quantity 24, 1 location with 20000 stitches, polo", () => {
    checkResult({
      expectedResult: 20.78,
      calcParams: {
        productData: {
          net,
          type: "polo",
        },
        decorationType: "Embroidery",
        locations: [
          {
            stitchCount: 20000,
          },
        ],
        quantity: 24,
      },
    });
  });
});

function checkResult(params: {
  expectedResult: number;
  calcParams: CalculatePriceParams;
}) {
  const actualResult = calculatePrice(params.calcParams);
  const roundedResult = roundToDecimalPlaces(actualResult, 2);
  expect(roundedResult).toBeCloseTo(params.expectedResult, 1);
}
