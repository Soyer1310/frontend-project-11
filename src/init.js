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

const loadFeed = (watchedState, urlString) => {
  getRSScontent(urlString)
    .then((resp) => {
      const parsedRSS = XMLparser(resp.data.contents);
      const feedID = _.uniqueId();
      const feedLink = urlString;
      const {
        feedTitle, feedDescription,
      } = parsedRSS;
      const feed = {
        feedTitle, feedDescription, feedLink, feedID,
      };
      watchedState.feeds.push(feed);
      const { posts } = parsedRSS;
      const postsWithId = posts.map((post) => {
        const postId = _.uniqueId();
        post = { ...post, postId };
        return post;
      });
      const unionPosts = _.unionWith(watchedState.posts, postsWithId, comparePosts);
      watchedState.posts = unionPosts;
      watchedState.rssForm.state = 'formSubmited';
    })
    .catch((e) => {
      if (e.message === 'Network Error') {
        watchedState.rssForm.errors = ['error_messages.network_error'];
      } else {
        watchedState.rssForm.errors = [`error_messages.${e.message}`];
      }
      watchedState.rssForm.validation = 'invalid';
    });
};

const updater = (state) => {
  const links = getFeedsLinks(state.feeds);
  new Promise((resolve) => {
    links.forEach((link) => {
      getRSScontent(link)
        .then(((content) => {
          const parsedRSS = XMLparser(content.data.contents);
          const { posts } = parsedRSS;
          const postsWithId = posts.map((post) => {
            const postId = _.uniqueId();
            post = { ...post, postId };
            return post;
          });
          const unionPosts = _.unionWith(state.posts, postsWithId, comparePosts);
          state.posts = unionPosts;
        }));
    });
    resolve();
  })
    .finally(() => {
      setTimeout(() => updater(state), 5000);
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
        state: null,
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
    watchedState.rssForm.state = 'formFilling';
    elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      watchedState.rssForm.state = 'formFilling';
      watchedState.rssForm.validation = 'valid';
      watchedState.rssForm.errors = [];
      const formData = new FormData(e.target);
      const urlString = formData.get('url');
      validate(urlString, watchedState.feeds).then(() => {
        watchedState.rssForm.validation = 'valid';
        loadFeed(watchedState, urlString);
      }).catch((error) => {
        const messages = error.errors.map((err) => `error_messages.${err}`);
        watchedState.rssForm.errors = messages;
        watchedState.rssForm.validation = 'invalid';
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
