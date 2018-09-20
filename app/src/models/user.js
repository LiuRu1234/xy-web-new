import {post, get, getTokenLocalstorage, getQuery} from '../utils/utils';

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
			let json = yield call(get, '/user/info', getTokenLocalstorage());
			if (json.data.status == 1) {
				yield put({type: 'saveUser', payload: json.data.data});
				if (json.data.data.usage_state == -1 ){
					yield put({
						type: 'price/saveWarningModalShow',
						payload: true
					});
					yield put({
						type: 'price/saveIsWarning',
						payload: true
					});
				} 
			} else {
				if(process.env.NODE_ENV === 'production') {
					window.location = '//' + window.location.host;
				} else {
				// window.location = '/';
				}
				return;
			}
		},
	},
	subscriptions: {},
};
