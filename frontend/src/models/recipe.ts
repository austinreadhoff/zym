class Recipe {
    ID: string = '';
    Name: string = '';
    StyleID: string = '';
    Created: Date = new Date();

    static fromJSON(json: any): Recipe {
        return Object.assign(new Recipe(), json);
    }
    static fromJSONList(jsonList: any[]): Recipe[] {
        return jsonList.map((json) => Recipe.fromJSON(json));
    }
}

export default Recipe;