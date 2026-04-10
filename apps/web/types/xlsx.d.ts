declare module "xlsx" {
  interface WorkSheet {
    [cell: string]: unknown;
  }

  interface WorkBook {
    SheetNames: string[];
    Sheets: Record<string, WorkSheet>;
  }

  interface Utils {
    aoa_to_sheet(data: unknown[][]): WorkSheet;
    book_new(): WorkBook;
    book_append_sheet(wb: WorkBook, ws: WorkSheet, name?: string): void;
  }

  export const utils: Utils;
  export function writeFile(wb: WorkBook, filename: string): void;
}
