package main

import (
	"context"
	"fmt"
	"math"
	"strings"
)

type App struct {
	ctx context.Context
}

func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// Output read-friendly recipe
func (a *App) OutputRecipe() string {
	profile := LoadJSON[EquipmentProfile]("./SAMPLEDATA/profile.json")
	recipe := LoadJSON[Recipe]("./SAMPLEDATA/recipe.json")

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
	var output strings.Builder
	output.WriteString("---FERMENTABLES---\n")
	for _, ingredient := range recipe.Fermentables {
		output.WriteString(fmt.Sprintf("%s : %f oz\n", ingredient.Name, ingredient.Oz))
	}

	output.WriteString("\n---COLOR---\n")
	output.WriteString(fmt.Sprintf("SRM: %f\n", srm))
	output.WriteString("\n---HOPS---\n")
	output.WriteString(fmt.Sprintf("%s : %f oz, %d min\n", recipe.BitteringHop.Name, recipe.BitteringHop.Oz, recipe.BitteringHop.BoilTime))
	for _, hop := range recipe.FlavorAromaHops {
		output.WriteString(fmt.Sprintf("%s : %f oz, %d min\n", hop.Name, hop.Oz, hop.BoilTime))
	}

	return output.String()
}
