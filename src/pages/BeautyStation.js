// src/pages/BeautyStation.js
import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import '../styles/beauty-Station.css';
import { Link } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { fetchUserAttributes } from 'aws-amplify/auth';

/* ── Hardcoded Google reviews ── */
const GOOGLE_REVIEWS = [
  {
    id: 'g1',
    name: 'Sonya Amirhamzeh',
    rating: 5,
    date: 'Diciembre 2025',
    text: 'I cannot say enough amazing things about Beauty Station Guatemala! They did the hair and makeup for me (the bride), my mom, my mother-in-law, and all of my bridesmaids for our wedding in Antigua — and every single person looked absolutely stunning. Not one person was even slightly unhappy with how they looked. Every hairstyle and makeup look was flawless, unique, and lasted beautifully all day and night.\n\nFrom the moment their team arrived, they brought such a calm, joyful energy to the morning. They worked efficiently but never rushed, and somehow managed to make each person feel special and cared for. I felt so confident and beautiful — exactly how every bride hopes to feel on her wedding day — and my mom still talks about how much she loved her look.\n\nWe scouted several artists before deciding, and I can say without hesitation that Beauty Station Guatemala is the best in town. Their professionalism, skill, and warmth truly set them apart. I would recommend them a thousand times over to any bride getting married in Guatemala. They made our day unforgettable.',
    services: ['Bridal services', 'Makeup services', 'Hairstyling'],
    source: 'google',
    avatar: null,
  },
  {
    id: 'g2',
    name: 'Lotte Zoontjens',
    rating: 5,
    date: 'Marzo 2025',
    text: 'I hired Aleh and her team for my destination wedding in Antigua, they took care of me and my bridesmaids as well as most of my family members and made sure we all looked spectacular for my wedding day. The team is very experienced and profesional and really provide high quality but personalized makeup and hair services. I did several trials before with other agencies but Aleh\'s agency really stood out in my opinion. The products they use and their expertise on long wear hair styles that last all day was really exceptional. Highly recommended !',
    images: [
      `${process.env.PUBLIC_URL}/images/reviews/lotte-1.webp`,
      `${process.env.PUBLIC_URL}/images/reviews/lotte-2.webp`,
      `${process.env.PUBLIC_URL}/images/reviews/lotte-3.webp`,
    ],
    source: 'google',
    avatar: null,
  },
  {
    id: 'g3',
    name: 'Adriana Cifuentes',
    rating: 5,
    date: 'Marzo 2025',
    text: 'I was a bridesmaid for my friend\'s destination wedding in Antigua, Guatemala. We booked Beauty Station for this important day. My appointment was at 6 a.m., and they finished my hair and makeup by 7:30 a.m. The wedding was at 4 p.m., and the ceremony at 7 p.m. My hair and makeup stayed intact the entire time. I can fully recommend this team of professionals; not only were they very punctual, but they were also very nice to me and to all of us 🤍🥰😍',
    services: ['Bridal services', 'Makeup services'],
    images: [
      `${process.env.PUBLIC_URL}/images/reviews/adriana-1.webp`,
      `${process.env.PUBLIC_URL}/images/reviews/adriana-2.webp`,
    ],
    source: 'google',
    avatar: null,
  },
  {
    id: 'g4',
    name: 'Sydney Smith',
    rating: 5,
    date: 'Julio 2025',
    text: 'WOW! I cannot say enough amazing things about Beauty Station and the incredible work of Aleh and her team for my wedding in Antigua! From the moment we connected, Aleh was professional, kind, and genuinely passionate about making me feel beautiful on my special day.\n\nI went to their studio in Guatemala City for a hair trial a year before my wedding & they traveled to Antigua on my wedding day. Their studio is BEAUTIFUL & we had the best time putting my look together.\n\nOn my wedding day, they made getting ready such a joy for myself, bridesmaids, and the moms. Regardless of age, they knew exactly how to make each woman feel their most beautiful!\n\nOur hair & makeup lasted all day and night, through the heat and happy tears, and I still felt flawless by the end of it all!\n\nAleh is beyond talented and a joy to be around, and I would 100% use Beauty Station again without hesitation. If you\'re getting married in Antigua, don\'t think twice—book them! You will be in the best hands possible. I would book them 100 times again!\n\nThank you again to Aleh and the team for helping make my wedding day so magical! I\'ve never felt so beautiful as I did when you dolled me up 🤍🥹✨',
    services: ['Makeup services', 'Hairstyling'],
    source: 'google',
    avatar: null,
  },
  {
    id: 'g5',
    name: 'Natalia Dial',
    rating: 5,
    date: 'Abril 2025',
    text: 'Aleh and her team at Beauty Station are the best! Beauty Station did my hair and makeup for my wedding day and welcome party as well as my bridesmaids. We loved them so much that my sister hired them for her wedding in May. Aleh and her team were all set up for us before we got to the room to get ready and were exceptional at hair and makeup. Highly recommend them!',
    images: [
      `${process.env.PUBLIC_URL}/images/reviews/natalia-1.webp`,
    ],
    source: 'google',
    avatar: null,
  },
  {
    id: 'g6',
    name: 'Carol Benitez',
    rating: 5,
    date: 'Febrero 2025',
    text: 'The team at Beauty Station is the best, I hired them for our wedding, it was 15 girls getting makeup done and 13 getting hair. They were at our airbnb promply at 5am, and everyone was ready without a fuss or rush by 9:45am. We had an marathon of a day ahead, mass at 12pm, followed with cocktail hour and reception ending at 10:30pm and after party from 10:30-1am. Adriana did my make up and hair, it came out perfectly and lasted me through a 16 hour day!!! Everyone\'s hair and makeup cameout beautifull too....I cant recommend the team at beauty station enough, they are the most efficient hair and makeup team I have come across and I have been part of a lot of weddings',
    services: ['Bridal services'],
    images: [
      `${process.env.PUBLIC_URL}/images/reviews/carol-1.webp`,
      `${process.env.PUBLIC_URL}/images/reviews/carol-2.webp`,
      `${process.env.PUBLIC_URL}/images/reviews/carol-3.webp`,
      `${process.env.PUBLIC_URL}/images/reviews/carol-4.webp`,
      `${process.env.PUBLIC_URL}/images/reviews/carol-5.webp`,
    ],
    source: 'google',
    avatar: null,
  },
  {
    id: 'g7',
    name: 'Graciana Zevallos',
    rating: 5,
    date: 'Enero 2025',
    text: 'Aleh and her team are so incredibly talented, I can\'t recommend them enough! Not only did I look and feel like a princess, but my bridesmaids all loved their hair and make up as well! Everyone looked so beautiful. If you\'re getting married in Antigua or anywhere else in Guatemala, then you need to book Beauty Station for your glam!',
    images: [
      `${process.env.PUBLIC_URL}/images/reviews/graciana-1.webp`,
    ],
    source: 'google',
    avatar: null,
  },
  {
    id: 'g8',
    name: 'Jessica Vu',
    rating: 5,
    date: 'Abril 2025',
    text: 'Aleh and her team were absolutely amazing for my wedding! Aleh did a flawless job on our makeup, and her team also did a great job styling our hair. They were all professional, punctual, and made the getting-ready process seamless and stress-free. Aleh is now expanding her work to destinations worldwide, and I can confidently say she\'s worth booking no matter where you are. Highly recommend!',
    services: ['Bridal services', 'Makeup services', 'Hairstyling'],
    source: 'google',
    avatar: null,
  },
];

