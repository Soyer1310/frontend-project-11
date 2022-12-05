import buildCard from './buildCard.js';

const input = document.getElementById('url-input');
const messagesElem = document.querySelector('.feedback');
const feedsContainer = document.querySelector('div.feeds');

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
  const button = document.querySelector('button.btn-primary');
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
    input.blur();
  }
  if (state.rssForm.validation === 'valid') {
    input.classList.remove('is-invalid');
  }
  if (state.rssForm.state === 'formSubmited') {
    messagesElem.classList.remove('text-danger');
    messagesElem.classList.add('text-success');
    messagesElem.textContent = i18nInstance.t('successful_message');
    buildFeedsList(state, i18nInstance);
    input.value = '';
    input.focus();
  }
  if (state.rssForm.state === 'formFilling') {
    messagesElem.classList.add('text-danger');
    messagesElem.classList.remove('text-success');
  }
};
