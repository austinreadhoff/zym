import {LoadRecipe, PrintRecipe} from '../wailsjs/go/main/App';
import {main} from '../wailsjs/go/models';

declare global {
    interface Window {
        loadRecipe: () => void;
        printRecipe: (Recipe: main.Recipe, batch: number) => void;
    }
}

window.loadRecipe = function () {
    try {
        LoadRecipe("./SAMPLEDATA/recipe.json")
            .then((result) => {
                window.printRecipe(result, 0);
            })
            .catch((err) => {
                console.error(err);
            });
    } catch (err) {
        console.error(err);
    }
};
window.printRecipe = function (recipe: main.Recipe, batch: number) {
    try {
        PrintRecipe(recipe, batch)
            .then((result) => {
                document.getElementById("result")!.innerText = result;
            })
            .catch((err) => {
                console.error(err);
            });
    } catch (err) {
        console.error(err);
    }
};

window.loadRecipe();