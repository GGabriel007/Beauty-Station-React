// src/components/admin/AdminManualRegistration.js
// Admin tool to manually register a student into a course (cash payment).
// Course list comes from /admin/courses (CourseSettings) so newly created courses
// appear immediately. Seat counts are overlaid from /modulos where available.

import React, { useState, useEffect, useMemo } from 'react';
import '../../styles/classes.css';
import { get, post } from 'aws-amplify/api';
import { courseCanonicalItems } from '../../config/courseData';

const FONT = "'Montserrat', sans-serif";
const C = {
  roseLight: '#F0E2E9',
  roseTint:  '#E8CBD4',
  rose:      '#cd929d',
  roseDeep:  '#7D4E61',
  text:      '#000000',
  muted:     '#888',
  white:     '#ffffff',
};

async function apiFetch(path) {
  const op = get({ apiName: 'checkoutApi', path });
  const { body } = await op.response;
  return body.json();
}

async function apiPost(path, data) {
  const op = post({ apiName: 'checkoutApi', path, options: { body: data } });
  const { body } = await op.response;
  return body.json();
}

// Build the canonical item name (e.g., "Master Waves 2PM a 4PM") from a course
// name and a raw schedule option string (e.g., "Opción 1: 2PM A 4PM").
// Returns null if no recognizable time pattern is found.
function buildItemName(courseName, scheduleOption) {
  const match = scheduleOption.match(/(\d+)\s*([AP]M)\s+[Aa]\s+(\d+)\s*([AP]M)/i);
  if (!match) return null;
  const [, h1, m1, h2, m2] = match;
  return `${courseName} ${h1}${m1.toUpperCase()} a ${h2}${m2.toUpperCase()}`;
}

// Human-readable schedule label from a schedule option string.
// "Opción 1: 2PM A 4PM" → "2PM a 4PM"
function getScheduleDisplay(scheduleOption) {
  const match = scheduleOption.match(/(\d+)\s*([AP]M)\s+[Aa]\s+(\d+)\s*([AP]M)/i);
  if (!match) return scheduleOption;
  const [, h1, m1, h2, m2] = match;
  return `${h1}${m1.toUpperCase()} a ${h2}${m2.toUpperCase()}`;
}

const EMPTY_FORM = {
  studentName: '',
  email:       '',
  phone:       '',
  dpi:         'CF',
  notes:       '',
};

