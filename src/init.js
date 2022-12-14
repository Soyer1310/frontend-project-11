import axios from 'axios';
import * as yup from 'yup';
import i18next from 'i18next';
import _ from 'lodash';
import resources from './locales/index.js';
import XMLparser from './parser.js';
import watcher from './watcher.js';

const getFeedsUrls = (feeds) => feeds.map((feed) => feed.url);

const validate = (value, feedList) => {
  const urls = getFeedsUrls(feedList);
  const urlSchema = yup.string().url().required().notOneOf(
    urls,
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
  if (a.feedId === b.feedId && a.title === b.title && a.description === b.description) {
    return true;
  }
  return false;
};

const loadFeed = (watchedState, url) => {
  getRSScontent(url)
    .then((resp) => {
      const parsedRSS = XMLparser(resp.data.contents);
      const feedId = _.uniqueId();
      const {
        feedTitle, feedDescription,
      } = parsedRSS;
      const feed = {
        title: feedTitle, description: feedDescription, url, id: feedId,
      };
      watchedState.feeds.push(feed);
      const { posts } = parsedRSS;
      const postsWithId = posts.map((post) => {
        const postId = _.uniqueId();
        post = { ...post, feedId, id: postId };
        return post;
      });
      const unionPosts = _.union(watchedState.posts, postsWithId);
      watchedState.posts = unionPosts;
      watchedState.rssForm.state = 'loaded';
      watchedState.rssForm.validation = 'valid';
    })
    .catch((e) => {
      if (e.isAxiosError) {
        watchedState.rssForm.error = 'error_messages.network_error';
      } else if (e.isParsingError) {
        watchedState.rssForm.error = 'error_messages.incorrect_resource';
      } else {
        watchedState.rssForm.error = 'error_messages.unknown_error';
      }
      watchedState.rssForm.state = 'formFilling';
      watchedState.rssForm.validation = 'invalid';
    });
};

const updater = (state) => {
  const urls = getFeedsUrls(state.feeds);
  const promises = urls.map((url) => getRSScontent(url)
    .then((content) => {
      const currentFeedId = state.feeds.find((feed) => feed.url === url).id;
      const parsedRSS = XMLparser(content.data.contents);
      const { posts } = parsedRSS;
      const postsWithId = posts.map((post) => {
        const postId = _.uniqueId();
        post = { ...post, feedId: currentFeedId, id: postId };
        return post;
      });
      const unionPosts = _.unionWith(state.posts, postsWithId, comparePosts);
      state.posts = unionPosts;
      return null;
    }));
  Promise.all(promises)
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
        state: 'formFilling',
        error: null,
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
      const formData = new FormData(e.target);
      const urlString = formData.get('url');
      validate(urlString, watchedState.feeds).then(() => {
        watchedState.rssForm.state = 'loading';
        watchedState.rssForm.error = null;
        watchedState.rssForm.validation = 'valid';
        loadFeed(watchedState, urlString);
      }).catch((error) => {
        watchedState.rssForm.state = 'formFilling';
        const message = `error_messages.${error.message}`;
        watchedState.rssForm.error = message;
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
