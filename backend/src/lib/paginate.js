export function parsePagination(query, maxLimit = 100, defaultLimit = 50) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(maxLimit, Math.max(1, Number(query.limit) || defaultLimit));
  const skip = (page - 1) * limit;
  return { page, limit, skip, take: limit };
}

export function paginatedResponse(data, total, { page, limit }) {
  return { data, total, page, totalPages: Math.ceil(total / limit) };
}
