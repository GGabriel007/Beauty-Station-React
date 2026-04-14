// src/components/admin/AdminReviews.js
// 2.6 — Reviews grid with soft-delete and restore.

import React, { useState, useEffect } from 'react';
import { get, put, del } from 'aws-amplify/api';

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
      setReviews(prev => prev.map(r => r.reviewId === reviewId ? { ...r, isVisible: false } : r));
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
      setReviews(prev => prev.map(r => r.reviewId === reviewId ? { ...r, isVisible: true } : r));
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
            ({visible.length} visibles · {hidden.length} ocultas)
          </span>
        </h1>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.84rem', fontFamily: FONT }}>
          <input
            type="checkbox"
            checked={showHidden}
            onChange={e => setShowHidden(e.target.checked)}
            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
          />
          Mostrar reseñas ocultas
        </label>
      </div>

      {error && <p style={{ color: '#c62828', marginBottom: '12px', fontFamily: FONT }}>{error}</p>}

      {shown.length === 0 && (
        <p style={{ color: '#bbb', fontFamily: FONT }}>
          {showHidden ? 'No hay reseñas eliminadas.' : 'No hay reseñas visibles.'}
        </p>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '14px' }}>
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

function ReviewCard({ review, confirmDelete, actionId, onRequestDelete, onCancelDelete, onDelete, onRestore, fmtDate }) {
  const isBusy    = actionId === review.reviewId;
  const isPending = confirmDelete === review.reviewId;
  const stars     = Math.min(5, Math.max(0, Number(review.rating) || 5));

  return (
    <div style={{
      background: '#fff',
      border: `1px solid ${review.isVisible ? '#e0e0e0' : '#f5c6c6'}`,
      borderRadius: '8px',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      opacity: review.isVisible ? 1 : 0.8,
    }}>
      {/* Stars */}
      <div style={{ color: '#f5a623', fontSize: '0.95rem' }}>
        {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
      </div>

      {/* Name + source */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong style={{ fontSize: '0.88rem', fontFamily: FONT }}>{review.name}</strong>
        {review.source && (
          <span style={{ fontSize: '0.65rem', background: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: '3px', padding: '2px 6px', color: '#888', fontFamily: FONT }}>
            {review.source}
          </span>
        )}
      </div>

      {/* Date */}
      {review.date && <p style={{ margin: 0, fontSize: '0.72rem', color: '#bbb', fontFamily: FONT }}>{review.date}</p>}

      {/* Text */}
      <p style={{ margin: 0, fontSize: '0.8rem', color: '#555', lineHeight: 1.5, fontFamily: FONT, flex: 1 }}>{review.text}</p>

      {/* Services */}
      {Array.isArray(review.services) && review.services.length > 0 && (
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {review.services.map(s => (
            <span key={s} style={{ fontSize: '0.65rem', background: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: '3px', padding: '2px 6px', color: '#666', fontFamily: FONT }}>{s}</span>
          ))}
        </div>
      )}

      {/* Deleted info */}
      {!review.isVisible && review.deletedAt && (
        <p style={{ margin: 0, fontSize: '0.7rem', color: '#c62828', fontFamily: FONT }}>
          Eliminado el {fmtDate(review.deletedAt)} · por {review.deletedBy || '?'}
        </p>
      )}

      {/* Action area */}
      <div style={{ marginTop: '4px', borderTop: '1px solid #f0f0f0', paddingTop: '10px' }}>
        {review.isVisible ? (
          isPending ? (
            <div style={{ fontSize: '0.8rem', fontFamily: FONT }}>
              <span style={{ color: '#c62828' }}>¿Eliminar esta reseña?</span>{' '}
              <button onClick={onDelete} disabled={isBusy}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c62828', fontWeight: 700, fontFamily: FONT, fontSize: '0.8rem', textDecoration: 'underline' }}>
                {isBusy ? '…' : 'Sí, eliminar'}
              </button>{' '}
              <button onClick={onCancelDelete}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', fontFamily: FONT, fontSize: '0.8rem', textDecoration: 'underline' }}>
                Cancelar
              </button>
            </div>
          ) : (
            <button onClick={onRequestDelete} disabled={isBusy}
              style={{ background: 'none', border: '1px solid #c62828', color: '#c62828', borderRadius: '4px', padding: '5px 12px', cursor: 'pointer', fontSize: '0.75rem', fontFamily: FONT, opacity: isBusy ? 0.5 : 1 }}>
              Eliminar
            </button>
          )
        ) : (
          <button onClick={onRestore} disabled={isBusy}
            style={{ background: '#111', color: '#fff', border: 'none', borderRadius: '4px', padding: '5px 12px', cursor: 'pointer', fontSize: '0.75rem', fontFamily: FONT, opacity: isBusy ? 0.5 : 1 }}>
            {isBusy ? '…' : 'Restaurar'}
          </button>
        )}
      </div>
    </div>
  );
}

const FONT         = "'Montserrat', sans-serif";
const pageTitleStyle = { fontSize: '1.5rem', fontWeight: 700, margin: 0, letterSpacing: '1px', fontFamily: FONT };
