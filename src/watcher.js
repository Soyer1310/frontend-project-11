import onChange from 'on-change';
import postsRender from './postsRender.js';
import modalRender from './modalRender.js';
import visitRender from './visitRender.js';
import render from './render.js';

export default (state, i18nInstance, elements) => {
  const watchedState = onChange(state, (path, value) => {
    if (path === 'posts') {
      postsRender(state, i18nInstance, elements);
    } else if (path === 'visitedPosts') {
      modalRender(state, value, elements);
      visitRender(state.visitedPosts);
    } else {
      render(state, i18nInstance, render);
    }
  });
  return watchedState;
};
