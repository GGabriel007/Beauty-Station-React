// src/components/admin/AdminRegistrations.js
// 2.5 — Read-only registrations table with search, course filter,
//        date range, pagination (50/page), and CSV export.

import React, { useState, useEffect, useMemo } from 'react';
import { get } from 'aws-amplify/api';

const PAGE_SIZE = 50;

async function apiFetch(path) {
  const op = get({ apiName: 'checkoutApi', path });
  const { body } = await op.response;
  return body.json();
}

export default function AdminRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [search,        setSearch]        = useState('');
  const [filterCourse,  setFilterCourse]  = useState('');
  const [dateFrom,      setDateFrom]      = useState('');
  const [dateTo,        setDateTo]        = useState('');
  const [page,          setPage]          = useState(1);

  useEffect(() => {
    apiFetch('/admin/registrations')
      .then(data => setRegistrations(Array.isArray(data) ? data : []))
      .catch(() => setError('Error al cargar las inscripciones.'))
      .finally(() => setLoading(false));
  }, []);

  // All unique course names that appear in any registration's Items string
  const allCourses = useMemo(() => {
    const names = new Set();
    for (const r of registrations) {
      if (r.Items) r.Items.split(', ').forEach(c => names.add(c.trim()));
    }
    return Array.from(names).sort();
  }, [registrations]);

  const filtered = useMemo(() => {
    const q      = search.toLowerCase();
    const fromTs = dateFrom ? new Date(dateFrom).getTime() : null;
    const toTs   = dateTo   ? new Date(dateTo + 'T23:59:59').getTime() : null;
    return registrations.filter(r => {
      if (q && !r.Name?.toLowerCase().includes(q) && !r.email?.toLowerCase().includes(q)) return false;
      if (filterCourse && !r.Items?.includes(filterCourse)) return false;
      if (fromTs && (r.Timestamp || 0) < fromTs) return false;
      if (toTs   && (r.Timestamp || 0) > toTs)   return false;
      return true;
    });
  }, [registrations, search, filterCourse, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const clearFilters = () => { setSearch(''); setFilterCourse(''); setDateFrom(''); setDateTo(''); setPage(1); };
  const hasFilters   = search || filterCourse || dateFrom || dateTo;

  const exportCSV = () => {
    const headers = ['Nombre', 'Email', 'Teléfono', 'Curso(s)', 'Total (Q)', 'Fecha'];
    const rows    = filtered.map(r => [
      r.Name        || '',
      r.email       || '',
      r.phoneNumber || '',
      r.Items       || '',
      r.TotalPrice  || '',
      r.Timestamp ? new Date(r.Timestamp).toLocaleDateString('es-GT') : '',
    ]);
    const csv  = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `inscripciones_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const fmtDate = ts => ts
    ? new Date(ts).toLocaleDateString('es-GT', { year: 'numeric', month: 'short', day: 'numeric' })
    : '—';

  if (loading) return <p style={{ color: '#aaa', fontFamily: FONT }}>Cargando inscripciones…</p>;
  if (error)   return <p style={{ color: '#c62828', fontFamily: FONT }}>{error}</p>;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <h1 style={pageTitleStyle}>Inscripciones</h1>
        <button onClick={exportCSV} style={primaryBtn}>⬇ Exportar CSV</button>
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '14px 16px', marginBottom: '14px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <label style={labelStyle}>Buscar</label>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Nombre o email" style={{ ...inputStyle, width: '190px' }} />
        </div>
        <div>
          <label style={labelStyle}>Curso</label>
          <select value={filterCourse} onChange={e => { setFilterCourse(e.target.value); setPage(1); }} style={{ ...inputStyle, width: '220px' }}>
            <option value="">Todos los cursos</option>
            {allCourses.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Desde</label>
          <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} style={{ ...inputStyle, width: '140px' }} />
        </div>
        <div>
          <label style={labelStyle}>Hasta</label>
          <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }} style={{ ...inputStyle, width: '140px' }} />
        </div>
        {hasFilters && (
          <button onClick={clearFilters} style={{ ...ghostBtn, alignSelf: 'flex-end' }}>Limpiar</button>
        )}
      </div>

      {/* Result count */}
      <p style={{ fontSize: '0.78rem', color: '#999', marginBottom: '8px', fontFamily: FONT }}>
        {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
        {totalPages > 1 && ` · Página ${page} de ${totalPages}`}
      </p>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', fontFamily: FONT }}>
          <thead>
            <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #e0e0e0' }}>
              {['Nombre', 'Email', 'Teléfono', 'Curso(s)', 'Total', 'Fecha'].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, fontSize: '0.68rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '28px', textAlign: 'center', color: '#bbb', fontFamily: FONT }}>Sin resultados para los filtros aplicados.</td></tr>
            ) : paginated.map((r, i) => (
              <tr key={r.id || i} style={{ borderBottom: '1px solid #f5f5f5' }}>
                <td style={td}>{r.Name       || '—'}</td>
                <td style={td}>{r.email      || '—'}</td>
                <td style={td}>{r.phoneNumber|| '—'}</td>
                <td style={{ ...td, maxWidth: '240px', wordBreak: 'break-word', lineHeight: '1.4' }}>{r.Items || '—'}</td>
                <td style={{ ...td, whiteSpace: 'nowrap' }}>Q{r.TotalPrice || 0}</td>
                <td style={{ ...td, whiteSpace: 'nowrap', color: '#888' }}>{fmtDate(r.Timestamp)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center', marginTop: '16px' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))}            disabled={page === 1}          style={{ ...ghostBtn, padding: '7px 14px' }}>← Anterior</button>
          <span style={{ fontSize: '0.82rem', color: '#666', fontFamily: FONT }}>Página {page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))}   disabled={page === totalPages} style={{ ...ghostBtn, padding: '7px 14px' }}>Siguiente →</button>
        </div>
      )}
    </div>
  );
}

const FONT         = "'Montserrat', sans-serif";
const inputStyle   = { padding: '7px 10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.83rem', fontFamily: FONT, boxSizing: 'border-box', outline: 'none' };
const labelStyle   = { display: 'block', fontSize: '0.68rem', fontWeight: 700, marginBottom: '4px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: FONT };
const primaryBtn   = { background: '#111', color: '#fff', border: 'none', borderRadius: '4px', padding: '9px 18px', cursor: 'pointer', fontSize: '0.82rem', fontFamily: FONT, fontWeight: 600 };
const ghostBtn     = { background: '#fff', color: '#333', border: '1px solid #ddd', borderRadius: '4px', padding: '9px 14px', cursor: 'pointer', fontSize: '0.82rem', fontFamily: FONT };
const td           = { padding: '10px 12px', color: '#333', fontFamily: FONT };
const pageTitleStyle = { fontSize: '1.5rem', fontWeight: 700, margin: 0, letterSpacing: '1px', fontFamily: FONT };
