
export default {
  namespace: 'user',
  state: {
    userInfo: {}    //用户信息
  },
  reducers: {
    saveUser(state, { payload: userInfo}) {
			return { ...state, userInfo };
		},
  },
  effects: {
    *fetchUserInfo({payload}, { call, put, select }) {
      // yield call(post, '/userlist1', payload);
    },
  },
  subscriptions: {},
};
