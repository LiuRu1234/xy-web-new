import { routerRedux } from 'dva/router';
import {getUser, create, fetch} from '../services/user';

export default {
  namespace: 'global',
  state: {
    text: 'hello umi+dva',
    login: false,
    user: []
  },
  reducers: {
    saveUser(state, {payload: user}) {
      return {...state, user}
    }
  },
  effects: {
    *getUser({payload}, { call, put, select }) {
      const user = yield call(fetch);
      console.log(user)
      yield put({
        type: 'saveUser',
        payload: user.data
      })
    }
  },
  
};
