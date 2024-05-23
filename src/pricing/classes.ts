type SimpleTableRows<T> = {
  [key: string]: T[];
};
type SimpleTableParams<T> = {
  headers: string[];
  rows: SimpleTableRows<T>;
};

export class SimpleTable<T> {
  private readonly headers;
  private readonly rows;

  constructor(params: SimpleTableParams<T>) {
    this.headers = params.headers;
    this.rows = params.rows;
  }

  get(headerName: string, rowName: string) {
    const columnIndex = this.headers.indexOf(headerName);
    if (columnIndex === -1)
      throw new Error(`Column ${headerName} not found in the table.`);

    const row = this.rows[rowName];
    if (!row) throw new Error(`Row ${row} not found in the table.`);

    const val = row[columnIndex];
    if (!val)
      console.warn(`No value found in column ${headerName} at row ${rowName}!`);

    return val;
  }
}
