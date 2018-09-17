import {post, get, getTokenLocalstorage} from '../utils/utils';
import {message} from 'antd';

export default {
	namespace: 'application',
	state: {
		xcxShow: false,
		prModalShow: false,
	},
	reducers: {
		saveXcxShow(state, { payload: xcxShow}) {
			return {...state, xcxShow};
		},

		savePrModalShow(state, { payload: prModalShow}) {
			return {...state, prModalShow};
		},
	},
	effects: {
		*applyApp({ payload: param }, { call, put, select, take }) {
			const json = yield call(post, '/plugapply', {...param, ...getTokenLocalstorage()});

			if (json.data.status == 1) {
				message.success(json.data.msg);
				yield put({type: 'savePrModalShow', payload: false});
			} else {
				message.error(json.data.msg);
			}
		}
	},
	subscriptions: {},
};
