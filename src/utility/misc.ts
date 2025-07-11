import { AppError } from "../error";
import crypto from "crypto";
import { INTERNAL_SERVER_ERROR } from "./statusCodes";

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

//gets the timestamp of the date X years before the current date.
export function getTimeStampYearsAgo(yearsAgo: number) {
  const date = new Date();
  date.setFullYear(date.getFullYear() - yearsAgo);
  return date.getTime();
}

export function getDaysSinceDate(date: Date) {
  const twentyFourHours = 1000 * 60 * 60 * 24;
  const msSinceDate = new Date().getTime() - date.getTime();
  const days = msSinceDate / twentyFourHours;
  return days;
}

export function findAllFormValues(
  formData: FormData,
  testFn: (fieldName: string, fieldValue: FormDataEntryValue) => boolean
) {
  const entries: { fieldName: string; fieldValue: FormDataEntryValue }[] = [];
  for (const entry of formData.entries()) {
    if (testFn(entry[0], entry[1]))
      entries.push({ fieldName: entry[0], fieldValue: entry[1] });
  }
  return entries;
}

//first page is pageNumber = 1, NOT zero-indexed
export function getArrayPage<T>(
  array: T[],
  pageNumber: number,
  countPerPage: number
) {
  const startIndex = countPerPage * (pageNumber - 1);
  return array.slice(startIndex, startIndex + countPerPage);
}

//from the article https://medium.com/@tony.infisical/guide-to-nodes-crypto-module-for-encryption-decryption-65c077176980
export function encrypt(text: string) {
  const key = process.env.MAIN_ENCRYPTION_KEY;
  if (!key) throw new Error("No encryption key found!");

  const iv = crypto.randomBytes(12).toString("base64");
  const cipher = crypto.createCipheriv(
    "aes-256-gcm",
    Buffer.from(key, "base64"),
    Buffer.from(iv, "base64")
  );
  let ciphertext = cipher.update(text, "utf8", "base64");
  ciphertext += cipher.final("base64");
  const tag = cipher.getAuthTag();

  return { ciphertext, iv, tag };
}

//from the article https://medium.com/@tony.infisical/guide-to-nodes-crypto-module-for-encryption-decryption-65c077176980
export function decrypt(encrypted: string, iv: string, tag: string) {
  const key = process.env.MAIN_ENCRYPTION_KEY;
  if (!key) throw new Error("No encryption key found!");

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    Buffer.from(key, "base64"),
    Buffer.from(iv, "base64")
  );

  decipher.setAuthTag(Buffer.from(tag, "base64"));

  let plaintext = decipher.update(encrypted, "base64", "utf8");
  plaintext += decipher.final("utf8");

  return plaintext;
}

export function wrap(value: number, min: number, max: number) {
  if (value < min) return max;
  if (value > max) return min;
  return value;
}

export function clamp(value: number, min: number, max: number) {
  if (max < min)
    console.error(
      `WARNING: clamp called with invalid values (min ${min}, max ${max})`
    );
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

export function forceClientDownload(
  urlOrBlob: Blob | string,
  downloadName: string
) {
  const url =
    urlOrBlob instanceof Blob ? URL.createObjectURL(urlOrBlob) : urlOrBlob;

  const link = document.createElement("a");
  link.href = url;
  link.download = downloadName;
  link.click();
}

export function getEnvVariable(name: string) {
  const value = process.env[name];
  if (!value)
    throw new AppError({
      type: "Environment",
      serverMessage: `Environment variable ${name} not found!`,
      statusCode: INTERNAL_SERVER_ERROR,
    });
  return value;
}

export function checkEnvVariable(value: string | undefined, isClient = false) {
  if (!value)
    throw new AppError({
      type: "Environment",
      serverMessage: isClient ? undefined : "Undefined environment variable!",
      clientMessage: isClient ? "Undefined environment variable!" : undefined,
      statusCode: INTERNAL_SERVER_ERROR,
    });
}

//only use when cryptographic randomness is not needed
export function createRandomDigitString(digits: number) {
  return Array.from({ length: digits }, () =>
    Math.floor(Math.random() * 10)
  ).join("");
}

//if the given rect is bigger than the given boundaries, scales the rect down so that it "fits" within the boundaries, without affecting aspect ratio.
//treats the rect as if it is centered within the bounds.
export function getConfinedRectDimensions(
  rect: { width: number; height: number },
  bounds: { width: number; height: number }
) {
  if (rect.width <= bounds.width && rect.height <= bounds.height) return rect; //the rect already fits, so don't bother

  const widthDiff = Math.abs(rect.width - bounds.width);
  const heightDiff = Math.abs(rect.height - bounds.height);
  const aspectRatio = rect.width / rect.height;

  if (widthDiff > heightDiff) {
    return {
      width: bounds.width,
      height: bounds.width / aspectRatio,
    };
  } else {
    return {
      width: bounds.height * aspectRatio,
      height: bounds.height,
    };
  }
}

//provided an array of items and a way to get a unique ID per item, returns a new array without any items that have the same ID. useful for deduplicating arrays of objects.
export function deduplicateArray<T>(
  arr: T[],
  getStringifiedObjectId: (obj: T) => string
) {
  const deduplicated: T[] = [];
  const seenIds: string[] = [];
  for (const obj of arr) {
    const id = getStringifiedObjectId(obj);
    if (seenIds.includes(id)) continue;

    deduplicated.push(obj);
    seenIds.push(id);
  }
  return deduplicated;
}

//sort firstArray based on the order of IDs given in idsArray.
//firstArray can be any type, as long as getId can be used to pull unique IDs from each item in it.
export function sortByIdOrder<T>(
  firstArray: T[],
  idsArray: string[],
  getId: (item: T) => string
): T[] {
  const idToIndexMap = new Map<string, number>();

  // Create a map of id => order index
  idsArray.forEach((id, index) => {
    idToIndexMap.set(id.toLocaleLowerCase(), index);
  });

  return [...firstArray].sort((a, b) => {
    const idA = getId(a).toLocaleLowerCase();
    const idB = getId(b).toLocaleLowerCase();
    const indexA = idToIndexMap.get(idA);
    const indexB = idToIndexMap.get(idB);

    // Sort unknown IDs to the end, preserving their relative order
    if (indexA === undefined && indexB === undefined) return 0;
    if (indexA === undefined) return 1;
    if (indexB === undefined) return -1;

    return indexA - indexB;
  });
}

export function wrapArray<T>(arr: T[], shift: number): T[] {
  const len = arr.length;
  if (len === 0) return [];

  // Normalize the shift to be within array bounds and handle negatives
  const normalizedShift = ((-shift % len) + len) % len;

  // Positive shift moves elements from front to back (left shift)
  return [...arr.slice(normalizedShift), ...arr.slice(0, normalizedShift)];
}
