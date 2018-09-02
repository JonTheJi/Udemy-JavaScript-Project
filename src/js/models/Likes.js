export default class Likes {
    constructor() {
    this.likes = [];
}

  addLike(id, title, author, img) {
      const like = {id, title, author, img};
      this.likes.push(like);
      return like;
  }

  deleteLike(id) {
      const index = this.items.likes.findIndex(el => el.id === id);
      this.likes.splice(index, 1);
  }
}
