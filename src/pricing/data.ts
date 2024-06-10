import { SimpleTable } from "./classes";

export const markupTableHeaderNumbers = [
  12, 24, 48, 72, 144, 288, 500, 1000, 2004, 3000,
];
export const markupTableRowNames = {
  tshirts: "t-shirts",
  polosPrint: "polos/jackets/sweats (print)",
  polosEmb: "polos/jackets/sweats (emb)",
};
export const markupTable = new SimpleTable({
  headers: markupTableHeaderNumbers.map((num) => `${num}`),
  rows: {
    [markupTableRowNames.tshirts]: [
      4.82, 3.82, 2.45, 2.18, 2.05, 1.95, 1.9, 1.85, 1.77, 1.65,
    ],
    [markupTableRowNames.polosPrint]: [
      2.44, 2.23, 1.97, 1.87, 1.78, 1.72, 1.65,
    ],
    [markupTableRowNames.polosEmb]: [2.37, 2.17, 1.91, 1.83, 1.74, 1.72, 1.65],
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
export const polosJacketsSweatsPrintUpchargeTable = new SimpleTable({
  headers: ["1", "2", "3", "4"],
  rows: {
    [printUpchargeRowNames.oneColor]: [0.85, 1, 2, 3],
    [printUpchargeRowNames.twoColor]: [1.05, 1.25, 2.25, 3.25],
    [printUpchargeRowNames.multiColor]: [1.5, 1.75, 2.75, 3.75],
  },
});

export const poloJacketSweatPolyUpcharge = 0.5;
export const poloJacketSweatFleeceUpcharge = 0.5;
export const poloJacketSweatEmbLocationFees = {
  second: 5,
  third: 5,
  fourth: 7.5,
};
export const additional5kStitchPrice = 1.5;
