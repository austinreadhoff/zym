import React, { useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import _ from 'lodash';
import '../App.css';
import { apiFetch } from '../APIClient';
import Batch from '../components/Batch';
import mdlRecipe from '../models/recipe';
import Style from '../models/style';
import mdlBatch from '../models/batch';
import { Fermentable, Hop } from '../models/batch';

function Recipe() {
  const id = useParams().id;
  const [recipe, setRecipe] = React.useState<mdlRecipe>(new mdlRecipe());
  const [batches, setBatches] = React.useState<mdlBatch[]>([]);
  const [selectedBatchIndex, setSelectedBatchIndex] = React.useState(0);

  const [styles, setStyles] = React.useState<Style[]>([]);
  const [fermentables, setFermentables] = React.useState<Fermentable[]>([]);
  const [hops, setHops] = React.useState<Hop[]>([]);
  
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

  const handleBatchChange = (idx: number, updatedBatch: mdlBatch) => {
    setBatches(prev => prev.map((batch, i) => (i === idx ? updatedBatch : batch)));
  };

  const handleBatchDelete = (idx: number) => {
    const batchToDelete = batches[idx];
    apiFetch('/api/batches/' + batchToDelete.ID, {
      method: 'DELETE',
    }).then((responseObj) => {
      if (responseObj.response.ok) {
        setBatches(prev => {
          const newBatches = prev.filter((_, i) => i !== idx);
          setSelectedBatchIndex(idx === 0 ? 0 : idx - 1);
          return newBatches;
        });
      }
    });
  };

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

  const addBatch = async () => {
    apiFetch('/api/batches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipeID: id }),
    })
    .then((responseObj) => {
      if (responseObj.response.ok) {
        setBatches(prev => [...prev, mdlBatch.fromJSON(responseObj.data.batch)]);
        setSelectedBatchIndex(i => i + 1);
      } 
    });
  }

  useEffect(() => {
    //load initial data
    Promise.all([
      apiFetch('/api/recipes/' + id),
      apiFetch('/api/styles'),
      apiFetch('/api/fermentables'),
      apiFetch('/api/hops')
    ]).then(([recipeResponse, stylesResponse, fermentablesResponse, hopsResponse]) => {
      setRecipe(mdlRecipe.fromJSON(recipeResponse.data.recipe));
      setBatches(mdlBatch.fromJSONList(recipeResponse.data.batches));
      setStyles(
        Style.fromJSONList(stylesResponse.data.styles).sort((a, b) =>
          a.Name.localeCompare(b.Name)
        )
      );
      setFermentables(
        Fermentable.fromJSONList(fermentablesResponse.data.fermentables).sort((a, b) =>
          a.Name.localeCompare(b.Name)
        )
      );
      setHops(
        Hop.fromJSONList(hopsResponse.data.hops).sort((a, b) =>
          a.Name.localeCompare(b.Name)
        )
      );
    });
    
    //cleanup
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  useEffect(() => {
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
        <textarea
          name="Notes"
          value={recipe.Notes}
          onChange={handleRecipeChange}
          placeholder="Recipe notes"
          rows={4}
        />
        <div style={{ display: 'flex', alignItems: 'center', margin: '16px 0' }}>
          <button
            type="button"
            disabled={batches.length === 0 || selectedBatchIndex === 0}
            onClick={() => setSelectedBatchIndex(i => i - 1)}
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
                addBatch();
              }}
            >
              + New Batch
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setSelectedBatchIndex(i => i + 1)}
            >
              Next &#8594;
            </button>
          )}
        </div>
        <div>
          {batches.map((batch, idx) =>
            idx === selectedBatchIndex ? (
              <Batch
                key={idx}
                batchIn={batch}
                onBatchChange={updatedBatch => handleBatchChange(idx, updatedBatch)}
                onBatchDelete={() => handleBatchDelete(idx)}
                disableDelete={batches.length === 1}
                hops={hops}
                fermentables={fermentables}
              />
            ) : null
          )}
        </div>
      </form>
    </div>
  );
}

export default Recipe;
