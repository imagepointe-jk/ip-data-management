export function convertDateToDefaultInputValue(date: Date) {
  return date.toISOString().substring(0, 10);
}

export function makeStringTitleCase(str: string) {
  return str
    .split(" ")
    .map(
      (word) =>
        `${word[0]?.toUpperCase()}${word.substring(1).toLocaleLowerCase()}`
    )
    .join(" ");
}

export function message(message: string) {
  return { message };
}
//assumes that the allowed values are already sorted in ascending order.
export function roundDownToAllowedValue(num: number, allowedValues: number[]) {
  let result = allowedValues[0] || 0;
  for (const val of allowedValues) {
    if (val > num) return result;
    result = val;
  }
  return result;
}

export function roundToDecimalPlaces(num: number, decimalPlaces: number) {
  return (
    Math.round(num * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces)
  );
}

export function filterErrors<T>(arr: (Error | T)[]) {
  const filtered: T[] = [];
  for (const item of arr) {
    if (!(item instanceof Error)) filtered.push(item);
  }
  return filtered;
}

export function waitForMs(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function findInAnyArray<T>(
  arrays: T[][],
  predicate: (value: T, index: number, obj: T[]) => boolean
): T | undefined {
  let all: T[] = [];
  for (const arr of arrays) {
    all = all.concat(arr);
  }
  return all.find(predicate);
}

//Can't figure out algorithm and we don't need more than 4 right now
export function getPermutations<T>(arr: T[]): T[][] {
  if (arr.length <= 0) return [[]];
  if (arr.length === 1) return [arr];

  const e0 = arr[0]!;
  const e1 = arr[1]!;
  const e2 = arr[2]!;
  const e3 = arr[3]!;
  if (arr.length === 2)
    return [
      [e0, e1],
      [e1, e0],
    ];
  else if (arr.length === 3)
    return [
      [e0, e1, e2],
      [e0, e2, e1],
      [e1, e0, e2],
      [e1, e2, e0],
      [e2, e0, e1],
      [e2, e1, e0],
    ];
  else if (arr.length === 4)
    return [
      [e0, e1, e2, e3],
      [e0, e1, e3, e2],
      [e0, e2, e1, e3],
      [e0, e2, e3, e1],
      [e0, e3, e1, e2],
      [e0, e3, e2, e1],

      [e1, e0, e2, e3],
      [e1, e0, e3, e2],
      [e1, e2, e0, e3],
      [e1, e2, e3, e0],
      [e1, e3, e0, e2],
      [e1, e3, e2, e0],

      [e2, e0, e1, e3],
      [e2, e0, e3, e1],
      [e2, e1, e0, e3],
      [e2, e1, e3, e0],
      [e2, e3, e0, e1],
      [e2, e3, e1, e0],

      [e3, e0, e1, e2],
      [e3, e0, e2, e1],
      [e3, e1, e0, e2],
      [e3, e1, e2, e0],
      [e3, e2, e0, e1],
      [e3, e2, e1, e0],
    ];
  else throw new Error("Permutations of > 4 elements not supported.");
}

export function getGreatestSum(nums: number[][]) {
  const sums = nums.map((set) => set.reduce((accum, val) => accum + val, 0));
  sums.sort((a, b) => b - a);
  return sums[0] || 0;
}
