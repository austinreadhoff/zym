class Batch {
    ID: string = '';
    RecipeID: string = '';
    Number: Number = 0;
    OG: number = 0;
    IBU: number = 0;
    Created: Date = new Date();

    static fromJSON(json: any): Batch {
        const recipe: Batch = {
            ID: json.ID,
            RecipeID: json.RecipeID,
            Number: json.Number,
            OG: json.OG,
            IBU: json.IBU,
            Created: json.Created
        };
        return recipe;
    }
    static fromJSONList(jsonList: any[]): Batch[] {
        return jsonList.map((json) => Batch.fromJSON(json));
    }
}

export default Batch;