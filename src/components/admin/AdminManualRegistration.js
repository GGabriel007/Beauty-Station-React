// src/components/admin/AdminManualRegistration.js
// Admin tool to manually register a student into a course (cash payment).
// Course list comes from /admin/courses (CourseSettings) so newly created courses
// appear immediately. Seat counts are overlaid from /modulos where available.

import React, { useState, useEffect, useMemo, useRef } from 'react';
import '../../styles/classes.css';
import { get, post } from 'aws-amplify/api';
import { courseCanonicalItems, coursesInfo } from '../../config/courseData';

const COUNTRIES = [
  { code: '+502', label: '🇬🇹 Guatemala +502' },
  { code: '+1',   label: '🇺🇸 EE.UU. / Canadá +1' },
  { code: '+52',  label: '🇲🇽 México +52' },
  { code: '+503', label: '🇸🇻 El Salvador +503' },
  { code: '+504', label: '🇭🇳 Honduras +504' },
  { code: '+505', label: '🇳🇮 Nicaragua +505' },
  { code: '+506', label: '🇨🇷 Costa Rica +506' },
  { code: '+507', label: '🇵🇦 Panamá +507' },
  { code: '+57',  label: '🇨🇴 Colombia +57' },
  { code: '+58',  label: '🇻🇪 Venezuela +58' },
  { code: '+51',  label: '🇵🇪 Perú +51' },
  { code: '+56',  label: '🇨🇱 Chile +56' },
  { code: '+54',  label: '🇦🇷 Argentina +54' },
  { code: '+55',  label: '🇧🇷 Brasil +55' },
  { code: '+593', label: '🇪🇨 Ecuador +593' },
  { code: '+591', label: '🇧🇴 Bolivia +591' },
  { code: '+595', label: '🇵🇾 Paraguay +595' },
  { code: '+598', label: '🇺🇾 Uruguay +598' },
  { code: '+34',  label: '🇪🇸 España +34' },
  { code: '+44',  label: '🇬🇧 Reino Unido +44' },
];

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

  const [phoneCountry,  setPhoneCountry]  = useState('+502'); // persists between submissions
  const [countryOpen,   setCountryOpen]   = useState(false);
  const countryRef = useRef(null);

  const [selectedCourseName, setSelectedCourseName] = useState(''); // course name (first dropdown)
  const [selectedItem,  setSelectedItem]  = useState('');   // canonical item name (second dropdown)
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

  // Close country dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (countryRef.current && !countryRef.current.contains(e.target)) {
        setCountryOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
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
        // For admin-created courses, use the same item name format as AdminSettings
        // so seat counts from Configuración are matched correctly: "<courseName> <scheduleOption>"
        for (const opt of schedOpts) {
          const itemName = `${course.courseName} ${opt}`;
          options.push({ itemName, schedule: opt, seats: seatMap[itemName] });
        }
      }
      if (options.length > 0) {
        options.sort((a, b) => a.schedule.localeCompare(b.schedule));
        groups[course.courseName] = { options, courseId: course.courseId };
      }
    }
    return groups;
  }, [courseMap, seatMap]);

  // Split course names into hair / makeup / other buckets (same as Configuración)
  const categoryBuckets = useMemo(() => {
    const hair = [], makeup = [], other = [];
    for (const [name, group] of Object.entries(courseGroups)) {
      const course = courseMap[group.courseId];
      const cat = course?.category || coursesInfo[group.courseId]?.category;
      if      (cat === 'hair')   hair.push(name);
      else if (cat === 'makeup') makeup.push(name);
      else                       other.push(name);
    }
    hair.sort(); makeup.sort(); other.sort();
    return { hair, makeup, other };
  }, [courseGroups, courseMap]);

  const schedules = selectedCourseName
    ? (courseGroups[selectedCourseName]?.options || [])
    : [];

  // seatsLeft: number = known count, undefined = no Modulos entry (seats not yet configured)
  const seatsLeft  = selectedItem ? seatMap[selectedItem] : undefined;
  const seatsKnown = seatsLeft !== undefined;
  // Block when seats are unknown (never configured) OR when the known count is 0
  const seatsEmpty = !seatsKnown || seatsLeft <= 0;

  const total = coursePrice + enrollmentFee;

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

  // ── Handlers ───────────────────────────────────────────────────────────────

  const setField = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleCourseNameChange = (name) => {
    setSelectedCourseName(name);
    setSelectedItem('');
    setSelectedCourseId('');
    setSubmitResult(null);
    if (!name) return;
    const group = courseGroups[name];
    if (!group) return;
    setSelectedCourseId(group.courseId);
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
        phoneNumber:   `${phoneCountry} ${form.phone.trim()}`,
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
      setForm({ studentName: '', email: '', phone: '', dpi: 'CF', notes: '' });

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
                {categoryBuckets.hair.length > 0 && (
                  <optgroup label="Cabello (Hair)">
                    {categoryBuckets.hair.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </optgroup>
                )}
                {categoryBuckets.makeup.length > 0 && (
                  <optgroup label="Maquillaje (Makeup)">
                    {categoryBuckets.makeup.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </optgroup>
                )}
                {categoryBuckets.other.length > 0 && (
                  <optgroup label="Otros">
                    {categoryBuckets.other.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </optgroup>
                )}
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
                      disabled={s.seats === undefined || s.seats <= 0}
                    >
                      {s.schedule}
                      {s.seats === undefined
                        ? ' — SIN CUPOS (sin configurar)'
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
                background: seatsKnown && seatsLeft > 3 ? '#f0fdf4'
                          : seatsKnown && seatsLeft > 0 ? '#fffbeb'
                          : '#fff5f5',
                border: `1px solid ${
                  seatsKnown && seatsLeft > 3 ? '#bbf7d0'
                  : seatsKnown && seatsLeft > 0 ? '#fcd34d'
                  : '#fed7d7'
                }`,
                color: seatsKnown && seatsLeft > 3 ? '#166534'
                     : seatsKnown && seatsLeft > 0 ? '#92400e'
                     : '#9b1c1c',
                fontSize:   '0.82rem',
                fontFamily: FONT,
                fontWeight: 600,
              }}>
                {!seatsKnown
                  ? 'Sin cupos configurados — configura cupos en la pestaña Configuración'
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
              <p style={{ margin: '5px 0 0', fontSize: '0.8rem', fontFamily: FONT, color: C.muted }}>
                CF (Consumidor Final) — opcional
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
              <div style={{ display: 'flex' }}>
                <div style={{ position: 'relative', flexShrink: 0 }} ref={countryRef}>
                  <button
                    type="button"
                    onClick={() => setCountryOpen(o => !o)}
                    style={{
                      height: '100%',
                      padding: '8px 10px',
                      border: '1px solid #ddd',
                      borderRight: 'none',
                      background: '#f9f9f9',
                      cursor: 'pointer',
                      fontFamily: FONT,
                      fontSize: '0.83rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      whiteSpace: 'nowrap',
                      outline: 'none',
                      borderRadius: 0,
                    }}
                  >
                    <span>{phoneCountry}</span>
                    <span style={{ fontSize: '0.6rem', color: '#888' }}>{countryOpen ? '▴' : '▾'}</span>
                  </button>
                  {countryOpen && (
                    <ul style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      zIndex: 999,
                      background: '#fff',
                      border: '1px solid #ddd',
                      margin: 0,
                      padding: 0,
                      listStyle: 'none',
                      minWidth: '220px',
                      maxHeight: '240px',
                      overflowY: 'auto',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                    }}>
                      {COUNTRIES.map(c => (
                        <li
                          key={c.code}
                          onClick={() => { setPhoneCountry(c.code); setCountryOpen(false); }}
                          style={{
                            padding: '9px 14px',
                            cursor: 'pointer',
                            fontSize: '0.82rem',
                            fontFamily: FONT,
                            background: phoneCountry === c.code ? C.roseLight : 'transparent',
                            borderBottom: '1px solid #f5f5f5',
                          }}
                        >
                          {c.label}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setField('phone', e.target.value)}
                  placeholder="XXXX-XXXX"
                  style={{ ...inputStyle, flex: 1 }}
                />
              </div>
            </Field>

            <Field label="DPI / NIT">
              <input
                type="text"
                value={form.dpi}
                onChange={e => setField('dpi', e.target.value)}
                placeholder="CF"
                style={inputStyle}
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
