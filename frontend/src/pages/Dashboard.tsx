import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../APIClient';
import Recipe from '../models/recipe';

function Dashboard() {
  const [recipes, setRecipes] = React.useState<Recipe[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    apiFetch('/api/recipes')
    .then((responseObj) => {
      setRecipes(Recipe.fromJSONList(responseObj.data.recipes));
    });
  }, []);

  const handleNew = async () => {
    apiFetch('/api/recipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ }),
    })
    .then((responseObj) => {
      if (responseObj.response.ok) {
        navigate('/recipe/' + responseObj.data.id);
      } 
    });
  };

  return (
    <div>
      <button onClick={handleNew}>New</button>
      <h1>Recipes</h1>
      <ul>
        {recipes.length === 0 && <p>You haven't created any recipes</p>}
        {recipes.map(recipe => (
          <li key={recipe.ID}>
            <Link to={`/recipe/${recipe.ID}`}>
              {recipe.Name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;
