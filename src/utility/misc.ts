export function convertDateToDefaultInputValue(date: Date) {
  return date.toISOString().substring(0, 10);
}

export function makeStringTitleCase(str: string) {
  return str
    .split(" ")
    .map(
      (word) =>
        `${word[0].toUpperCase()}${word.substring(1).toLocaleLowerCase()}`
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

export function batchArray<T>(arr: T[], batchSize: number) {
  const batches: T[][] = [];
  let batchIndex = 0;
  for (let i = 0; i < arr.length; i++) {
    if (i > 0 && i % batchSize === 0) {
      batchIndex++;
    }
    if (batches[batchIndex] === undefined) {
      const newBatch: T[] = [];
      batches[batchIndex] = newBatch;
    }
    batches[batchIndex].push(arr[i]);
  }
  return batches;
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
