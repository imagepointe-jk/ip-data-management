export function convertDateToDefaultInputValue(date: Date) {
  return date.toISOString().substring(0, 10);
}
