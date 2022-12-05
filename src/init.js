import axios from 'axios';
import i18next from 'i18next';
import _ from 'lodash';
import onChange from 'on-change';
import render from './render.js';
import postsRender from './postsRender.js';
import modalRender from './modalRender.js';
import resources from './locales/index.js';
import validate from './validation.js';
import visitRender from './visitRender.js';

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

const createPostsUi = (posts) => {
  const postsUi = posts.map((post) => {
    const { postId } = post;
    const visibility = 'hidden';
    return { postId, visibility };
  });
  return postsUi;
};

const addPosts = (rss, feedID) => {
  const items = Array.from(rss.querySelectorAll('item'));
  const posts = items.map((item) => {
    const title = item.querySelector('title').textContent;
    const description = item.querySelector('description').textContent;
    const link = item.querySelector('link').textContent;
    const postId = _.uniqueId();
    return {
      title, description, link, feedID, postId,
    };
  });
  return posts;
};

const addFeed = (state, rss, feedID) => {
  const title = rss.querySelector('title').textContent;
  const description = rss.querySelector('description').textContent;
  const feed = { title, description, feedID };
  return feed;
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
    uiPosts: [],
    visitedPosts: [],
  };
  const watchedState = onChange(state, (path, value) => {
    if (path === 'posts') {
      postsRender(state, i18nInstance);
    } else if (value === 'visible') {
      modalRender(state);
    } else if (path === 'visitedPosts') {
      visitRender(state.visitedPosts);
    } else if (path !== 'uiPosts') {
      render(state, i18nInstance);
    }
  });

  const comparePosts = (a, b) => {
    if (a.title === b.title && a.description === b.description) {
      return true;
    }
    return false;
  };

  const handler = (e) => {
    const clickedButton = e.target;
    const clickedButtonId = clickedButton.dataset.id;
    const choosenPost = _.find(watchedState.uiPosts, (uiPost) => uiPost.postId === clickedButtonId);
    watchedState.uiPosts.forEach((item) => {
      const currentPost = item;
      currentPost.visibility = 'hidden';
    });
    watchedState.visitedPosts.push(clickedButtonId);
    choosenPost.visibility = 'visible';
  };

  const updater = () => {
    setTimeout(() => {
      if (watchedState.posts.length > 0) {
        const links = state.rssForm.feedList;
        links.forEach((link) => {
          getRSScontent(link)
            .then(((resp) => XMLparser(resp.data.contents)))
            .then((parsedRSS) => {
              const posts = addPosts(parsedRSS);
              const unionPosts = _.unionWith(watchedState.posts, posts, comparePosts);
              watchedState.posts = unionPosts;
              watchedState.uiPosts = createPostsUi(unionPosts);
              const buttons = document.querySelectorAll('.preview-btn');
              buttons.forEach((button) => {
                button.addEventListener('click', handler);
              });
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
        .then((parsedRSS) => {
          const feedID = _.uniqueId();
          const feed = addFeed(state, parsedRSS, feedID);
          watchedState.feeds.push(feed);
          const posts = addPosts(parsedRSS, feedID);
          const unionPosts = _.unionWith(watchedState.posts, posts, comparePosts);
          watchedState.posts = unionPosts;
          watchedState.uiPosts = createPostsUi(unionPosts);
          watchedState.rssForm.state = 'formSubmited';
          watchedState.rssForm.feedList.push(urlString);
          watchedState.rssForm.errors = [];
          const buttons = document.querySelectorAll('.preview-btn');
          buttons.forEach((button) => {
            button.addEventListener('click', handler);
          });
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
  updater();
};
