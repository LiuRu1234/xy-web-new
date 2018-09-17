import {LOGIN_ID, TOKEN, EXP_EMAIL} from '../config/constants';
import { routerRedux } from 'dva/router';
import {post, get, getTokenLocalstorage, getQuery, sortBy, search} from '../utils/utils';
import {message, notification, Icon} from 'antd';


export default {
	namespace: 'a',
	state: {
        userInfo: {}
    },
    
    reducers: {
        saveUser(state, { payload: userInfo}) {
			return { ...state, userInfo };
		},
    },

	effects:{
        *isLogined({ payload: {} }, { call, put, select, take }) {
            const loginId = localStorage.getItem(LOGIN_ID);
			const token = localStorage.getItem(TOKEN);
            let json = yield call(get, '/user/info', {login_id: loginId, token});
            yield put({
                type: 'saveUser',
                payload: json.data.data
            });
        }
    },

	subscriptions: {
		setup({ dispatch, history } ) {
			return history.listen(({ pathname, search }, q) => {
				if (pathname === '/a') {
					dispatch({ type: 'isLogined', payload: {} });
				}
			});
		}
	},
};
