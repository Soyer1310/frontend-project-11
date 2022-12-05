import buildCard from './buildCard.js';

const postsContainer = document.querySelector('div.posts');

export default (state, i18nInstance) => {
  postsContainer.innerHTML = '';
  const card = buildCard(i18nInstance, 'posts_titel');
  const ul = card.querySelector('ul');
  state.posts.forEach((post) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    const link = document.createElement('a');
    if (state.visitedPosts.includes(post.postId)) {
      link.classList.add('fw-normal');
      link.classList.add('link-secondary');
    } else {
      link.classList.add('fw-bold');
    }
    link.setAttribute('href', post.link);
    link.setAttribute('target', 'blank');
    link.dataset.id = post.postId;
    link.textContent = post.title;
    li.append(link);
    const button = document.createElement('button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm', 'preview-btn');
    button.setAttribute('type', 'button');
    button.dataset.id = post.postId;
    button.dataset.bsToggle = 'model';
    button.dataset.bsTarget = '#model';
    button.textContent = i18nInstance.t('view');
    li.append(button);
    ul.prepend(li);
  });
  postsContainer.append(card);
};
