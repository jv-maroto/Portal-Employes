import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchNominasByYear } from '../api/api';

const Nominas = () => {
  const { year } = useParams();
  const [nominas, setNominas] = useState([]);

  useEffect(() => {
    const fetchNominas = async () => {
      const data = await fetchNominasByYear(year);
      setNominas(data);
    };

    fetchNominas();
  }, [year]);

  return (
    <div>
      <h1>Nóminas del Año {year}</h1>
      <ul>
        {nominas.map((nomina, index) => (
          <li key={index}>
            <a href={nomina.file_url} target="_blank" rel="noopener noreferrer">
              {`Mes ${nomina.month}`}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Nominas;
