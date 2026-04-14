// src/components/admin/AdminCourses.js
// 2.3 — Course cards with inline edit forms.

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

export default function AdminCourses() {
  const [courses,   setCourses]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    apiFetch('/admin/courses')
      .then(data => setCourses(Array.isArray(data) ? data : []))
      .catch(() => setError('Error al cargar los cursos.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSaved = (courseId, updates) => {
    setCourses(prev => prev.map(c => c.courseId === courseId ? { ...c, ...updates } : c));
    setEditingId(null);
  };

  if (loading) return <p style={{ color: '#aaa', fontFamily: FONT }}>Cargando cursos…</p>;
  if (error)   return <p style={{ color: '#c62828', fontFamily: FONT }}>{error}</p>;

  return (
    <div>
      <h1 style={pageTitleStyle}>Cursos ({courses.length})</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {courses.map(course =>
          editingId === course.courseId
            ? <CourseEditForm
                key={course.courseId}
                course={course}
                onSave={updates => handleSaved(course.courseId, updates)}
                onCancel={() => setEditingId(null)}
              />
            : <CourseCard
                key={course.courseId}
                course={course}
                onEdit={() => setEditingId(course.courseId)}
              />
        )}
      </div>
    </div>
  );
}

// ── Course summary card ─────────────────────────────────────────────────────

function CourseCard({ course, onEdit }) {
  const fmtDate = ts => ts
    ? new Date(ts).toLocaleDateString('es-GT', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;
  return (
    <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
          <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, fontFamily: FONT }}>{course.courseName}</h3>
          {!course.isVisible && <Badge text="Oculto" />}
          {course.promoActive && <Badge text="Promo activa" color="#e65100" />}
        </div>
        <p style={{ margin: '0 0 4px', fontSize: '0.8rem', color: '#555', fontFamily: FONT }}>
          Q{course.price ?? '—'}
          {course.enrollmentFee != null && ` · Inscripción Q${course.enrollmentFee}`}
        </p>
        {course.lastUpdatedAt && (
          <p style={{ margin: 0, fontSize: '0.7rem', color: '#bbb', fontFamily: FONT }}>
            Actualizado: {fmtDate(course.lastUpdatedAt)} · {course.lastUpdatedBy || '?'}
          </p>
        )}
      </div>
      <button onClick={onEdit} style={primaryBtn}>Editar</button>
    </div>
  );
}

// ── Inline edit form ────────────────────────────────────────────────────────

