import onChange from 'on-change';
import renderPosts from './renderPosts.js';
import renderModal from './renderModal.js';
import renderVisited from './renderVisited.js';
import buildCard from './buildCard.js';

const buildFeedsList = (state, i18nInstance, elements) => {
  const { feedsContainer } = elements;
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

const initializatior = (i18nInstance, elements) => {
  const { input } = elements;
  const { messagesElem } = elements;
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

const renderForm = (state, i18nInstance, elements) => {
  const { input } = elements;
  const { messagesElem } = elements;
  initializatior(i18nInstance, elements);
  if (state.rssForm.validation === 'invalid') {
    input.classList.add('is-invalid');
    messagesElem.textContent = i18nInstance.t(state.rssForm.error);
    input.blur();
  }

  if (state.rssForm.validation === 'valid') {
    input.classList.remove('is-invalid');
  }

  if (state.rssForm.state === 'loaded') {
    messagesElem.classList.remove('text-danger');
    messagesElem.classList.add('text-success');
    messagesElem.textContent = i18nInstance.t('successful_message');
    buildFeedsList(state, i18nInstance, elements);
    input.removeAttribute('disabled');
    input.value = '';
    input.focus();
  }

  if (state.rssForm.state === 'loading') {
    input.setAttribute('disabled', 'disabled');
  }

  if (state.rssForm.state === 'formFilling') {
    messagesElem.classList.add('text-danger');
    messagesElem.classList.remove('text-success');
    input.removeAttribute('disabled');
  }
};

export default (state, i18nInstance, elements) => {
  initializatior(i18nInstance, elements);
  const watchedState = onChange(state, (path) => {
    if (path === 'posts') {
      renderPosts(state, i18nInstance, elements);
    } else if (path === 'modal.modalPostId') {
      renderModal(state, elements);
    } else if (path === 'visitedPosts') {
      renderVisited(state.visitedPosts);
    } else if (path === 'rssForm.state' || path === 'rssForm.validation' || path === 'rssForm.error') {
      renderForm(state, i18nInstance, elements);
    }
  });
  return watchedState;
};
