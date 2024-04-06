package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math"
	"os"
)

func LoadJSON[T any](path string) T {
	var output T
	content, err := os.ReadFile(path)
	if err != nil {
		log.Println("failure reading file: ", path, ".  Error: ", err)
	}
	err = json.Unmarshal(content, &output)
	if err != nil {
		log.Println("failure parsing json as object: ", path, ".  Error: ", err)
	}

	return output
}

func main() {
	profile := LoadJSON[EquipmentProfile]("./sample/profile.json")
	recipe := LoadJSON[Recipe]("./sample/recipe.json")

	//calculate grain bill
	gravityUnits := (recipe.OG - 1) * 1000 * profile.TargetBatchGallons

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
		mcu := (fermentable.Oz / 16) * profile.TargetBatchGallons
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
