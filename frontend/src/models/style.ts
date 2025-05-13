class Style {
    ID: string = '';
    Name: string = '';
    Notes: string = '';

    static fromJSON(json: any): Style {
        const style: Style =  {
            ID: json.ID,
            Name: json.Name,
            Notes: json.Notes
        };
        return style;
    }
    static fromJSONList(jsonList: any[]): Style[] {
        return jsonList.map((json) => Style.fromJSON(json));
    }
}

export default Style;