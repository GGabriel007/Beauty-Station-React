// src/components/admin/AdminOnlineCourse.js
// 2.4 — Online course lesson manager: reorder, edit titles/S3 keys, add, delete.

import React, { useState, useEffect } from 'react';
import { get, put } from 'aws-amplify/api';

const COURSE_ID = 'curso-en-linea';

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

export default function AdminOnlineCourse() {
  const [lessons,       setLessons]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [saving,        setSaving]        = useState(false);
  const [error,         setError]         = useState(null);
  const [successMsg,    setSuccessMsg]    = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // index pending confirmation

  useEffect(() => {
    apiFetch(`/admin/lessons/${COURSE_ID}`)
      .then(data => setLessons(data.lessons || []))
      .catch(() => setError('Error al cargar las lecciones.'))
      .finally(() => setLoading(false));
  }, []);

  const update = (i, key, val) =>
    setLessons(prev => prev.map((l, idx) => idx === i ? { ...l, [key]: val } : l));

  const moveUp = i => {
    if (i === 0) return;
    setLessons(prev => {
      const next = [...prev];
      [next[i - 1], next[i]] = [next[i], next[i - 1]];
      return next;
    });
  };

  const moveDown = i => {
    setLessons(prev => {
      if (i === prev.length - 1) return prev;
      const next = [...prev];
      [next[i], next[i + 1]] = [next[i + 1], next[i]];
      return next;
    });
  };

  const addLesson = () => {
    const newId = `lesson-${Date.now()}`;
    setLessons(prev => [...prev, { id: newId, title: '', description: '', s3Key: '', duration: '00:00' }]);
  };

  const confirmDelete = i => setDeleteConfirm(i);
  const cancelDelete  = () => setDeleteConfirm(null);
  const doDelete      = i => {
    setLessons(prev => prev.filter((_, idx) => idx !== i));
    setDeleteConfirm(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await apiPut(`/admin/lessons/${COURSE_ID}`, { lessons });
      setSuccessMsg('Lecciones guardadas exitosamente.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch {
      setError('Error al guardar las lecciones.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p style={{ color: '#aaa', fontFamily: FONT }}>Cargando lecciones…</p>;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <h1 style={pageTitleStyle}>Curso en Línea — Lecciones</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={addLesson} style={ghostBtn}>+ Nueva Lección</button>
          <button onClick={handleSave} disabled={saving} style={{ ...primaryBtn, opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Guardando…' : 'Guardar Cambios'}
          </button>
        </div>
      </div>

      {error      && <p style={{ color: '#c62828', marginBottom: '12px', fontFamily: FONT }}>{error}</p>}
      {successMsg && <p style={{ color: '#2e7d32', marginBottom: '12px', fontFamily: FONT }}>{successMsg}</p>}

      {lessons.length === 0 && (
        <p style={{ color: '#bbb', fontFamily: FONT }}>No hay lecciones. Agrega una con el botón de arriba.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {lessons.map((lesson, i) => (
          <div key={lesson.id} style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '16px 18px' }}>
            {/* Row controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#bbb', fontFamily: FONT, width: '22px' }}>#{i + 1}</span>
              <button onClick={() => moveUp(i)}   disabled={i === 0}                  style={arrowBtn} title="Subir">▲</button>
              <button onClick={() => moveDown(i)} disabled={i === lessons.length - 1} style={arrowBtn} title="Bajar">▼</button>
              <div style={{ flex: 1 }} />
              {deleteConfirm === i ? (
                <span style={{ fontSize: '0.8rem', fontFamily: FONT }}>
                  <span style={{ color: '#c62828' }}>¿Eliminar esta lección?</span>{' '}
                  <button onClick={() => doDelete(i)}  style={{ ...inlineBtn, color: '#c62828', fontWeight: 700 }}>Sí</button>{' '}
                  <button onClick={cancelDelete}        style={{ ...inlineBtn, color: '#666' }}>No</button>
                </span>
              ) : (
                <button onClick={() => confirmDelete(i)} style={{ background: 'none', border: '1px solid #c62828', color: '#c62828', borderRadius: '4px', padding: '4px 10px', cursor: 'pointer', fontSize: '0.75rem', fontFamily: FONT }}>Eliminar</button>
              )}
            </div>

            {/* Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Título</label>
                <input value={lesson.title} onChange={e => update(i, 'title', e.target.value)} style={inputStyle} placeholder="Ej: Lección 1: Introducción" />
              </div>
              <div>
                <label style={labelStyle}>Clave S3 (nombre del archivo de video)</label>
                <input value={lesson.s3Key} onChange={e => update(i, 's3Key', e.target.value)} style={inputStyle} placeholder="Ej: lessons/intro.mp4" />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Descripción</label>
                <textarea value={lesson.description} onChange={e => update(i, 'description', e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {lessons.length > 0 && (
        <div style={{ textAlign: 'right', marginTop: '18px' }}>
          <button onClick={handleSave} disabled={saving} style={{ ...primaryBtn, opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Guardando…' : 'Guardar Cambios'}
          </button>
        </div>
      )}
    </div>
  );
}

const FONT         = "'Montserrat', sans-serif";
const inputStyle   = { width: '100%', padding: '7px 10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.85rem', fontFamily: FONT, boxSizing: 'border-box', outline: 'none' };
const labelStyle   = { display: 'block', fontSize: '0.7rem', fontWeight: 700, marginBottom: '4px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: FONT };
const primaryBtn   = { background: '#111', color: '#fff', border: 'none', borderRadius: '4px', padding: '9px 18px', cursor: 'pointer', fontSize: '0.82rem', fontFamily: FONT, fontWeight: 600 };
const ghostBtn     = { background: '#fff', color: '#333', border: '1px solid #ddd', borderRadius: '4px', padding: '9px 14px', cursor: 'pointer', fontSize: '0.82rem', fontFamily: FONT };
const arrowBtn     = { background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '0.72rem', fontFamily: FONT };
const inlineBtn    = { background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT, fontSize: '0.8rem', textDecoration: 'underline', padding: 0 };
const pageTitleStyle = { fontSize: '1.5rem', fontWeight: 700, margin: 0, letterSpacing: '1px', fontFamily: FONT };
