import React, { useCallback, useEffect } from 'react';
import './App.css';
import { apiFetch } from './APIClient';
import { useNavigate, useParams } from 'react-router-dom';
import mdlRecipe from './models/recipe';
import _, { set } from 'lodash';

function Recipe() {
  const id = useParams().id;
  const [initialLoad, setInitialLoad] = React.useState(true);
  const [recipe, setRecipe] = React.useState<mdlRecipe>(new mdlRecipe());
  
  const navigate = useNavigate();

  const debouncedSave = useCallback(
    _.debounce(async (recipeJSON) => {      
      console.log("saving");  //TODO
      try {
        await apiFetch('/api/recipes/' + id, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: recipeJSON,
        });
      } catch (error) {
        console.error("Auto-save failed:", error);
      } finally {
        console.log("saved"); //TODO
      }
    }, 1500),
    []
  );

  const handleRecipeChange =  (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRecipe(prevData => ({
      ...prevData,
      [name]: value,
    }))
  }

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

  useEffect(() => {
    //load initial data
    apiFetch('/api/recipes/' + id)
    .then((responseObj) => {
      setRecipe(mdlRecipe.fromJSON(responseObj.data.recipe));
      setTimeout(() => {
        setInitialLoad(false);
      }, 1500);
    });

    //cleanup
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  useEffect(() => {
    if (initialLoad) {
      return;
    }

    debouncedSave(JSON.stringify(recipe));
  }, [recipe]);

  return (
    <div>
      <button onClick={handleDelete}>Delete</button>
      <form>
        <input 
          type="text"
          name="Name"
          value={recipe.Name} 
          onChange={handleRecipeChange}
        />
      </form>
    </div>
  );
}

export default Recipe;
