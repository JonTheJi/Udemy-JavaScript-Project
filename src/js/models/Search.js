// api key e974489e001fdd461e3eecdfadb47edf
// URL http://food2fork.com/api/search
import axios from 'axios';
import {key, proxy} from '../config';

export default class Search {
  constructor (query) {
    this.query = query;
  }

  async getResults() {
    try {
      const res = await axios(`http://food2fork.com/api/search?key=${key}&q=${this.query}`);
      this.result = res.data.recipes;
    } catch (error) {
      alert (error);
    }
  }
}
