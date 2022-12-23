export default (state, elements) => {
  const currentPostID = state.modal.modalPostId;
  const { modalTitle } = elements;
  const { modalDescription } = elements;
  const { modalLink } = elements;
  const currentPost = state.posts.filter((post) => post.id === currentPostID);
  modalTitle.textContent = currentPost[0].title;
  modalDescription.textContent = currentPost[0].description;
  modalLink.href = currentPost[0].link;
};
