const input = document.getElementById('url-input');
const messagesElem = document.querySelector('.feedback');
const postsContainer = document.querySelector('div.posts');
const feedsContainer = document.querySelector('div.feeds');

const buildCard = (i18nInstance, title) => {
  const card = document.createElement('div');
  card.classList.add('card', 'border-0');
  const cardBody = document.createElement('div');
  cardBody.classList.add('cart-body');
  card.append(cardBody);
  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = i18nInstance.t(title);
  cardBody.append(cardTitle);
  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');
  card.append(ul);
  return card;
};

const buildPostsList = (state, i18nInstance) => {
  postsContainer.innerHTML = '';
  const card = buildCard(i18nInstance, 'posts_titel');
  const ul = card.querySelector('ul');
  state.posts.forEach((post) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    const link = document.createElement('a');
    link.classList.add('fw-bold');
    link.setAttribute('href', post.link);
    link.setAttribute('target', 'blank');
    link.dataset.id = post.id;
    link.textContent = post.title;
    li.append(link);
    const button = document.createElement('button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.setAttribute('type', 'button');
    button.dataset.id = post.id;
    button.dataset.bsToggle = 'model';
    button.dataset.bsTarget = '#model';
    button.textContent = i18nInstance.t('view');
    li.append(button);
    ul.append(li);
  });
  postsContainer.append(card);
};
const buildFeedsList = (state, i18nInstance) => {
  feedsContainer.innerHTML = '';
  const card = buildCard(i18nInstance, 'feeds_titel');
  const ul = card.querySelector('ul');
  state.feeds.forEach((feed) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');
    const h3 = document.createElement('h3');
    h3.classList.add('h6', 'm-0');
    h3.textContent = feed.title;
    const p = document.createElement('p');
    p.classList.add('m-0', 'small', 'text-black-50');
    p.textContent = feed.description;
    li.append(h3, p);
    ul.append(li);
  });
  feedsContainer.append(card);
};

const initializatior = (state, i18nInstance) => {
  const header = document.querySelector('h1');
  header.textContent = i18nInstance.t('header');
  const introdution = document.querySelector('.lead');
  introdution.textContent = i18nInstance.t('introdution');
  input.placeholder = i18nInstance.t('placeholder');
  const label = document.querySelector('label');
  label.textContent = i18nInstance.t('placeholder');
  const button = document.querySelector('button');
  button.textContent = i18nInstance.t('button');
  const example = document.querySelector('.text-muted');
  example.textContent = i18nInstance.t('example');
  messagesElem.textContent = '';
};

export default (state, i18nInstance) => {
  initializatior(state, i18nInstance);
  if (state.rssForm.validation === 'invalid') {
    input.classList.add('is-invalid');
    input.value = state.rssForm.value;
    messagesElem.textContent = state.rssForm.errors.map((err) => i18nInstance.t(err)).join('\n');
    console.log(messagesElem);
    input.blur();
  }
  if (state.rssForm.validation === 'valid') {
    input.classList.remove('is-invalid');
  }
  if (state.rssForm.state === 'formSubmited') {
    messagesElem.classList.remove('text-danger');
    messagesElem.classList.add('text-success');
    messagesElem.textContent = i18nInstance.t('successful_message');
    buildPostsList(state, i18nInstance);
    buildFeedsList(state, i18nInstance);
    input.value = '';
    input.focus();
  }
  if (state.rssForm.state === 'formFilling') {
    messagesElem.classList.add('text-danger');
    messagesElem.classList.remove('text-success');
  }
};
