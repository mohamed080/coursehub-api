const getPagination = (query) => {
  const page = Math.max(parseInt(query.page) || 1, 1);

  const requestedLimit = parseInt(query.limit) || 10;

  const limit = Math.min(Math.max(requestedLimit, 1), 100);

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

module.exports = getPagination;
