import _ from 'lodash';
import { Modal } from 'bootstrap';

export default (state) => {
  const myModal = new Modal(document.getElementById('modal'), {
    keyboard: false,
  });
  myModal.show();
  const modalTitle = document.querySelector('.modal-title');
  const modalDescription = document.querySelector('.modal-body');
  const modalLink = document.querySelector('.full-article');
  const currentPostID = _.find(state.uiPosts, (uiPost) => uiPost.visibility === 'visible').postId;
  state.posts.forEach((post) => {
    if (post.postId === currentPostID) {
      modalTitle.textContent = post.title;
      modalDescription.textContent = post.description;
      modalLink.href = post.link;
    }
  });
};
