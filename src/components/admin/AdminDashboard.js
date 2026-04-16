// src/components/admin/AdminDashboard.js
// 2.2 — Summary screen: revenue, enrollments, low-seat warnings,
//        recently deleted reviews, and course update log.

import React, { useState, useEffect } from 'react';
import '../../styles/classes.css';
import { get } from 'aws-amplify/api';

async function apiFetch(path) {
  const op = get({ apiName: 'checkoutApi', path });
  const { body } = await op.response;
  return body.json();
}

export default function AdminDashboard() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    Promise.all([
      apiFetch('/admin/registrations'),
      apiFetch('/admin/seats'),
      apiFetch('/admin/reviews'),
      apiFetch('/admin/courses'),
      apiFetch('/admin/coupons').catch(() => []),
    ])
      .then(([registrations, seats, reviews, courses, coupons]) => {
        // Revenue + enrollment count
        const totalRevenue     = registrations.reduce((sum, r) => sum + Number(r.TotalPrice || 0), 0);
        const totalEnrollments = registrations.length;

        // Seats near full (fewer than 3 remaining) — exclude kit inventory row
        const nearFull = [];
        for (const item of seats) {
          for (const key of Object.keys(item)) {
            if (key === 'id') continue;
            if (key === 'Kit de pieles perfectas') continue;
            const count = Number(item[key]);
            if (count < 3) nearFull.push({ name: key, count });
          }
        }
        nearFull.sort((a, b) => a.count - b.count);

        // Recently deleted reviews — only rows explicitly deleted by an admin
        // (reviews hidden at creation won't have a deletedAt timestamp)
        const deletedReviews = reviews
          .filter(r => !r.isVisible && r.deletedAt)
          .sort((a, b) => (b.deletedAt || 0) - (a.deletedAt || 0))
          .slice(0, 5);

        // Course update log — ALL courses, sorted so recently edited appear first,
        // never-edited courses (no lastUpdatedAt) fall to the bottom.
        const courseUpdates = [...courses].sort((a, b) => {
          if (a.lastUpdatedAt && b.lastUpdatedAt) return (b.lastUpdatedAt || 0) - (a.lastUpdatedAt || 0);
          if (a.lastUpdatedAt) return -1;
          if (b.lastUpdatedAt) return 1;
          return (a.courseName || '').localeCompare(b.courseName || '');
        });

        // Coupon stats
        const couponList = Array.isArray(coupons) ? coupons : [];
        const activeCoupons = couponList.filter(c => c.isActive && !(c.expiresAt && Date.now() > Number(c.expiresAt)));
        const totalCouponUses = couponList.reduce((sum, c) => sum + Number(c.usageCount || 0), 0);
        const topCoupons = [...couponList]
          .sort((a, b) => Number(b.usageCount || 0) - Number(a.usageCount || 0))
          .slice(0, 5);

        setStats({ totalRevenue, totalEnrollments, nearFull, deletedReviews, courseUpdates,
                   activeCoupons, totalCouponUses, topCoupons });
      })
      .catch(() => setError('Error al cargar el dashboard. Verifica que las tablas estén sembradas.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner text="Cargando dashboard…" />;
  if (error)   return <p style={{ color: '#c62828', fontFamily: FONT }}>{error}</p>;

  const fmtQ    = n  => `Q${Number(n).toLocaleString('es-GT', { minimumFractionDigits: 2 })}`;
  const fmtDate = ts => ts ? new Date(ts).toLocaleDateString('es-GT', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

  return (
    <div>
      <PageTitle>Dashboard</PageTitle>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '14px', marginBottom: '28px' }}>
        <StatCard label="Inscripciones Totales"       value={stats.totalEnrollments} />
        <StatCard label="Cursos con Pocos Cupos"      value={stats.nearFull.length} accent={stats.nearFull.length > 0} />
        <StatCard label="Reseñas Eliminadas (últ. 5)" value={stats.deletedReviews.length} />
        <StatCard label="Cupones Activos"             value={stats.activeCoupons.length} />
        <StatCard label="Usos de Cupones (total)"     value={stats.totalCouponUses} />
      </div>

      {/* Low-seat warning */}
      {stats.nearFull.length > 0 && (
        <Section title="Cupos Casi Agotados">
          {stats.nearFull.map(s => (
            <Row key={s.name} left={s.name} right={`${s.count} cupo${s.count !== 1 ? 's' : ''} restante${s.count !== 1 ? 's' : ''}`} accent />
          ))}
        </Section>
      )}

      {/* Recently deleted reviews */}
      <Section title="Últimas Reseñas Eliminadas">
        {stats.deletedReviews.length === 0
          ? <Empty text="Ninguna reseña eliminada recientemente." />
          : stats.deletedReviews.map(r => (
            <Row key={r.reviewId} left={r.name} right={`${fmtDate(r.deletedAt)} · por ${r.deletedBy || '?'}`} />
          ))
        }
      </Section>

      {/* Coupon usage */}
      <Section title="Cupones — Más Usados">
        {stats.topCoupons.length === 0
          ? <Empty text="No hay cupones creados aún." />
          : stats.topCoupons.map(c => {
              const expired = c.expiresAt && Date.now() > Number(c.expiresAt);
              const status = !c.isActive ? 'Inactivo' : expired ? 'Expirado' : 'Activo';
              return (
                <Row
                  key={c.couponCode}
                  left={
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: '1px', fontSize: '0.85rem' }}>
                      {c.couponCode}
                      {' '}
                      <span style={{ fontFamily: FONT, fontWeight: 400, fontSize: '0.75rem', color: '#888' }}>
                        ({c.discountType === 'percentage' ? `${c.discountValue}%` : `Q${c.discountValue}`})
                      </span>
                    </span>
                  }
                  right={`${c.usageCount || 0} uso${(c.usageCount || 0) !== 1 ? 's' : ''} · ${status}`}
                  muted={!c.isActive || expired}
                />
              );
            })
        }
      </Section>

      {/* Course update log */}
      <Section title="Última Actualización por Curso">
        {stats.courseUpdates.length === 0
          ? <Empty text="No se encontraron cursos en la base de datos." />
          : stats.courseUpdates.map(c => (
            <Row
              key={c.courseId}
              left={c.courseName || c.courseId}
              right={c.lastUpdatedAt
                ? `${fmtDate(c.lastUpdatedAt)} · por ${c.lastUpdatedBy || '?'}`
                : 'Sin editar'
              }
              muted={!c.lastUpdatedAt}
            />
          ))
        }
      </Section>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ label, value, accent }) {
  return (
    <div style={{
      background: accent ? '#fdf0f0' : '#fff',
      border: `1px solid ${accent ? '#cd929d' : '#E8CBD4'}`,
      borderRadius: '0', padding: '18px', textAlign: 'center',
    }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '4px', fontFamily: FONT, color: accent ? '#7D4E61' : '#2A2A2A' }}>{value}</div>
      <div style={{ fontSize: '0.72rem', color: '#888', fontFamily: FONT, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '0', padding: '18px 20px', marginBottom: '18px' }}>
      <h2 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '12px', letterSpacing: '0.5px', fontFamily: FONT }}>{title}</h2>
      {children}
    </div>
  );
}

function Row({ left, right, accent, muted }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '8px 0', borderBottom: '1px solid #f0f0f0',
      fontSize: '0.83rem', fontFamily: FONT,
    }}>
      <span style={{ color: accent ? '#e65100' : muted ? '#bbb' : '#333' }}>{left}</span>
      <span style={{ color: muted ? '#ddd' : '#aaa', fontSize: '0.78rem', fontStyle: muted ? 'italic' : 'normal' }}>{right}</span>
    </div>
  );
}

function Empty({ text }) {
  return <p style={{ fontSize: '0.82rem', color: '#bbb', fontFamily: FONT, margin: 0 }}>{text}</p>;
}

function Spinner({ text }) {
  return <p style={{ color: '#aaa', fontFamily: FONT }}>{text}</p>;
}

function PageTitle({ children }) {
  return (
    <h1 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '2.8rem', fontWeight: 300, letterSpacing: '5px', textTransform: 'uppercase', color: '#000000', margin: '0 0 22px 0' }}>{children}</h1>
  );
}

const FONT = "'Montserrat', sans-serif";
