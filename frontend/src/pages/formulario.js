import React, { useState, useEffect, useRef, useContext } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import '../static/css/VacationForm.css';  // Asegúrate de tener el archivo CSS
import AuthContext from '../context/AuthContext';  // Importa el contexto de autenticación

function VacationForm() {
    const { authTokens } = useContext(AuthContext);  // Extrae los tokens del contexto
    const [dni, setDni] = useState('');
    const [motivo, setMotivo] = useState('Vacaciones');
    const [inicio, setInicio] = useState('');
    const [fin, setFin] = useState('');
    const [email, setEmail] = useState('');
    const [signature, setSignature] = useState(null);
    const [showNotification, setShowNotification] = useState(false);  // Estado para la notificación
    
    // Referencia al SignatureCanvas
    const sigPadRef = useRef(null);

    useEffect(() => {
      const canvas = sigPadRef.current.getCanvas();
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (context) {
        console.log("Contexto del canvas configurado con willReadFrequently.");
      }
    }, []);

    const clearSignature = () => {
      sigPadRef.current.clear();
    };

    const saveSignature = () => {
        const signatureImage = sigPadRef.current.getTrimmedCanvas().toDataURL('image/png');
        setSignature(signatureImage);
        console.log('Firma generada:', signatureImage);  // Verifica si la firma se genera correctamente
  
        // Mostrar la notificación temporalmente
        setShowNotification(true);
        setTimeout(() => {
          setShowNotification(false);  // Ocultar la notificación después de 1 segundo
        }, 1000);
      };

    const handleSubmit = async (e) => {
      e.preventDefault();

      const formData = {
        dni,
        motivo,
        inicio,
        fin,
        email,
        firma: signature,
      };
      console.log(formData);

      try {
        const response = await fetch('http://127.0.0.1:8000/api/vacaciones/registrar/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authTokens.access}`,
            },
            body: JSON.stringify(formData),
        });

        if (response.ok) {
            console.log('Vacación registrada correctamente.');
      
            // Limpiar el formulario después de recibir una respuesta exitosa
            setDni('');
            setMotivo('Vacaciones');
            setInicio('');
            setFin('');
            setEmail('');
            clearSignature(); // Borra la firma del campo de firma
            alert('Vacación registrada correctamente y correo enviado.');
      
            // Opcional: recargar la página completa para asegurarse de que todo esté limpio
            window.location.reload();
          } else {
            const errorResult = await response.json();
            console.error(errorResult);
            alert('Error al registrar la vacación.');
          }
        } catch (error) {
          console.error('Error:', error);
          alert('Ocurrió un error al enviar la solicitud.');
        }
      };

    return (
      <div className="vacation-form-container">
         {showNotification && (
          <div className="floating-notification">
            Firma guardada
          </div>
        )}
        <h1 className="form-title">Formulario de Vacaciones</h1>
        <form onSubmit={handleSubmit} className="vacation-form">
          <input 
            type="text" 
            placeholder="DNI Trabajador" 
            value={dni} 
            onChange={(e) => setDni(e.target.value)} 
            className="vacation-form-input"
          />
          <select value={motivo} onChange={(e) => setMotivo(e.target.value)} className="vacation-form-select">
            <option value="Vacaciones">Vacaciones</option>
            <option value="Días Libres">Días Libres</option>
            <option value="Permiso">Permiso</option>
          </select>
          <input 
            type="date" 
            value={inicio} 
            onChange={(e) => setInicio(e.target.value)} 
            className="vacation-form-input"
          />
          <input 
            type="date" 
            value={fin} 
            onChange={(e) => setFin(e.target.value)} 
            className="vacation-form-input"
          />
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className="vacation-form-input"
          />

          <div className="vacation-signature-pad">
            <SignatureCanvas
              ref={sigPadRef}  // Usa la referencia para acceder al canvas
              canvasProps={{ className: 'sigCanvas', style: { border: '1px solid black', backgroundColor: 'white' } }}
            />
          </div>

          <div className="vacation-signature-buttons">
            <button type="button" className="vacation-btn" onClick={clearSignature}>Borrar Firma</button>
            <button type="button" className="vacation-btn" onClick={saveSignature}>Guardar Firma</button>
          </div>

          <button type="submit" className="vacation-submit-btn">Enviar</button>
        </form>
      </div>
    );
  }

  export default VacationForm;
