import onChange from 'on-change';
import postsRender from './postsRender.js';
import modalRender from './modalRender.js';
import visitRender from './visitRender.js';
import render from './render.js';

export default (state, i18nInstance, elements) => {
  const watchedState = onChange(state, (path) => {
    if (path === 'posts') {
      postsRender(state, i18nInstance, elements);
    } else if (path === 'modal.modalPostId') {
      modalRender(state, elements);
      visitRender(state.visitedPosts);
    } else {
      render(state, i18nInstance, elements);
    }
  });
  return watchedState;
};
