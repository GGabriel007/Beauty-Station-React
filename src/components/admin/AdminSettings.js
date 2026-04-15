// src/components/admin/AdminSettings.js
// 2.7 + 3.2 — Three sections: Inventory, Global Pricing, Site Notice, Activity Log.

import React, { useState, useEffect } from 'react';
import { get, put } from 'aws-amplify/api';

async function apiFetch(path) {
  const op = get({ apiName: 'checkoutApi', path });
  const { body } = await op.response;
  return body.json();
}

async function apiPut(path, data) {
  const op = put({ apiName: 'checkoutApi', path, options: { body: data } });
  const { body } = await op.response;
  return body.json();
}

export default function AdminSettings() {
  const [seats,    setSeats]    = useState([]);  // [{ moduleId, courseName, seats }]
  const [settings, setSettings] = useState({});  // { settingKey: { settingKey, value, label } }
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    Promise.all([
      apiFetch('/admin/seats'),
      apiFetch('/admin/site-settings'),
    ])
      .then(([seatsData, settingsData]) => {
        // Each Modulos item: { id, 'CourseName': count }
        const processed = [];
        for (const item of seatsData) {
          for (const key of Object.keys(item)) {
            if (key === 'id') continue;
            processed.push({ moduleId: item.id, courseName: key, seats: Number(item[key]) });
          }
        }
        processed.sort((a, b) => a.courseName.localeCompare(b.courseName));
        setSeats(processed);

        // Build a map keyed by settingKey
        const map = {};
        for (const s of settingsData) map[s.settingKey] = s;
        setSettings(map);
      })
      .catch(() => setError('Error al cargar la configuración.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: '#aaa', fontFamily: FONT }}>Cargando configuración…</p>;
  if (error)   return <p style={{ color: '#c62828', fontFamily: FONT }}>{error}</p>;

  const kit      = seats.find(s => s.courseName === 'Kit de pieles perfectas');
  const courses  = seats.filter(s => s.courseName !== 'Kit de pieles perfectas');

  return (
    <div>
      <h1 style={pageTitleStyle}>Configuración</h1>

      {/* ── Inventory: Kit ── */}
      <Section title="Inventario — Kit de Maquillaje">
        {kit
          ? <SeatRow key={kit.courseName} label="Kit de pieles perfectas" moduleId={kit.moduleId} courseName={kit.courseName} initialSeats={kit.seats} />
          : <p style={emptyStyle}>Kit no encontrado en la base de datos.</p>
        }
      </Section>

      {/* ── Inventory: per-course seats ── */}
      <Section title="Lugares por Curso y Horario">
        {courses.length === 0
          ? <p style={emptyStyle}>No se encontraron datos de cupos.</p>
          : courses.map(s => (
            <SeatRow
              key={`${s.moduleId}-${s.courseName}`}
              label={s.courseName}
              moduleId={s.moduleId}
              courseName={s.courseName}
              initialSeats={s.seats}
            />
          ))
        }
      </Section>

      {/* ── Global pricing ── */}
      <Section title="Precios Globales">
        <SettingRow label="Cuota de Inscripción (Q)"    settingKey="enrollmentFee" initial={settings.enrollmentFee?.value    ?? ''} type="number" />
        <SettingRow label="Precio del Kit de Pieles (Q)" settingKey="kitPrice"      initial={settings.kitPrice?.value          ?? ''} type="number" />
      </Section>

      {/* ── Site notice ── */}
      <Section title="Aviso del Sitio">
        <SiteNoticeRow
          initialText={settings.siteNotice?.value           ?? ''}
          initialActive={
            settings.siteNoticeActive?.value === true ||
            settings.siteNoticeActive?.value === 'true'
          }
        />
      </Section>

      {/* ── Activity log ── */}
      <Section title="Registro de Actividad">
        <ActivityLog />
      </Section>
    </div>
  );
}

// ── Per-seat row ─────────────────────────────────────────────────────────────

function SeatRow({ label, moduleId, courseName, initialSeats }) {
  const [value,  setValue]  = useState(initialSeats);
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [err,    setErr]    = useState(null);

  const handleSave = async () => {
    if (!moduleId) { setErr('ID de módulo no encontrado.'); return; }
    setSaving(true); setErr(null); setSaved(false);
    try {
      await apiPut(`/admin/seats/${moduleId}`, { courseName, seats: Number(value) });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setErr('Error al guardar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={rowStyle}>
      <span style={{ flex: 1, fontSize: '0.84rem', fontFamily: FONT }}>{label}</span>
      <input
        type="number"
        value={value}
        min="0"
        onChange={e => setValue(e.target.value)}
        style={{ ...numInput }}
      />
      <SaveButton saving={saving} saved={saved} onClick={handleSave} />
      {err && <span style={errStyle}>{err}</span>}
    </div>
  );
}

// ── Site setting row ──────────────────────────────────────────────────────────

function SettingRow({ label, settingKey, initial, type = 'text' }) {
  const [value,  setValue]  = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [err,    setErr]    = useState(null);

  const handleSave = async () => {
    setSaving(true); setErr(null); setSaved(false);
    try {
      await apiPut(`/admin/site-settings/${settingKey}`, { value });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setErr('Error al guardar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={rowStyle}>
      <span style={{ flex: 1, fontSize: '0.84rem', fontFamily: FONT }}>{label}</span>
      <input
        type={type}
        value={value}
        onChange={e => setValue(e.target.value)}
        style={{ ...numInput, width: '130px' }}
      />
      <SaveButton saving={saving} saved={saved} onClick={handleSave} />
      {err && <span style={errStyle}>{err}</span>}
    </div>
  );
}

// ── Site notice (text + toggle) ───────────────────────────────────────────────

function SiteNoticeRow({ initialText, initialActive }) {
  const [text,   setText]   = useState(initialText);
  const [active, setActive] = useState(initialActive);
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [err,    setErr]    = useState(null);

  const handleSave = async () => {
    setSaving(true); setErr(null); setSaved(false);
    try {
      await Promise.all([
        apiPut('/admin/site-settings/siteNotice',       { value: text }),
        apiPut('/admin/site-settings/siteNoticeActive', { value: String(active) }),
      ]);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setErr('Error al guardar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '10px' }}>
        <label style={labelStyle}>Texto del aviso</label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={3}
          placeholder="Ej: Registro abierto — próximo módulo comienza el lunes"
          style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.85rem', fontFamily: FONT, boxSizing: 'border-box', resize: 'vertical', outline: 'none' }}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.84rem', fontFamily: FONT, userSelect: 'none' }}>
          <div
            onClick={() => setActive(v => !v)}
            style={{
              width: '38px', height: '20px', borderRadius: '10px',
              background: active ? '#7D4E61' : '#ccc',
              position: 'relative', transition: 'background 0.2s', cursor: 'pointer', flexShrink: 0,
            }}
          >
            <div style={{
              width: '14px', height: '14px', borderRadius: '50%', background: '#fff',
              position: 'absolute', top: '3px',
              left: active ? '21px' : '3px',
              transition: 'left 0.2s',
            }} />
          </div>
          Mostrar aviso en el sitio público
        </label>
        <SaveButton saving={saving} saved={saved} onClick={handleSave} wide />
        {err && <span style={errStyle}>{err}</span>}
      </div>
    </div>
  );
}

// ── Activity Log ─────────────────────────────────────────────────────────────

function ActivityLog() {
  const [entries,  setEntries]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    apiFetch('/admin/activity-log')
      .then(data => setEntries(Array.isArray(data) ? data : []))
      .catch(() => setError('Error al cargar el registro. Asegúrate de que la tabla AdminLog existe en DynamoDB.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const fmtTs = ts => ts
    ? new Date(ts).toLocaleString('es-GT', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <p style={{ margin: 0, fontSize: '0.8rem', color: '#999', fontFamily: FONT }}>
          Últimas 100 acciones de administración.
        </p>
        <button
          onClick={load}
          disabled={loading}
          style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '4px', padding: '5px 12px', cursor: loading ? 'default' : 'pointer', fontSize: '0.75rem', fontFamily: FONT, opacity: loading ? 0.6 : 1 }}
        >
          {loading ? 'Cargando…' : 'Actualizar'}
        </button>
      </div>

      {error && <p style={{ color: '#c62828', fontSize: '0.82rem', fontFamily: FONT }}>{error}</p>}

      {!loading && !error && entries.length === 0 && (
        <p style={{ color: '#bbb', fontSize: '0.82rem', fontFamily: FONT }}>
          No hay entradas aún. Las acciones del panel (guardar cursos, editar precios, etc.) aparecerán aquí.
        </p>
      )}

      {entries.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', fontFamily: FONT }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                <th style={thStyle}>Fecha</th>
                <th style={thStyle}>Usuario</th>
                <th style={thStyle}>Acción</th>
                <th style={thStyle}>Valor anterior</th>
                <th style={thStyle}>Nuevo valor</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => (
                <tr key={e.actionId || i} style={{ borderBottom: '1px solid #f5f5f5', background: i % 2 === 0 ? '#fafafa' : '#fff' }}>
                  <td style={tdStyle}>{fmtTs(e.timestamp)}</td>
                  <td style={tdStyle}>{e.staffEmail || '—'}</td>
                  <td style={tdStyle}>{e.action || '—'}</td>
                  <td style={{ ...tdStyle, color: '#c62828', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.oldValue ?? '—'}</td>
                  <td style={{ ...tdStyle, color: '#2e7d32', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.newValue ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Shared primitives ─────────────────────────────────────────────────────────

function Section({ title, children }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '18px 20px', marginBottom: '18px' }}>
      <h2 style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '14px', letterSpacing: '0.5px', textTransform: 'uppercase', color: '#666', fontFamily: FONT }}>{title}</h2>
      {children}
    </div>
  );
}

function SaveButton({ saving, saved, onClick, wide }) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      style={{
        background: saved ? '#2e7d32' : '#111',
        color: '#fff', border: 'none', borderRadius: '4px',
        padding: wide ? '8px 18px' : '7px 14px',
        cursor: saving ? 'default' : 'pointer',
        fontSize: '0.78rem', fontFamily: FONT, fontWeight: 600,
        whiteSpace: 'nowrap', opacity: saving ? 0.6 : 1,
        minWidth: '80px',
        transition: 'background 0.3s',
      }}
    >
      {saving ? '…' : saved ? '✓ Guardado' : 'Guardar'}
    </button>
  );
}

const FONT         = "'Montserrat', sans-serif";
const pageTitleStyle = { fontSize: '1.5rem', fontWeight: 700, marginBottom: '20px', letterSpacing: '1px', fontFamily: FONT };
const labelStyle   = { display: 'block', fontSize: '0.7rem', fontWeight: 700, marginBottom: '5px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: FONT };
const rowStyle     = { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid #f5f5f5', flexWrap: 'wrap' };
const numInput     = { width: '90px', padding: '6px 8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.85rem', fontFamily: FONT, outline: 'none', textAlign: 'right' };
const errStyle     = { fontSize: '0.72rem', color: '#c62828', fontFamily: FONT };
const emptyStyle   = { fontSize: '0.82rem', color: '#bbb', fontFamily: FONT, margin: 0 };
const thStyle      = { textAlign: 'left', padding: '6px 10px', fontWeight: 700, color: '#666', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' };
const tdStyle      = { padding: '7px 10px', color: '#444', verticalAlign: 'top' };
