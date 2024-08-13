import React, { useState, useEffect } from 'react';
import '../static/css/homepage.css';

const BlogMenu = () => {
  const noticias = [
    {
      imagen: 'https://sagreracanarias.es/Documentos/imagenes/im1.jpg',
      enlace: 'https://sagreracanarias.es/Documentos/imagenes/im1.jpg'
    },
    {
      imagen: 'https://sagreracanarias.es/Documentos/imagenes/im1.jpg',
      enlace: 'https://sagreracanarias.es/Documentos/imagenes/im1.jpg'
    }
  ];

  const [noticiaActual, setNoticiaActual] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setNoticiaActual((prevNoticia) => (prevNoticia + 1) % noticias.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [noticias.length]);

  return (
    <div className="container">
      <div className="content">
        <div className="blog-menu-container">
          <div className="blog-menu">
            <div className="noticia">
              <a className="noticias" href={noticias[noticiaActual].enlace} target="_blank" rel="noopener noreferrer">
                
              </a>
            </div>
          </div>
        </div>
        <div className="portal-denuncias-container">
          <div className="portal-denuncias">
           </div>
        </div>
      </div>
    </div>
  );
};

export default BlogMenu;