function CourseEditForm({ course, onSave, onCancel }) {
  const [form, setForm] = useState({
    description:     course.description     || '',
    price:           course.price           ?? '',
    enrollmentFee:   course.enrollmentFee   ?? '',
    dates:           course.dates           || '',
    scheduleOptions: Array.isArray(course.scheduleOptions) ? [...course.scheduleOptions] : [],
    promoText:       course.promoText       || '',
    promoActive:     !!course.promoActive,
    isVisible:       course.isVisible !== false,
  });
  const [saving,    setSaving]    = useState(false);
  const [saveError, setSaveError] = useState(null);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  // Schedule helpers
  const addSchedule    = ()      => set('scheduleOptions', [...form.scheduleOptions, '']);
  const removeSchedule = i       => set('scheduleOptions', form.scheduleOptions.filter((_, idx) => idx !== i));
  const updateSchedule = (i, v) => set('scheduleOptions', form.scheduleOptions.map((s, idx) => idx === i ? v : s));

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const payload = {
        ...form,
        price:         Number(form.price),
        enrollmentFee: Number(form.enrollmentFee),
      };
      await apiPut(`/admin/courses/${course.courseId}`, payload);
      onSave(payload);
    } catch {
      setSaveError('Error al guardar. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ background: '#fff', border: '2px solid #111', borderRadius: '8px', padding: '22px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, fontFamily: FONT }}>Editando: {course.courseName}</h3>
        <button onClick={onCancel} style={ghostBtn}>Cancelar</button>
      </div>

      {/* Price row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
        <Field label="Precio (Q)">
          <input type="number" value={form.price} onChange={e => set('price', e.target.value)} style={inputStyle} min="0" />
        </Field>
        <Field label="Cuota de Inscripción (Q)">
          <input type="number" value={form.enrollmentFee} onChange={e => set('enrollmentFee', e.target.value)} style={inputStyle} min="0" />
        </Field>
      </div>

      <Field label="Fechas del Curso">
        <input value={form.dates} onChange={e => set('dates', e.target.value)} style={inputStyle} placeholder="Ej: 27 DE ENERO - 17 DE FEBRERO" />
      </Field>

      <Field label="Descripción">
        <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
      </Field>

      <Field label="Opciones de Horario">
        {form.scheduleOptions.map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
            <input value={s} onChange={e => updateSchedule(i, e.target.value)} style={{ ...inputStyle, flex: 1 }} />
            <button onClick={() => removeSchedule(i)} style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '4px', padding: '0 10px', cursor: 'pointer', color: '#c62828', fontSize: '1rem', fontFamily: FONT }}>✕</button>
          </div>
        ))}
        <button onClick={addSchedule} style={{ ...ghostBtn, marginTop: '4px', fontSize: '0.78rem' }}>+ Agregar horario</button>
      </Field>

      <Field label="Texto Promocional">
        <input value={form.promoText} onChange={e => set('promoText', e.target.value)} style={inputStyle} placeholder="Ej: *Inscripción gratis hasta el 15 de julio" />
      </Field>

      <div style={{ display: 'flex', gap: '28px', marginBottom: '18px', flexWrap: 'wrap' }}>
        <Toggle label="Promo activa"       checked={form.promoActive} onChange={v => set('promoActive', v)} />
        <Toggle label="Visible en el sitio" checked={form.isVisible}  onChange={v => set('isVisible',  v)} />
      </div>

      {saveError && <p style={{ color: '#c62828', fontSize: '0.82rem', marginBottom: '12px', fontFamily: FONT }}>{saveError}</p>}

      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={handleSave} disabled={saving} style={{ ...primaryBtn, opacity: saving ? 0.6 : 1 }}>
          {saving ? 'Guardando…' : 'Guardar Cambios'}
        </button>
        <button onClick={onCancel} style={ghostBtn}>Cancelar</button>
      </div>
    </div>
  );
}

// ── Shared primitives ───────────────────────────────────────────────────────

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.84rem', fontFamily: FONT }}>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: '38px', height: '20px', borderRadius: '10px',
          background: checked ? '#111' : '#ccc',
          position: 'relative', transition: 'background 0.2s', cursor: 'pointer', flexShrink: 0,
        }}
      >
        <div style={{
          width: '14px', height: '14px', borderRadius: '50%', background: '#fff',
          position: 'absolute', top: '3px',
          left: checked ? '21px' : '3px',
          transition: 'left 0.2s',
        }} />
      </div>
      {label}
    </label>
  );
}

function Badge({ text, color = '#555' }) {
  return (
    <span style={{ background: '#f5f5f5', border: `1px solid #ddd`, borderRadius: '4px', padding: '2px 7px', fontSize: '0.68rem', color, fontFamily: FONT, fontWeight: 600 }}>{text}</span>
  );
}

const FONT       = "'Montserrat', sans-serif";
const inputStyle = { width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.85rem', fontFamily: FONT, boxSizing: 'border-box', outline: 'none' };
const labelStyle = { display: 'block', fontSize: '0.7rem', fontWeight: 700, marginBottom: '5px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: FONT };
const primaryBtn = { background: '#111', color: '#fff', border: 'none', borderRadius: '4px', padding: '9px 18px', cursor: 'pointer', fontSize: '0.82rem', fontFamily: FONT, fontWeight: 600 };
const ghostBtn   = { background: '#fff', color: '#333', border: '1px solid #ddd', borderRadius: '4px', padding: '9px 14px', cursor: 'pointer', fontSize: '0.82rem', fontFamily: FONT };
const pageTitleStyle = { fontSize: '1.5rem', fontWeight: 700, marginBottom: '20px', letterSpacing: '1px', fontFamily: FONT };
