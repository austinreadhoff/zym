import React, { useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import _, { set } from 'lodash';
import { Typeahead } from 'react-bootstrap-typeahead';
import './App.css';
import { apiFetch } from './APIClient';
import mdlRecipe from './models/recipe';
import Style from './models/style';

function Recipe() {
  const id = useParams().id;
  const [initialLoad, setInitialLoad] = React.useState(true);
  const [recipe, setRecipe] = React.useState<mdlRecipe>(new mdlRecipe());

  const [styles, setStyles] = React.useState<Style[]>([]);
  const [selectedStyle, setSelectedStyle] = React.useState<Style[]>([]);
  
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

  const handleNameChange =  (e: React.ChangeEvent<HTMLInputElement>) => {
    setRecipe(prevData => ({
      ...prevData,
      Name: e.target.value,
    }))
  }
  const handleStyleChange = (selected: any) => {
    if (selected.length === 0) {
      setSelectedStyle([]);
      return;
    }

    setSelectedStyle(selected);
    setRecipe(prevData => ({
      ...prevData,
      StyleID: selected[0].ID
    }));
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
    Promise.all([
      apiFetch('/api/recipes/' + id),
      apiFetch('/api/styles')
    ]).then(([recipeResponse, stylesResponse]) => {
      setRecipe(mdlRecipe.fromJSON(recipeResponse.data.recipe));
      setStyles(Style.fromJSONList(stylesResponse.data.styles));
      setSelectedStyle(
        Style.fromJSONList(stylesResponse.data.styles).filter(
          (style) => style.ID === recipeResponse.data.recipe.StyleID
        )
      );
      setTimeout(() => {
        //TODO: This prevents very quick edits from being saved, find different workaround
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
          onChange={handleNameChange}
        />
        <Typeahead
          labelKey="Name"
          onChange={handleStyleChange}
          options={styles}
          placeholder="Style"
          selected={selectedStyle}
        />
      </form>
    </div>
  );
}

export default Recipe;
