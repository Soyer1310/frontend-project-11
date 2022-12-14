import axios from 'axios';
import * as yup from 'yup';
import i18next from 'i18next';
import _ from 'lodash';
import render from './render.js';
import resources from './locales/index.js';
import XMLparser from './parser.js';
import watcher from './watcher.js';

const getFeedsLinks = (feeds) => feeds.map((feed) => feed.feedLink);

yup.setLocale({
  mixed: {
    default: 'field_invalid',
    notOneOf: 'duble_link',
    required: 'required_feild',
  },
  string: {
    url: 'incorrect_format',
  },
});

const validate = (value, feedList) => {
  const links = getFeedsLinks(feedList);
  const urlSchema = yup.string().url().required().notOneOf(
    links,
  );
  return urlSchema.validate(value, { abortEarly: false });
};

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
      const links = getFeedsLinks(state.feeds);
      const requests = links.map((link) => getRSScontent(link));
      const requestsPromise = Promise.all(requests);
      requestsPromise.then((contents) => contents.forEach((content) => {
        const parsedRSS = XMLparser(content.data.contents);
        const { posts } = parsedRSS;
        const unionPosts = _.unionWith(watchedState.posts, posts, comparePosts);
        watchedState.posts = unionPosts;
      }))
        .finally(() => {
          setTimeout(updater, 5000);
        });
    };
    const form = document.querySelector('form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      watchedState.rssForm.state = 'formFilling';
      watchedState.rssForm.errors = [];
      const formData = new FormData(e.target);
      const urlString = formData.get('url');
      validate(urlString, watchedState.feeds).then(() => {
        watchedState.rssForm.validation = 'valid';
        getRSScontent(urlString)
          .catch(() => {
            watchedState.rssForm.errors = ['error_messages.network_error'];
          })
          .then(((resp) => XMLparser(resp.data.contents, urlString)))
          .then((parsedRSS) => {
            const {
              feedTitle, feedDescription, feedLink, feedID,
            } = parsedRSS;
            const feed = {
              feedTitle, feedDescription, feedLink, feedID,
            };
            watchedState.feeds.push(feed);
            const { posts } = parsedRSS;
            const unionPosts = _.unionWith(watchedState.posts, posts, comparePosts);
            watchedState.posts = unionPosts;
            watchedState.rssForm.state = 'formSubmited';
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
