import { Modal } from 'bootstrap';

export default (state, visitedPosts) => {
  const myModal = new Modal(document.getElementById('modal'), {
    keyboard: false,
  });
  const currentPostID = visitedPosts[visitedPosts.length - 1];
  myModal.show();
  const modalTitle = document.querySelector('.modal-title');
  const modalDescription = document.querySelector('.modal-body');
  const modalLink = document.querySelector('.full-article');
  state.posts.forEach((post) => {
    if (post.postId === currentPostID) {
      modalTitle.textContent = post.postTitle;
      modalDescription.textContent = post.postDescription;
      modalLink.href = post.link;
    }
  });
};
