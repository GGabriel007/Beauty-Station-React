// src/components/admin/AdminSettings.js
// 2.7 — Three sections: Inventory (kit + per-course seats),
//        Global Pricing (enrollment fee, kit price),
//        Site Notice (banner text + visibility toggle).

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
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.84rem', fontFamily: FONT }}>
          <input
            type="checkbox"
            checked={active}
            onChange={e => setActive(e.target.checked)}
            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
          />
          Mostrar aviso en el sitio público
        </label>
        <SaveButton saving={saving} saved={saved} onClick={handleSave} wide />
        {err && <span style={errStyle}>{err}</span>}
      </div>
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
