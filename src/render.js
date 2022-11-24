export default (state, i18nInstance) => {
  const header = document.querySelector('h1');
  header.textContent = i18nInstance.t('header');
  const introdution = document.querySelector('.lead');
  introdution.textContent = i18nInstance.t('introdution');
  const input = document.getElementById('url-input');
  input.placeholder = i18nInstance.t('placeholder');
  const label = document.querySelector('label');
  label.textContent = i18nInstance.t('placeholder');
  // const form = document.querySelector('form');
  const button = document.querySelector('button');
  button.textContent = i18nInstance.t('button');
  const example = document.querySelector('.text-muted');
  example.textContent = i18nInstance.t('example');
  const messagesElem = document.querySelector('.feedback');
  messagesElem.textContent = '';
  if (state.rssForm.validation === 'invalid') {
    input.classList.add('is-invalid');
    input.value = state.rssForm.value;
    messagesElem.textContent = state.rssForm.errors.map((err) => i18nInstance.t(err)).join('\n');
    console.log(messagesElem);
    input.blur();
  }
  if (state.rssForm.validation === 'valid') {
    input.classList.remove('is-invalid');
    messagesElem.textContent = '';
    input.value = '';
    input.focus();
  }
};