const PREVIEW_LENGTH = 220;

/* ── Star rating display / input ── */
const StarRating = ({ value, onChange }) => (
  <div className="home-stars">
    {[1, 2, 3, 4, 5].map(star => (
      <span
        key={star}
        className={`home-star${star <= value ? ' home-star--filled' : ''}`}
        onClick={() => onChange && onChange(star)}
        style={{ cursor: onChange ? 'pointer' : 'default' }}
      >
        ★
      </span>
    ))}
  </div>
);

/* ── Individual review card with expand/collapse ── */
const ReviewCard = ({ review }) => {
  const [expanded, setExpanded] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const isLong = review.text.length > PREVIEW_LENGTH;
  const displayed = !isLong || expanded
    ? review.text
    : review.text.slice(0, PREVIEW_LENGTH).trimEnd() + '…';

  return (
    <div className="home-review-card">
      <StarRating value={review.rating} />
      <p className="home-review-text">
        "{displayed.split('\n').map((line, i) => (
          <span key={i}>{line}{i < displayed.split('\n').length - 1 && <br />}</span>
        ))}"
      </p>
      {isLong && (
        <button
          className="home-review-toggle"
          onClick={() => setExpanded(e => !e)}
        >
          {expanded ? 'Menos ↑' : 'Más →'}
        </button>
      )}
      {review.images && review.images.length > 0 && (
        <div className="home-review-images">
          {review.images.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`${review.name} ${i + 1}`}
              className="home-review-img"
              onClick={() => setLightboxSrc(src)}
            />
          ))}
        </div>
      )}
      {lightboxSrc && ReactDOM.createPortal(
        <div className="review-lightbox" onClick={() => setLightboxSrc(null)}>
          <button className="review-lightbox-close" onClick={() => setLightboxSrc(null)}>✕</button>
          <img
            src={lightboxSrc}
            alt="Vista ampliada"
            className="review-lightbox-img"
            onClick={e => e.stopPropagation()}
          />
        </div>,
        document.body
      )}
      {review.services && review.services.length > 0 && (
        <div className="home-review-services">
          <span className="home-review-services-label">Servicios:</span>
          <div className="home-review-services-tags">
            {review.services.map((s, i) => (
              <span key={i} className="home-review-service-tag">{s}</span>
            ))}
          </div>
        </div>
      )}
      <div className="home-review-footer">
        <div className="home-review-avatar">
          {review.avatar
            ? <img src={review.avatar} alt={review.name} className="home-review-avatar-img" />
            : review.name.charAt(0).toUpperCase()
          }
        </div>
        <div className="home-review-info">
          <span className="home-review-name">{review.name}</span>
          <span className="home-review-date">{review.date}</span>
        </div>
        {review.source === 'google' && (
          <span className="home-review-google-badge">G</span>
        )}
      </div>
    </div>
  );
};

