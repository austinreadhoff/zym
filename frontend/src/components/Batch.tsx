import React, { useEffect, useCallback } from 'react';
import _ from 'lodash';
import { apiFetch } from '../APIClient';
import mdlBatch, { Fermentable as FermentableModel, Hop as HopModel } from '../models/batch';
import './Batch.css';

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

    if (field === 'ID') {
      const selected = fermentables.find(f => String(f.ID) === String(value));
      if (selected) {
        updated[idx] = { 
          ...updated[idx],
          Name: selected.Name,
          Yield: selected.Yield,
          Color: selected.Color,
          Notes: selected.Notes,
          Mash: selected.Mash 
        };
      }
    }

    if (JSON.stringify(batchIn.Fermentables) !== JSON.stringify(updated)) {
      onBatchChange({ ...batchIn, Fermentables: updated });
    }
  };

  const handleAddFermentable = () => {
    if (fermentables.length === 0) return;
    const first = fermentables[0];
    const newFermentable: FermentableModel = new FermentableModel();
    newFermentable.BatchFermentableID = null;
    newFermentable.ID = String(first.ID);
    newFermentable.BatchID = batchIn.ID;
    newFermentable.Name = first.Name;
    newFermentable.Mash = first.Mash;

    const updated = [...(batchIn.Fermentables || []), newFermentable];
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

    if (field === 'ID') {
      const selected = hops.find(h => String(h.ID) === String(value));
      if (selected) {
        updated[idx] = { 
          ...updated[idx], 
          Name: selected.Name,
          Notes: selected.Notes,
          AlphaAcid: selected.AlphaAcid 
        };
      }
    }

    if (JSON.stringify(batchIn.Hops) !== JSON.stringify(updated)) {
      onBatchChange({ ...batchIn, Hops: updated });
    }
  };

  const handleAddHop = () => {
    if (hops.length === 0) return;
    const first = hops[0];
    const newHop: HopModel = new HopModel();
    newHop.BatchHopID = null;
    newHop.ID = String(first.ID);
    newHop.BatchID = batchIn.ID;
    newHop.Name = first.Name;
    newHop.AlphaAcid = first.AlphaAcid;

    const updated = [...(batchIn.Hops || []), newHop];
    onBatchChange({ ...batchIn, Hops: updated });
  };

  const handleRemoveHop = (idx: number) => {
    const updated = batchIn.Hops.filter((_: any, i: number) => i !== idx);
    onBatchChange({ ...batchIn, Hops: updated });
  };

  return (
    <div>
      <div className="form-group">
        <label htmlFor="OG">OG:</label>
        <input 
          className="input-sm"
          type="text"
          name="OG"
          value={batchIn.OG} 
          onChange={handleBatchChange}
        />
      </div>
      <div className="form-group">
        <label htmlFor="IBU">IBU:</label>
        <input 
          className="input-sm"
          type="text"
          name="IBU"
          value={batchIn.IBU} 
          onChange={handleBatchChange}
        />
      </div>

      {/* Fermentables Section */}
      <div style={{ marginTop: 16 }}>
        <div className="inline-container">
          <h4>Fermentables</h4>
          <button type="button" onClick={handleAddFermentable} style={{ marginTop: 4 }}>+ Add</button>
        </div>
        {(batchIn.Fermentables || []).map((f: FermentableModel, idx: number) => (
          <div key={idx} className="fermentable-container">
            <button type="button"  className="danger" onClick={() => handleRemoveFermentable(idx)}>-</button>
            <select
              value={f.ID}
              onChange={e => handleFermentableChange(idx, 'ID', String(e.target.value))}
            >
              {fermentables.map(opt => (
                <option key={opt.ID} value={String(opt.ID)}>{opt.Name}</option>
              ))}
            </select>
            <div className="form-group">
              <label>%:</label>
              <input
                className="input-sm"
                type="number"
                value={f.Percent}
                onChange={e => handleFermentableChange(idx, 'Percent', Number(e.target.value))}
              />
            </div>
            <label style={{ marginLeft: 8 }}>
              <input
                type="checkbox"
                checked={!!f.Mash}
                onChange={e => handleFermentableChange(idx, 'Mash', e.target.checked)}
              /> Mash
            </label>
          </div>
        ))}
      </div>

      {/* Hops Section */}
      <div style={{ marginTop: 16 }}>
        <div className="inline-container">
          <h4>Hops</h4>
          <button type="button" onClick={handleAddHop} style={{ marginTop: 4 }}>+ Add</button>
        </div>
        {(batchIn.Hops || []).map((h: HopModel, idx: number) => (
          <div key={idx} className="hop-container">
            <button type="button" className="danger" onClick={() => handleRemoveHop(idx)}>-</button>
            <select
              value={h.ID}
              onChange={e => handleHopChange(idx, 'ID', String(e.target.value))}
            >
              {hops.map(opt => (
                <option key={opt.ID} value={String(opt.ID)}>{opt.Name}</option>
              ))}
            </select>
            <div className="form-group">
              <label>Alpha %:</label>
              <input
                className="input-sm"
                type="number"
                value={h.AlphaAcid}
                onChange={e => handleHopChange(idx, 'AlphaAcid', Number(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label>Oz:</label>
              <input
                className="input-sm"
                type="number"
                value={h.Amount}
                onChange={e => handleHopChange(idx, 'Amount', Number(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label>Min:</label>
              <input
                className="input-sm"
                type="number"
                value={h.BoilMinutes}
                onChange={e => handleHopChange(idx, 'BoilMinutes', Number(e.target.value))}
              />
            </div>
            <label style={{ marginLeft: 8 }}>
              <input
                type="checkbox"
                checked={!!h.DryHop}
                onChange={e => handleHopChange(idx, 'DryHop', e.target.checked)}
              /> Dry Hop
            </label>
          </div>
        ))}
      </div>
      <textarea
        name="Notes"
        value={batchIn.Notes}
        onChange={handleBatchChange}
        placeholder="Batch notes"
        rows={4}
      />
      <br/><button className="danger" onClick={onBatchDelete} disabled={disableDelete}>Delete Batch</button>
    </div>
  );
}

export default Batch;
