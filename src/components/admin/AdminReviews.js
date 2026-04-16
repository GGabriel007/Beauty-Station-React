// src/components/admin/AdminReviews.js
// 2.6 — Reviews grid with three-phase lifecycle:
//        Visible → Hidden (soft-delete) → Permanently Deleted (hard-delete)

import React, { useState, useEffect } from 'react';
import '../../styles/classes.css';
import { get, put, del } from 'aws-amplify/api';
// Import homepage styles so the card CSS classes are available on the admin route
import '../../styles/beauty-Station.css';

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

async function apiDel(path) {
  const op = del({ apiName: 'checkoutApi', path });
  await op.response;
}

export default function AdminReviews() {
  const [reviews,            setReviews]            = useState([]);
  const [loading,            setLoading]            = useState(true);
  const [error,              setError]              = useState(null);

  // 'visible' | 'hidden' — which list is displayed
  const [activeTab,          setActiveTab]          = useState('visible');

  // Soft-hide confirm
  const [confirmHide,        setConfirmHide]        = useState(null); // reviewId
  // Permanent-delete confirm
  const [confirmPermanent,   setConfirmPermanent]   = useState(null); // reviewId
  const [actionId,           setActionId]           = useState(null);

  useEffect(() => {
    apiFetch('/admin/reviews')
      .then(data => setReviews(Array.isArray(data) ? data : []))
      .catch(() => setError('Error al cargar las reseñas.'))
      .finally(() => setLoading(false));
  }, []);

  // Phase 1→2: Visible → Hidden (soft-delete, existing API)
  const handleHide = async reviewId => {
    setActionId(reviewId);
    try {
      await apiDel(`/admin/reviews/${reviewId}`);
      setReviews(prev => prev.map(r =>
        r.reviewId === reviewId
          ? { ...r, isVisible: false, deletedAt: Date.now() }
          : r
      ));
      setConfirmHide(null);
    } catch {
      setError('Error al ocultar la reseña.');
    } finally {
      setActionId(null);
    }
  };

  // Phase 2→1: Hidden → Visible (restore)
  const handleRestore = async reviewId => {
    setActionId(reviewId);
    try {
      await apiPut(`/admin/reviews/${reviewId}`, {});
      setReviews(prev => prev.map(r =>
        r.reviewId === reviewId
          ? { ...r, isVisible: true, deletedAt: undefined }
          : r
      ));
    } catch {
      setError('Error al restaurar la reseña.');
    } finally {
      setActionId(null);
    }
  };

  // Phase 2→3: Hidden → Permanently Deleted (hard-delete)
  // Uses the same DELETE endpoint but with a ?permanent=true flag so the
  // Lambda can remove the item entirely instead of just marking isVisible=false.
  const handlePermanentDelete = async reviewId => {
    setActionId(reviewId);
    try {
      await apiDel(`/admin/reviews/${reviewId}?permanent=true`);
      // Remove from local state entirely
      setReviews(prev => prev.filter(r => r.reviewId !== reviewId));
      setConfirmPermanent(null);
    } catch {
      setError('Error al eliminar permanentemente la reseña.');
    } finally {
      setActionId(null);
    }
  };

  const visible = reviews.filter(r =>  r.isVisible);
  const hidden  = reviews.filter(r => !r.isVisible);
  const shown   = activeTab === 'visible' ? visible : hidden;

  const fmtDate = ts => ts
    ? new Date(ts).toLocaleDateString('es-GT', { year: 'numeric', month: 'short', day: 'numeric' })
    : '—';

  if (loading) return <p style={{ color: '#aaa', fontFamily: FONT }}>Cargando reseñas…</p>;

  return (
    <div>
      {/* Header */}
      <h1 className="admin-page-title">Reseñas</h1>

      {/* ── Phase tabs ── */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '24px', borderBottom: '2px solid #f0f0f0' }}>
        {[
          { id: 'visible', label: `Visibles (${visible.length})` },
          { id: 'hidden',  label: `Ocultas (${hidden.length})` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 22px',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #7D4E61' : '2px solid transparent',
              marginBottom: '-2px',
              background: 'none',
              fontFamily: FONT,
              fontSize: '0.8rem',
              fontWeight: 700,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              color: activeTab === tab.id ? '#7D4E61' : '#aaa',
              cursor: 'pointer',
              transition: 'color 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Lifecycle guide */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <PhaseChip color="#2e7d32" bg="#e8f5e9" label="① Visible" />
        <span style={{ color: '#bbb', fontSize: '0.8rem' }}>→</span>
        <PhaseChip color="#e65100" bg="#fff3e0" label="② Oculta" />
        <span style={{ color: '#bbb', fontSize: '0.8rem' }}>→</span>
        <PhaseChip color="#c62828" bg="#fdecea" label="③ Eliminada para siempre" />
        <span style={{ color: '#bbb', fontSize: '0.72rem', marginLeft: '6px' }}>
          Las reseñas ocultas ya no aparecen en el sitio público, pero siguen en la base de datos hasta que las elimines definitivamente.
        </span>
      </div>

      {error && <p style={{ color: '#c62828', marginBottom: '12px', fontFamily: FONT }}>{error}</p>}

      {shown.length === 0 && (
        <p style={{ color: '#bbb', fontFamily: FONT }}>
          {activeTab === 'visible' ? 'No hay reseñas visibles.' : 'No hay reseñas ocultas.'}
        </p>
      )}

      {/* Review grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '16px' }}>
        {shown.map(review => (
          <ReviewCard
            key={review.reviewId}
            review={review}
            confirmHide={confirmHide}
            confirmPermanent={confirmPermanent}
            actionId={actionId}
            onRequestHide={() => setConfirmHide(review.reviewId)}
            onCancelHide={() => setConfirmHide(null)}
            onHide={() => handleHide(review.reviewId)}
            onRestore={() => handleRestore(review.reviewId)}
            onRequestPermanent={() => setConfirmPermanent(review.reviewId)}
            onCancelPermanent={() => setConfirmPermanent(null)}
            onPermanentDelete={() => handlePermanentDelete(review.reviewId)}
            fmtDate={fmtDate}
          />
        ))}
      </div>
    </div>
  );
}

// ── Small phase chip label ────────────────────────────────────────────────────
function PhaseChip({ label, color, bg }) {
  return (
    <span style={{
      fontFamily: FONT, fontSize: '0.68rem', fontWeight: 700,
      letterSpacing: '0.5px', color, background: bg,
      border: `1px solid ${color}`, padding: '3px 10px', borderRadius: '0',
    }}>
      {label}
    </span>
  );
}

// ── Review card ───────────────────────────────────────────────────────────────
function ReviewCard({
  review, confirmHide, confirmPermanent, actionId,
  onRequestHide, onCancelHide, onHide,
  onRestore,
  onRequestPermanent, onCancelPermanent, onPermanentDelete,
  fmtDate,
}) {
  const isBusy          = actionId === review.reviewId;
  const isPendingHide   = confirmHide      === review.reviewId;
  const isPendingPerm   = confirmPermanent === review.reviewId;
  const stars           = Math.min(5, Math.max(0, Number(review.rating) || 5));

  return (
    <div
      className="home-review-card"
      style={{
        opacity:       review.isVisible ? 1 : 0.75,
        border:        review.isVisible ? undefined : '1.5px dashed #f5c6c6',
        background:    review.isVisible ? '#fff' : '#fff8f8',
        pointerEvents: isBusy ? 'none' : 'auto',
      }}
    >
      {/* Phase badge */}
      {!review.isVisible && (
        <div style={{ marginBottom: '6px' }}>
          <span style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#e65100', background: '#fff3e0', border: '1px solid #ffcc80', borderRadius: '0', padding: '2px 7px', fontFamily: FONT }}>
            Oculta
          </span>
        </div>
      )}

      {/* Stars */}
      <div className="home-stars" style={{ marginBottom: '6px' }}>
        {[1, 2, 3, 4, 5].map(i => (
          <span key={i} className={`home-star${i <= stars ? ' home-star--filled' : ''}`}>★</span>
        ))}
      </div>

      {/* Text */}
      <p className="home-review-text" style={{ marginBottom: '10px' }}>{review.text}</p>

      {/* Service tags */}
      {Array.isArray(review.services) && review.services.length > 0 && (
        <div className="home-review-services" style={{ marginBottom: '10px' }}>
          <span className="home-review-services-label">Servicios</span>
          <div className="home-review-services-tags">
            {review.services.map(s => (
              <span key={s} className="home-review-service-tag">{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* Footer: avatar + name + date + source */}
      <div className="home-review-footer">
        <div className="home-review-avatar">
          {review.avatar
            ? <img src={review.avatar} alt={review.name} className="home-review-avatar-img" />
            : (review.name || '?').charAt(0).toUpperCase()
          }
        </div>
        <div className="home-review-info">
          <span className="home-review-name">{review.name}</span>
          <span className="home-review-date">{review.date || fmtDate(review.createdAt)}</span>
        </div>
        {review.source === 'google' && (
          <span className="home-review-google-badge" title="Reseña de Google">G</span>
        )}
      </div>

      {/* ── Admin action strip ── */}
      <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '10px', marginTop: '10px' }}>

        {/* Deletion metadata */}
        {!review.isVisible && review.deletedAt && (
          <p style={{ margin: '0 0 8px', fontSize: '0.7rem', color: '#e65100', fontFamily: FONT }}>
            Ocultada el {fmtDate(review.deletedAt)}
            {review.deletedBy ? ` · por ${review.deletedBy}` : ''}
          </p>
        )}

        {review.isVisible ? (
          /* ── Phase 1: Visible ── */
          isPendingHide ? (
            <div style={{ fontSize: '0.8rem', fontFamily: FONT }}>
              <p style={{ margin: '0 0 6px', color: '#e65100', fontWeight: 600 }}>
                ¿Ocultar esta reseña del sitio público?
              </p>
              <p style={{ margin: '0 0 8px', fontSize: '0.72rem', color: '#888' }}>
                La reseña seguirá en la base de datos y podrás restaurarla luego.
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={onHide} disabled={isBusy} style={dangerBtn}>
                  {isBusy ? 'Ocultando…' : 'Sí, ocultar'}
                </button>
                <button onClick={onCancelHide} style={cancelBtn}>Cancelar</button>
              </div>
            </div>
          ) : (
            <button onClick={onRequestHide} disabled={isBusy} style={outlineOrangeBtn}>
              Ocultar
            </button>
          )
        ) : (
          /* ── Phase 2: Hidden ── */
          isPendingPerm ? (
            <div style={{ fontSize: '0.8rem', fontFamily: FONT }}>
              <p style={{ margin: '0 0 6px', color: '#c62828', fontWeight: 700 }}>
                ⚠ Esta acción es IRREVERSIBLE
              </p>
              <p style={{ margin: '0 0 8px', fontSize: '0.72rem', color: '#888' }}>
                La reseña se borrará permanentemente de la base de datos y no podrá recuperarse.
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={onPermanentDelete} disabled={isBusy} style={{ ...dangerBtn, background: '#c62828' }}>
                  {isBusy ? 'Eliminando…' : 'Eliminar para siempre'}
                </button>
                <button onClick={onCancelPermanent} style={cancelBtn}>Cancelar</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button onClick={onRestore} disabled={isBusy} style={restoreBtn}>
                {isBusy ? 'Restaurando…' : 'Restaurar'}
              </button>
              <button onClick={onRequestPermanent} disabled={isBusy} style={outlineRedBtn}>
                Eliminar definitivamente
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}

// ── Shared button styles ──────────────────────────────────────────────────────
const FONT = "'Montserrat', sans-serif";

const base = {
  border: 'none', borderRadius: '0', padding: '6px 14px',
  cursor: 'pointer', fontSize: '0.75rem', fontFamily: FONT, fontWeight: 600,
};

const dangerBtn      = { ...base, background: '#e65100', color: '#fff' };
const cancelBtn      = { ...base, background: '#fff', color: '#555', border: '1px solid #ddd' };
const restoreBtn     = { ...base, background: '#111', color: '#fff' };
const outlineOrangeBtn = { ...base, background: 'none', border: '1px solid #e65100', color: '#e65100' };
const outlineRedBtn  = { ...base, background: 'none', border: '1px solid #c62828', color: '#c62828' };

const pageTitleStyle = {
  fontFamily: "'Montserrat', sans-serif", fontSize: '2.8rem', fontWeight: 300,
  letterSpacing: '5px', textTransform: 'uppercase', color: '#000000', margin: '0 0 22px 0',
};
