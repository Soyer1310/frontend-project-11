import * as yup from 'yup';

export default (value, feedList) => {
  const urlSchema = yup.string().url('Ссылка должна быть валидным URL').required().notOneOf(
    feedList,
    'Данный фид уже добавлен в список',
  );
  return urlSchema.validate(value, { abortEarly: false });
};
