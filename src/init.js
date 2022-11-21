import axios from 'axios';
import onChange from 'on-change';
import render from './render.js';
import validate from './validation.js';

export default () => {
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
    render(state);
  });

  const form = document.querySelector('form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const urlString = formData.get('url');
    watchedState.rssForm.value = urlString;
    console.log(urlString);
    const response = axios.get(urlString);
    response.then(((resp) => console.log(resp.data)));
    validate(urlString, watchedState.rssForm.feedList).then(() => {
      watchedState.rssForm.validation = 'valid';
      watchedState.rssForm.state = 'formSubmited';
      watchedState.rssForm.feedList.push(urlString);
      watchedState.rssForm.errors = [];
    }).catch((error) => {
      watchedState.rssForm.validation = 'invalid';
      watchedState.rssForm.errors.push(error.value);
      console.log('$$$', error);
      console.log(state.rssForm.validation);
    });
    console.log('!!!', state.rssForm.feedList);
  });
};
