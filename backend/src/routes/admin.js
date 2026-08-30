// ---------------------------------------------------------------------
//  ADMIN API  (mounted at /api/admin)  — used only by the private admin
//  app. Every route requires a valid staff token; sensitive routes
//  require the ADMIN role. Role checks run server-side on every request.
//
//  Role policy (matches the brief's permissions table):
//   - FRONT_DESK (requireStaff): view dashboard, view members, borrow/return
//   - ADMIN (requireAdmin): everything else — book CUD, member CUD,
//     invoices, maintenance, staff, reports, audit
// ---------------------------------------------------------------------
import { Router } from 'express';
import { requireStaff, requireAdmin } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rateLimit.js';
import * as auth from '../controllers/admin/auth.controller.js';
import * as dash from '../controllers/admin/dashboard.controller.js';
import * as books from '../controllers/admin/books.controller.js';
import * as members from '../controllers/admin/members.controller.js';
import * as borrow from '../controllers/admin/borrow.controller.js';
import * as invoices from '../controllers/admin/invoices.controller.js';
import * as maintenance from '../controllers/admin/maintenance.controller.js';
import * as staff from '../controllers/admin/staff.controller.js';
import * as reports from '../controllers/admin/reports.controller.js';
import * as audit from '../controllers/admin/audit.controller.js';

const router = Router();

// ---- Auth ------------------------------------------------------------
router.post('/login', rateLimit({ max: 8 }), auth.staffLogin);
router.get('/me', requireStaff, auth.staffMe);

// ---- Dashboard (any staff) ------------------------------------------
router.get('/dashboard', requireStaff, dash.dashboard);

// ---- Borrowing (any staff — front-desk core task) -------------------
router.get('/borrow-log', requireStaff, borrow.getOpenLoans);
router.post('/borrow-log', requireStaff, borrow.logIssue);
router.post('/borrow-log/return', requireStaff, borrow.logReturn);

// ---- Members: view (any staff), write (admin) -----------------------
router.get('/members', requireStaff, members.getMembers);
router.get('/members/:id', requireStaff, members.getMemberById);
router.post('/members', requireAdmin, members.addMember);
router.put('/members/:id', requireAdmin, members.editMember);

// ---- Books: read (any staff), write (admin) -------------------------
router.get('/books', requireStaff, books.getBooks);
router.get('/books/:id', requireStaff, books.getBookById);
router.post('/books', requireAdmin, books.addBook);
router.put('/books/:id', requireAdmin, books.editBook);
router.delete('/books/:id', requireAdmin, books.removeBook);

// ---- Invoices (admin) ------------------------------------------------
router.get('/invoices', requireAdmin, invoices.getInvoices);
router.get('/invoices/:id', requireAdmin, invoices.getInvoiceById);
router.post('/invoices', requireAdmin, invoices.addInvoice);
router.put('/invoices/:id/payment', requireAdmin, invoices.markPaid);

// ---- Maintenance (admin) ---------------------------------------------
router.get('/maintenance', requireAdmin, maintenance.getMaintenance);
router.post('/maintenance', requireAdmin, maintenance.addMaintenance);
router.delete('/maintenance/:id', requireAdmin, maintenance.removeMaintenance);

// ---- Staff management (admin only) ----------------------------------
router.get('/staff', requireAdmin, staff.getStaff);
router.post('/staff', requireAdmin, staff.addStaff);
router.delete('/staff/:id', requireAdmin, staff.removeStaff);

// ---- Reports + audit (admin only) -----------------------------------
router.get('/reports', requireAdmin, reports.reportsSummary);
router.get('/reports/most-borrowed.csv', requireAdmin, reports.mostBorrowedCsv);
router.get('/audit', requireAdmin, audit.getAudit);

export default router;
