import * as yup from 'yup';

yup.setLocale({
  mixed: {
    default: 'field_invalid',
    notOneOf: 'duble_link',
    required: 'required_feild',
  },
  string: {
    url: 'incorrect_format',
  },
});

export default (value, feedList) => {
  const urlSchema = yup.string().url().required().notOneOf(
    feedList,
  );
  return urlSchema.validate(value, { abortEarly: false });
};
