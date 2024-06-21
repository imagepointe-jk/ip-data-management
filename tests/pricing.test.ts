import { roundToDecimalPlaces } from "../src/utility/misc";
import { calculatePrice } from "../src/pricing/calc";
import { CalculatePriceParams } from "@/types/schema";

describe("T-shirt screen print pricing formula", () => {
  const net = 6.43;
  test("Quantity 48, 1st location 1 color", () => {
    checkResult({
      expectedResult: 15.75,
      calcParams: {
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
        quantities: [48],
      },
    });
  });

  test("Quantity 72, 1st location 2 colors, 2nd location 1 color", () => {
    checkResult({
      expectedResult: 17.52,
      calcParams: {
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
        quantities: [72],
      },
    });
  });

  test("Quantity 144, 1st location 3 colors, 2nd location 2 colors, 3rd location 1 color", () => {
    checkResult({
      expectedResult: 18.68,
      calcParams: {
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
        quantities: [144],
      },
    });
  });

  test("Quantity 288, 1st location 2 colors, 2nd location 2 colors, 3rd location 2 colors", () => {
    checkResult({
      expectedResult: 17.54,
      calcParams: {
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
        quantities: [288],
      },
    });
  });

  test("Quantity 72, 1st location 1 color, 2nd location 1 color", () => {
    checkResult({
      expectedResult: 16.52,
      calcParams: {
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
        quantities: [72],
      },
    });
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
        quantities: [48],
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
        quantities: [48],
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
        quantities: [48],
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
        quantities: [72],
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
        quantities: [144],
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
        quantities: [288],
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
        quantities: [500],
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
        quantities: [48],
      },
    });
  });
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
            colorCount: 2,
          },
          {
            colorCount: 1,
          },
        ],
        quantities: [48],
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
        quantities: [48],
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
        quantities: [48],
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
            colorCount: 3,
          },
          {
            colorCount: 2,
          },
          {
            colorCount: 1,
          },
        ],
        quantities: [48],
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
        quantities: [48],
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
        quantities: [48],
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
        quantities: [48],
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
        quantities: [48],
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
        quantities: [150],
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
        quantities: [24],
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
        quantities: [48],
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
        quantities: [72],
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
        quantities: [144],
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
        quantities: [288],
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
        quantities: [500],
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
        quantities: [24],
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
        quantities: [24],
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
        quantities: [24],
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
        quantities: [24],
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
        quantities: [24],
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
        quantities: [24],
      },
    });
  });
});

