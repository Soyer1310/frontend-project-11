import { Modal } from 'bootstrap';

export default (state, elements) => {
  const myModal = new Modal(elements.modal, {
    keyboard: false,
  });
  const currentPostID = state.modal.modalPostId;
  myModal.show();
  const { modalTitle } = elements;
  const { modalDescription } = elements;
  const { modalLink } = elements;
  state.posts.forEach((post) => {
    if (post.postId === currentPostID) {
      modalTitle.textContent = post.postTitle;
      modalDescription.textContent = post.postDescription;
      modalLink.href = post.link;
    }
  });
};
