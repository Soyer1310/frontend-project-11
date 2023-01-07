export default (visited, elements) => {
  const links = Array.from(elements.postsContainer.querySelectorAll('a'));
  links.forEach((link) => {
    if (visited.includes(link.dataset.id)) {
      link.classList.remove('fw-bold');
      link.classList.add('fw-normal');
      link.classList.add('link-secondary');
    }
  });
};
