// Global app controller
import Search from './models/Search';
import * as searchView from './views/searchView';
import {elements, renderLoader, clearLoader} from './views/base';
/** Global state of the app
 *  Search object
 *  Current recipe object
 *  Shopping list object
 *  Liked recipes
**/
const state = {

};

const controlSearch = async () => {
  // 1) Get query from view
  const query = searchView.getInput(); //TODO
  console.log(query);
  if (query !== '') {
    // 2) new Search object and add too state
    state.search = new Search(query);

    // 3) clearing previous results, input and results
    renderLoader(elements.searchResults);
    searchView.clearInput();
    searchView.clearResults();

    // 4) search for recipes
    await state.search.getResults();

    // 5) Render results on UI and cloear the loader
    clearLoader();
    searchView.renderResults(state.search.result);
    console.log(state.search.result);
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
