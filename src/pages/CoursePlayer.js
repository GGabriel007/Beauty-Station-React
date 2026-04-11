import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { get, post } from 'aws-amplify/api';
import { toast } from 'react-toastify';
import { FiCheckCircle, FiCircle, FiChevronRight, FiLock, FiArrowLeft } from 'react-icons/fi';
import '../styles/CoursePlayer.css';

const CoursePlayer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { authStatus } = useAuthenticator(ctx => [ctx.authStatus]);

  const [userEmail, setUserEmail] = useState('');
  const [lessons, setLessons] = useState([]);
  const [courseName, setCourseName] = useState('');
  const [completedLessons, setCompletedLessons] = useState([]);
  const [currentLessonId, setCurrentLessonId] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoLoading, setVideoLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);

  // Step 1: redirect if not logged in, otherwise get email
  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      sessionStorage.setItem('loginRedirect', `/mis-cursos/${courseId}`);
      navigate('/login');
    } else if (authStatus === 'authenticated') {
      fetchUserAttributes()
        .then(attrs => setUserEmail(attrs.email || ''))
        .catch(() => {});
    }
  }, [authStatus, courseId, navigate]);

  // Step 2: fetch lessons (access-gated) + progress once we have the email
  useEffect(() => {
    if (!userEmail) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const lessonsOp = get({
          apiName: 'checkoutApi',
          path: `/course-lessons/${courseId}?email=${encodeURIComponent(userEmail)}`
        });
        const lessonsRes = await lessonsOp.response;
        const lessonsData = await lessonsRes.body.json();
        setLessons(lessonsData.lessons || []);
        setCourseName(lessonsData.courseName || '');

        const progressOp = get({
          apiName: 'checkoutApi',
          path: `/course-progress/${courseId}?email=${encodeURIComponent(userEmail)}`
        });
        const progressRes = await progressOp.response;
        const progressData = await progressRes.body.json();
        setCompletedLessons(progressData.completedLessons || []);

        const firstId = (lessonsData.lessons || [])[0]?.id;
        setCurrentLessonId(progressData.lastWatched || firstId || null);
      } catch (err) {
        try {
          const body = err.response?.body;
          const parsed = typeof body === 'string' ? JSON.parse(body) : await body?.json();
          if (parsed?.error?.includes('No tienes acceso')) {
            setAccessDenied(true);
            return;
          }
        } catch (_) {}
        toast.error('Error al cargar el curso. Intenta de nuevo.', { autoClose: 5000 });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userEmail, courseId]);

  // Fetch a fresh CloudFront signed URL whenever the selected lesson changes
  useEffect(() => {
    if (!currentLessonId || !userEmail) return;
    let cancelled = false;

    const fetchVideoUrl = async () => {
      setVideoUrl('');
      setVideoLoading(true);
      try {
        const op = get({
          apiName: 'checkoutApi',
          path: `/course-video-url/${courseId}/${currentLessonId}?email=${encodeURIComponent(userEmail)}`
        });
        const res = await op.response;
        const data = await res.body.json();
        if (!cancelled) setVideoUrl(data.videoUrl || '');
      } catch (err) {
        console.error('Error fetching signed video URL:', err);
        if (!cancelled) toast.error('Error al cargar el video. Intenta de nuevo.', { autoClose: 5000 });
      } finally {
        if (!cancelled) setVideoLoading(false);
      }
    };

    fetchVideoUrl();
    return () => { cancelled = true; };
  }, [currentLessonId, userEmail, courseId]);

  const saveProgress = useCallback(async (newCompleted, newLastWatched) => {
    if (!userEmail) return;
    setSavingProgress(true);
    try {
      const op = post({
        apiName: 'checkoutApi',
        path: `/course-progress/${courseId}`,
        options: { body: { email: userEmail, completedLessons: newCompleted, lastWatched: newLastWatched } }
      });
      await op.response;
    } catch {
      console.error('Progress save failed');
    } finally {
      setSavingProgress(false);
    }
  }, [userEmail, courseId]);

  const handleMarkComplete = () => {
    if (!currentLessonId || completedLessons.includes(currentLessonId)) return;
    const newCompleted = [...completedLessons, currentLessonId];
    setCompletedLessons(newCompleted);
    saveProgress(newCompleted, currentLessonId);
    toast.success('¡Lección marcada como completada!', { autoClose: 3000 });
  };

  const handleSelectLesson = (lessonId) => {
    setCurrentLessonId(lessonId);
    saveProgress(completedLessons, lessonId);
  };

  if (authStatus === 'configuring' || loading) {
    return (
      <div className="cp-loading">
        <div className="cp-spinner" />
        <p>Cargando tu curso...</p>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="cp-access-denied">
        <FiLock size={48} className="cp-lock-icon" />
        <h2>Acceso Restringido</h2>
        <p>No tienes acceso a este curso. Adquiérelo para comenzar a aprender.</p>
        <button onClick={() => navigate('/classes/classes-2')} className="cp-btn-primary">
          Ver Cursos Disponibles
        </button>
      </div>
    );
  }

  const currentLesson = lessons.find(l => l.id === currentLessonId);
  const isCurrentComplete = completedLessons.includes(currentLessonId);
  const progressPct = lessons.length > 0
    ? Math.round((completedLessons.length / lessons.length) * 100)
    : 0;

  return (
    <div className="cp-wrapper">
      <button className="cp-back-btn" onClick={() => navigate('/dashboard')}>
        <FiArrowLeft /> Volver a mi perfil
      </button>

      <h1 className="cp-page-title">{courseName}</h1>
      <p className="cp-page-subtitle">Curso en Línea</p>

      <div className="cp-progress-header">
        <span />
        <span className="cp-progress-badge">{progressPct}% completado</span>
      </div>

      <div className="cp-body">
        {/* ── Sidebar ── */}
        <aside className="cp-sidebar">
          <div className="cp-sidebar-header">
            <p className="cp-sidebar-label">Contenido del Curso</p>
            <div className="cp-progress-bar-wrapper">
              <div className="cp-progress-track">
                <div className="cp-progress-fill" style={{ width: `${progressPct}%` }} />
              </div>
              <span className="cp-progress-text">
                {completedLessons.length}/{lessons.length} lecciones
              </span>
            </div>
          </div>

          <ul className="cp-lesson-list">
            {lessons.map((lesson, idx) => {
              const isDone = completedLessons.includes(lesson.id);
              const isActive = lesson.id === currentLessonId;
              return (
                <li
                  key={lesson.id}
                  className={`cp-lesson-item${isActive ? ' cp-lesson-active' : ''}${isDone ? ' cp-lesson-done' : ''}`}
                  onClick={() => handleSelectLesson(lesson.id)}
                >
                  <span className="cp-lesson-icon">
                    {isDone ? <FiCheckCircle /> : <FiCircle />}
                  </span>
                  <div className="cp-lesson-info">
                    <span className="cp-lesson-num">Lección {idx + 1}</span>
                    <span className="cp-lesson-name">{lesson.title}</span>
                    {lesson.duration && (
                      <span className="cp-lesson-duration">{lesson.duration}</span>
                    )}
                  </div>
                  {isActive && <FiChevronRight className="cp-lesson-arrow" />}
                </li>
              );
            })}
          </ul>
        </aside>

        {/* ── Main content ── */}
        <main className="cp-main">
          {currentLesson ? (
            <>
              <div className="cp-video-card">
                <div className="cp-video-wrapper">
                  {videoLoading && (
                    <div className="cp-video-loading">
                      <div className="cp-spinner" />
                    </div>
                  )}
                  {!videoLoading && videoUrl && (
                    <video
                      key={videoUrl}
                      src={videoUrl}
                      controls
                      controlsList="nodownload"
                      disablePictureInPicture
                      onContextMenu={e => e.preventDefault()}
                      className="cp-video"
                    />
                  )}
                </div>
              </div>

              <div className="cp-lesson-detail">
                <div className="cp-lesson-detail-header">
                  <h2 className="cp-lesson-detail-title">{currentLesson.title}</h2>
                  <button
                    className={`cp-complete-btn${isCurrentComplete ? ' cp-complete-btn--done' : ''}`}
                    onClick={handleMarkComplete}
                    disabled={isCurrentComplete || savingProgress}
                  >
                    {isCurrentComplete ? '✓ Completada' : 'Marcar como completada'}
                  </button>
                </div>
                <p className="cp-lesson-desc">{currentLesson.description}</p>
              </div>
            </>
          ) : (
            <div className="cp-empty">
              <p>Selecciona una lección para comenzar.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CoursePlayer;
