import fs from "fs";
import * as xlsx from "xlsx";

type Obj = {
  [key: string]: any;
};

type DataFromWorkbook = {
  [key: string]: Obj[];
};

export function getSourceJson(path: string) {
  try {
    const file = fs.readFileSync(path);
    const workbook = xlsx.read(file, { type: "buffer" });
    const data: DataFromWorkbook = {};
    for (const sheetName of workbook.SheetNames) {
      data[`${sheetName}`] = xlsx.utils.sheet_to_json(
        workbook.Sheets[sheetName]!,
      );
    }

    return data;
  } catch (error) {
    console.error("ERROR PARSING SOURCE", error);
  }
}