describe("Hats/beanies (emb)", () => {
  //correct markup at different quantities for >$10 net=================================
  test("Quantity 24, net 11, location with 1000 stitches", () => {
    checkResult({
      expectedResult: 32.78,
      calcParams: {
        productData: {
          net: 11,
          type: "hat",
        },
        decorationType: "Embroidery",
        locations: [
          {
            stitchCount: 1000,
          },
        ],
        quantities: [24],
      },
    });
  });
  test("Quantity 48, net 11, location with 1000 stitches", () => {
    checkResult({
      expectedResult: 26.18,
      calcParams: {
        productData: {
          net: 11,
          type: "hat",
        },
        decorationType: "Embroidery",
        locations: [
          {
            stitchCount: 1000,
          },
        ],
        quantities: [48],
      },
    });
  });
  test("Quantity 72, net 11, location with 1000 stitches", () => {
    checkResult({
      expectedResult: 23.98,
      calcParams: {
        productData: {
          net: 11,
          type: "hat",
        },
        decorationType: "Embroidery",
        locations: [
          {
            stitchCount: 1000,
          },
        ],
        quantities: [72],
      },
    });
  });
  test("Quantity 144, net 11, location with 1000 stitches", () => {
    checkResult({
      expectedResult: 22.99,
      calcParams: {
        productData: {
          net: 11,
          type: "hat",
        },
        decorationType: "Embroidery",
        locations: [
          {
            stitchCount: 1000,
          },
        ],
        quantities: [144],
      },
    });
  });
  test("Quantity 288, net 11, location with 1000 stitches", () => {
    checkResult({
      expectedResult: 22.33,
      calcParams: {
        productData: {
          net: 11,
          type: "hat",
        },
        decorationType: "Embroidery",
        locations: [
          {
            stitchCount: 1000,
          },
        ],
        quantities: [288],
      },
    });
  });
  test("Quantity 500, net 11, location with 1000 stitches", () => {
    checkResult({
      expectedResult: 21.78,
      calcParams: {
        productData: {
          net: 11,
          type: "hat",
        },
        decorationType: "Embroidery",
        locations: [
          {
            stitchCount: 1000,
          },
        ],
        quantities: [500],
      },
    });
  });
  //correct markup at different quantities for 2.50-3.49 net=================================
  test("Quantity 24, net 3, location with 1000 stitches", () => {
    checkResult({
      expectedResult: 21,
      calcParams: {
        productData: {
          net: 3,
          type: "hat",
        },
        decorationType: "Embroidery",
        locations: [
          {
            stitchCount: 1000,
          },
        ],
        quantities: [24],
      },
    });
  });
  test("Quantity 48, net 3, location with 1000 stitches", () => {
    checkResult({
      expectedResult: 16.95,
      calcParams: {
        productData: {
          net: 3,
          type: "hat",
        },
        decorationType: "Embroidery",
        locations: [
          {
            stitchCount: 1000,
          },
        ],
        quantities: [48],
      },
    });
  });
  test("Quantity 72, net 3, location with 1000 stitches", () => {
    checkResult({
      expectedResult: 16.35,
      calcParams: {
        productData: {
          net: 3,
          type: "hat",
        },
        decorationType: "Embroidery",
        locations: [
          {
            stitchCount: 1000,
          },
        ],
        quantities: [72],
      },
    });
  });
  test("Quantity 144, net 3, location with 1000 stitches", () => {
    checkResult({
      expectedResult: 13.65,
      calcParams: {
        productData: {
          net: 3,
          type: "hat",
        },
        decorationType: "Embroidery",
        locations: [
          {
            stitchCount: 1000,
          },
        ],
        quantities: [144],
      },
    });
  });
  test("Quantity 288, net 3, location with 1000 stitches", () => {
    checkResult({
      expectedResult: 13.2,
      calcParams: {
        productData: {
          net: 3,
          type: "hat",
        },
        decorationType: "Embroidery",
        locations: [
          {
            stitchCount: 1000,
          },
        ],
        quantities: [288],
      },
    });
  });
  test("Quantity 500, net 3, location with 1000 stitches", () => {
    checkResult({
      expectedResult: 12.75,
      calcParams: {
        productData: {
          net: 3,
          type: "hat",
        },
        decorationType: "Embroidery",
        locations: [
          {
            stitchCount: 1000,
          },
        ],
        quantities: [500],
      },
    });
  });
  //correct markup at different quantities for 3.50-4.99 net=================================
  test("Quantity 24, net 4, location with 1000 stitches", () => {
    checkResult({
      expectedResult: 22,
      calcParams: {
        productData: {
          net: 4,
          type: "hat",
        },
        decorationType: "Embroidery",
        locations: [
          {
            stitchCount: 1000,
          },
        ],
        quantities: [24],
      },
    });
  });
  test("Quantity 48, net 4, location with 1000 stitches", () => {
    checkResult({
      expectedResult: 18,
      calcParams: {
        productData: {
          net: 4,
          type: "hat",
        },
        decorationType: "Embroidery",
        locations: [
          {
            stitchCount: 1000,
          },
        ],
        quantities: [48],
      },
    });
  });
  test("Quantity 72, net 4, location with 1000 stitches", () => {
    checkResult({
      expectedResult: 17,
      calcParams: {
        productData: {
          net: 4,
          type: "hat",
        },
        decorationType: "Embroidery",
        locations: [
          {
            stitchCount: 1000,
          },
        ],
        quantities: [72],
      },
    });
  });
  test("Quantity 144, net 4, location with 1000 stitches", () => {
    checkResult({
      expectedResult: 14.6,
      calcParams: {
        productData: {
          net: 4,
          type: "hat",
        },
        decorationType: "Embroidery",
        locations: [
          {
            stitchCount: 1000,
          },
        ],
        quantities: [144],
      },
    });
  });
  test("Quantity 288, net 4, location with 1000 stitches", () => {
    checkResult({
      expectedResult: 13.8,
      calcParams: {
        productData: {
          net: 4,
          type: "hat",
        },
        decorationType: "Embroidery",
        locations: [
          {
            stitchCount: 1000,
          },
        ],
        quantities: [288],
      },
    });
  });
  test("Quantity 500, net 4, location with 1000 stitches", () => {
    checkResult({
      expectedResult: 13,
      calcParams: {
        productData: {
          net: 4,
          type: "hat",
        },
        decorationType: "Embroidery",
        locations: [
          {
            stitchCount: 1000,
          },
        ],
        quantities: [500],
      },
    });
  });
  //correct markup at different quantities for 5.00-7.49 net=================================
  test("Quantity 24, net 6, location with 1000 stitches", () => {
    checkResult({
      expectedResult: 24.3,
      calcParams: {
        productData: {
          net: 6,
          type: "hat",
        },
        decorationType: "Embroidery",
        locations: [
          {
            stitchCount: 1000,
          },
        ],
        quantities: [24],
      },
    });
  });
  test("Quantity 48, net 6, location with 1000 stitches", () => {
    checkResult({
      expectedResult: 19.8,
      calcParams: {
        productData: {
          net: 6,
          type: "hat",
        },
        decorationType: "Embroidery",
        locations: [
          {
            stitchCount: 1000,
          },
        ],
        quantities: [48],
      },
    });
  });
  test("Quantity 72, net 6, location with 1000 stitches", () => {
    checkResult({
      expectedResult: 19.5,
      calcParams: {
        productData: {
          net: 6,
          type: "hat",
        },
        decorationType: "Embroidery",
        locations: [
          {
            stitchCount: 1000,
          },
        ],
        quantities: [72],
      },
    });
  });
  test("Quantity 144, net 6, location with 1000 stitches", () => {
    checkResult({
      expectedResult: 17.1,
      calcParams: {
        productData: {
          net: 6,
          type: "hat",
        },
        decorationType: "Embroidery",
        locations: [
          {
            stitchCount: 1000,
          },
        ],
        quantities: [144],
      },
    });
  });
  test("Quantity 288, net 6, location with 1000 stitches", () => {
    checkResult({
      expectedResult: 16.5,
      calcParams: {
        productData: {
          net: 6,
          type: "hat",
        },
        decorationType: "Embroidery",
        locations: [
          {
            stitchCount: 1000,
          },
        ],
        quantities: [288],
      },
    });
  });
  test("Quantity 500, net 6, location with 1000 stitches", () => {
    checkResult({
      expectedResult: 15.6,
      calcParams: {
        productData: {
          net: 6,
          type: "hat",
        },
        decorationType: "Embroidery",
        locations: [
          {
            stitchCount: 1000,
          },
        ],
        quantities: [500],
      },
    });
  });
  //correct markup at different quantities for 7.50-10 net=================================
  test("Quantity 24, net 8, location with 1000 stitches", () => {
    checkResult({
      expectedResult: 26.8,
      calcParams: {
        productData: {
          net: 8,
          type: "hat",
        },
        decorationType: "Embroidery",
        locations: [
          {
            stitchCount: 1000,
          },
        ],
        quantities: [24],
      },
    });
  });
  test("Quantity 48, net 8, location with 1000 stitches", () => {
    checkResult({
      expectedResult: 22.8,
      calcParams: {
        productData: {
          net: 8,
          type: "hat",
        },
        decorationType: "Embroidery",
        locations: [
          {
            stitchCount: 1000,
          },
        ],
        quantities: [48],
      },
    });
  });
  test("Quantity 72, net 8, location with 1000 stitches", () => {
    checkResult({
      expectedResult: 22,
      calcParams: {
        productData: {
          net: 8,
          type: "hat",
        },
        decorationType: "Embroidery",
        locations: [
          {
            stitchCount: 1000,
          },
        ],
        quantities: [72],
      },
    });
  });
  test("Quantity 144, net 8, location with 1000 stitches", () => {
    checkResult({
      expectedResult: 19.6,
      calcParams: {
        productData: {
          net: 8,
          type: "hat",
        },
        decorationType: "Embroidery",
        locations: [
          {
            stitchCount: 1000,
          },
        ],
        quantities: [144],
      },
    });
  });
  test("Quantity 288, net 8, location with 1000 stitches", () => {
    checkResult({
      expectedResult: 19.2,
      calcParams: {
        productData: {
          net: 8,
          type: "hat",
        },
        decorationType: "Embroidery",
        locations: [
          {
            stitchCount: 1000,
          },
        ],
        quantities: [288],
      },
    });
  });
  test("Quantity 500, net 8, location with 1000 stitches", () => {
    checkResult({
      expectedResult: 18.4,
      calcParams: {
        productData: {
          net: 8,
          type: "hat",
        },
        decorationType: "Embroidery",
        locations: [
          {
            stitchCount: 1000,
          },
        ],
        quantities: [500],
      },
    });
  });
});

describe("Batch calculations", () => {
  test("Batch calculation works correctly", () => {
    const expectedResults = [19.2, 18.4];
    const actualResults = calculatePrice({
      productData: {
        net: 8,
        type: "hat",
      },
      decorationType: "Embroidery",
      locations: [
        {
          stitchCount: 1000,
        },
      ],
      quantities: [288, 500],
    });
    if (actualResults === 0) throw new Error("Zero result");
    const result0 = actualResults[0];
    const result1 = actualResults[1];
    if (!result0 || !result1) throw new Error("Missing result");
    const rounded0 = roundToDecimalPlaces(result0.result, 2);
    const rounded1 = roundToDecimalPlaces(result1.result, 2);
    expect(rounded0).toBeCloseTo(expectedResults[0]!);
    expect(rounded1).toBeCloseTo(expectedResults[1]!);
  });
});

function checkResult(params: {
  expectedResult: number;
  calcParams: CalculatePriceParams;
}) {
  const actualResult = calculatePrice(params.calcParams);
  if (actualResult === 0) throw new Error("Zero result");
  const roundedResult = roundToDecimalPlaces(actualResult[0]!.result, 2);
  expect(roundedResult).toBeCloseTo(params.expectedResult, 1);
}
