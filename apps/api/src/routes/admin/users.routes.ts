import { Router } from "express";
import { z } from "zod";
import multer from "multer";
import * as XLSX from "xlsx";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";
import { badRequest } from "../../utils/errors";
import { prisma } from "../../db/prisma";
import * as usersService from "./users.service";

const listUsersQuerySchema = z.object({
  search: z.string().optional(),
  role: z.enum(["admin", "student"]).optional(),
  status: z.enum(["active", "inactive"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

const exportUsersQuerySchema = z.object({
  search: z.string().optional(),
  role: z.enum(["admin", "student"]).optional(),
  status: z.enum(["active", "inactive"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

const createAdminSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
});

const router = Router();

router.get(
  "/admin/stats",
  asyncHandler(async (_req, res) => {
    const [totalStudents, activeCourses, certificatesIssued] =
      await Promise.all([
        prisma.user.count({ where: { role: { name: "student" } } }),
        prisma.course.count({ where: { status: "published" } }),
        prisma.certificate.count(),
      ]);
    sendSuccess(res, { totalStudents, activeCourses, certificatesIssued });
  }),
);

router.get(
  "/admin/users/export",
  asyncHandler(async (req, res) => {
    const parsed = exportUsersQuerySchema.safeParse(req.query);
    if (!parsed.success) throw badRequest("Invalid query parameters");
    const result = await usersService.exportUsers(parsed.data);
    sendSuccess(res, result);
  }),
);

router.get(
  "/admin/users",
  asyncHandler(async (req, res) => {
    const parsed = listUsersQuerySchema.safeParse(req.query);
    if (!parsed.success) throw badRequest("Invalid query parameters");
    const result = await usersService.listUsers(parsed.data);
    sendSuccess(res, result);
  }),
);

router.post(
  "/admin/admins",
  asyncHandler(async (req, res) => {
    const parsed = createAdminSchema.safeParse(req.body);
    if (!parsed.success)
      throw badRequest("firstName, lastName, and a valid email are required");
    const admin = await usersService.createAdmin({
      ...parsed.data,
      createdById: req.user!.userId,
    });
    sendSuccess(res, admin, "Admin created and invitation sent", 201);
  }),
);

router.patch(
  "/admin/users/:id/activate",
  asyncHandler(async (req, res) => {
    const user = await usersService.setUserActive({
      userId: req.params.id,
      isActive: true,
    });
    sendSuccess(res, user, "Account activated");
  }),
);

router.patch(
  "/admin/users/:id/deactivate",
  asyncHandler(async (req, res) => {
    if (req.params.id === req.user!.userId)
      throw badRequest("You cannot deactivate your own account");
    const user = await usersService.setUserActive({
      userId: req.params.id,
      isActive: false,
    });
    sendSuccess(res, user, "Account deactivated");
  }),
);

router.patch(
  "/admin/users/:id/verify-email",
  asyncHandler(async (req, res) => {
    const user = await usersService.verifyUserEmail({ userId: req.params.id });
    sendSuccess(res, user, "Email verified");
  }),
);

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
  "/admin/students/import",
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

    const result = await usersService.createStudentsFromImport(
      rows,
      req.user!.userId,
    );
    sendSuccess(
      res,
      result,
      `Import complete: ${result.created} created, ${result.skipped} skipped, ${result.failed} failed`,
      201,
    );
  }),
);

export default router;
