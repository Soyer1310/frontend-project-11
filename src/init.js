import axios from 'axios';
import onChange from 'on-change';
import i18next from 'i18next';
import _ from 'lodash';
import resources from './locales/index.js';
import render from './render.js';
import validate from './validation.js';
import postsRender from './postsRender.js';

const getRSScontent = (url) => {
  const preparedURL = new URL('https://allorigins.hexlet.app/get');
  preparedURL.searchParams.set('disableCache', true);
  preparedURL.searchParams.set('url', url);
  return axios.get(preparedURL);
};

const XMLparser = (XMLstring) => {
  const parser = new DOMParser();
  return parser.parseFromString(XMLstring, 'application/xml');
};

const addPosts = (document, id) => {
  const items = Array.from(document.querySelectorAll('item'));
  const posts = items.map((item) => {
    const title = item.querySelector('title').textContent;
    const description = item.querySelector('description').textContent;
    const link = item.querySelector('link').textContent;
    return {
      title, description, link, id,
    };
  });
  return posts;
};

const addFeed = (state, document) => {
  const title = document.querySelector('title').textContent;
  const description = document.querySelector('description').textContent;
  const id = _.uniqueId();
  const feed = { title, description, id };
  const posts = addPosts(document, id);
  state.feeds.push(feed);
  state.posts.push(...posts);
};

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
    feeds: [],
    posts: [],
  };

  const watchedState = onChange(state, (path) => {
    if (path === 'posts') {
      postsRender(state, i18nInstance);
    } else {
      render(state, i18nInstance);
    }
  });

  const updater = () => {
    setTimeout(() => {
      if (watchedState.posts.length > 0) {
        const links = state.rssForm.feedList;
        links.forEach((link) => {
          getRSScontent(link)
            .then(((resp) => XMLparser(resp.data.contents)))
            .then((document) => {
              const currentTitle = document.querySelector('title').textContent;
              const [id] = watchedState.feeds.filter((feed) => feed.title === currentTitle)
                .map((feed) => feed.id);
              const posts = addPosts(document, id);
              watchedState.posts = _.unionWith(watchedState.posts, posts, _.isEqual);
            });
        });
      }
      updater(state);
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
        .then((document) => {
          addFeed(state, document);
          watchedState.rssForm.state = 'formSubmited';
          watchedState.rssForm.feedList.push(urlString);
          watchedState.rssForm.errors = [];
        })
        .catch(() => {
          watchedState.rssForm.validation = 'invalid';
          watchedState.rssForm.errors = ['error_messages.incorrect_resource'];
        });
    }).catch((error) => {
      watchedState.rssForm.validation = 'invalid';
      const messages = error.errors.map((err) => `error_messages.${err}`);
      watchedState.rssForm.errors = messages;
    });
  });
  render(state, i18nInstance);
  updater(state);
};
