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
    const title = item.querySelector('title').textContent;
    const description = item.querySelector('description').textContent;
    const link = item.querySelector('link').textContent;
    return {
      title, description, link,
    };
  });
  return {
    feedTitle, feedDescription, posts,
  };
};
