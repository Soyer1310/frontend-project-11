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
import XMLparser from './parser.js';

const getRSScontent = (url) => {
  const preparedURL = new URL('https://allorigins.hexlet.app/get');
  preparedURL.searchParams.set('disableCache', true);
  preparedURL.searchParams.set('url', url);
  return axios.get(preparedURL);
};

const createPostsUi = (posts) => {
  const postsUi = posts.map((post) => {
    const { postId } = post;
    const visibility = 'hidden';
    return { postId, visibility };
  });
  return postsUi;
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
    if (a.postTitle === b.postTitle && a.postDescription === b.postDescription) {
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
              const { posts } = parsedRSS;
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
          const { feedTitle, feedDescription, feedID } = parsedRSS;
          const feed = { feedTitle, feedDescription, feedID };
          watchedState.feeds.push(feed);
          const { posts } = parsedRSS;
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
  render(state, i18nInstance);
  updater();
};
