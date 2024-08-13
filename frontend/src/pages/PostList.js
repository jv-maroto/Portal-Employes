import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../static/css/PostList.css';  // Importa tu archivo CSS personalizado

function PostList() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/api/posts/')  // URL completa con protocolo y host
      .then(response => {
        console.log("Datos recibidos:", response.data);  // Verifica los datos en la consola
        setPosts(response.data);
      })
      .catch(error => {
        console.error("Hubo un error al obtener los posts:", error);
      });
  }, []);

  return (
    <div className="container post-list-container">
      <h1 className="title special-title">Noticias</h1>
      <div className="post-grid">
        {posts.map(post => (
          <div key={post.id} className="post-card">
            <h2>{post.title}</h2>
            <div className="post-summary">{post.summary}</div>  {/* Mostrar el resumen aquí */}
            <Link to={`/posts/${post.id}`} className="btn-ver-mas">Ver Noticia</Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PostList;