const BeautyStation = () => {
  const { authStatus } = useAuthenticator(ctx => [ctx.authStatus]);
  const scrollRef = useRef(null);

  const [userName, setUserName] = useState('');
  const [userReviews, setUserReviews] = useState(() => {
    try { return JSON.parse(localStorage.getItem('bs_reviews') || '[]'); }
    catch { return []; }
  });
  const [reviewForm, setReviewForm] = useState({ rating: 0, text: '' });
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    if (authStatus === 'authenticated') {
      fetchUserAttributes()
        .then(attrs => setUserName(attrs.name || attrs.given_name || 'Usuario'))
        .catch(() => {});
    }
  }, [authStatus]);

  const allReviews = [...GOOGLE_REVIEWS, ...userReviews];

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (reviewForm.rating === 0 || !reviewForm.text.trim()) return;
    const newReview = {
      id: `u_${Date.now()}`,
      name: userName || 'Usuario',
      rating: reviewForm.rating,
      date: new Date().toLocaleDateString('es-GT', { month: 'long', year: 'numeric' }),
      text: reviewForm.text.trim(),
      source: 'user',
    };
    const updated = [...userReviews, newReview];
    setUserReviews(updated);
    localStorage.setItem('bs_reviews', JSON.stringify(updated));
    setReviewForm({ rating: 0, text: '' });
    setReviewSubmitted(true);
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const amount = scrollRef.current.clientWidth * 0.75;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
    }
  };

  return (
    <div className="home-page">

      {/* ── Intro hero ── */}
      <section
        className="home-intro"
        style={{ backgroundImage: `linear-gradient(rgba(205, 146, 157, 0.72), rgba(205, 146, 157, 0.72)), url('${process.env.PUBLIC_URL}/images/beauty-station-hero.jpeg')` }}
      >
        <p className="home-intro-tagline">Maquillaje Profesional · Guatemala</p>
        <img
          src={`${process.env.PUBLIC_URL}/images/beauty-station-logo.png`}
          alt="Beauty Station"
          className="home-intro-logo"
        />
        <p className="home-intro-body">
          Aprende nuevas técnicas en nuestros cursos intensivos de belleza, o reserva
          un servicio profesional a domicilio para tu evento especial.
        </p>
      </section>

      {/* ── Services cards ── */}
      <section className="home-cards-section">
        <div className="home-cards-grid">

          <Link to="/classes" className="home-card home-card--link">
            <div className="home-card-img-wrap">
              <img src={`${process.env.PUBLIC_URL}/images/cursos_graduadas.jpg`} alt="Cursos" className="home-card-img" />
            </div>
            <div className="home-card-body">
              <p className="home-card-name">CURSOS</p>
              <span className="home-card-btn">MÁS INFORMACIÓN </span>
            </div>
          </Link>

          <Link to="/classes/course/curso-en-linea" className="home-card home-card--link">
            <div className="home-card-img-wrap">
              <img src={`${process.env.PUBLIC_URL}/images/Class_1/Module_1/Makeup/imagen_module_1Mkup.jpeg`} alt="Cursos en Línea" className="home-card-img" />
            </div>
            <div className="home-card-body">
              <p className="home-card-name">CURSOS EN LÍNEA</p>
              <span className="home-card-btn">MÁS INFORMACIÓN </span>
            </div>
          </Link>

          <Link to="/servicio-a-domicilio" className="home-card home-card--link">
            <div className="home-card-img-wrap">
              <img src={`${process.env.PUBLIC_URL}/images/home_eventos_mirror.jpg`} alt="Eventos" className="home-card-img" />
            </div>
            <div className="home-card-body">
              <p className="home-card-name">EVENTOS</p>
              <span className="home-card-btn">MÁS INFORMACIÓN </span>
            </div>
          </Link>

        </div>
      </section>

      {/* ── WhatsApp contact ── */}
      <section className="home-contact">
        <p className="home-contact-label">¿Tienes alguna consulta?</p>
        <h3 className="home-contact-title">Escríbenos directamente</h3>
        <p className="home-contact-body">
          Te responderemos a la brevedad posible y con gusto resolveremos cualquier duda.
        </p>
        <a
          className="home-cta-btn"
          href="https://api.whatsapp.com/send?phone=50250177803&text=Encontr%C3%A9%20sus%20redes%20sociales%20y%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20%3A"
          target="_blank"
          rel="noopener noreferrer"
        >
          Contactar por WhatsApp
        </a>
      </section>

      {/* ── Reviews ── */}
      <section className="home-reviews">
        <p className="home-reviews-tagline">Lo que dicen nuestros clientes</p>
        <h2 className="home-reviews-title">Reseñas</h2>
        <p className="home-reviews-body">
          Estas son algunas de las opiniones de quienes han confiado en nosotros
          para realzar su belleza.
        </p>

        {/* Carousel */}
        <div className="home-reviews-carousel-wrapper">
          <button className="gallery-arrow left-arrow" onClick={() => scroll('left')}>&#10094;</button>
          <div className="home-reviews-carousel" ref={scrollRef}>
            {allReviews.map(review => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
          <button className="gallery-arrow right-arrow" onClick={() => scroll('right')}>&#10095;</button>
        </div>

        {/* Submit review */}
        <div className="home-review-submit-area">
          {authStatus === 'authenticated' ? (
            reviewSubmitted ? (
              <p className="home-review-thanks">¡Gracias por tu reseña!</p>
            ) : (
              <form className="home-review-form" onSubmit={handleReviewSubmit}>
                <p className="home-review-form-title">Deja tu reseña</p>
                <StarRating
                  value={reviewForm.rating}
                  onChange={r => setReviewForm(prev => ({ ...prev, rating: r }))}
                />
                <textarea
                  className="home-review-textarea"
                  value={reviewForm.text}
                  onChange={e => setReviewForm(prev => ({ ...prev, text: e.target.value }))}
                  placeholder="Comparte tu experiencia con nosotras..."
                  maxLength={300}
                  required
                  rows={3}
                />
                <button
                  className="home-review-submit-btn"
                  type="submit"
                  disabled={reviewForm.rating === 0}
                >
                  Publicar reseña
                </button>
              </form>
            )
          ) : (
            <div className="home-review-login-prompt">
              <p className="home-review-login-text">¿Quieres dejar tu reseña?</p>
              <Link to="/login" className="home-cta-btn home-cta-btn--dark">
                Inicia sesión
              </Link>
            </div>
          )}
        </div>

      </section>

    </div>
  );
};

export default BeautyStation;
