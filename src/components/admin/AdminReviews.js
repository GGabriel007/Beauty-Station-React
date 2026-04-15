// src/components/admin/AdminReviews.js
// 2.6 — Reviews grid with soft-delete and restore.
//        Card visual style matches the public homepage exactly.

import React, { useState, useEffect } from 'react';
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
  const [reviews,       setReviews]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [showHidden,    setShowHidden]    = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null); // reviewId
  const [actionId,      setActionId]      = useState(null); // reviewId being actioned

  useEffect(() => {
    apiFetch('/admin/reviews')
      .then(data => setReviews(Array.isArray(data) ? data : []))
      .catch(() => setError('Error al cargar las reseñas.'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async reviewId => {
    setActionId(reviewId);
    try {
      await apiDel(`/admin/reviews/${reviewId}`);
      setReviews(prev => prev.map(r =>
        r.reviewId === reviewId
          ? { ...r, isVisible: false, deletedAt: Date.now() }
          : r
      ));
      setConfirmDelete(null);
    } catch {
      setError('Error al eliminar la reseña.');
    } finally {
      setActionId(null);
    }
  };

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

  const visible = reviews.filter(r =>  r.isVisible);
  const hidden  = reviews.filter(r => !r.isVisible);
  const shown   = showHidden ? hidden : visible;

  const fmtDate = ts => ts
    ? new Date(ts).toLocaleDateString('es-GT', { year: 'numeric', month: 'short', day: 'numeric' })
    : '—';

  if (loading) return <p style={{ color: '#aaa', fontFamily: FONT }}>Cargando reseñas…</p>;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={pageTitleStyle}>
          Reseñas{' '}
          <span style={{ fontSize: '1rem', fontWeight: 400, color: '#888' }}>
            ({visible.length} visible{visible.length !== 1 ? 's' : ''} · {hidden.length} oculta{hidden.length !== 1 ? 's' : ''})
          </span>
        </h1>

        {/* Show hidden toggle */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.84rem', fontFamily: FONT, userSelect: 'none' }}>
          <div
            onClick={() => setShowHidden(v => !v)}
            style={{
              width: '38px', height: '20px', borderRadius: '10px',
              background: showHidden ? '#7D4E61' : '#ccc',
              position: 'relative', transition: 'background 0.2s', cursor: 'pointer', flexShrink: 0,
            }}
          >
            <div style={{
              width: '14px', height: '14px', borderRadius: '50%', background: '#fff',
              position: 'absolute', top: '3px',
              left: showHidden ? '21px' : '3px',
              transition: 'left 0.2s',
            }} />
          </div>
          Mostrar reseñas ocultas
        </label>
      </div>

      {error && <p style={{ color: '#c62828', marginBottom: '12px', fontFamily: FONT }}>{error}</p>}

      {shown.length === 0 && (
        <p style={{ color: '#bbb', fontFamily: FONT }}>
          {showHidden ? 'No hay reseñas eliminadas.' : 'No hay reseñas visibles.'}
        </p>
      )}

      {/* Review grid — same layout as public homepage */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '16px' }}>
        {shown.map(review => (
          <ReviewCard
            key={review.reviewId}
            review={review}
            confirmDelete={confirmDelete}
            actionId={actionId}
            onRequestDelete={() => setConfirmDelete(review.reviewId)}
            onCancelDelete={() => setConfirmDelete(null)}
            onDelete={() => handleDelete(review.reviewId)}
            onRestore={() => handleRestore(review.reviewId)}
            fmtDate={fmtDate}
          />
        ))}
      </div>
    </div>
  );
}

// ── Review card: homepage visual + admin action strip at the bottom ────────────

function ReviewCard({ review, confirmDelete, actionId, onRequestDelete, onCancelDelete, onDelete, onRestore, fmtDate }) {
  const isBusy    = actionId === review.reviewId;
  const isPending = confirmDelete === review.reviewId;
  const stars     = Math.min(5, Math.max(0, Number(review.rating) || 5));

  return (
    <div
      className="home-review-card"
      style={{
        // Override the card's box-shadow/border for hidden reviews so staff can
        // visually distinguish them from live ones.
        opacity:    review.isVisible ? 1 : 0.7,
        border:     review.isVisible ? undefined : '1.5px dashed #f5c6c6',
        background: review.isVisible ? '#fff' : '#fff8f8',
        // Prevent the hover lift on hidden cards (staff shouldn't be distracted)
        pointerEvents: isBusy ? 'none' : 'auto',
      }}
    >
      {/* Hidden badge */}
      {!review.isVisible && (
        <div style={{ marginBottom: '6px' }}>
          <span style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#c62828', background: '#fdecea', border: '1px solid #f5c6c6', borderRadius: '3px', padding: '2px 7px', fontFamily: FONT }}>
            Oculta
          </span>
        </div>
      )}

      {/* ── Stars (homepage style) ── */}
      <div className="home-stars" style={{ marginBottom: '6px' }}>
        {[1, 2, 3, 4, 5].map(i => (
          <span key={i} className={`home-star${i <= stars ? ' home-star--filled' : ''}`}>★</span>
        ))}
      </div>

      {/* ── Review text ── */}
      <p className="home-review-text" style={{ marginBottom: '10px' }}>{review.text}</p>

      {/* ── Service tags ── */}
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

      {/* ── Footer: avatar + name/date + source badge (homepage style) ── */}
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

      {/* ── Admin strip ── */}
      <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '10px', marginTop: '10px' }}>

        {/* Deletion metadata */}
        {!review.isVisible && review.deletedAt && (
          <p style={{ margin: '0 0 8px', fontSize: '0.7rem', color: '#c62828', fontFamily: FONT }}>
            Eliminada el {fmtDate(review.deletedAt)}
            {review.deletedBy ? ` · por ${review.deletedBy}` : ''}
          </p>
        )}

        {review.isVisible ? (
          isPending ? (
            /* Confirmation step */
            <div style={{ fontSize: '0.8rem', fontFamily: FONT, lineHeight: 1.6 }}>
              <p style={{ margin: '0 0 6px', color: '#c62828', fontWeight: 600 }}>
                ¿Estás seguro de que quieres eliminar esta reseña?
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={onDelete}
                  disabled={isBusy}
                  style={{ background: '#c62828', color: '#fff', border: 'none', borderRadius: '4px', padding: '6px 14px', cursor: 'pointer', fontSize: '0.78rem', fontFamily: FONT, fontWeight: 600, opacity: isBusy ? 0.6 : 1 }}
                >
                  {isBusy ? 'Eliminando…' : 'Sí, eliminar'}
                </button>
                <button
                  onClick={onCancelDelete}
                  style={{ background: '#fff', color: '#555', border: '1px solid #ddd', borderRadius: '4px', padding: '6px 14px', cursor: 'pointer', fontSize: '0.78rem', fontFamily: FONT }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            /* Default: red delete button */
            <button
              onClick={onRequestDelete}
              disabled={isBusy}
              style={{ background: 'none', border: '1px solid #c62828', color: '#c62828', borderRadius: '4px', padding: '5px 14px', cursor: 'pointer', fontSize: '0.75rem', fontFamily: FONT, fontWeight: 600, opacity: isBusy ? 0.5 : 1 }}
            >
              Eliminar
            </button>
          )
        ) : (
          /* Hidden review: restore button */
          <button
            onClick={onRestore}
            disabled={isBusy}
            style={{ background: '#111', color: '#fff', border: 'none', borderRadius: '4px', padding: '5px 14px', cursor: 'pointer', fontSize: '0.75rem', fontFamily: FONT, fontWeight: 600, opacity: isBusy ? 0.5 : 1 }}
          >
            {isBusy ? 'Restaurando…' : 'Restaurar'}
          </button>
        )}
      </div>
    </div>
  );
}

const FONT         = "'Montserrat', sans-serif";
const pageTitleStyle = { fontSize: '1.5rem', fontWeight: 700, margin: 0, letterSpacing: '1px', fontFamily: FONT };
