declare module "jspdf-autotable" {
  import type { jsPDF } from "jspdf";

  interface AutoTableStyles {
    fontSize?: number;
    cellPadding?: number;
    fillColor?: number[] | string;
    textColor?: number | number[] | string;
    fontStyle?: string;
  }

  interface AutoTableHookData {
    pageNumber: number;
  }

  interface AutoTableOptions {
    startY?: number;
    head?: unknown[][];
    body?: unknown[][];
    styles?: AutoTableStyles;
    headStyles?: AutoTableStyles;
    alternateRowStyles?: AutoTableStyles;
    margin?: { top?: number; right?: number; bottom?: number; left?: number };
    theme?: "striped" | "grid" | "plain";
    didDrawPage?: (data: AutoTableHookData) => void;
  }

  export default function autoTable(
    doc: jsPDF,
    options: AutoTableOptions,
  ): void;
}
