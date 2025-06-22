import React, { useEffect, useCallback } from 'react';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import '../App.css';
import { apiFetch } from '../APIClient';
import mdlBatch, { Fermentable as FermentableModel, Hop as HopModel } from '../models/batch';

type BatchProps = {
  batchIn: mdlBatch;
  onBatchChange: (updatedBatch: mdlBatch) => void;
  onBatchDelete: () => void;
  disableDelete: boolean;
  hops: HopModel[];
  fermentables: FermentableModel[];
}

function Batch({ batchIn, onBatchChange, onBatchDelete, disableDelete, hops, fermentables }: BatchProps) {
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
    onBatchChange(updatedBatch);
  };

  const handleFermentableChange = (idx: number, field: string, value: any) => {
    const updated = batchIn.Fermentables.map((f: FermentableModel, i: number) =>
      i === idx ? { ...f, [field]: value } : f
    );
    if (JSON.stringify(batchIn.Fermentables) !== JSON.stringify(updated)) {
      onBatchChange({ ...batchIn, Fermentables: updated });
    }
  };

  const handleAddFermentable = () => {
    if (fermentables.length === 0) return;
    const first = fermentables[0];
    const newFerm: FermentableModel = {
      BatchFermentableID: uuidv4(),
      ID: String(first.ID),
      BatchID: batchIn.ID,
      Name: first.Name,
      Yield: 0,
      Color: 0,
      Mash: false,
      Notes: '',
      Amount: 0
    };
    const updated = [...(batchIn.Fermentables || []), newFerm];
    onBatchChange({ ...batchIn, Fermentables: updated });
  };

  const handleRemoveFermentable = (idx: number) => {
    const updated = batchIn.Fermentables.filter((_: any, i: number) => i !== idx);
    onBatchChange({ ...batchIn, Fermentables: updated });
  };

  const handleHopChange = (idx: number, field: string, value: any) => {
    const updated = batchIn.Hops.map((h: HopModel, i: number) =>
      i === idx ? { ...h, [field]: value } : h
    );
    if (JSON.stringify(batchIn.Hops) !== JSON.stringify(updated)) {
      onBatchChange({ ...batchIn, Hops: updated });
    }
  };

  const handleAddHop = () => {
    if (hops.length === 0) return;
    const first = hops[0];
    const newHop: HopModel = {
      BatchHopID: uuidv4(),
      ID: String(first.ID),
      BatchID: batchIn.ID,
      Name: first.Name,
      AlphaAcid: 0,
      Notes: '',
      Amount: 0,
      BoilMinutes: 0,
      DryHop: false
    };
    const updated = [...(batchIn.Hops || []), newHop];
    onBatchChange({ ...batchIn, Hops: updated });
  };

  const handleRemoveHop = (idx: number) => {
    const updated = batchIn.Hops.filter((_: any, i: number) => i !== idx);
    onBatchChange({ ...batchIn, Hops: updated });
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

      {/* Fermentables Section */}
      <div style={{ marginTop: 16 }}>
        <h4>Fermentables</h4>
        {(batchIn.Fermentables || []).map((f: FermentableModel, idx: number) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
            <select
              value={f.ID}
              onChange={e => handleFermentableChange(idx, 'ID', String(e.target.value))}
            >
              {fermentables.map(opt => (
                <option key={opt.ID} value={String(opt.ID)}>{opt.Name}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Amount"
              value={f.Amount}
              onChange={e => handleFermentableChange(idx, 'Amount', Number(e.target.value))}
              style={{ marginLeft: 8, width: 80 }}
            />
            <button type="button" onClick={() => handleRemoveFermentable(idx)} style={{ marginLeft: 8 }}>Remove</button>
          </div>
        ))}
        <button type="button" onClick={handleAddFermentable} style={{ marginTop: 4 }}>Add Fermentable</button>
      </div>

      {/* Hops Section */}
      <div style={{ marginTop: 16 }}>
        <h4>Hops</h4>
        {(batchIn.Hops || []).map((h: HopModel, idx: number) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
            <select
              value={h.ID}
              onChange={e => handleHopChange(idx, 'ID', String(e.target.value))}
            >
              {hops.map(opt => (
                <option key={opt.ID} value={String(opt.ID)}>{opt.Name}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Amount"
              value={h.Amount}
              onChange={e => handleHopChange(idx, 'Amount', Number(e.target.value))}
              style={{ marginLeft: 8, width: 80 }}
            />
            <input
              type="number"
              placeholder="Boil Minutes"
              value={h.BoilMinutes}
              onChange={e => handleHopChange(idx, 'BoilMinutes', Number(e.target.value))}
              style={{ marginLeft: 8, width: 100 }}
            />
            <label style={{ marginLeft: 8 }}>
              <input
                type="checkbox"
                checked={!!h.DryHop}
                onChange={e => handleHopChange(idx, 'DryHop', e.target.checked)}
              /> Dry Hop
            </label>
            <button type="button" onClick={() => handleRemoveHop(idx)} style={{ marginLeft: 8 }}>Remove</button>
          </div>
        ))}
        <button type="button" onClick={handleAddHop} style={{ marginTop: 4 }}>Add Hop</button>
      </div>
    </div>
  );
}

export default Batch;
