import React, { useEffect, useCallback } from 'react';
import _ from 'lodash';
import '../App.css';
import { apiFetch } from '../APIClient';
import mdlBatch from '../models/batch';

type BatchProps = {
  batchIn: mdlBatch;
  onBatchChange?: (updatedBatch: mdlBatch) => void;
  onBatchDelete?: () => void;
  disableDelete?: boolean;
}

function Batch({ batchIn, onBatchChange, onBatchDelete, disableDelete }: BatchProps) {
  const debouncedSave = useCallback(
    _.debounce(async (batchJSON) => {
      console.log("saving batch");  //TODO
      try {
        await apiFetch('/api/batches/' + batchIn.ID, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: batchJSON,
        });
      } catch (error) {
        console.error("Auto-save failed:", error);
      } finally {
        console.log("saved batch");  //TODO
      }
    }, 1500),
    [batchIn.ID]
  );

  useEffect(() => {
    const batchToSave = {
      ...batchIn,
      IBU: batchIn.IBU !== undefined ? Number(batchIn.IBU) : batchIn.IBU,
      OG: batchIn.OG !== undefined ? Number(batchIn.OG) : batchIn.OG,
    };
    debouncedSave(JSON.stringify(batchToSave));
    return () => {
      debouncedSave.cancel();
    };
  }, [batchIn, debouncedSave]);

  const handleBatchChange = (e: any) => {
    const { name, value } = e.target;
    const updatedBatch = {
      ...batchIn,
      [name]: value,
    };
    if (onBatchChange) {
      onBatchChange(updatedBatch);
    }
  };

  return (
    <div>
      <button onClick={onBatchDelete} disabled={disableDelete}>Delete</button>
      <div style={{ border: '1px solid #ccc', padding: 12, marginBottom: 8 }}>
        Batch #{String(batchIn.Number)} (details go here)
      </div>
      <input 
        type="string"
        name="OG"
        value={batchIn.OG} 
        onChange={handleBatchChange}
      />
      <input 
        type="string"
        name="IBU"
        value={batchIn.IBU} 
        onChange={handleBatchChange}
      />
    </div>
  );
}

export default Batch;
