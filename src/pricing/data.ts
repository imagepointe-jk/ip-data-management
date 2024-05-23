import { SimpleTable } from "./classes";

export const markupTableHeaderNumbers = [
  12, 24, 48, 72, 144, 288, 500, 1000, 2004, 3000,
];
export const markupTableRowNames = {
  tshirts: "t-shirts",
};
export const markupTable = new SimpleTable({
  headers: markupTableHeaderNumbers.map((num) => `${num}`),
  rows: {
    [markupTableRowNames.tshirts]: [
      4.82, 3.82, 2.45, 2.18, 2.05, 1.95, 1.9, 1.85, 1.77, 1.65,
    ],
  },
});

export const printUpchargeHeaderNumbers = [48, 72, 144, 288, 500];
export const printUpchargeRowNames = {
  oneColor: "One Color",
  twoColor: "Two Color",
  multiColor: "Multicolor",
};
export const printUpchargeTable = new SimpleTable({
  headers: printUpchargeHeaderNumbers.map((num) => `${num}`),
  rows: {
    [printUpchargeRowNames.oneColor]: [3, 2.5, 2, 1.75, 1.5],
    [printUpchargeRowNames.twoColor]: [4.5, 3.5, 2.5, 2.25, 1.75],
    [printUpchargeRowNames.multiColor]: [7, 5, 3, 2.75, 2],
  },
});
