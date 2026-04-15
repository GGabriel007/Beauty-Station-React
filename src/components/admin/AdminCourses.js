// src/components/admin/AdminCourses.js
// 2.3 + 3.4 — Course cards with inline edit forms and direct S3 image upload.

import React, { useState, useEffect, useRef } from 'react';
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
  };

  const handleClose = () => setEditingId(null);

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
                course={courses.find(c => c.courseId === course.courseId)}
                onSave={updates => handleSaved(course.courseId, updates)}
                onClose={handleClose}
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

function CourseEditForm({ course, onSave, onClose }) {
  const [form, setForm] = useState({
    description:     course.description     || '',
    price:           course.price           ?? '',
    enrollmentFee:   course.enrollmentFee   ?? '',
    dates:           course.dates           || '',
    scheduleOptions: Array.isArray(course.scheduleOptions) ? [...course.scheduleOptions] : [],
    imageUrls:       Array.isArray(course.imageUrls)       ? [...course.imageUrls]       : [],
    promoText:       course.promoText       || '',
    promoActive:     !!course.promoActive,
    isVisible:       course.isVisible !== false,
  });

  // Tracks the persisted state shown in the footer; updates after each successful save
  const [savedMeta, setSavedMeta] = useState({
    lastUpdatedAt: course.lastUpdatedAt  || null,
    lastUpdatedBy: course.lastUpdatedBy  || null,
  });

  const [saving,    setSaving]    = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [justSaved, setJustSaved] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  // Schedule helpers
  const addSchedule    = ()      => set('scheduleOptions', [...form.scheduleOptions, '']);
  const removeSchedule = i       => set('scheduleOptions', form.scheduleOptions.filter((_, idx) => idx !== i));
  const updateSchedule = (i, v) => set('scheduleOptions', form.scheduleOptions.map((s, idx) => idx === i ? v : s));

  // Image URL helpers
  const addImageUrl    = ()      => set('imageUrls', [...form.imageUrls, '']);
  const removeImageUrl = i       => set('imageUrls', form.imageUrls.filter((_, idx) => idx !== i));
  const updateImageUrl = (i, v) => set('imageUrls', form.imageUrls.map((u, idx) => idx === i ? v : u));

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    setJustSaved(false);
    try {
      const payload = {
        ...form,
        price:         form.price         !== '' ? Number(form.price)         : null,
        enrollmentFee: form.enrollmentFee !== '' ? Number(form.enrollmentFee) : null,
        // Strip empty strings from arrays
        scheduleOptions: form.scheduleOptions.filter(s => s.trim() !== ''),
        imageUrls:       form.imageUrls.filter(u => u.trim() !== ''),
      };
      await apiPut(`/admin/courses/${course.courseId}`, payload);

      const nowTs = Date.now();
      setSavedMeta({ lastUpdatedAt: nowTs, lastUpdatedBy: null }); // Lambda sets exact value; we show local approximation
      setJustSaved(true);
      onSave({ ...payload, lastUpdatedAt: nowTs });
      setTimeout(() => setJustSaved(false), 4000);
    } catch {
      setSaveError('Error al guardar. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const fmtDate = ts => ts
    ? new Date(ts).toLocaleDateString('es-GT', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div style={{ background: '#fff', border: '2px solid #111', borderRadius: '8px', padding: '22px 24px' }}>

      {/* Header: course name (read-only) + close */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', gap: '12px' }}>
        <div>
          <p style={{ margin: '0 0 2px', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#aaa', fontFamily: FONT }}>Editando curso</p>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, fontFamily: FONT }}>{course.courseName}</h3>
        </div>
        <button onClick={onClose} style={ghostBtn}>Cerrar</button>
      </div>

      {/* ── Pricing ── */}
      <SectionDivider label="Precios" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
        <Field label="Precio (Q)">
          <input type="number" value={form.price} onChange={e => set('price', e.target.value)} style={inputStyle} min="0" placeholder="2200" />
        </Field>
        <Field label="Cuota de Inscripción (Q)">
          <input type="number" value={form.enrollmentFee} onChange={e => set('enrollmentFee', e.target.value)} style={inputStyle} min="0" placeholder="Usa precio global si vacío" />
        </Field>
      </div>

      {/* ── Content ── */}
      <SectionDivider label="Contenido" />

      <Field label="Descripción">
        <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={4} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Descripción detallada del módulo…" />
      </Field>

      <Field label="Fechas del Curso">
        <input value={form.dates} onChange={e => set('dates', e.target.value)} style={inputStyle} placeholder="Ej: 27 DE ENERO – 17 DE FEBRERO" />
      </Field>

      {/* ── Schedule options ── */}
      <SectionDivider label="Horarios" />
      <Field label="Opciones de Horario">
        {form.scheduleOptions.map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
            <input
              value={s}
              onChange={e => updateSchedule(i, e.target.value)}
              style={{ ...inputStyle, flex: 1 }}
              placeholder="Ej: Lunes y miércoles 2PM a 4PM"
            />
            <button
              onClick={() => removeSchedule(i)}
              title="Eliminar horario"
              style={removeBtn}
            >✕</button>
          </div>
        ))}
        <button onClick={addSchedule} style={{ ...ghostBtn, marginTop: '4px', fontSize: '0.78rem' }}>+ Agregar horario</button>
      </Field>

      {/* ── Image URLs ── */}
      <SectionDivider label="Imágenes" />
      <Field label="Imágenes del Curso">
        <p style={{ margin: '0 0 8px', fontSize: '0.75rem', color: '#999', fontFamily: FONT }}>
          Sube una imagen desde tu computadora o pega una URL manualmente. Las imágenes se muestran en el orden ingresado.
        </p>
        {form.imageUrls.length === 0 && (
          <p style={{ fontSize: '0.8rem', color: '#ccc', fontStyle: 'italic', margin: '0 0 8px', fontFamily: FONT }}>
            Sin imágenes — se usarán las imágenes predeterminadas del curso.
          </p>
        )}
        {form.imageUrls.map((url, i) => (
          <ImageUploadRow
            key={i}
            index={i}
            url={url}
            courseId={course.courseId}
            onUpdate={v => updateImageUrl(i, v)}
            onRemove={() => removeImageUrl(i)}
          />
        ))}
        <button onClick={addImageUrl} style={{ ...ghostBtn, marginTop: '4px', fontSize: '0.78rem' }}>+ Agregar imagen</button>
      </Field>

      {/* ── Promo & visibility ── */}
      <SectionDivider label="Promoción y Visibilidad" />

      <Field label="Texto Promocional">
        <input
          value={form.promoText}
          onChange={e => set('promoText', e.target.value)}
          style={inputStyle}
          placeholder="Ej: ¡Inscripción gratis hasta el 15 de julio!"
        />
      </Field>

      <div style={{ display: 'flex', gap: '28px', marginBottom: '18px', flexWrap: 'wrap' }}>
        <Toggle label="Promo activa"        checked={form.promoActive} onChange={v => set('promoActive', v)} />
        <Toggle label="Visible en el sitio" checked={form.isVisible}   onChange={v => set('isVisible',  v)} />
      </div>

      {/* ── Save / error ── */}
      {saveError && (
        <p style={{ color: '#c62828', fontSize: '0.82rem', marginBottom: '12px', fontFamily: FONT }}>
          {saveError}
        </p>
      )}

      {justSaved && (
        <p style={{ color: '#2e7d32', fontSize: '0.82rem', marginBottom: '12px', fontFamily: FONT, fontWeight: 600 }}>
          Cambios guardados correctamente.
        </p>
      )}

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{ ...primaryBtn, opacity: saving ? 0.6 : 1, minWidth: '140px' }}
        >
          {saving ? 'Guardando…' : 'Guardar Cambios'}
        </button>
        <button onClick={onClose} style={ghostBtn}>Cerrar</button>
      </div>

      {/* ── Last saved metadata ── */}
      <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '12px' }}>
        {savedMeta.lastUpdatedAt ? (
          <p style={{ margin: 0, fontSize: '0.72rem', color: '#bbb', fontFamily: FONT }}>
            Último guardado: {fmtDate(savedMeta.lastUpdatedAt)}
            {savedMeta.lastUpdatedBy && ` · por ${savedMeta.lastUpdatedBy}`}
          </p>
        ) : (
          <p style={{ margin: 0, fontSize: '0.72rem', color: '#ddd', fontFamily: FONT, fontStyle: 'italic' }}>
            Este curso aún no ha sido editado desde el panel de administración.
          </p>
        )}
      </div>
    </div>
  );
}

