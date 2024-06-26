package main

type Recipe struct {
	Name    string  `json:"name"`
	Style   string  `json:"style"`
	Batches []Batch `json:"batches"`
}

type Batch struct {
	OG              float64       `json:"og"`
	IBU             float64       `json:"ibu"`
	Fermentables    []Fermentable `json:"fermentables"`
	BitteringHop    Hop           `json:"bitteringhop"`
	FlavorAromaHops []Hop         `json:"flavorAromaHops"`
}

type Fermentable struct {
	Name    string  `json:"name"`
	Yield   int     `json:"yield"`
	Percent float64 `json:"percent"`
	Oz      float64 `json:"oz"`
	Color   int     `json:"color"`
	Mash    bool    `json:"mash"`
}

type Hop struct {
	Name      string  `json:"name"`
	AlphaAcid float64 `json:"alphaAcid"`
	Oz        float64 `json:"oz"`
	BoilTime  int     `json:"boilTime"`
	DryHop    bool    `json:"dryHop"`
}

func (hop Hop) Utilization() float64 {
	if hop.DryHop {
		return 0.0
	}

	switch {
	case hop.BoilTime <= 9:
		return 0.06
	case hop.BoilTime <= 19:
		return 0.15
	case hop.BoilTime <= 29:
		return 0.19
	case hop.BoilTime <= 44:
		return 0.24
	case hop.BoilTime <= 59:
		return 0.27
	case hop.BoilTime <= 74:
		return 0.30
	default:
		return 0.34
	}
}
