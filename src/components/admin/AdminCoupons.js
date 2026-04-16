// src/components/admin/AdminCoupons.js
// Full coupon management: create, edit, toggle active, delete.

import React, { useState, useEffect } from 'react';
import { get, post, put, del } from 'aws-amplify/api';

const FONT = "'Montserrat', sans-serif";
const C = {
  rose:     '#cd929d',
  roseDeep: '#7D4E61',
  roseTint: '#E8CBD4',
  roseLight:'#F0E2E9',
  text:     '#2A2A2A',
  muted:    '#888',
  white:    '#ffffff',
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
async function apiPut(path, data) {
  const op = put({ apiName: 'checkoutApi', path, options: { body: data } });
  const { body } = await op.response;
  return body.json();
}
async function apiDel(path) {
  const op = del({ apiName: 'checkoutApi', path });
  const { body } = await op.response;
  return body.json();
}

const EMPTY_FORM = {
  couponCode:          '',
  discountType:        'percentage',
  discountValue:       '',
  description:         '',
  isActive:            true,
  usageLimit:          '',
  minimumOrderAmount:  '',
  expiresAt:           '',
};

export default function AdminCoupons() {
  const [coupons,     setCoupons]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [showCreate,  setShowCreate]  = useState(false);
  const [editingCode, setEditingCode] = useState(null);  // couponCode being edited
  const [deleteCode,  setDeleteCode]  = useState(null);  // confirm delete
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [saving,      setSaving]      = useState(false);
  const [saveError,   setSaveError]   = useState(null);

  const load = () => {
    setLoading(true);
    apiFetch('/admin/coupons')
      .then(data => setCoupons(Array.isArray(data) ? data : []))
      .catch(() => setError('Error al cargar los cupones.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setSaveError(null);
    setEditingCode(null);
    setShowCreate(true);
  };

  const openEdit = (coupon) => {
    setForm({
      couponCode:         coupon.couponCode,
      discountType:       coupon.discountType || 'percentage',
      discountValue:      coupon.discountValue ?? '',
      description:        coupon.description  || '',
      isActive:           coupon.isActive !== false,
      usageLimit:         coupon.usageLimit         != null ? coupon.usageLimit         : '',
      minimumOrderAmount: coupon.minimumOrderAmount  != null ? coupon.minimumOrderAmount : '',
      expiresAt:          coupon.expiresAt           != null
                            ? new Date(coupon.expiresAt).toISOString().slice(0, 10)
                            : '',
    });
    setSaveError(null);
    setShowCreate(false);
    setEditingCode(coupon.couponCode);
  };

  const closeForm = () => {
    setShowCreate(false);
    setEditingCode(null);
    setSaveError(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const payload = {
        ...form,
        couponCode:         form.couponCode.trim().toUpperCase(),
        discountValue:      Number(form.discountValue),
        usageLimit:         form.usageLimit         !== '' ? Number(form.usageLimit)         : null,
        minimumOrderAmount: form.minimumOrderAmount  !== '' ? Number(form.minimumOrderAmount) : null,
        expiresAt:          form.expiresAt           !== '' ? new Date(form.expiresAt).getTime() : null,
      };
      if (editingCode) {
        await apiPut(`/admin/coupons/${editingCode}`, payload);
        setCoupons(prev => prev.map(c => c.couponCode === editingCode ? { ...c, ...payload } : c));
      } else {
        const result = await apiPost('/admin/coupons', payload);
        setCoupons(prev => [result.coupon, ...prev]);
      }
      closeForm();
    } catch (err) {
      let msg = 'Error al guardar el cupón.';
      try {
        if (err.response) {
          const b = err.response.body;
          const o = typeof b === 'string' ? JSON.parse(b) : await b.json();
          if (o?.error) msg = o.error;
        }
      } catch (_) {}
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteCode) return;
    try {
      await apiDel(`/admin/coupons/${deleteCode}`);
      setCoupons(prev => prev.filter(c => c.couponCode !== deleteCode));
    } catch {
      setError('Error al eliminar el cupón.');
    } finally {
      setDeleteCode(null);
    }
  };

  const handleToggleActive = async (coupon) => {
    const updated = { ...coupon, isActive: !coupon.isActive };
    setCoupons(prev => prev.map(c => c.couponCode === coupon.couponCode ? updated : c));
    try {
      await apiPut(`/admin/coupons/${coupon.couponCode}`, { isActive: !coupon.isActive });
    } catch {
      setCoupons(prev => prev.map(c => c.couponCode === coupon.couponCode ? coupon : c));
    }
  };

  const fmtDate = ts => ts ? new Date(ts).toLocaleDateString('es-GT', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
  const isExpired = ts => ts && Date.now() > Number(ts);

  if (loading) return <p style={{ color: C.muted, fontFamily: FONT }}>Cargando cupones…</p>;
  if (error)   return <p style={{ color: '#c62828', fontFamily: FONT }}>{error}</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={pageTitleStyle}>Cupones ({coupons.length})</h1>
        <button onClick={openCreate} style={primaryBtn}>+ Nuevo Cupón</button>
      </div>

      {/* ── Create / Edit Form ── */}
      {(showCreate || editingCode) && (
        <div style={{ background: C.white, border: `2px solid ${C.roseDeep}`, borderRadius: '10px', padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <p style={miniLabel}>{editingCode ? 'Editando cupón' : 'Nuevo cupón'}</p>
              <h3 style={{ margin: 0, fontFamily: FONT, fontSize: '1rem', fontWeight: 700 }}>
                {editingCode ? editingCode : 'Crear cupón de descuento'}
              </h3>
            </div>
            <button onClick={closeForm} style={ghostBtn}>Cancelar</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>

            {/* Code — read-only when editing */}
            <Field label="Código del Cupón">
              <input
                value={form.couponCode}
                onChange={e => setF('couponCode', e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))}
                style={{ ...inputStyle, fontFamily: 'monospace', fontWeight: 700, fontSize: '0.92rem',
                         letterSpacing: '1px', textTransform: 'uppercase',
                         ...(editingCode ? { background: '#f7f7f7', color: '#aaa' } : {}) }}
                placeholder="Ej: PROMO10"
                disabled={!!editingCode}
                maxLength={30}
              />
            </Field>

            {/* Discount type */}
            <Field label="Tipo de Descuento">
              <div style={{ display: 'flex', gap: '8px' }}>
                {['percentage', 'fixed'].map(type => (
                  <button
                    key={type}
                    onClick={() => setF('discountType', type)}
                    style={{
                      flex: 1, padding: '8px 10px', borderRadius: '4px', cursor: 'pointer',
                      fontFamily: FONT, fontSize: '0.78rem', fontWeight: 600,
                      border: form.discountType === type ? `2px solid ${C.roseDeep}` : `1px solid ${C.roseTint}`,
                      background: form.discountType === type ? C.roseLight : C.white,
                      color: form.discountType === type ? C.roseDeep : C.muted,
                    }}
                  >
                    {type === 'percentage' ? '% Porcentaje' : 'Q Monto Fijo'}
                  </button>
                ))}
              </div>
            </Field>

            {/* Discount value */}
            <Field label={form.discountType === 'percentage' ? 'Porcentaje de Descuento (%)' : 'Monto de Descuento (Q)'}>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: C.muted, fontSize: '0.85rem', fontFamily: FONT }}>
                  {form.discountType === 'percentage' ? '%' : 'Q'}
                </span>
                <input
                  type="number"
                  value={form.discountValue}
                  onChange={e => setF('discountValue', e.target.value)}
                  style={{ ...inputStyle, paddingLeft: '28px' }}
                  min="1"
                  max={form.discountType === 'percentage' ? 100 : undefined}
                  placeholder={form.discountType === 'percentage' ? '10' : '500'}
                />
              </div>
            </Field>

            {/* Description */}
            <Field label="Descripción (nota interna)">
              <input
                value={form.description}
                onChange={e => setF('description', e.target.value)}
                style={inputStyle}
                placeholder="Ej: Promo verano — solo para redes sociales"
                maxLength={200}
              />
            </Field>

            {/* Usage limit */}
            <Field label="Límite de Usos (vacío = ilimitado)">
              <input
                type="number"
                value={form.usageLimit}
                onChange={e => setF('usageLimit', e.target.value)}
                style={inputStyle}
                min="1"
                placeholder="Ilimitado"
              />
            </Field>

            {/* Minimum order */}
            <Field label="Monto Mínimo del Pedido (Q)">
              <input
                type="number"
                value={form.minimumOrderAmount}
                onChange={e => setF('minimumOrderAmount', e.target.value)}
                style={inputStyle}
                min="0"
                placeholder="Sin mínimo"
              />
            </Field>

            {/* Expiry date */}
            <Field label="Fecha de Expiración (vacío = no expira)">
              <input
                type="date"
                value={form.expiresAt}
                onChange={e => setF('expiresAt', e.target.value)}
                style={inputStyle}
              />
            </Field>

            {/* Active toggle */}
            <Field label="Estado">
              <Toggle label="Cupón activo" checked={form.isActive} onChange={v => setF('isActive', v)} />
            </Field>

          </div>

          {saveError && <p style={{ color: '#c62828', fontSize: '0.82rem', marginTop: '14px', fontFamily: FONT }}>{saveError}</p>}

          <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
            <button onClick={handleSave} disabled={saving} style={{ ...primaryBtn, opacity: saving ? 0.6 : 1, minWidth: '160px' }}>
              {saving ? 'Guardando…' : editingCode ? 'Guardar Cambios' : 'Crear Cupón'}
            </button>
            <button onClick={closeForm} style={ghostBtn}>Cancelar</button>
          </div>
        </div>
      )}

      {/* ── Coupon list ── */}
      {coupons.length === 0 ? (
        <div style={{ background: C.white, border: `1px solid ${C.roseTint}`, borderRadius: '8px', padding: '40px', textAlign: 'center' }}>
          <p style={{ color: C.muted, fontFamily: FONT, fontSize: '0.88rem' }}>No hay cupones creados aún.</p>
          <p style={{ color: C.rose, fontFamily: FONT, fontSize: '0.78rem' }}>Haz clic en "+ Nuevo Cupón" para empezar.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {coupons.map(coupon => {
            const expired = isExpired(coupon.expiresAt);
            const statusColor = !coupon.isActive ? '#aaa' : expired ? '#e65100' : '#2e7d32';
            const statusText  = !coupon.isActive ? 'Inactivo' : expired ? 'Expirado' : 'Activo';

            return (
              <div
                key={coupon.couponCode}
                style={{
                  background: C.white,
                  border: editingCode === coupon.couponCode ? `2px solid ${C.roseDeep}` : `1px solid ${C.roseTint}`,
                  borderRadius: '8px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  flexWrap: 'wrap',
                  opacity: (!coupon.isActive || expired) ? 0.75 : 1,
                }}
              >
                {/* Code badge */}
                <div style={{
                  background: C.roseLight,
                  border: `1px solid ${C.roseTint}`,
                  borderRadius: '6px',
                  padding: '6px 14px',
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  color: C.roseDeep,
                  letterSpacing: '1.5px',
                  minWidth: '110px',
                  textAlign: 'center',
                  flexShrink: 0,
                }}>
                  {coupon.couponCode}
                </div>

                {/* Discount */}
                <div style={{ flex: 1, minWidth: '140px' }}>
                  <p style={{ margin: 0, fontFamily: FONT, fontWeight: 700, fontSize: '1rem', color: C.text }}>
                    {coupon.discountType === 'percentage'
                      ? `${coupon.discountValue}% de descuento`
                      : `Q${coupon.discountValue} de descuento`}
                  </p>
                  {coupon.description && (
                    <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: C.muted, fontFamily: FONT }}>{coupon.description}</p>
                  )}
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap' }}>
                  <Stat label="Usos" value={`${coupon.usageCount || 0}${coupon.usageLimit != null ? ` / ${coupon.usageLimit}` : ''}`} />
                  <Stat label="Mínimo" value={coupon.minimumOrderAmount != null ? `Q${coupon.minimumOrderAmount}` : '—'} />
                  <Stat label="Expira" value={coupon.expiresAt ? fmtDate(coupon.expiresAt) : 'Nunca'} accent={expired} />
                  <Stat label="Estado" value={statusText} color={statusColor} />
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <button
                    onClick={() => handleToggleActive(coupon)}
                    title={coupon.isActive ? 'Desactivar' : 'Activar'}
                    style={{
                      ...ghostBtn,
                      fontSize: '0.72rem',
                      padding: '6px 12px',
                      color: coupon.isActive ? '#e65100' : '#2e7d32',
                      borderColor: coupon.isActive ? '#ffccbc' : '#c8e6c9',
                    }}
                  >
                    {coupon.isActive ? 'Desactivar' : 'Activar'}
                  </button>
                  <button onClick={() => openEdit(coupon)} style={{ ...ghostBtn, fontSize: '0.72rem', padding: '6px 12px' }}>
                    Editar
                  </button>
                  <button
                    onClick={() => setDeleteCode(coupon.couponCode)}
                    style={{ ...ghostBtn, fontSize: '0.72rem', padding: '6px 12px', color: '#c62828', borderColor: '#ffcdd2' }}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Delete confirmation ── */}
      {deleteCode && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: C.white, borderRadius: '12px', padding: '32px', maxWidth: '360px', width: '90%', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
            <p style={{ margin: '0 0 8px', fontFamily: FONT, fontWeight: 700, fontSize: '1rem', color: C.text }}>¿Eliminar cupón?</p>
            <p style={{ margin: '0 0 24px', fontFamily: 'monospace', fontWeight: 700, fontSize: '1.1rem', color: C.roseDeep, letterSpacing: '1px' }}>{deleteCode}</p>
            <p style={{ margin: '0 0 24px', fontFamily: FONT, fontSize: '0.82rem', color: C.muted }}>Esta acción es permanente y no se puede deshacer.</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button onClick={() => setDeleteCode(null)} style={{ ...ghostBtn, flex: 1 }}>Cancelar</button>
              <button onClick={handleDelete} style={{ ...primaryBtn, flex: 1, background: '#c62828', borderColor: '#c62828' }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: '4px' }}>
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

function Stat({ label, value, accent, color }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ margin: 0, fontSize: '0.62rem', color: '#bbb', fontFamily: FONT, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
      <p style={{ margin: '2px 0 0', fontSize: '0.8rem', fontWeight: 700, fontFamily: FONT, color: color || (accent ? '#e65100' : C.text) }}>{value}</p>
    </div>
  );
}

const FONT_VAL    = "'Montserrat', sans-serif";
const inputStyle  = { width: '100%', padding: '8px 10px', border: `1px solid ${C.roseTint}`, borderRadius: '4px', fontSize: '0.85rem', fontFamily: FONT_VAL, boxSizing: 'border-box', outline: 'none' };
const labelStyle  = { display: 'block', fontSize: '0.68rem', fontWeight: 700, marginBottom: '5px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: FONT_VAL };
const primaryBtn  = { background: C.roseDeep, color: '#fff', border: 'none', borderRadius: '6px', padding: '10px 20px', cursor: 'pointer', fontSize: '0.82rem', fontFamily: FONT_VAL, fontWeight: 700, letterSpacing: '0.5px' };
const ghostBtn    = { background: C.white, color: '#333', border: `1px solid ${C.roseTint}`, borderRadius: '6px', padding: '10px 16px', cursor: 'pointer', fontSize: '0.82rem', fontFamily: FONT_VAL };
const pageTitleStyle = { fontSize: '1.5rem', fontWeight: 700, marginBottom: '0', letterSpacing: '1px', fontFamily: FONT_VAL };
const miniLabel   = { margin: '0 0 2px', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#aaa', fontFamily: FONT_VAL };
