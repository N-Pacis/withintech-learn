import { Router } from "express";
import multer from "multer";
import * as XLSX from "xlsx";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";
import { badRequest } from "../../utils/errors";
import * as remindersService from "./reminders.service";

const router = Router();

// Reuse same multer config as invitations
const xlsxUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ];
    if (!allowed.includes(file.mimetype)) {
      cb(badRequest("Only .xlsx, .xls, or .csv files are allowed"));
      return;
    }
    cb(null, true);
  },
}).single("file");

router.post(
  "/admin/reminders/send",
  (req, res, next) => {
    xlsxUpload(req, res, (err) => {
      if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE")
        return next(badRequest("File size must not exceed 10MB"));
      if (err) return next(err);
      next();
    });
  },
  asyncHandler(async (req, res) => {
    if (!req.file) throw badRequest("No file uploaded");

    // Validate subject and body from form-data
    const { subject, body } = req.body;
    if (!subject?.trim()) throw badRequest("Subject is required");
    if (!body?.trim()) throw badRequest("Body is required");

    // Validate required placeholders present
    if (!body.includes("[First Name]") && !body.includes("[Last Name]")) {
      // Warning only - don't block
    }

    // Parse XLSX (same as invitations)
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) throw badRequest("The uploaded file contains no sheets");

    const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
      workbook.Sheets[sheetName],
      { defval: "" },
    );

    if (rawRows.length === 0) throw badRequest("The spreadsheet is empty");
    if (rawRows.length > 500)
      throw badRequest("Import is limited to 500 rows per file");

    // Parse rows with flexible column mapping
    const rows = rawRows.map((r) => {
      const get = (...keys: string[]) => {
        for (const k of keys) {
          const match = Object.keys(r).find(
            (rk) => rk.toLowerCase().trim() === k.toLowerCase(),
          );
          if (match && r[match]) return String(r[match]).trim();
        }
        return "";
      };
      return {
        firstName: get("firstname", "first name", "first_name"),
        lastName: get("lastname", "last name", "last_name", "surname"),
        email: get("email", "email address"),
      };
    });

    const result = await remindersService.sendReminders(
      rows,
      subject.trim(),
      body.trim(),
      req.user!.userId,
    );

    sendSuccess(
      res,
      result,
      `Reminders sent: ${result.sent} sent, ${result.skipped} skipped, ${result.failed} failed`,
      200,
    );
  }),
);

export default router;
