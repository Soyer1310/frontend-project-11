export default (XMLstring) => {
  const parser = new DOMParser();
  const parsedContent = parser.parseFromString(XMLstring, 'application/xml');
  if (parsedContent.querySelector('parsererror')) {
    throw new Error('incorrect_resource');
  }
  const feedTitle = parsedContent.querySelector('title').textContent;
  const feedDescription = parsedContent.querySelector('description').textContent;
  const items = Array.from(parsedContent.querySelectorAll('item'));
  const posts = items.map((item) => {
    const postTitle = item.querySelector('title').textContent;
    const postDescription = item.querySelector('description').textContent;
    const link = item.querySelector('link').textContent;
    return {
      postTitle, postDescription, link,
    };
  });
  return {
    feedTitle, feedDescription, posts,
  };
};
