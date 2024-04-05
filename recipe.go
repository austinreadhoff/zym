package main

type Recipe struct {
	OG              float64
	IBU             float64
	Fermentables    []Fermentable
	BitteringHop    Hop
	FlavorAromaHops []Hop
}

type Fermentable struct {
	Name    string
	Yield   int
	Percent float64
	Oz      float64
	Color   int
	Mash    bool
}

type Hop struct {
	Name      string
	AlphaAcid float64
	Oz        float64
	BoilTime  int
	DryHop    bool
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
