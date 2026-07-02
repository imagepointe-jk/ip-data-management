"use client";

import SyncTable, { SyncRowData } from "@/components/SyncTable/SyncTable";
import { FormEvent } from "react";
import {
  createProductSyncRows,
  getAllProducts,
  ProductSyncRow,
} from "./generalProductUploadNEW";
import { useImmer } from "use-immer";

// const testData: {
//   syncRowData: SyncRowData;
//   data: {
//     sku: string;
//     name: string;
//     description: string;
//     regularPrice: string;
//     costOfGood: string;
//   };
// }[] = [
//   {
//     syncRowData: {
//       rowId: "1",
//       status: "ready",
//     },
//     data: {
//       sku: "AS1234",
//       name: "Test",
//       description:
//         "Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit, illum magni animi soluta nam eligendi quaerat doloribus quidem. Quod excepturi inventore id atque ipsum aut modi tempore quidem eos at.",
//       costOfGood: "12.34",
//       regularPrice: "12.34",
//     },
//   },
//   {
//     syncRowData: {
//       rowId: "2",
//       status: "processing",
//     },
//     data: {
//       sku: "AS1234",
//       name: "Test",
//       description:
//         "Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit, illum magni animi soluta nam eligendi quaerat doloribus quidem. Quod excepturi inventore id atque ipsum aut modi tempore quidem eos at.",
//       costOfGood: "12.34",
//       regularPrice: "12.34",
//     },
//   },
//   {
//     syncRowData: {
//       rowId: "3",
//       status: "error",
//     },
//     data: {
//       sku: "AS1234",
//       name: "Test",
//       description:
//         "Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit, illum magni animi soluta nam eligendi quaerat doloribus quidem. Quod excepturi inventore id atque ipsum aut modi tempore quidem eos at.",
//       costOfGood: "12.34",
//       regularPrice: "12.34",
//     },
//   },
//   {
//     syncRowData: {
//       rowId: "4",
//       status: "done",
//     },
//     data: {
//       sku: "AS1234",
//       name: "Test",
//       description:
//         "Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit, illum magni animi soluta nam eligendi quaerat doloribus quidem. Quod excepturi inventore id atque ipsum aut modi tempore quidem eos at.",
//       costOfGood: "12.34",
//       regularPrice: "12.34",
//     },
//   },
// ];

export function GeneralProductUploadFormNEW() {
  const [syncRows, setSyncRows] = useImmer<ProductSyncRow[]>([]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const rows = await createProductSyncRows(formData);
    setSyncRows(rows);

    const url = `${formData.get("url")}`;
    const key = `${formData.get("key")}`;
    const secret = `${formData.get("secret")}`;

    // const response = await getAllProducts(url, key, secret, true);
    // const json = await response.json();
    // console.log(json);
  }

  function clearForm() {
    const url = document.getElementById("url");
    const key = document.getElementById("key");
    const secret = document.getElementById("secret");
    const file = document.getElementById("file");

    (url as HTMLInputElement).value = "";
    (key as HTMLInputElement).value = "";
    (secret as HTMLInputElement).value = "";
    (file as HTMLInputElement).value = "";

    setSyncRows([]);
  }

  return (
    <form
      className="content-frame vert-flex-group"
      style={{ marginTop: "20px", width: "1400px" }}
      onSubmit={onSubmit}
    >
      <h3>Upload Import Spreadsheet</h3>
      <label htmlFor="url">
        Store URL
        <input type="text" name="url" id="url" required />
      </label>
      <label htmlFor="key">
        API Key
        <input type="text" name="key" id="key" required />
      </label>
      <label htmlFor="secret">
        API Secret
        <input type="text" name="secret" id="secret" required />
      </label>
      <label htmlFor="file">
        <input type="file" name="file" id="file" required />
      </label>
      <div>
        <button type="submit">Preview Import</button>
      </div>
      <div>
        <button type="button" onClick={clearForm}>
          Reset
        </button>
      </div>
      <SyncTable
        dataset={syncRows}
        columns={[
          {
            createCell: (item) => item.data?.sku,
            headerName: "SKU",
          },
          {
            createCell: (item) => item.data?.published,
            headerName: "Published",
          },
          {
            createCell: (item) => item.data?.sku,
            headerName: "SKU",
          },
          {
            createCell: (item) => item.data?.sortOrder,
            headerName: "Sort Order",
          },
          {
            createCell: (item) => item.data?.stock,
            headerName: "Stock",
          },
        ]}
      />
    </form>
  );
}
