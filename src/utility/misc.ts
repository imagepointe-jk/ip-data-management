export function convertDateToDefaultInputValue(date: Date) {
  return date.toISOString().substring(0, 10);
}

export function makeStringTitleCase(str: string) {
  return str
    .split(" ")
    .map((word) => `${word[0]!.toUpperCase()}${word.substring(1)}`)
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
