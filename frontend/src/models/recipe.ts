import Style from "./style";

class Recipe {
    ID: string = '';
    Name: string = '';
    Notes: string = '';
    StyleID: string = '';
    Created: Date = new Date();

    Style: Style | null = null;

    static fromJSON(json: any): Recipe {
        const recipe: Recipe = {
            ID: json.ID,
            Name: json.Name,
            Notes: json.Notes,
            StyleID: json.StyleID,
            Created: json.Created,
            Style: json.Style ? Style.fromJSON(json.Style) : null,
        };
        return recipe;
    }
    static fromJSONList(jsonList: any[]): Recipe[] {
        return jsonList.map((json) => Recipe.fromJSON(json));
    }
}

export default Recipe;