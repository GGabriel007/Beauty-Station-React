// src/components/admin/AdminCourses.js
import React, { useState, useEffect, useRef } from 'react';
import '../../styles/classes.css';
import '../../styles/admin-courses.css';
import { get, put } from 'aws-amplify/api';
import SecurityPinModal from './SecurityPinModal';
import { coursesInfo as hardcodedCourses } from '../../config/courseData';

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

const slugify = (s) =>
  s.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export default function AdminCourses() {
  const [courses,        setCourses]        = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [activeTab,      setActiveTab]      = useState('hair');
  const [editingId,      setEditingId]      = useState(null);
  const [isCreating,     setIsCreating]     = useState(false);

  useEffect(() => {
    apiFetch('/admin/courses')
      .then(dbData => {
        const dbMap = {};
        (Array.isArray(dbData) ? dbData : []).forEach(c => { dbMap[c.courseId] = c; });

        // Merge hardcoded base + DB overrides so all courses appear even before admin edits
        const merged = [];
        for (const [id, hc] of Object.entries(hardcodedCourses)) {
          if (dbMap[id]) {
            merged.push({ ...hc, ...dbMap[id], courseId: id });
          } else {
            merged.push({ ...hc, courseId: id });
          }
        }
        // DB-only courses (admin-created, not in hardcoded)
        for (const [id, dc] of Object.entries(dbMap)) {
          if (!hardcodedCourses[id]) merged.push(dc);
        }

        setCourses(merged);
      })
      .catch(() => setError('Error al cargar los cursos.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSaved = (courseId, updates) => {
    setCourses(prev => prev.map(c => c.courseId === courseId ? { ...c, ...updates } : c));
  };

  const handleDeleted = (courseId) => {
    setCourses(prev => prev.map(c => c.courseId === courseId ? { ...c, deleted: true } : c));
    if (editingId === courseId) setEditingId(null);
  };

  const handleCreated = (newCourse) => {
    setCourses(prev => [...prev, newCourse]);
    setIsCreating(false);
    setEditingId(newCourse.courseId);
  };

  const visibleCourses = courses.filter(c => !c.deleted);
  const tabCourses     = visibleCourses
    .filter(c => c.category === activeTab)
    .sort((a, b) => (a.cardOrder ?? 99) - (b.cardOrder ?? 99));

  const existingIds = courses.map(c => c.courseId);

  if (loading) return <p className="ac-status-text">Cargando cursos…</p>;
  if (error)   return <p className="ac-status-text ac-status-error">{error}</p>;

  return (
    <div>
      <h1 className="admin-page-title">Cursos</h1>

      {/* ── Category tabs ── */}
      <div className="ac-tabs">
        <button
          className={`ac-tab${activeTab === 'hair' ? ' ac-tab--active' : ''}`}
          onClick={() => { setActiveTab('hair'); setEditingId(null); setIsCreating(false); }}
        >
          Peinado
        </button>
        <button
          className={`ac-tab${activeTab === 'makeup' ? ' ac-tab--active' : ''}`}
          onClick={() => { setActiveTab('makeup'); setEditingId(null); setIsCreating(false); }}
        >
          Maquillaje
        </button>
      </div>

      <div className="ac-list">
        {tabCourses.map(course =>
          editingId === course.courseId
            ? <CourseEditForm
                key={course.courseId}
                course={course}
                onSave={updates => handleSaved(course.courseId, updates)}
                onDelete={() => handleDeleted(course.courseId)}
                onClose={() => setEditingId(null)}
              />
            : <CourseCard
                key={course.courseId}
                course={course}
                onEdit={() => { setIsCreating(false); setEditingId(course.courseId); }}
                onDelete={() => handleDeleted(course.courseId)}
              />
        )}

        {tabCourses.length === 0 && !isCreating && (
          <p className="ac-empty-text">No hay cursos en esta categoría.</p>
        )}

        {/* ── Add course ── */}
        {isCreating
          ? <CourseCreateForm
              category={activeTab}
              existingIds={existingIds}
              onSave={handleCreated}
              onClose={() => setIsCreating(false)}
            />
          : (
            <button
              className="ac-btn ac-btn--add ac-btn--add-course"
              onClick={() => { setEditingId(null); setIsCreating(true); }}
            >
              + Agregar Curso de {activeTab === 'hair' ? 'Peinado' : 'Maquillaje'}
            </button>
          )
        }
      </div>
    </div>
  );
}

// ── Course summary card ──────────────────────────────────────────────────────

function CourseCard({ course, onEdit, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting,      setDeleting]      = useState(false);
  const [deleteError,   setDeleteError]   = useState(null);
  const [pinOpen,       setPinOpen]       = useState(false);

  const fmtDate = ts => ts
    ? new Date(ts).toLocaleDateString('es-GT', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  const doDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await apiPut(`/admin/courses/${course.courseId}`, { deleted: true });
      onDelete();
    } catch {
      setDeleteError('Error al eliminar.');
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <>
      <div className="ac-card">
        <div className="ac-card-info">
          <div className="ac-card-title-row">
            <h3 className="ac-card-name">{course.courseName}</h3>
            <div className="ac-card-badges">
              {!course.isVisible  && <span className="ac-badge ac-badge--hidden">Oculto</span>}
              {course.promoActive && <span className="ac-badge ac-badge--promo">Promo activa</span>}
            </div>
          </div>
          <p className="ac-card-price">
            Q{course.price ?? '—'}
            {course.enrollmentFee != null && ` · Inscripción Q${course.enrollmentFee}`}
          </p>
          {course.lastUpdatedAt && (
            <p className="ac-card-meta">
              Actualizado: {fmtDate(course.lastUpdatedAt)} · {course.lastUpdatedBy || '?'}
            </p>
          )}
          {deleteError && <p className="ac-feedback ac-feedback--error" style={{ marginTop: 6 }}>{deleteError}</p>}
        </div>

        {confirmDelete ? (
          <div className="ac-delete-confirm">
            <span className="ac-delete-confirm-text">¿Eliminar este curso?</span>
            <button
              onClick={() => { setConfirmDelete(false); setPinOpen(true); }}
              disabled={deleting}
              className="ac-btn ac-btn--danger"
            >
              {deleting ? '…' : 'Sí, eliminar'}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              disabled={deleting}
              className="ac-btn ac-btn--ghost"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <div className="ac-card-actions">
            <button onClick={onEdit} className="ac-btn ac-btn--primary">Editar</button>
            <button onClick={() => setConfirmDelete(true)} className="ac-btn ac-btn--danger">Eliminar</button>
          </div>
        )}
      </div>

      <SecurityPinModal
        isOpen={pinOpen}
        onSuccess={() => { setPinOpen(false); doDelete(); }}
        onClose={() => setPinOpen(false)}
        message={`Estás a punto de eliminar "${course.courseName}". Ingresa el PIN de seguridad para confirmar.`}
      />
    </>
  );
}

// ── Minimal create form ──────────────────────────────────────────────────────

function CourseCreateForm({ category, existingIds, onSave, onClose }) {
  const [name,     setName]     = useState('');
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState(null);
  const [pinOpen,  setPinOpen]  = useState(false);

  const generateId = (rawName) => {
    const base = slugify(rawName);
    if (!base) return '';
    let id = base;
    let n  = 2;
    while (existingIds.includes(id)) id = `${base}-${n++}`;
    return id;
  };

  const courseId = generateId(name);

  const triggerCreate = () => {
    if (!name.trim()) { setError('El nombre del curso es requerido.'); return; }
    if (!courseId)    { setError('No se pudo generar el ID del curso.'); return; }
    setError(null);
    setPinOpen(true);
  };

  const handleCreate = async () => {
    setSaving(true);
    try {
      const newCourse = {
        courseId,
        courseName: name.trim(),
        category,
        isVisible: true,
        deleted: false,
        scheduleOptions: [],
        classes: [],
      };
      await apiPut(`/admin/courses/${courseId}`, newCourse);
      onSave(newCourse);
    } catch {
      setError('Error al crear el curso. Inténtalo de nuevo.');
      setSaving(false);
    }
  };

  return (
    <>
      <div className="ac-create-form">
        <div className="ac-form-header">
          <div>
            <p className="ac-form-header-label">Nuevo curso de {category === 'hair' ? 'Peinado' : 'Maquillaje'}</p>
            <h3 className="ac-form-header-title">Crear Curso</h3>
          </div>
          <button onClick={onClose} className="ac-btn ac-btn--ghost">✕ Cancelar</button>
        </div>

        <Field label="Nombre del Curso" hint="El nombre que verán los estudiantes en la página de cursos.">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="ac-input"
            placeholder="Ej: Ondas Perfectas"
            autoFocus
          />
        </Field>

        {name.trim() && (
          <p className="ac-hint-text">ID generado: <code style={{ background: '#f3f3f3', padding: '1px 6px' }}>{courseId}</code></p>
        )}

        {error && <p className="ac-feedback ac-feedback--error">⚠ {error}</p>}

        <div className="ac-save-row" style={{ marginTop: 8 }}>
          <button
            onClick={triggerCreate}
            disabled={saving || !name.trim()}
            className="ac-btn ac-btn--primary"
          >
            {saving ? 'Creando…' : 'Crear y Editar'}
          </button>
          <button onClick={onClose} className="ac-btn ac-btn--ghost">Cancelar</button>
        </div>
        <p className="ac-hint-text" style={{ marginTop: 8 }}>
          Después de crear, podrás agregar precio, imágenes, horarios y más desde la pantalla de edición.
        </p>
      </div>

      <SecurityPinModal
        isOpen={pinOpen}
        onSuccess={() => { setPinOpen(false); handleCreate(); }}
        onClose={() => setPinOpen(false)}
        message={`Estás a punto de crear el curso "${name.trim()}". Ingresa el PIN de seguridad para continuar.`}
      />
    </>
  );
}

// ── Inline edit form ─────────────────────────────────────────────────────────

function CourseEditForm({ course, onSave, onDelete, onClose }) {
  const formRef = useRef(null);

  useEffect(() => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const [form, setForm] = useState({
    description:       course.description       || '',
    price:             course.price             ?? '',
    enrollmentFee:     course.enrollmentFee     ?? '',
    dates:             course.dates             || '',
    instructor:        course.instructor        || '',
    level:             course.level             || '',
    materialsRequired: course.materialsRequired || '',
    installments:      course.installments      || '',
    promo:             course.promo             || '',
    scheduleOptions:   Array.isArray(course.scheduleOptions) ? [...course.scheduleOptions] : [],
    whatsappLinks:     Array.isArray(course.whatsappLinks) ? [...course.whatsappLinks] : course.scheduleOptions ? new Array(course.scheduleOptions.length).fill('') : [],
    imageUrls:         Array.isArray(course.imageUrls)       ? [...course.imageUrls]       : [],
    classes:           Array.isArray(course.classes)
                         ? course.classes.map(c => ({ ...c }))
                         : [],
    complexClasses:    Array.isArray(course.complexClasses)
                         ? course.complexClasses.map(cc => ({ ...cc, sessions: [...(cc.sessions || [])] }))
                         : [],
    promoActive:       !!course.promoActive,
    isVisible:         course.isVisible !== false,
    category:          course.category || 'hair',
  });

  const [savedMeta, setSavedMeta] = useState({
    lastUpdatedAt: course.lastUpdatedAt || null,
    lastUpdatedBy: course.lastUpdatedBy || null,
  });

  const [saving,         setSaving]         = useState(false);
  const [saveError,      setSaveError]      = useState(null);
  const [justSaved,      setJustSaved]      = useState(false);
  const [pinAction,      setPinAction]      = useState(null);
  const [pinMessage,     setPinMessage]     = useState('');
  const [confirmDelete,  setConfirmDelete]  = useState(false);
  const [deleting,       setDeleting]       = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const addSchedule    = ()      => setForm(f => ({ ...f, scheduleOptions: [...f.scheduleOptions, ''], whatsappLinks: [...f.whatsappLinks, ''] }));
  const removeSchedule = i       => setForm(f => ({ ...f, scheduleOptions: f.scheduleOptions.filter((_, idx) => idx !== i), whatsappLinks: f.whatsappLinks.filter((_, idx) => idx !== i) }));
  const updateSchedule = (i, v)  => set('scheduleOptions', form.scheduleOptions.map((s, idx) => idx === i ? v : s));
  const updateWhatsapp = (i, v)  => set('whatsappLinks', form.whatsappLinks.map((w, idx) => idx === i ? v : w));

  const addImageUrl    = ()      => set('imageUrls', [...form.imageUrls, '']);
  const removeImageUrl = i       => set('imageUrls', form.imageUrls.filter((_, idx) => idx !== i));
  const updateImageUrl = (i, v)  => set('imageUrls', form.imageUrls.map((u, idx) => idx === i ? v : u));

  const addClass         = ()            => set('classes', [...form.classes, { name: '', date: '', topics: '' }]);
  const addBreak         = ()            => set('classes', [...form.classes, { isBreak: true, text: '' }]);
  const removeClass      = i             => set('classes', form.classes.filter((_, idx) => idx !== i));
  const updateClass      = (i, field, v) => set('classes', form.classes.map((c, idx) => idx === i ? { ...c, [field]: v } : c));

  const addComplexClass      = ()         => set('complexClasses', [...form.complexClasses, { title: '', sessions: [''] }]);
  const removeComplexClass   = i          => set('complexClasses', form.complexClasses.filter((_, idx) => idx !== i));
  const updateComplexTitle   = (i, v)     => set('complexClasses', form.complexClasses.map((cc, idx) => idx === i ? { ...cc, title: v } : cc));
  const addComplexSession    = i          => set('complexClasses', form.complexClasses.map((cc, idx) => idx === i ? { ...cc, sessions: [...cc.sessions, ''] } : cc));
  const removeComplexSession = (i, si)    => set('complexClasses', form.complexClasses.map((cc, idx) => idx === i ? { ...cc, sessions: cc.sessions.filter((_, sidx) => sidx !== si) } : cc));
  const updateComplexSession = (i, si, v) => set('complexClasses', form.complexClasses.map((cc, idx) => idx === i ? { ...cc, sessions: cc.sessions.map((s, sidx) => sidx === si ? v : s) } : cc));

  const triggerSave = () => {
    const priceChanged = String(form.price ?? '') !== String(course.price ?? '');
    const feeChanged   = String(form.enrollmentFee ?? '') !== String(course.enrollmentFee ?? '');
    if (priceChanged || feeChanged) {
      setPinMessage('Estás modificando el precio de un curso. Ingresa el PIN de seguridad para continuar.');
      setPinAction(() => handleSave);
    } else {
      handleSave();
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    setJustSaved(false);
    try {
      const validScheduleIndices = form.scheduleOptions.map((s, i) => s.trim() !== '' ? i : -1).filter(i => i !== -1);
      const payload = {
        ...form,
        price:         form.price         !== '' ? Number(form.price)         : null,
        enrollmentFee: form.enrollmentFee !== '' ? Number(form.enrollmentFee) : null,
        scheduleOptions: validScheduleIndices.map(i => form.scheduleOptions[i].trim()),
        whatsappLinks:   validScheduleIndices.map(i => (form.whatsappLinks[i] || '').trim()),
        imageUrls:       form.imageUrls.filter(u => u.trim() !== ''),
        instructor:        form.instructor.trim()        || null,
        level:             form.level.trim()             || null,
        materialsRequired: form.materialsRequired.trim() || null,
        installments:      form.installments.trim()      || null,
        promo:             form.promo.trim()             || null,
        classes: form.classes
          .filter(c => c.isBreak ? c.text?.trim() : (c.name?.trim() || c.topics?.trim()))
          .map(c => c.isBreak
            ? { isBreak: true, text: c.text.trim() }
            : { name: c.name.trim(), date: c.date?.trim() || '', topics: c.topics?.trim() || '' }
          ),
        complexClasses: form.complexClasses
          .filter(cc => cc.title?.trim())
          .map(cc => ({ title: cc.title.trim(), sessions: (cc.sessions || []).filter(s => s.trim()) })),
      };
      await apiPut(`/admin/courses/${course.courseId}`, payload);
      const nowTs = Date.now();
      setSavedMeta({ lastUpdatedAt: nowTs, lastUpdatedBy: null });
      setJustSaved(true);
      onSave({ ...payload, lastUpdatedAt: nowTs });
      setTimeout(() => setJustSaved(false), 4000);
    } catch {
      setSaveError('Error al guardar. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const triggerDelete = () => {
    setConfirmDelete(false);
    setPinMessage(`Estás a punto de eliminar "${course.courseName}". Ingresa el PIN de seguridad para confirmar.`);
    setPinAction(() => doDelete);
  };

  const doDelete = async () => {
    setDeleting(true);
    try {
      await apiPut(`/admin/courses/${course.courseId}`, { deleted: true });
      onDelete();
    } catch {
      setSaveError('Error al eliminar el curso.');
      setDeleting(false);
    }
  };

  const fmtDate = ts => ts
    ? new Date(ts).toLocaleDateString('es-GT', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div className="ac-form" ref={formRef}>

      {/* ── Header ── */}
      <div className="ac-form-header">
        <div>
          <p className="ac-form-header-label">Editando curso</p>
          <h3 className="ac-form-header-title">{course.courseName}</h3>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {confirmDelete ? (
            <>
              <span className="ac-delete-confirm-text">¿Eliminar?</span>
              <button onClick={triggerDelete} disabled={deleting} className="ac-btn ac-btn--danger">
                {deleting ? '…' : 'Sí'}
              </button>
              <button onClick={() => setConfirmDelete(false)} className="ac-btn ac-btn--ghost">No</button>
            </>
          ) : (
            <button onClick={() => setConfirmDelete(true)} className="ac-btn ac-btn--danger">Eliminar</button>
          )}
          <button onClick={onClose} className="ac-btn ac-btn--ghost">✕ Cerrar</button>
        </div>
      </div>

      {/* ── PRECIOS ── */}
      <SectionDivider label="Precios" />
      <div className="ac-grid-2">
        <Field label="Precio del Curso (Q)" hint="Precio principal que verán los estudiantes">
          <input type="number" value={form.price} onChange={e => set('price', e.target.value)} className="ac-input" min="0" placeholder="2200" />
        </Field>
        <Field label="Cuota de Inscripción (Q)" hint="Dejar vacío usa el valor global de configuración">
          <input type="number" value={form.enrollmentFee} onChange={e => set('enrollmentFee', e.target.value)} className="ac-input" min="0" placeholder="200" />
        </Field>
      </div>

      {/* ── CONTENIDO ── */}
      <SectionDivider label="Contenido del Curso" />

      <Field label="Instructor / Impartido por">
        <input value={form.instructor} onChange={e => set('instructor', e.target.value)} className="ac-input" placeholder="Ej: NUESTRO TEAM DE PROFESIONALES" />
      </Field>

      <Field label="Descripción del Curso">
        <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={4} className="ac-input ac-textarea" placeholder="Descripción detallada del módulo…" />
      </Field>

      <div className="ac-grid-2">
        <Field label="Nivel" hint="Ej: Principiante / Intermedio / Avanzado">
          <input value={form.level} onChange={e => set('level', e.target.value)} className="ac-input" placeholder="Principiante/Intermedio" />
        </Field>
        <Field label="Materiales Requeridos">
          <input value={form.materialsRequired} onChange={e => set('materialsRequired', e.target.value)} className="ac-input" placeholder="Plancha, tubo y cepillo…" />
        </Field>
      </div>

      <Field label="Fechas del Curso">
        <input value={form.dates} onChange={e => set('dates', e.target.value)} className="ac-input" placeholder="Ej: 27 DE ENERO – 17 DE FEBRERO" />
      </Field>

      <div className="ac-grid-2">
        <Field label="Cuotas / Pagos">
          <input value={form.installments} onChange={e => set('installments', e.target.value)} className="ac-input" placeholder="HASTA 3 CUOTAS SIN RECARGO" />
        </Field>
        <Field label="Texto Promocional">
          <input value={form.promo} onChange={e => set('promo', e.target.value)} className="ac-input" placeholder="*DEMO MAKEUP GRATIS" />
        </Field>
      </div>

      {/* ── HORARIOS ── */}
      <SectionDivider label="Horarios y WhatsApp" />
      <p className="ac-hint-text">Cada opción de horario puede tener su propio enlace de grupo de WhatsApp.</p>
      {form.scheduleOptions.map((s, i) => (
        <div key={i} className="ac-schedule-block">
          <div className="ac-schedule-block-header">
            <span className="ac-schedule-num">Opción {i + 1}</span>
            <button onClick={() => removeSchedule(i)} className="ac-btn-remove" title="Eliminar horario">✕</button>
          </div>
          <input
            value={s}
            onChange={e => updateSchedule(i, e.target.value)}
            className="ac-input ac-input--bold"
            placeholder="Ej: Lunes y Miércoles 2PM a 4PM"
          />
          <input
            value={form.whatsappLinks[i] || ''}
            onChange={e => updateWhatsapp(i, e.target.value)}
            className="ac-input ac-input--mono"
            placeholder="https://chat.whatsapp.com/… (opcional)"
          />
        </div>
      ))}
      <button onClick={addSchedule} className="ac-btn ac-btn--add">+ Agregar horario</button>

      {/* ── IMÁGENES ── */}
      <SectionDivider label="Imágenes del Curso" />
      <p className="ac-hint-text">
        Sube imágenes desde tu computadora o pega una URL. La primera imagen se muestra en la tarjeta del curso.
      </p>
      {form.imageUrls.length === 0 && (
        <p className="ac-empty-text">Sin imágenes — se usarán las predeterminadas del curso.</p>
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
      <button onClick={addImageUrl} className="ac-btn ac-btn--add">+ Agregar imagen</button>

      {/* ── CLASES ── */}
      <SectionDivider label="Lista de Clases" />
      <p className="ac-hint-text">Cada fila es una clase. Usa "Agregar descanso" para semanas sin clase (ej: Semana Santa).</p>
      {form.classes.map((cls, i) => (
        <div key={i} className="ac-class-row">
          {cls.isBreak ? (
            <div className="ac-class-row-inner">
              <span className="ac-class-break-tag">Descanso</span>
              <input
                value={cls.text || ''}
                onChange={e => updateClass(i, 'text', e.target.value)}
                className="ac-input ac-input--italic"
                placeholder="Ej: SEMANA SANTA (NO HAY CLASE)"
              />
              <button onClick={() => removeClass(i)} className="ac-btn-remove" title="Eliminar">✕</button>
            </div>
          ) : (
            <div className="ac-class-row-inner ac-class-row-inner--cols">
              <span className="ac-class-num">{i + 1}.</span>
              <input value={cls.name || ''} onChange={e => updateClass(i, 'name', e.target.value)} className="ac-input ac-class-name-input" placeholder="Clase 1:" />
              <input value={cls.date || ''} onChange={e => updateClass(i, 'date', e.target.value)} className="ac-input ac-class-date-input" placeholder="Martes 27 de Enero" />
              <input value={cls.topics || ''} onChange={e => updateClass(i, 'topics', e.target.value)} className="ac-input ac-class-topics-input" placeholder="Tema de la clase" />
              <button onClick={() => removeClass(i)} className="ac-btn-remove" title="Eliminar">✕</button>
            </div>
          )}
        </div>
      ))}
      <div className="ac-btn-row">
        <button onClick={addClass} className="ac-btn ac-btn--add">+ Agregar clase</button>
        <button onClick={addBreak}  className="ac-btn ac-btn--add">+ Agregar descanso</button>
      </div>

      {/* ── MÓDULOS COMPLEJOS ── */}
      <SectionDivider label="Módulos Complejos (Masterclass + Práctica)" />
      <p className="ac-hint-text">Para módulos con múltiples sesiones por tema (ej: Maestría con Masterclass + Práctica).</p>
      {form.complexClasses.map((cc, i) => (
        <div key={i} className="ac-complex-block">
          <div className="ac-complex-block-header">
            <span className="ac-complex-num">Módulo {i + 1}</span>
            <button onClick={() => removeComplexClass(i)} className="ac-btn-remove" title="Eliminar módulo">✕</button>
          </div>
          <input
            value={cc.title || ''}
            onChange={e => updateComplexTitle(i, e.target.value)}
            className="ac-input ac-input--bold"
            placeholder="Título del módulo (ej: Semirecogido con ondas retro)"
          />
          <div className="ac-complex-sessions">
            {(cc.sessions || []).map((session, si) => (
              <div key={si} className="ac-complex-session-row">
                <span className="ac-complex-session-dot">›</span>
                <input
                  value={session}
                  onChange={e => updateComplexSession(i, si, e.target.value)}
                  className="ac-input"
                  placeholder="Ej: Clase 11: Masterclass Miércoles 15 de Abril"
                />
                <button onClick={() => removeComplexSession(i, si)} className="ac-btn-remove" title="Eliminar sesión">✕</button>
              </div>
            ))}
            <button onClick={() => addComplexSession(i)} className="ac-btn ac-btn--add ac-btn--indent">+ Agregar sesión</button>
          </div>
        </div>
      ))}
      <button onClick={addComplexClass} className="ac-btn ac-btn--add">+ Agregar módulo complejo</button>

      {/* ── VISIBILIDAD ── */}
      <SectionDivider label="Visibilidad" />
      <div className="ac-toggles">
        <Toggle label="Promo activa"        checked={form.promoActive} onChange={v => set('promoActive', v)} />
        <Toggle label="Visible en el sitio" checked={form.isVisible}   onChange={v => set('isVisible',  v)} />
      </div>

      {/* ── Feedback & Save ── */}
      <div className="ac-form-footer">
        {saveError && <p className="ac-feedback ac-feedback--error">⚠ {saveError}</p>}
        {justSaved && <p className="ac-feedback ac-feedback--success">✓ Cambios guardados correctamente.</p>}

        <div className="ac-save-row">
          <button onClick={triggerSave} disabled={saving} className={`ac-btn ac-btn--primary ac-btn--save${saving ? ' ac-btn--saving' : ''}`}>
            {saving ? 'Guardando…' : 'Guardar Cambios'}
          </button>
          <button onClick={onClose} className="ac-btn ac-btn--ghost">Cancelar</button>
        </div>

        <div className="ac-last-saved">
          {savedMeta.lastUpdatedAt
            ? `Último guardado: ${fmtDate(savedMeta.lastUpdatedAt)}${savedMeta.lastUpdatedBy ? ` · por ${savedMeta.lastUpdatedBy}` : ''}`
            : 'Este curso aún no ha sido editado desde el panel de administración.'
          }
        </div>
      </div>

      <SecurityPinModal
        isOpen={!!pinAction}
        onSuccess={() => { const ac = pinAction; setPinAction(null); if (ac) ac(); }}
        onClose={() => setPinAction(null)}
        message={pinMessage}
      />
    </div>
  );
}

// ── Image upload row ─────────────────────────────────────────────────────────

function ImageUploadRow({ index, url, courseId, onUpdate, onRemove }) {
  const fileInputRef = useRef(null);
  const [uploading,   setUploading]   = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';
    setUploading(true);
    setUploadError(null);
    try {
      const op = get({
        apiName: 'checkoutApi',
        path: '/admin/presigned-upload-url',
        options: { queryParams: { fileName: file.name, contentType: file.type, courseId: courseId || 'general' } },
      });
      const { body } = await op.response;
      const { uploadUrl, publicUrl } = await body.json();
      const s3Res = await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
      if (!s3Res.ok) throw new Error(`S3 responded with ${s3Res.status}`);
      onUpdate(publicUrl);
    } catch (err) {
      console.error('Image upload failed:', err);
      setUploadError('Error al subir. Verifica que el bucket beauty-station-images tiene CORS habilitado.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="ac-image-row">
      <div className="ac-image-row-inputs">
        <span className="ac-image-num">{index + 1}.</span>
        {uploading ? (
          <div className="ac-image-uploading">Subiendo imagen…</div>
        ) : (
          <input
            value={url}
            onChange={e => onUpdate(e.target.value)}
            className="ac-input ac-input--mono"
            placeholder="https://… o haz clic en Subir"
          />
        )}
        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
        <button onClick={() => { setUploadError(null); fileInputRef.current?.click(); }} disabled={uploading} className="ac-btn ac-btn--upload" title="Subir imagen">
          {uploading ? '…' : '↑ Subir'}
        </button>
        <button onClick={onRemove} className="ac-btn-remove" disabled={uploading} title="Eliminar imagen">✕</button>
      </div>
      {!uploading && url && url.startsWith('http') && (
        <div className="ac-image-preview-wrap">
          <img src={url} alt={`Imagen ${index + 1}`} className="ac-image-preview" onError={e => { e.target.style.display = 'none'; }} />
        </div>
      )}
      {uploadError && <p className="ac-image-error">{uploadError}</p>}
    </div>
  );
}

// ── Shared primitives ────────────────────────────────────────────────────────

function SectionDivider({ label }) {
  return (
    <div className="ac-section-divider">
      <span className="ac-section-divider-label">{label}</span>
      <div className="ac-section-divider-line" />
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div className="ac-field">
      <label className="ac-field-label">{label}</label>
      {hint && <p className="ac-field-hint">{hint}</p>}
      {children}
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="ac-toggle">
      <div className={`ac-toggle-track${checked ? ' ac-toggle-track--on' : ''}`} onClick={() => onChange(!checked)}>
        <div className="ac-toggle-thumb" />
      </div>
      <span className="ac-toggle-label">{label}</span>
    </label>
  );
}
