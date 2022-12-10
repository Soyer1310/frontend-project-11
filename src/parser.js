import _ from 'lodash';

export default (XMLstring) => {
  const parser = new DOMParser();
  const parsedContent = parser.parseFromString(XMLstring, 'application/xml');
  const feedID = _.uniqueId();
  const feedTitle = parsedContent.querySelector('title').textContent;
  const feedDescription = parsedContent.querySelector('description').textContent;
  const items = Array.from(parsedContent.querySelectorAll('item'));
  const posts = items.map((item) => {
    const postTitle = item.querySelector('title').textContent;
    const postDescription = item.querySelector('description').textContent;
    const link = item.querySelector('link').textContent;
    const postId = _.uniqueId();
    return {
      postTitle, postDescription, link, feedID, postId,
    };
  });
  return {
    feedTitle, feedDescription, feedID, posts,
  };
};
