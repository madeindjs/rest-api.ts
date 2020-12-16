// src/services/paginate.service.ts
import {Request} from 'express';
import {Serializer} from 'jsonapi-serializer';
import {SelectQueryBuilder} from 'typeorm';

const PER_PAGE = 20;

export async function paginate<T>(
  queryBuilder: SelectQueryBuilder<T>,
  serializer: Serializer,
  {query, baseUrl}: Request,
) {
  const page = Number(query.page ?? 1);

  const count = await queryBuilder.getCount();
  const totalPage = Math.floor(count / PER_PAGE);
  const prevPage = page === 1 ? 1 : page - 1;
  const nextPage = page === totalPage ? page : page + 1;
  const offset = page > 1 ? (page - 1) * PER_PAGE : 0;

  const data = await queryBuilder
    .clone()
    .offset(offset)
    .limit(PER_PAGE)
    .getMany();

  const getUrlForPage = page =>
    `${baseUrl}?${new URLSearchParams({...query, page})}`;

  const response = serializer.serialize(data);
  response.links = {
    first: getUrlForPage(1),
    last: getUrlForPage(totalPage),
    prev: getUrlForPage(prevPage),
    next: getUrlForPage(nextPage),
  };

  return response;
}
