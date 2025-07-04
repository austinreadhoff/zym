import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../APIClient';
import Recipe from '../models/recipe';
import './Dashboard.css';

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
      <i>states go here</i>
      <hr></hr>
      <div className="inline-container">
        <h2>Recipes</h2>
        <button onClick={handleNew}>+ Add</button>
      </div>
      <ul id="recipe-list">
        {recipes.length === 0 && <p>You haven't created any recipes</p>}
        {recipes.map(recipe => (
          <li key={recipe.ID}>
            <Link to={`/recipe/${recipe.ID}`}>
              <p>
                <span className="recipe-name">{recipe.Name}</span> - <span className="recipe-style">{recipe.Style?.Name}</span>
              </p>
              <p className="recipe-sub">Last Brewed: --/--/----</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;
