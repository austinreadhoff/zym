export namespace main {
	
	export class Hop {
	    name: string;
	    alphaAcid: number;
	    oz: number;
	    boilTime: number;
	    dryHop: boolean;
	
	    static createFrom(source: any = {}) {
	        return new Hop(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.alphaAcid = source["alphaAcid"];
	        this.oz = source["oz"];
	        this.boilTime = source["boilTime"];
	        this.dryHop = source["dryHop"];
	    }
	}
	export class Fermentable {
	    name: string;
	    yield: number;
	    percent: number;
	    oz: number;
	    color: number;
	    mash: boolean;
	
	    static createFrom(source: any = {}) {
	        return new Fermentable(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.yield = source["yield"];
	        this.percent = source["percent"];
	        this.oz = source["oz"];
	        this.color = source["color"];
	        this.mash = source["mash"];
	    }
	}
	export class Batch {
	    og: number;
	    ibu: number;
	    fermentables: Fermentable[];
	    bitteringhop: Hop;
	    flavorAromaHops: Hop[];
	
	    static createFrom(source: any = {}) {
	        return new Batch(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.og = source["og"];
	        this.ibu = source["ibu"];
	        this.fermentables = this.convertValues(source["fermentables"], Fermentable);
	        this.bitteringhop = this.convertValues(source["bitteringhop"], Hop);
	        this.flavorAromaHops = this.convertValues(source["flavorAromaHops"], Hop);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	
	export class Recipe {
	    name: string;
	    style: string;
	    batches: Batch[];
	
	    static createFrom(source: any = {}) {
	        return new Recipe(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.style = source["style"];
	        this.batches = this.convertValues(source["batches"], Batch);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