export default function AdminManualRegistration() {
  const [loading,       setLoading]       = useState(true);
  const [dataError,     setDataError]     = useState(null);
  const [seatMap,       setSeatMap]       = useState({});   // { "Course 2PM a 4PM": seats }
  const [courseMap,     setCourseMap]     = useState({});   // { courseId: courseObj }
  const [enrollmentFee, setEnrollmentFee] = useState(200);

  const [selectedItem,  setSelectedItem]  = useState('');   // canonical item name
  const [selectedCourseId, setSelectedCourseId] = useState(''); // to look up price
  const [coursePrice,   setCoursePrice]   = useState(0);    // editable
  const [form,          setForm]          = useState(EMPTY_FORM);
  const [submitting,    setSubmitting]    = useState(false);
  const [submitResult,  setSubmitResult]  = useState(null);

  // ── Load data (re-runs every time this tab mounts) ─────────────────────────
  useEffect(() => {
    setLoading(true);
    setDataError(null);
    Promise.all([
      apiFetch('/modulos'),
      apiFetch('/admin/courses'),
      apiFetch('/site-settings'),
    ])
      .then(([modulosData, coursesData, siteSettings]) => {
        // Build seat map from Modulos table
        const seats = {};
        for (const item of modulosData) {
          for (const [key, val] of Object.entries(item)) {
            if (key === 'id' || key === 'Kit de pieles perfectas') continue;
            seats[key] = Number(val);
          }
        }
        setSeatMap(seats);

        // Build courseId → full course object map from CourseSettings
        const map = {};
        for (const course of coursesData) {
          if (course.courseId) map[course.courseId] = course;
        }
        setCourseMap(map);

        if (siteSettings.enrollmentFee != null) {
          setEnrollmentFee(Number(siteSettings.enrollmentFee));
        }
      })
      .catch(() => setDataError('Error al cargar los datos. Intenta de nuevo.'))
      .finally(() => setLoading(false));
  }, []);

  // ── Derived state ──────────────────────────────────────────────────────────

  // Build course groups from CourseSettings (admin courses) so new courses appear
  // immediately. Seat counts from Modulos are overlaid where available.
  const courseGroups = useMemo(() => {
    const groups = {};
    for (const course of Object.values(courseMap)) {
      if (course.deleted) continue;
      if (!course.courseName) continue;
      const schedOpts = course.scheduleOptions;
      if (!Array.isArray(schedOpts) || schedOpts.length === 0) continue;

      // Use canonical item names for known courses so the item name sent to
      // the backend always matches moduleIds / DB_KEY_MAP. Fall back to
      // buildItemName only for admin-created courses without a canonical entry.
      const canonicalNames = courseCanonicalItems[course.courseId];
      const options = [];
      if (canonicalNames) {
        for (const itemName of canonicalNames) {
          // Derive a human-readable schedule label from the item name (e.g. "2PM a 4PM")
          const schedMatch = itemName.match(/(\d+[AP]M\s+a\s+\d+[AP]M)/i);
          const schedule = schedMatch ? schedMatch[1] : itemName;
          options.push({ itemName, schedule, seats: seatMap[itemName] });
        }
      } else {
        for (const opt of schedOpts) {
          const itemName = buildItemName(course.courseName, opt);
          if (!itemName) continue;
          options.push({
            itemName,
            schedule: getScheduleDisplay(opt),
            seats: seatMap[itemName],
          });
        }
      }
      if (options.length > 0) {
        options.sort((a, b) => a.schedule.localeCompare(b.schedule));
        groups[course.courseName] = { options, courseId: course.courseId };
      }
    }
    return groups;
  }, [courseMap, seatMap]);

  const courseNames = useMemo(() => Object.keys(courseGroups).sort(), [courseGroups]);

  // Schedules for the currently selected course name
  const selectedCourseName = selectedItem
    ? Object.keys(courseGroups).find(name =>
        courseGroups[name].options.some(o => o.itemName === selectedItem)
      ) || ''
    : '';

  const schedules = selectedCourseName
    ? (courseGroups[selectedCourseName]?.options || [])
    : [];

  // seatsLeft: number = known count, undefined = no Modulos entry (new/untracked course)
  const seatsLeft = selectedItem ? seatMap[selectedItem] : undefined;
  const seatsKnown  = seatsLeft !== undefined;
  const seatsEmpty  = seatsKnown && seatsLeft <= 0;

  const total       = coursePrice + enrollmentFee;
  const dpiRequired = total >= 2000;

  // Auto-fill price from CourseSettings when selection changes
  useEffect(() => {
    if (!selectedCourseId) { setCoursePrice(0); return; }
    const course = courseMap[selectedCourseId];
    if (course?.price != null) {
      setCoursePrice(Number(course.price));
    } else {
      setCoursePrice(0);
    }
  }, [selectedCourseId, courseMap]);

  // Reset DPI to CF when total drops below Q2,000
  useEffect(() => {
    if (!dpiRequired) setForm(f => ({ ...f, dpi: 'CF' }));
  }, [dpiRequired]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const setField = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleCourseNameChange = (name) => {
    setSelectedItem('');
    setSelectedCourseId('');
    setSubmitResult(null);
    if (!name) return;
    const group = courseGroups[name];
    if (!group) return;
    setSelectedCourseId(group.courseId);
    // Auto-select when only one schedule option
    if (group.options.length === 1) setSelectedItem(group.options[0].itemName);
  };

  const handleScheduleChange = (itemName) => {
    setSelectedItem(itemName);
    setSubmitResult(null);
  };

  const validate = () => {
    if (!selectedItem)            return 'Selecciona un curso y horario.';
    if (seatsEmpty)               return 'No hay asientos disponibles para este horario.';
    if (!form.studentName.trim()) return 'El nombre del alumno es requerido.';
    if (!form.email.trim())       return 'El email es requerido.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return 'El email no tiene un formato válido.';
    if (!form.phone.trim())       return 'El número de teléfono es requerido.';
    if (dpiRequired && (!form.dpi.trim() || form.dpi.trim().toUpperCase() === 'CF'))
      return 'Se requiere DPI/NIT para inscripciones de Q2,000 o más.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitResult(null);
    const err = validate();
    if (err) { setSubmitResult({ error: err }); return; }

    setSubmitting(true);
    try {
      const result = await apiPost('/admin/manual-register', {
        studentName:   form.studentName.trim(),
        email:         form.email.trim().toLowerCase(),
        phoneNumber:   form.phone.trim(),
        dpi:           form.dpi.trim() || 'CF',
        itemName:      selectedItem,
        coursePrice,
        enrollmentFee,
        totalPrice:    total,
        notes:         form.notes.trim(),
      });

      setSubmitResult({ success: true, paymentId: result.paymentId });

      // Optimistically decrement the local seat count
      if (seatsKnown) {
        setSeatMap(m => ({ ...m, [selectedItem]: Math.max(0, (m[selectedItem] ?? 1) - 1) }));
      }

      // Reset student fields; keep course selection for multi-registration speed
      setForm({ studentName: '', email: '', phone: '', dpi: dpiRequired ? '' : 'CF', notes: '' });

    } catch (err) {
      let message = 'Error al registrar al alumno. Intenta de nuevo.';
      try {
        if (err.response) {
          const body   = err.response.body;
          const errObj = typeof body === 'string' ? JSON.parse(body) : await body.json();
          if (errObj?.error) message = errObj.error;
        } else if (err.message) {
          message = err.message;
        }
      } catch (_) {}
      setSubmitResult({ error: message });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading)   return <p style={{ color: C.muted, fontFamily: FONT }}>Cargando datos…</p>;
  if (dataError) return <p style={{ color: '#c62828', fontFamily: FONT }}>{dataError}</p>;

  return (
    <div>
      <h1 className="admin-page-title">Inscribir Alumno</h1>
      <p style={{ fontSize: '0.82rem', color: C.muted, fontFamily: FONT, marginBottom: '24px', maxWidth: '580px' }}>
        Registra manualmente a un alumno en un curso. La inscripción quedará marcada como <strong>Admin</strong> con método de pago <strong>Efectivo (Cash)</strong> y descontará un cupo automáticamente.
      </p>

      <form onSubmit={handleSubmit}>
        {/* ── Result banner ── */}
        {submitResult && (
          <div style={{
            padding:     '13px 16px',
            marginBottom:'22px',
            background:  submitResult.success ? '#f0fdf4' : '#fff5f5',
            border:      `1px solid ${submitResult.success ? '#bbf7d0' : '#fed7d7'}`,
            color:       submitResult.success ? '#166534' : '#9b1c1c',
            fontSize:    '0.84rem',
            fontFamily:  FONT,
            lineHeight:  1.5,
          }}>
            {submitResult.success
              ? <>✓ Alumno inscrito exitosamente.&nbsp;
                  <strong>ID de Recibo: {submitResult.paymentId?.split('-')[0].toUpperCase() || '—'}</strong>
                  &nbsp;· Puedes inscribir otro alumno sin recargar.
                </>
              : `✗ ${submitResult.error}`
            }
          </div>
        )}

        {/* ── Top row: Course selection + Billing ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' }}>

          {/* Course selection card */}
          <Card title="Selección de Curso">
            <Field label="Curso *">
              <select
                value={selectedCourseName}
                onChange={e => handleCourseNameChange(e.target.value)}
                style={inputStyle}
              >
                <option value="">— Seleccionar curso —</option>
                {courseNames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </Field>

            {selectedCourseName && (
              <Field label="Horario *">
                <select
                  value={selectedItem}
                  onChange={e => handleScheduleChange(e.target.value)}
                  style={inputStyle}
                >
                  <option value="">— Seleccionar horario —</option>
                  {schedules.map(s => (
                    <option
                      key={s.itemName}
                      value={s.itemName}
                      disabled={s.seats !== undefined && s.seats <= 0}
                    >
                      {s.schedule}
                      {s.seats === undefined
                        ? ' — cupos sin configurar'
                        : s.seats > 0
                          ? ` — ${s.seats} lugar${s.seats !== 1 ? 'es' : ''}`
                          : ' — SIN CUPOS'}
                    </option>
                  ))}
                </select>
              </Field>
            )}

            {/* Seat availability badge */}
            {selectedItem && (
              <div style={{
                display:    'inline-flex',
                alignItems: 'center',
                padding:    '8px 14px',
                marginTop:  '8px',
                background: !seatsKnown ? '#f9fafb'
                          : seatsLeft > 3 ? '#f0fdf4'
                          : seatsLeft > 0 ? '#fffbeb'
                          : '#fff5f5',
                border: `1px solid ${
                  !seatsKnown ? '#e5e7eb'
                  : seatsLeft > 3 ? '#bbf7d0'
                  : seatsLeft > 0 ? '#fcd34d'
                  : '#fed7d7'
                }`,
                color: !seatsKnown ? '#6b7280'
                      : seatsLeft > 3 ? '#166534'
                      : seatsLeft > 0 ? '#92400e'
                      : '#9b1c1c',
                fontSize:   '0.82rem',
                fontFamily: FONT,
                fontWeight: 600,
              }}>
                {!seatsKnown
                  ? 'Cupos no configurados — se puede inscribir igualmente'
                  : seatsLeft > 0
                    ? `${seatsLeft} lugar${seatsLeft !== 1 ? 'es' : ''} disponible${seatsLeft !== 1 ? 's' : ''}`
                    : 'Sin cupos disponibles — inscripción bloqueada'}
              </div>
            )}
          </Card>

          {/* Billing summary card */}
          <Card title="Facturación">
            <Field label="Precio del Curso (Q)">
              <input
                type="number"
                min="0"
                step="1"
                value={coursePrice}
                onChange={e => setCoursePrice(Math.max(0, Number(e.target.value) || 0))}
                style={inputStyle}
              />
              {selectedItem && coursePrice === 0 && (
                <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: '#92400e', fontFamily: FONT }}>
                  Precio no encontrado en BD — ingrésalo manualmente.
                </p>
              )}
            </Field>

            <div style={{ marginTop: '14px', fontSize: '0.83rem', fontFamily: FONT }}>
              <BillingRow label="Precio del Curso"     value={`Q${coursePrice.toLocaleString('es-GT')}`} />
              <BillingRow label="Cuota de Inscripción" value={`Q${enrollmentFee}`} />
              <BillingRow label="Total a Pagar"        value={`Q${total.toLocaleString('es-GT')}`} bold />
            </div>

            {/* Payment method badge */}
            <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: `1px solid ${C.roseTint}` }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: FONT }}>
                Método de Pago
              </span>
              <div style={{ marginTop: '7px' }}>
                <span style={{
                  display:       'inline-block',
                  padding:       '5px 16px',
                  background:    '#f0fdf4',
                  border:        '1px solid #bbf7d0',
                  color:         '#166534',
                  fontSize:      '0.8rem',
                  fontWeight:    700,
                  fontFamily:    FONT,
                  letterSpacing: '0.8px',
                  textTransform: 'uppercase',
                }}>
                  Efectivo / Cash
                </span>
              </div>
            </div>

            {/* DPI/NIT requirement notice */}
            <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: `1px solid ${C.roseTint}` }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: FONT }}>
                NIT / DPI
              </span>
              <p style={{ margin: '5px 0 0', fontSize: '0.8rem', fontFamily: FONT, color: dpiRequired ? '#92400e' : C.muted }}>
                {dpiRequired
                  ? 'Requerido — total ≥ Q2,000'
                  : 'CF (Consumidor Final) — total < Q2,000'}
              </p>
            </div>
          </Card>
        </div>

        {/* ── Student information card ── */}
        <Card title="Datos del Alumno">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <Field label="Nombre Completo *">
              <input
                type="text"
                value={form.studentName}
                onChange={e => setField('studentName', e.target.value)}
                placeholder="Nombre y apellido"
                style={inputStyle}
              />
            </Field>

            <Field label="Email *">
              <input
                type="email"
                value={form.email}
                onChange={e => setField('email', e.target.value)}
                placeholder="correo@ejemplo.com"
                style={inputStyle}
              />
            </Field>

            <Field label="Teléfono *">
              <input
                type="tel"
                value={form.phone}
                onChange={e => setField('phone', e.target.value)}
                placeholder="+502 0000 0000"
                style={inputStyle}
              />
            </Field>

            <Field label={dpiRequired ? 'DPI / NIT *' : 'DPI / NIT'}>
              <input
                type="text"
                value={form.dpi}
                onChange={e => setField('dpi', e.target.value)}
                placeholder={dpiRequired ? 'Número de DPI o NIT requerido' : 'CF'}
                style={{
                  ...inputStyle,
                  borderColor: dpiRequired && (!form.dpi.trim() || form.dpi.trim().toUpperCase() === 'CF')
                    ? '#fca5a5' : '#ddd',
                }}
              />
            </Field>
          </div>

          <div style={{ marginTop: '16px' }}>
            <Field label="Notas internas (opcional)">
              <textarea
                value={form.notes}
                onChange={e => setField('notes', e.target.value)}
                placeholder="Observaciones, acuerdos de pago, etc."
                rows={2}
                style={{ ...inputStyle, resize: 'vertical', boxSizing: 'border-box' }}
              />
            </Field>
          </div>
        </Card>

        {/* ── Submit ── */}
        <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <button
            type="submit"
            disabled={submitting || seatsEmpty}
            style={{
              background:    submitting || seatsEmpty ? '#ccc' : C.roseDeep,
              color:         '#fff',
              border:        'none',
              padding:       '12px 32px',
              cursor:        submitting || seatsEmpty ? 'not-allowed' : 'pointer',
              fontSize:      '0.85rem',
              fontFamily:    FONT,
              fontWeight:    700,
              letterSpacing: '1.2px',
              textTransform: 'uppercase',
              transition:    'background 0.15s',
            }}
          >
            {submitting ? 'Inscribiendo…' : 'Inscribir Alumno'}
          </button>

          {seatsEmpty && (
            <span style={{ color: '#9b1c1c', fontSize: '0.8rem', fontFamily: FONT }}>
              Sin cupos disponibles en este horario.
            </span>
          )}

          <span style={{ fontSize: '0.75rem', color: C.muted, fontFamily: FONT }}>
            Se registrará como <strong>Admin</strong> · <strong>Efectivo</strong>
          </span>
        </div>
      </form>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Card({ title, children }) {
  return (
    <div style={{ background: C.white, border: '1px solid #e0e0e0', padding: '20px 22px' }}>
      <h3 style={{
        margin:        '0 0 16px 0',
        fontSize:      '0.72rem',
        fontWeight:    700,
        textTransform: 'uppercase',
        letterSpacing: '1px',
        color:         C.roseDeep,
        fontFamily:    FONT,
        borderBottom:  `1px solid ${C.roseTint}`,
        paddingBottom: '10px',
      }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <label style={{
        display:       'block',
        fontSize:      '0.68rem',
        fontWeight:    700,
        marginBottom:  '5px',
        color:         '#666',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        fontFamily:    FONT,
      }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function BillingRow({ label, value, bold }) {
  return (
    <div style={{
      display:        'flex',
      justifyContent: 'space-between',
      alignItems:     'center',
      padding:        '6px 0',
      borderBottom:   '1px solid #f5f5f5',
    }}>
      <span style={{ color: '#555', fontFamily: FONT, fontSize: '0.83rem' }}>{label}</span>
      <span style={{
        fontWeight: bold ? 700 : 400,
        fontFamily: FONT,
        fontSize:   bold ? '0.9rem' : '0.83rem',
        color:      bold ? '#000' : '#333',
      }}>
        {value}
      </span>
    </div>
  );
}

const inputStyle = {
  padding:      '8px 10px',
  border:       '1px solid #ddd',
  borderRadius: '0',
  fontSize:     '0.83rem',
  fontFamily:   FONT,
  boxSizing:    'border-box',
  outline:      'none',
  width:        '100%',
  display:      'block',
};
