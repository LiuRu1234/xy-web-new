import { PAGE_SIZE } from '../constants';
import request from '../utils/request';

export function fetch() {
  return request(`/api/users?_page=1&_limit=3`);
}

export function remove(id) {
  return request(`/api/users/${id}`, {
    method: 'DELETE',
  });
}

export function patch(id, values) {
  return request(`/api/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(values),
  });
}

export function create(values) {
  return request('/api/users', {
    method: 'get',
    body: JSON.stringify({
      _page: 1,
      _limit: 3
    }),
  });
}

export function getUser() {
    return request(`/api/user`, {
        method: 'get',
    });
}
