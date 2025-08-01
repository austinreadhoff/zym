class Batch {
    ID: string = '';
    RecipeID: string = '';
    Number: Number = 0;
    OG: number = 0;
    IBU: number = 0;
    Notes: string = '';
    Created: Date = new Date();

    Fermentables: Fermentable[] = [];
    Hops: Hop[] = [];

    static fromJSON(json: any): Batch {
        const batch: Batch = new Batch();
        batch.ID = json.ID;
        batch.RecipeID = json.RecipeID;
        batch.Number = json.Number;
        batch.OG = json.OG;
        batch.IBU = json.IBU;
        batch.Notes = json.Notes;
        batch.Created = json.Created;
        batch.Fermentables = Fermentable.fromJSONList(json.Fermentables || []);
        batch.Hops = Hop.fromJSONList(json.Hops || []);

        return batch;
    }
    static fromJSONList(jsonList: any[]): Batch[] {
        return jsonList.map((json) => Batch.fromJSON(json));
    }
}

export class Fermentable {
    BatchFermentableID: string | null = '';
    ID: string = '';
    BatchID: string = '';
    Name: string = '';
    Yield: number = 0;
    Color: number = 0;
    Mash: boolean = false;
    Notes: string = '';
    Percent: number = 0;
    Oz: number = 0; // Only exists client-side for ouput

    static fromJSON(json: any): Fermentable {
        const fermentable: Fermentable = new Fermentable();
        fermentable.BatchFermentableID = json.BatchFermentableID;
        fermentable.ID = json.ID;
        fermentable.BatchID = json.BatchID;
        fermentable.Name = json.Name;
        fermentable.Yield = json.Yield;
        fermentable.Color = json.Color;
        fermentable.Mash = json.Mash;
        fermentable.Notes = json.Notes;
        fermentable.Percent = json.Percent;
        fermentable.Oz = 0;
        
        return fermentable;
    }

    static fromJSONList(jsonList: any[]): Fermentable[] {
        return jsonList.map((json) => Fermentable.fromJSON(json));
    }
}

export class Hop {
    BatchHopID: string | null = '';
    ID: string = '';
    BatchID: string = '';
    Name: string = '';
    AlphaAcid: number = 0;
    Notes: string = '';
    Amount: number = 0;
    BoilMinutes: number = 0;
    DryHop: boolean = false;

    static fromJSON(json: any): Hop {
        const hop: Hop = new Hop();
        hop.BatchHopID = json.BatchHopID;
        hop.ID = json.ID;
        hop.BatchID = json.BatchID;
        hop.Name = json.Name;
        hop.AlphaAcid = json.AlphaAcid;
        hop.Notes = json.Notes;
        hop.Amount = json.Amount;
        hop.BoilMinutes = json.BoilMinutes;
        hop.DryHop = json.DryHop;
        
        return hop;
    }

    static fromJSONList(jsonList: any[]): Hop[] {
        return jsonList.map((json) => Hop.fromJSON(json));
    }

    static Utilization(hop: Hop): number {
        if (hop.DryHop) {
            return 0.0
        }
        else if (hop.BoilMinutes <= 9) {
            return 0.06;
        }
        else if (hop.BoilMinutes <= 19) {
            return 0.15;
        }
        else if (hop.BoilMinutes <= 29) {
            return 0.19;
        }
        else if (hop.BoilMinutes <= 44) {
            return 0.24;
        }
        else if (hop.BoilMinutes <= 59) {
            return 0.27;
        }
        else if (hop.BoilMinutes <= 74) {
            return 0.30;
        }
        else {
            return 0.34;
        }
    }
}

export default Batch;