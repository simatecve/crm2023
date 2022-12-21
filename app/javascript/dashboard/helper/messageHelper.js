export const findReplaceMessageVariables = ({ message, replacementList }) => {
  const regex = /{{(.*?)}}/g;
  return message.replace(regex, (match, replace) => {
    return replacementList[replace.trim()]
      ? replacementList[replace.trim().toLowerCase()]
      : '';
  });
};
