export default (state, elements) => {
  const currentPostID = state.modal.modalPostId;
  const { modalTitle } = elements;
  const { modalDescription } = elements;
  const { modalLink } = elements;
  const currentPost = state.posts.filter((post) => post.postId === currentPostID);
  modalTitle.textContent = currentPost[0].postTitle;
  modalDescription.textContent = currentPost[0].postDescription;
  modalLink.href = currentPost[0].link;
};
