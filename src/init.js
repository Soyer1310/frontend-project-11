import axios from 'axios';
import i18next from 'i18next';
import _ from 'lodash';
import render from './render.js';
import resources from './locales/index.js';
import validate from './validation.js';
import XMLparser from './parser.js';
import watcher from './watcher.js';

const getRSScontent = (url) => {
  const preparedURL = new URL('https://allorigins.hexlet.app/get');
  preparedURL.searchParams.set('disableCache', true);
  preparedURL.searchParams.set('url', url);
  return axios.get(preparedURL);
};

export default () => {
  const defaultLanguage = 'ru';
  const i18nInstance = i18next.createInstance();
  i18nInstance.init({
    lng: defaultLanguage,
    debug: false,
    resources,
  }).then(() => {
    const state = {
      rssForm: {
        value: 'Ссылка RSS',
        feedList: [],
        state: 'formFilling',
        errors: [],
        validation: 'valid',
      },
      feeds: [],
      posts: [],
      visitedPosts: [],
    };
    const watchedState = watcher(state, i18nInstance);
    const comparePosts = (a, b) => {
      if (a.postTitle === b.postTitle && a.postDescription === b.postDescription) {
        return true;
      }
      return false;
    };
    const handler = (e) => {
      if (e.target.dataset.id) {
        const clickedButtonId = e.target.dataset.id;
        watchedState.visitedPosts.push(clickedButtonId);
      }
    };
    const updater = () => {
      setTimeout(() => {
        if (watchedState.posts.length > 0) {
          const links = state.rssForm.feedList;
          const requests = links.map((link) => getRSScontent(link));
          const requestsPromise = Promise.all(requests);
          requestsPromise.then((contents) => contents.forEach((content) => {
            const parsedRSS = XMLparser(content.data.contents);
            const { posts } = parsedRSS;
            const unionPosts = _.unionWith(watchedState.posts, posts, comparePosts);
            watchedState.posts = unionPosts;
          }))
            .finally(() => {
              updater(state);
            });
        } else {
          updater(state);
        }
      }, 5000);
    };
    const form = document.querySelector('form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      watchedState.rssForm.state = 'formFilling';
      const formData = new FormData(e.target);
      const urlString = formData.get('url');
      watchedState.rssForm.value = urlString;
      validate(urlString, watchedState.rssForm.feedList).then(() => {
        watchedState.rssForm.validation = 'valid';
        getRSScontent(urlString)
          .catch(() => {
            watchedState.rssForm.errors = ['error_messages.network_error'];
          })
          .then(((resp) => XMLparser(resp.data.contents)))
          .then((parsedRSS) => {
            const { feedTitle, feedDescription, feedID } = parsedRSS;
            const feed = { feedTitle, feedDescription, feedID };
            watchedState.feeds.push(feed);
            const { posts } = parsedRSS;
            const unionPosts = _.unionWith(watchedState.posts, posts, comparePosts);
            watchedState.posts = unionPosts;
            watchedState.rssForm.state = 'formSubmited';
            watchedState.rssForm.feedList.push(urlString);
            watchedState.rssForm.errors = [];
          })
          .catch(() => {
            watchedState.rssForm.validation = 'invalid';
            if (watchedState.rssForm.errors.length === 0) {
              watchedState.rssForm.errors = ['error_messages.incorrect_resource'];
            }
          });
      }).catch((error) => {
        watchedState.rssForm.validation = 'invalid';
        const messages = error.errors.map((err) => `error_messages.${err}`);
        watchedState.rssForm.errors = messages;
      });
    });
    const postsContainer = document.querySelector('div.posts');
    postsContainer.addEventListener('click', handler);

    render(state, i18nInstance);
    updater();
  });
};
