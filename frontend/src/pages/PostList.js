import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BsEye, BsX } from 'react-icons/bs';
import Modal from 'react-modal';
import '../static/css/PostList.css';  // Importa tu archivo CSS personalizado
import AuthContext from '../context/AuthContext';  // Asegúrate de importar tu AuthContext

Modal.setAppElement('#root');  // Configuración para accesibilidad

function PostList() {
  const { user, authTokens } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [viewers, setViewers] = useState([]);
  const [selectedPostId, setSelectedPostId] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:8000/api/posts/')
      .then(response => {
        console.log("Datos recibidos:", response.data);
        setPosts(response.data);
      })
      .catch(error => {
        console.error("Hubo un error al obtener los posts:", error);
      });
  }, []);

  const openModal = (postId) => {
    setSelectedPostId(postId);
    axios.get(`http://localhost:8000/api/posts/${postId}/views/`, {
        headers: {
          Authorization: `Bearer ${authTokens.access}`
        }
      })
      .then(response => {
        setViewers(response.data);
        setModalIsOpen(true);
      })
      .catch(error => {
        console.error("Hubo un error al obtener las visualizaciones:", error);
      });
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setViewers([]);
    setSelectedPostId(null);
  };

  return (
    <div className="container post-list-container">
      <h1 className="title special-title">Noticias</h1>
      <div className="post-grid">
        {posts.map(post => (
          <div key={post.id} className="post-card">
            <h2>{post.title}</h2>
            <div className="post-summary">{post.summary}</div>
            <div className="post-actions">
              <Link to={`/posts/${post.id}`} className="btn-ver-mas">Ver Noticia</Link>
              {user?.is_superuser && <BsEye className="view-icon" onClick={() => openModal(post.id)} />}
            </div>
          </div>
        ))}
      </div>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Registro"
        className="Modal"
        overlayClassName="Overlay"
      >
        <div className="modal-header">
          <h2 className="modal-title">Registro</h2>
          <BsX className="close-icon" onClick={closeModal} />
        </div>
        <ul>
          {viewers.map(viewer => (
            <li key={`${viewer.first_name}-${viewer.last_name}`}>{viewer.first_name} {viewer.last_name} - {new Date(viewer.viewed_at).toLocaleDateString()}</li>
          ))}
        </ul>
      </Modal>
    </div>
  );
}

export default PostList;