import React, { useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import _ from 'lodash';
import './App.css';
import { apiFetch } from './APIClient';
import Batch from './Batch';
import mdlRecipe from './models/recipe';
import Style from './models/style';
import mdlBatch from './models/batch';

function Recipe() {
  const id = useParams().id;
  const [initialLoad, setInitialLoad] = React.useState(true);
  const [recipe, setRecipe] = React.useState<mdlRecipe>(new mdlRecipe());
  const [batches, setBatches] = React.useState<mdlBatch[]>([]);
  const [selectedBatchIndex, setSelectedBatchIndex] = React.useState(0);

  const [styles, setStyles] = React.useState<Style[]>([]);
  
  const navigate = useNavigate();

  const debouncedSave = useCallback(
    _.debounce(async (recipeJSON) => {      
      console.log("saving recipe");  //TODO
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
        console.log("saving recipe"); //TODO
      }
    }, 1500),
    []
  );

  const handleRecipeChange =  (e: any) => {
    const { name, value } = e.target;
    setRecipe(prevData => ({
      ...prevData,
      [name]: value,
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
      setBatches(mdlBatch.fromJSONList(recipeResponse.data.batches));
      setStyles(
        Style.fromJSONList(stylesResponse.data.styles).sort((a, b) =>
          a.Name.localeCompare(b.Name)
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
          onChange={handleRecipeChange}
        />
        <select
          value={recipe.StyleID || ''}
          onChange={(e: any) => {
            recipe.StyleID = e.target.value;
            handleRecipeChange(e);
          }}
        >
          <option value="">Select a style</option>
          {styles.map(style => (
            <option key={style.ID} value={style.ID}>
              {style.Name}
            </option>
          ))}
        </select>
        <div style={{ display: 'flex', alignItems: 'center', margin: '16px 0' }}>
          <button
            type="button"
            disabled={batches.length === 0 || selectedBatchIndex === 0}
            onClick={() => setSelectedBatchIndex(i => Math.max(i - 1, 0))}
          >
            &#8592; Back
          </button>
          <span style={{ margin: '0 12px' }}>
            {batches.length > 0
              ? `Batch ${batches[selectedBatchIndex]?.Number ?? ''}`
              : 'No Batches'}
          </span>
          {selectedBatchIndex === batches.length - 1 ? (
            <button
              type="button"
              onClick={() => {
                // TODO: Implement create new batch functionality
              }}
            >
              + New Batch
            </button>
          ) : (
            <button
              type="button"
              // disabled={batches.length === 0 || selectedBatchIndex >= batches.length - 1}
              onClick={() => setSelectedBatchIndex(i => Math.min(i + 1, batches.length - 1))}
            >
              Next &#8594;
            </button>
          )}
        </div>
        <div>
          {batches.map((batch, idx) =>
            idx === selectedBatchIndex ? (
              <Batch key={idx} batchIn={batch} />
            ) : null
          )}
        </div>
      </form>
    </div>
  );
}

export default Recipe;
