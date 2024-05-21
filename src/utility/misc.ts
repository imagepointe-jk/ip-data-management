export function convertDateToDefaultInputValue(date: Date) {
  return date.toISOString().substring(0, 10);
}

export function makeStringTitleCase(str: string) {
  return str
    .split(" ")
    .map((word) => `${word[0].toUpperCase()}${word.substring(1)}`)
    .join(" ");
}

export function message(message: string) {
  return { message };
}

export function roundToDecimalPlaces(num: number, decimalPlaces: number) {
  return (
    Math.round(num * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces)
  );
}
