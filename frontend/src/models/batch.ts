class Batch {
    ID: string = '';
    RecipeID: string = '';
    Number: Number = 0;
    OG: number = 0;
    IBU: number = 0;
    Created: Date = new Date();

    Fermantables: Fermentable[] = [];
    Hops: Hop[] = [];

    static fromJSON(json: any): Batch {
        const recipe: Batch = {
            ID: json.ID,
            RecipeID: json.RecipeID,
            Number: json.Number,
            OG: json.OG,
            IBU: json.IBU,
            Created: json.Created,
            Fermantables: Fermentable.fromJSONList(json.Fermantables || []),
            Hops: Hop.fromJSONList(json.Hops || [])
        };
        return recipe;
    }
    static fromJSONList(jsonList: any[]): Batch[] {
        return jsonList.map((json) => Batch.fromJSON(json));
    }
}

export class Fermentable {
    ID: string = '';
    BatchID: string = '';
    Name: string = '';
    Yield: number = 0;
    Color: number = 0;
    Mash: boolean = false;
    Notes: string = '';
    Amount: number = 0;

    static fromJSON(json: any): Fermentable {
        const fermantable: Fermentable = {
            ID: json.ID,
            BatchID: json.BatchID,
            Name: json.Name,
            Yield: json.Yield,
            Color: json.Color,
            Mash: json.Mash,
            Notes: json.Notes,
            Amount: json.Amount
        };
        return fermantable;
    }
    static fromJSONList(jsonList: any[]): Fermentable[] {
        return jsonList.map((json) => Fermentable.fromJSON(json));
    }
}

export class Hop {
    ID: string = '';
    BatchID: string = '';
    Name: string = '';
    AlphaAcid: number = 0;
    Notes: string = '';
    Amount: number = 0;
    BoilMinutes: number = 0;
    DryHop: boolean = false;

    static fromJSON(json: any): Hop {
        const hop: Hop = {
            ID: json.ID,
            BatchID: json.BatchID,
            Name: json.Name,
            AlphaAcid: json.AlphaAcid,
            Notes: json.Notes,
            Amount: json.Amount,
            BoilMinutes: json.BoilMinutes,
            DryHop: json.DryHop
        };
        return hop;
    }

    static fromJSONList(jsonList: any[]): Hop[] {
        return jsonList.map((json) => Hop.fromJSON(json));
    }
}

export default Batch;