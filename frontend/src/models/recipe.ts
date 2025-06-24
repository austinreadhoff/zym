import Style from "./style";

class Recipe {
    ID: string = '';
    Name: string = '';
    Notes: string = '';
    StyleID: string = '';
    Created: Date = new Date();

    static fromJSON(json: any): Recipe {
        const recipe: Recipe = {
            ID: json.ID,
            Name: json.Name,
            Notes: json.Notes,
            StyleID: json.StyleID,
            Created: json.Created
        };
        return recipe;
    }
    static fromJSONList(jsonList: any[]): Recipe[] {
        return jsonList.map((json) => Recipe.fromJSON(json));
    }
}

export default Recipe;