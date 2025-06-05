import React, { useCallback, useEffect } from 'react';
import _, { set } from 'lodash';
import './App.css';
import { apiFetch } from './APIClient';
import mdlBatch from './models/batch';

type BatchProps = {
  batchIn: mdlBatch;
}

function Batch({ batchIn }: BatchProps) {
  const [batch, setBatch] = React.useState<mdlBatch>(batchIn);

  const debouncedSave = useCallback(
    _.debounce(async (batchJSON) => {   
      console.log("saving batch");  //TODO
      try {
        await apiFetch('/api/batches/' + batch.ID, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: batchJSON,
        });
      } catch (error) {
        console.error("Auto-save failed:", error);
      } finally {
        console.log("saved batch"); //TODO
      }
    }, 1500),
    []
  );

  const handleBatchChange =  (e: any) => {
    const { name, value } = e.target;
    setBatch(prevData => ({
      ...prevData,
      [name]: value,
    }));
  }

  const handleDelete = async () => {
    // apiFetch('/api/recipes/' + id, {
    //   method: 'DELETE'
    // })
    // .then((responseObj) => {
    //   if (responseObj.response.ok) {
    //     navigate('/');
    //   } 
    // });
  };

  useEffect(() => {    
    //cleanup
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  useEffect(() => {
    // Ensure IBU and OG are numbers in the JSON
    const batchToSave = {
      ...batch,
      IBU: batch.IBU !== undefined ? Number(batch.IBU) : batch.IBU,
      OG: batch.OG !== undefined ? Number(batch.OG) : batch.OG,
    };
    debouncedSave(JSON.stringify(batchToSave));
  }, [batch]);

  return (
    <div>
      <button onClick={handleDelete}>Delete</button>
      <div style={{ border: '1px solid #ccc', padding: 12, marginBottom: 8 }}>
        Batch #{String(batch.Number)} (details go here)
      </div>
      <input 
          type="string"
          name="OG"
          value={batch.OG} 
          onChange={handleBatchChange}
        />
        <input 
          type="string"
          name="IBU"
          value={batch.IBU} 
          onChange={handleBatchChange}
        />
    </div>
  );
}

export default Batch;
