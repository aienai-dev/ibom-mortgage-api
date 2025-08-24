const template = ({ user, token, content }) => {
  return content.snippet(user, token);
};

module.exports = template;
