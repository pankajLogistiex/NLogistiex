export const getAuthorizedHeaders = (token) => {
  return {
    Authorization: token,
  };
};
