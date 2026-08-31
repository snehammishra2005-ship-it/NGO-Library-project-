import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { useToast } from '../context/ToastContext.jsx';
import { date } from '../utils/format.js';

export default function Audit() {
  const toast = useToast();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.audit().then((d) => setEntries(d.entries)).catch((e) => toast.error(e.message)).finally(() => setLoading(false));
  }, []); // eslint-disable-line

  return (
    <div>
      <h1 className="text-xl font-semibold text-ink-900">Audit log</h1>
      <p className="mt-1 text-sm text-ink-500">Who changed what, and when.</p>

      <div className="card mt-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="tbl min-w-[680px]">
            <thead><tr><th>When</th><th>Staff</th><th>Action</th><th>Entity</th><th>Details</th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="py-8 text-center text-ink-400">Loading…</td></tr>
              ) : entries.length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center text-ink-400">No activity yet.</td></tr>
              ) : entries.map((e) => (
                <tr key={e.audit_id}>
                  <td className="whitespace-nowrap text-ink-500">{date(e.at)}</td>
                  <td className="text-ink-800">{e.staff_name}</td>
                  <td><span className="font-mono text-xs text-ink-600">{e.action}</span></td>
                  <td className="text-ink-600">{e.entity}{e.entity_id ? ` #${e.entity_id}` : ''}</td>
                  <td className="text-ink-500">{e.details || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
