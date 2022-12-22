export default (visited) => {
  const links = Array.from(document.querySelectorAll('a'));
  links.forEach((link) => {
    if (visited.includes(link.dataset.id)) {
      link.classList.remove('fw-bold');
      link.classList.add('fw-normal');
      link.classList.add('link-secondary');
    }
  });
};
