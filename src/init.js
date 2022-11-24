import axios from 'axios';
import onChange from 'on-change';
import i18next from 'i18next';
import resources from './locales/index.js';
import render from './render.js';
import validate from './validation.js';

export default () => {
  const defaultLanguage = 'ru';
  const i18nInstance = i18next.createInstance();
  i18nInstance.init({
    lng: defaultLanguage,
    debug: false,
    resources,
  });

  const state = {
    rssForm: {
      value: 'Ссылка RSS',
      feedList: [],
      state: 'formFilling',
      errors: [],
      validation: 'valid',
    },
  };

  const watchedState = onChange(state, () => {
    render(state, i18nInstance);
  });

  const form = document.querySelector('form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.rssForm.validation = 'valid';
    const formData = new FormData(e.target);
    const urlString = formData.get('url');
    watchedState.rssForm.value = urlString;
    const response = axios.get(urlString);
    response.then(((resp) => console.log(resp.data)));
    validate(urlString, watchedState.rssForm.feedList).then(() => {
      console.log('QQQQQQQQQQQQQQQQQQQQQQQQQQQQ');
      watchedState.rssForm.validation = 'valid';
      watchedState.rssForm.state = 'formSubmited';
      watchedState.rssForm.feedList.push(urlString);
      watchedState.rssForm.errors = [];
    }).catch((error) => {
      watchedState.rssForm.validation = 'invalid';
      const messages = error.errors.map((err) => `error_messages.${err}`);
      watchedState.rssForm.errors = messages;
    });
  });
  render(state, i18nInstance);
};
