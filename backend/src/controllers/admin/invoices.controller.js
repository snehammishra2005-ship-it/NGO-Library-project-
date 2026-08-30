import { asyncHandler, badRequest, notFound } from '../../utils/http.js';
import { listInvoices, getInvoice, createInvoice, setPaymentStatus } from '../../repos/invoices.repo.js';
import { record } from '../../repos/audit.repo.js';

const TYPES = ['MEMBERSHIP_FEE', 'FINE', 'OTHER'];

export const getInvoices = asyncHandler(async (req, res) => {
  res.json({ invoices: await listInvoices({ status: req.query.status, memberId: req.query.memberId }) });
});

export const getInvoiceById = asyncHandler(async (req, res) => {
  const invoice = await getInvoice(req.params.id);
  if (!invoice) throw notFound('Invoice not found');
  res.json({ invoice });
});

export const addInvoice = asyncHandler(async (req, res) => {
  const { member_id, type, amount } = req.body || {};
  if (!member_id) throw badRequest('member_id is required');
  if (!TYPES.includes(type)) throw badRequest('type must be MEMBERSHIP_FEE, FINE or OTHER');
  if (isNaN(amount) || Number(amount) < 0) throw badRequest('amount must be a non-negative number');
  const invoice = await createInvoice(req.body, req.user.sub);
  await record({ staffId: req.user.sub, action: 'CREATE', entity: 'INVOICE', entityId: invoice.invoice_id, details: `${type} ${amount}` });
  res.status(201).json({ invoice });
});

export const markPaid = asyncHandler(async (req, res) => {
  const status = req.body?.payment_status;
  if (!['PAID', 'UNPAID'].includes(status)) throw badRequest('payment_status must be PAID or UNPAID');
  const invoice = await setPaymentStatus(req.params.id, status);
  await record({ staffId: req.user.sub, action: 'UPDATE', entity: 'INVOICE', entityId: req.params.id, details: status });
  res.json({ invoice });
});
