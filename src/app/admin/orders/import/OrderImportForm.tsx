"use client";

export function OrderImportForm() {
  return (
    <form
      className="content-frame vert-flex-group"
      style={{ marginTop: "20px", width: "600px" }}
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
    </form>
  );
}
