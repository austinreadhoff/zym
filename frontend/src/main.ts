import {OutputRecipe} from '../wailsjs/go/main/App';

window.outputRecipe = function () {
    try {
        OutputRecipe()
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

window.outputRecipe();

declare global {
    interface Window {
        outputRecipe: () => void;
    }
}
