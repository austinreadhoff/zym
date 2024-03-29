package main

import (
	"fmt"
	"math"
)

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

func main() {
	//equipment profile
	targetBatchGallons := 2.5
	preFermentationGallons := 6.0
	brewhouseEfficiency := 0.75

	//recipe
	og := 1.06
	ibu := 45.0

	var fermentablesB []Fermentable
	fermentablesB = append(fermentablesB, Fermentable{
		Name:    "2-Row",
		Yield:   36,
		Percent: 0.875,
		Color:   2,
		Mash:    true,
	})
	fermentablesB = append(fermentablesB, Fermentable{
		Name:    "Victory",
		Yield:   34,
		Percent: 0.05,
		Color:   25,
		Mash:    true,
	})
	fermentablesB = append(fermentablesB, Fermentable{
		Name:    "Crystal 40",
		Yield:   34,
		Percent: 0.025,
		Color:   40,
		Mash:    true,
	})
	fermentablesB = append(fermentablesB, Fermentable{
		Name:    "Crystal 80",
		Yield:   34,
		Percent: 0.025,
		Color:   80,
		Mash:    true,
	})
	fermentablesB = append(fermentablesB, Fermentable{
		Name:    "Carapils",
		Yield:   33,
		Percent: 0.025,
		Color:   2,
		Mash:    true,
	})

	bitteringHop := Hop{
		Name:      "Cascade",
		AlphaAcid: 0.052,
		BoilTime:  60,
	}

	var flavorAromaHops []Hop
	flavorAromaHops = append(flavorAromaHops, Hop{
		Name:      "Cascade",
		AlphaAcid: 0.052,
		Oz:        1.0,
		BoilTime:  20,
	})
	flavorAromaHops = append(flavorAromaHops, Hop{
		Name:      "Cascade",
		AlphaAcid: 0.052,
		Oz:        0.5,
		BoilTime:  10,
	})
	flavorAromaHops = append(flavorAromaHops, Hop{
		Name:      "Cascade",
		AlphaAcid: 0.052,
		Oz:        0.5,
		BoilTime:  2,
	})

	//calculate grain bill
	gravityUnits := (og - 1) * 1000 * targetBatchGallons

	for i, fermentable := range fermentablesB {
		fermentableUnits := fermentable.Percent * float64(gravityUnits)

		efficiency := 1.0
		if fermentable.Mash {
			efficiency = brewhouseEfficiency
		}

		fermentablesB[i].Oz = (fermentableUnits / float64(fermentable.Yield) / efficiency) * 16
	}

	//calculate hop additions
	gravityCorrectionFactor := 1.0
	if og > 1.050 {
		gravityCorrectionFactor = 1 + ((og - 1.050) / 0.2)
	}

	ibuRemaining := ibu
	for _, hop := range flavorAromaHops {
		ibu = (hop.Oz * hop.Utilization() * hop.AlphaAcid * 7489) / (preFermentationGallons * gravityCorrectionFactor)
		ibuRemaining -= ibu
	}

	if ibuRemaining > 0 {
		bitteringHop.Oz = (preFermentationGallons * gravityCorrectionFactor * ibuRemaining) / (bitteringHop.Utilization() * bitteringHop.AlphaAcid * 7489)
	}

	//calculate color
	srm := 0.0
	for _, fermentable := range fermentablesB {
		mcu := (fermentable.Oz / 16) * targetBatchGallons
		srm += 1.4922 * (math.Pow(mcu, 0.6859))
	}

	//debug print
	fmt.Println("OUTPUT----------------------------")
	for _, ingredient := range fermentablesB {
		fmt.Println(ingredient.Name, ": ", ingredient.Oz, "oz")
	}

	fmt.Println("\nSRM: ", srm)
	fmt.Println("\n", bitteringHop.Name, ": ", bitteringHop.Oz, "oz ", bitteringHop.BoilTime, "min")
	for _, hop := range flavorAromaHops {
		fmt.Println(hop.Name, ": ", hop.Oz, "oz ", hop.BoilTime, "min")
	}
}
