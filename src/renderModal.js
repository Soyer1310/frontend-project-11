export default (state, elements) => {
  const currentPostID = state.modal.modalPostId;
  const { modalTitle } = elements;
  const { modalDescription } = elements;
  const { modalLink } = elements;
  const currentPost = state.posts.find((post) => post.id === currentPostID);
  modalTitle.textContent = currentPost.title;
  modalDescription.textContent = currentPost.description;
  modalLink.href = currentPost.link;
};
