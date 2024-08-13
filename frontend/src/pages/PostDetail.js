import React, { useEffect, useState, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { BsBoxArrowRight } from 'react-icons/bs';
import '../static/css/PostDetail.css';  // Importa tu archivo CSS personalizado

function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const containerRef = useRef(null); // Referencia para el contenedor
  const scrollIntervalRef = useRef(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    axios.get(`http://localhost:8000/api/posts/${id}/`)
      .then(response => {
        console.log("Datos del post recibidos:", response.data);  // Agrega este log para verificar los datos
        setPost(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Hubo un error al obtener el post:", error);
        setError("Hubo un error al obtener el post. Por favor, inténtalo de nuevo más tarde.");
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (containerRef.current) {
      setIsOverflowing(containerRef.current.scrollHeight > containerRef.current.clientHeight);
    }
  }, [post]);

  const smoothScroll = (step) => {
    const startPosition = containerRef.current.scrollTop;
    const targetPosition = startPosition + step;
    const distance = step;
    const duration = 100; // Duración del desplazamiento en milisegundos
    let startTime = null;

    const animation = (currentTime) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const run = ease(timeElapsed, startPosition, distance, duration);
      containerRef.current.scrollTop = run;
      if (timeElapsed < duration) requestAnimationFrame(animation);
    };

    const ease = (t, b, c, d) => {
      t /= d / 2;
      if (t < 1) return c / 2 * t * t + b;
      t--;
      return -c / 2 * (t * (t - 2) - 1) + b;
    };

    requestAnimationFrame(animation);
  };

  const scrollStep = (step) => {
    smoothScroll(step);
  };

  const startScrolling = (step) => {
    scrollStep(step);
    if (!scrollIntervalRef.current) {
      scrollIntervalRef.current = setInterval(() => {
        scrollStep(step);
      }, 100); // Ajusta el intervalo según sea necesario
    }
  };

  const stopScrolling = () => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  };

  if (loading) {
    return <p className="message">Cargando...</p>;
  }

  if (error) {
    return <p className="message">{error}</p>;
  }

  if (!post) {
    return <p className="message">No se encontró el post.</p>;
  }

  const pdfUrl = post.pdf ? `http://localhost:8000${post.pdf}` : null;
  if (pdfUrl) {
    console.log("PDF URL:", pdfUrl);  // Imprimir la URL del archivo PDF
  }

  return (
    <div className="post-detail-page">
      <button className="btn-back" onClick={() => window.history.back()}>
        <BsBoxArrowRight className="back-icon" />
      </button>
      <div className="post-detail-container" ref={containerRef}>
        <div className="post-detail">
          <h1 className="post-title" style={{ marginTop: isOverflowing ? '80%' : '0' }}>{post.title}</h1>
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
          {pdfUrl && (
            <div className="pdf-link">
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                {post.pdf.split('/').pop()}
              </a>
            </div>
          )}
        </div>
      </div>
      {isOverflowing && (
        <>
          <button 
            className="scroll-up-btn" 
            onMouseDown={() => startScrolling(-100)} 
            onMouseUp={stopScrolling}
            onMouseLeave={stopScrolling}
          >
            ↑
          </button>
          <button 
            className="scroll-down-btn" 
            onMouseDown={() => startScrolling(100)} 
            onMouseUp={stopScrolling}
            onMouseLeave={stopScrolling}
          >
            ↓
          </button>
        </>
      )}
    </div>
  );
}

export default PostDetail;