// ── Image upload row (3.4) ───────────────────────────────────────────────────
// Wraps a URL text input with a "Subir" button that:
//   1. Opens a file picker (images only)
//   2. Calls GET /admin/presigned-upload-url to get a short-lived S3 PUT URL
//   3. PUTs the file directly to S3 from the browser (no server memory used)
//   4. Auto-fills the URL input with the permanent public S3 URL

function ImageUploadRow({ index, url, courseId, onUpdate, onRemove }) {
  const fileInputRef = useRef(null);
  const [uploading,   setUploading]   = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = ''; // reset so the same file can be re-selected

    setUploading(true);
    setUploadError(null);
    try {
      // Step 1 — ask Lambda for a presigned PUT URL
      const op = get({
        apiName: 'checkoutApi',
        path: '/admin/presigned-upload-url',
        options: {
          queryParams: {
            fileName:    file.name,
            contentType: file.type,
            courseId:    courseId || 'general',
          },
        },
      });
      const { body } = await op.response;
      const { uploadUrl, publicUrl } = await body.json();

      // Step 2 — upload directly to S3 using the presigned URL
      const s3Res = await fetch(uploadUrl, {
        method:  'PUT',
        body:    file,
        headers: { 'Content-Type': file.type },
      });
      if (!s3Res.ok) throw new Error(`S3 responded with ${s3Res.status}`);

      // Step 3 — auto-fill the URL field
      onUpdate(publicUrl);
    } catch (err) {
      console.error('Image upload failed:', err);
      setUploadError('Error al subir. Verifica que el bucket beauty-station-images existe y tiene CORS habilitado.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: uploadError ? '2px' : '6px', alignItems: 'center' }}>
        <span style={{ fontSize: '0.7rem', color: '#bbb', fontFamily: FONT, minWidth: '18px', textAlign: 'right' }}>
          {index + 1}.
        </span>

        {uploading ? (
          <div style={{ flex: 1, padding: '7px 10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.78rem', fontFamily: FONT, color: '#aaa', background: '#fafafa' }}>
            Subiendo imagen…
          </div>
        ) : (
          <input
            value={url}
            onChange={e => onUpdate(e.target.value)}
            style={{ ...inputStyle, flex: 1, fontFamily: 'monospace', fontSize: '0.78rem' }}
            placeholder="https://… o haz clic en Subir"
          />
        )}

        {/* Hidden native file picker — accepts images only */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {/* Upload trigger */}
        <button
          onClick={() => { setUploadError(null); fileInputRef.current?.click(); }}
          disabled={uploading}
          title="Subir imagen desde tu computadora"
          style={{
            background: '#fff', border: '1px solid #7D4E61', color: '#7D4E61',
            borderRadius: '4px', padding: '0 12px', cursor: uploading ? 'default' : 'pointer',
            fontSize: '0.75rem', fontFamily: FONT, fontWeight: 600,
            height: '36px', flexShrink: 0, opacity: uploading ? 0.5 : 1,
          }}
        >
          {uploading ? '…' : 'Subir'}
        </button>

        <button onClick={onRemove} title="Eliminar imagen" style={removeBtn} disabled={uploading}>✕</button>
      </div>

      {/* Inline preview of uploaded image */}
      {!uploading && url && url.startsWith('http') && (
        <div style={{ marginLeft: '28px', marginBottom: '6px' }}>
          <img
            src={url}
            alt={`Imagen ${index + 1}`}
            style={{ height: '60px', borderRadius: '4px', border: '1px solid #eee', objectFit: 'cover' }}
            onError={e => { e.target.style.display = 'none'; }}
          />
        </div>
      )}

      {uploadError && (
        <p style={{ margin: '0 0 6px 28px', fontSize: '0.7rem', color: '#c62828', fontFamily: FONT }}>
          {uploadError}
        </p>
      )}
    </div>
  );
}

// ── Shared primitives ───────────────────────────────────────────────────────

function SectionDivider({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', marginTop: '4px' }}>
      <span style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#aaa', fontFamily: FONT, whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ flex: 1, height: '1px', background: '#f0f0f0' }} />
    </div>
  );
}

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
    <span style={{ background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '4px', padding: '2px 7px', fontSize: '0.68rem', color, fontFamily: FONT, fontWeight: 600 }}>
      {text}
    </span>
  );
}

const FONT       = "'Montserrat', sans-serif";
const inputStyle = { width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.85rem', fontFamily: FONT, boxSizing: 'border-box', outline: 'none' };
const labelStyle = { display: 'block', fontSize: '0.7rem', fontWeight: 700, marginBottom: '5px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: FONT };
const primaryBtn = { background: '#111', color: '#fff', border: 'none', borderRadius: '4px', padding: '9px 18px', cursor: 'pointer', fontSize: '0.82rem', fontFamily: FONT, fontWeight: 600 };
const ghostBtn   = { background: '#fff', color: '#333', border: '1px solid #ddd', borderRadius: '4px', padding: '9px 14px', cursor: 'pointer', fontSize: '0.82rem', fontFamily: FONT };
const removeBtn  = { background: '#fff', border: '1px solid #e0e0e0', borderRadius: '4px', padding: '0 10px', cursor: 'pointer', color: '#c62828', fontSize: '1rem', fontFamily: FONT, height: '36px', flexShrink: 0 };
const pageTitleStyle = { fontSize: '1.5rem', fontWeight: 700, marginBottom: '20px', letterSpacing: '1px', fontFamily: FONT };
