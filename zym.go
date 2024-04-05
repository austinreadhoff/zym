package main

import (
	"fmt"
	"math"
)

func main() {
	//equipment profile
	var profile EquipmentProfile
	profile.BrewhouseEfficiency = 2.5
	profile.PreFermentationGallons = 6.0
	profile.BrewhouseEfficiency = 0.75

	//recipe
	var recipe Recipe
	recipe.OG = 1.06
	recipe.IBU = 45.0

	recipe.Fermentables = append(recipe.Fermentables, Fermentable{
		Name:    "2-Row",
		Yield:   36,
		Percent: 0.875,
		Color:   2,
		Mash:    true,
	})
	recipe.Fermentables = append(recipe.Fermentables, Fermentable{
		Name:    "Victory",
		Yield:   34,
		Percent: 0.05,
		Color:   25,
		Mash:    true,
	})
	recipe.Fermentables = append(recipe.Fermentables, Fermentable{
		Name:    "Crystal 40",
		Yield:   34,
		Percent: 0.025,
		Color:   40,
		Mash:    true,
	})
	recipe.Fermentables = append(recipe.Fermentables, Fermentable{
		Name:    "Crystal 80",
		Yield:   34,
		Percent: 0.025,
		Color:   80,
		Mash:    true,
	})
	recipe.Fermentables = append(recipe.Fermentables, Fermentable{
		Name:    "Carapils",
		Yield:   33,
		Percent: 0.025,
		Color:   2,
		Mash:    true,
	})

	recipe.BitteringHop = Hop{
		Name:      "Cascade",
		AlphaAcid: 0.052,
		BoilTime:  60,
	}

	recipe.FlavorAromaHops = append(recipe.FlavorAromaHops, Hop{
		Name:      "Cascade",
		AlphaAcid: 0.052,
		Oz:        1.0,
		BoilTime:  20,
	})
	recipe.FlavorAromaHops = append(recipe.FlavorAromaHops, Hop{
		Name:      "Cascade",
		AlphaAcid: 0.052,
		Oz:        0.5,
		BoilTime:  10,
	})
	recipe.FlavorAromaHops = append(recipe.FlavorAromaHops, Hop{
		Name:      "Cascade",
		AlphaAcid: 0.052,
		Oz:        0.5,
		BoilTime:  2,
	})

	//calculate grain bill
	gravityUnits := (recipe.OG - 1) * 1000 * profile.BrewhouseEfficiency

	for i, fermentable := range recipe.Fermentables {
		fermentableUnits := fermentable.Percent * float64(gravityUnits)

		efficiency := 1.0
		if fermentable.Mash {
			efficiency = profile.BrewhouseEfficiency
		}

		recipe.Fermentables[i].Oz = (fermentableUnits / float64(fermentable.Yield) / efficiency) * 16
	}

	//calculate hop additions
	gravityCorrectionFactor := 1.0
	if recipe.OG > 1.050 {
		gravityCorrectionFactor = 1 + ((recipe.OG - 1.050) / 0.2)
	}

	ibuRemaining := recipe.IBU
	for _, hop := range recipe.FlavorAromaHops {
		recipe.IBU = (hop.Oz * hop.Utilization() * hop.AlphaAcid * 7489) / (profile.PreFermentationGallons * gravityCorrectionFactor)
		ibuRemaining -= recipe.IBU
	}

	if ibuRemaining > 0 {
		recipe.BitteringHop.Oz = (profile.PreFermentationGallons * gravityCorrectionFactor * ibuRemaining) / (recipe.BitteringHop.Utilization() * recipe.BitteringHop.AlphaAcid * 7489)
	}

	//calculate color
	srm := 0.0
	for _, fermentable := range recipe.Fermentables {
		mcu := (fermentable.Oz / 16) * profile.BrewhouseEfficiency
		srm += 1.4922 * (math.Pow(mcu, 0.6859))
	}

	//debug print
	fmt.Println("OUTPUT----------------------------")
	for _, ingredient := range recipe.Fermentables {
		fmt.Println(ingredient.Name, ": ", ingredient.Oz, "oz")
	}

	fmt.Println("\nSRM: ", srm)
	fmt.Println("\n", recipe.BitteringHop.Name, ": ", recipe.BitteringHop.Oz, "oz ", recipe.BitteringHop.BoilTime, "min")
	for _, hop := range recipe.FlavorAromaHops {
		fmt.Println(hop.Name, ": ", hop.Oz, "oz ", hop.BoilTime, "min")
	}
}
