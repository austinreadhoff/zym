import React, { useEffect } from 'react';
import './App.css';
import { apiFetch } from './APIClient';
import { useNavigate, useParams } from 'react-router-dom';

function Recipe() {
  const id = useParams().id;
  const [testText, setTestText] = React.useState("");

  const navigate = useNavigate();

  useEffect(() => {
    apiFetch('/api/recipes/' + id)
    .then((responseObj) => {
      setTestText(responseObj.data.recipe.Name);
    });
  }, []);

  const handleDelete = async () => {
    apiFetch('/api/recipes/' + id, {
      method: 'DELETE'
    })
    .then((responseObj) => {
      if (responseObj.response.ok) {
        navigate('/');
      } 
    });
  };

  return (
    <div>
      <button onClick={handleDelete}>Delete</button>
      <h1>{testText}</h1>
    </div>
  );
}

export default Recipe;
