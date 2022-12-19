import axios from 'axios';
import * as yup from 'yup';
import i18next from 'i18next';
import _ from 'lodash';
import resources from './locales/index.js';
import XMLparser from './parser.js';
import watcher from './watcher.js';

const getFeedsLinks = (feeds) => feeds.map((feed) => feed.feedLink);

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

const comparePosts = (a, b) => {
  if (a.postTitle === b.postTitle && a.postDescription === b.postDescription) {
    return true;
  }
  return false;
};

const loadFeed = (state, urlString) => {
  const watchedState = state;
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
};

const updater = (watchedState) => {
  const state = watchedState;
  const links = getFeedsLinks(state.feeds);
  const requests = links.map((link) => getRSScontent(link));
  const requestsPromise = Promise.all(requests);
  requestsPromise.then((contents) => contents.forEach((content) => {
    const parsedRSS = XMLparser(content.data.contents);
    const { posts } = parsedRSS;
    const unionPosts = _.unionWith(state.posts, posts, comparePosts);
    state.posts = unionPosts;
  }))
    .finally(() => {
      setTimeout(() => updater(watchedState), 5000);
    });
};

export default () => {
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
      modal: {
        modalPostId: null,
      },
      feeds: [],
      posts: [],
      visitedPosts: [],
    };

    const elements = {
      form: document.querySelector('form'),
      input: document.getElementById('url-input'),
      messagesElem: document.querySelector('.feedback'),
      feedsContainer: document.querySelector('div.feeds'),
      postsContainer: document.querySelector('div.posts'),
      modal: document.getElementById('modal'),
      modalTitle: document.querySelector('.modal-title'),
      modalDescription: document.querySelector('.modal-body'),
      modalLink: document.querySelector('.full-article'),
    };

    const watchedState = watcher(state, i18nInstance, elements);
    elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      watchedState.rssForm.state = 'formFilling';
      watchedState.rssForm.errors = [];
      const formData = new FormData(e.target);
      const urlString = formData.get('url');
      validate(urlString, watchedState.feeds).then(() => {
        watchedState.rssForm.validation = 'valid';
        loadFeed(watchedState, urlString);
      }).catch((error) => {
        watchedState.rssForm.validation = 'invalid';
        const messages = error.errors.map((err) => `error_messages.${err}`);
        watchedState.rssForm.errors = messages;
      });
    });
    elements.postsContainer.addEventListener('click', (e) => {
      if (e.target.dataset.id) {
        const clickedButtonId = e.target.dataset.id;
        if (!watchedState.visitedPosts.includes(clickedButtonId)) {
          watchedState.visitedPosts.push(clickedButtonId);
        }
        watchedState.modal.modalPostId = clickedButtonId;
      }
    });
    updater(watchedState);
  });
};
