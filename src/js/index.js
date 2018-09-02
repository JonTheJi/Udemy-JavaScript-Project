// Global app controller
import Search from './models/Search';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as lsitView from './views/listView';
import {elements, renderLoader, clearLoader} from './views/base';
import Recipe from './models/Recipe';
import List from './models/List';

/** Global state of the app
 *  Search object
 *  Current recipe object
 *  Shopping list object
 *  Liked recipes
**/
const state = {

};
/**
  * SEARCH controller
  */
const controlSearch = async () => {
  // 1) Get query from view
  const query = searchView.getInput();
  if (query !== '') {
    // 2) new Search object and add too state
    state.search = new Search(query);

    // 3) clearing previous results, input and results
    renderLoader(elements.searchResults);
    searchView.clearInput();
    searchView.clearResults();

    try {
      // 4) search for recipes
      await state.search.getResults();

      // 5) Render results on UI and cloear the loader
      if (state.search.result.length !== 0) {
        clearLoader();
        searchView.renderResults(state.search.result);
      } else {
        clearLoader();
      }
    } catch (error) {
      alert('wong input');
      clearLoader();
    }
  }
}
elements.searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
      searchView.clearResults();
    const btn = e.target.closest('.btn-inline');
    if (btn) {
      const gotToPage = parseInt(btn.dataset.goto, 10);
      searchView.renderResults(state.search.result, gotToPage);
    }
});


/**
  * Recipe controller
  */
const controlRecipe = async () => {
  // Get Id from URL

  const idArr =  window.location.hash.split('.');
  const id = idArr[1];

  if (id) {
    // prepare UI for changes
    recipeView.clearRecipe();
    renderLoader(elements.recipe);

    // Highlight selected search item
    if (sate.search) searchView.highLightSelected(id);


    // Create new recipe object
    state.recipe = new Recipe(id);

    try {
      // Get recippe dataset
      await state.recipe.getRecipe();
      state.recipe.parseIngredients();
      console.log(state.recipe.ingredients);
      // Calculate servings and timeout
      state.recipe.calcTime();
      state.recipe.calcServings();

      // Render recipe
      clearLoader();
      recipeView.renderRecipe(state.recipe);
    } catch (error) {
      alert(error + ' Error processing recipes');
    }
  }
};

window.addEventListener('hashchange', controlRecipe);
window.addEventListener('load', controlRecipe);

// List controller

const controllerList = () => {
    if (!state.list) {
      state.list = new List();
    }

    // Add each ingredient to the List and the UI
      state.recipe.ingredients.forEach(el => {
      const item = state.list.addItem(el.count, el.unit, el.ingredient);
      listView.renderItem(item);
    });
};

// Handle delte and update list item addEventListener
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;


    // Handle the delete button
    if (e.target.matches('.shppping__delete, .shppping__delete *')) {
        // Delete from state
        state.list.deleteItem(id);


        // Delte from UI
        listView.deleteItem(id);

        // Handle the update
    } else if (e.target.matches('.shopping__count-value')) {
        const val = parsoFloat(e.target.value, 10);
        sate.list.updateCount(id, val);
    }
});

// Event delegation, Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
  if (e.target.matchers('.btn-decrease, .btn-decrease *')) {
      if (state.recipe.servings > 1) {
          state.recipe.updateServings('dec');
          recipeView.updateServingIngredients(state.recipe);
      }
  } else if (e.target.matches('.btn-increase, .btn-increase *')) {
      state.recipe.updateServings('inc');
  } else if (e.target.matches('.recipe__btn--add, .recipe__btn *')) {
      controllerList();
  }
});
