// Global app controller
import Search from './models/Search';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesViews';
import {elements, renderLoader, clearLoader} from './views/base';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';

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

    const btn = e.target.closest('.btn-inline');
    if (btn) {
      searchView.clearResults();
      const gotToPage = parseInt(btn.dataset.goto, 10);
      searchView.renderResults(state.search.result, gotToPage);
    }
});

/**
  * Recipe controller
  */

  //testing

const controlRecipe = async () => {
  // Get Id from URl
  const original =  window.location.hash;
  var id = '';
  var index = 0;
  console.log(original);
  for (var i = 0; i < original.length; i++) {
    if (original.charAt(i) === '.' || original.charAt(i) === '#') {
      index = i;
    }
  }
  id = original.slice(index + 1);
  if (id) {
    // prepare UI for changes
    recipeView.clearRecipe();
    renderLoader(elements.recipe);

    // Highlight selected search item
    if (state.search) searchView.highLightSelected(id);

    // Create new recipe object
    state.recipe = new Recipe(id);
    console.log(id);
    try {
        // Get recippe dataset
        await state.recipe.getRecipe();
        state.recipe.parseIngredients();

        // Calculate servings and timeout
        state.recipe.calcTime();
        state.recipe.calcServings();

        // Render recipe
        clearLoader();
        recipeView.renderRecipe(
        state.recipe,
        state.likes.isLiked(id)
      );
    } catch (error) {
      alert(error + ' Error procesing recipes');
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

// Like controller
const controlLike = () => {
  if (!state.likes) {
    state.likes = new Likes();
  }
  const currentID = state.recipe.id;

  // User has not yet liked current recipe
  if (!state.likes.isLiked(currentID)) {
      // Add like to the state
      const newLike = state.likes.addLike(
        currentID,
        state.recipe.title,
        state.recipe.author,
        state.recipe.image
      );
      // Toggle the like button
      likesView.toggleLikeBtn(true);
      // Add like to UI list
      likesView.renderLike(newLike);

    // User has liked current recipe
  } else {
      // Remove like from the state
      state.likes.deleteLike(currentID);
      // Toggle the like button
      likesView.toggleLikeBtn(false);
      // Remove like from UI list
      likesView.deleteLike(currentID);
  }
  likesView.toggleLikeBtn(state.likes.getNumLikes());
};

// Handle delte and update list item addEventListener
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    // Handle the delete button
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        // Delete from state
        state.list.deleteItem(id);

        // Delete from UI
        listView.deleteItem(id);

    // Handle the count update
  } else if(e.target.matches('.Shopping__count-value')) {
        const val = parsFloat(e.target.value, 10);
        console.log(val);
        state.list.updateCount(id, val);
    }
});

// Restore liked recipes
window.addEventListener('load', () => {
  state.likes = new Likes();

  // Restore likes
  state.likes.readStorage();

  // Toggle like menue button
  likesView.toggleLikeMenu(state.likes.getNumLikes());

  // Render the exsting likes
  state.likes.likes.forEach(like => likesView.renderLike(like));
});

// Event delegation, Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
  if (e.target.matches('.btn-decrease, .btn-decrease *')) {
      if (state.recipe.servings > 1) {
          state.recipe.updateServings('dec');
          recipeView.updateServingIngredients(state.recipe);
      }
  } else if (e.target.matches('.btn-increase, .btn-increase *')) {
      state.recipe.updateServings('inc');
      console.log('hello');
      recipeView.updateServingIngredients(state.recipe);
  } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
    // Add ingredients to shopping list
      controllerList();
  } else if (e.target.matches('.recipe__love, .recipe__love *')) {
    // like controller
      controlLike();
  }
});
