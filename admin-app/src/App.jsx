import { Routes, Route } from 'react-router-dom';
import AdminLayout from './components/AdminLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Borrowing from './pages/Borrowing.jsx';
import Members from './pages/Members.jsx';
import MemberDetail from './pages/MemberDetail.jsx';
import Books from './pages/Books.jsx';
import BookForm from './pages/BookForm.jsx';
import Invoices from './pages/Invoices.jsx';
import InvoiceDetail from './pages/InvoiceDetail.jsx';
import Maintenance from './pages/Maintenance.jsx';
import Staff from './pages/Staff.jsx';
import Reports from './pages/Reports.jsx';
import Audit from './pages/Audit.jsx';
import NotFound from './pages/NotFound.jsx';

const admin = (el) => <ProtectedRoute adminOnly>{el}</ProtectedRoute>;

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="borrowing" element={<Borrowing />} />
        <Route path="members" element={<Members />} />
        <Route path="members/:id" element={<MemberDetail />} />
        <Route path="books" element={admin(<Books />)} />
        <Route path="books/new" element={admin(<BookForm mode="create" />)} />
        <Route path="books/:id/edit" element={admin(<BookForm mode="edit" />)} />
        <Route path="invoices" element={admin(<Invoices />)} />
        <Route path="invoices/:id" element={admin(<InvoiceDetail />)} />
        <Route path="maintenance" element={admin(<Maintenance />)} />
        <Route path="staff" element={admin(<Staff />)} />
        <Route path="reports" element={admin(<Reports />)} />
        <Route path="audit" element={admin(<Audit />)} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
