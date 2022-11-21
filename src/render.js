const input = document.getElementById('url-input');
export default (state) => {
  if (state.rssForm.validation === 'invalid') {
    input.classList.add('is-invalid');
    input.value = state.rssForm.value;
    input.blur();
  }
  if (state.rssForm.validation === 'valid') {
    input.classList.remove('is-invalid');
    input.value = '';
    input.focus();
  }
};
