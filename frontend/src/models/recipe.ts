import Style from "./style";

class Recipe {
    ID: string = '';
    Name: string = '';
    StyleID: string = '';
    Created: Date = new Date();

    static fromJSON(json: any): Recipe {
        const recipe: Recipe = {
            ID: json.ID,
            Name: json.Name,
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