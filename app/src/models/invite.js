import { post, get, getTokenLocalstorage, getQuery, sortBy, search } from '@utils/utils';
import { message } from 'antd';
import { routerRedux } from 'dva/router';

export default {
	namespace: 'invite',
	state: {
		inviteCode: '',
		inviteInfo: null
	},
	reducers: {
		saveInviteCode(state, { payload: inviteCode}) {
			return { ...state, inviteCode };
		},

		saveInviteInfo(state, { payload: inviteInfo}) {
			return { ...state, inviteInfo };
		},
	},
	effects: {
		//获取链接信息
		*fetchInvite({ payload: {}}, { call, put, select }) {
			const project = yield select(state => state.project);
			const json = yield call(get, '/link/info', {
				...getTokenLocalstorage(),
				invite_code: getQuery('r'),
			});

			if(json.data.status == 1) {
				yield put({type: 'saveInviteInfo', payload: json.data.data});
			} else {
				message.error(json.data.msg);
			}
		},

		//获取邀请链接
		*getInviteCode({ payload: {}}, { call, put, select }) {
			const project = yield select(state => state.project);
			const json = yield call(post, '/invite/link', {
				...getTokenLocalstorage(),
				project_id: project.projectActive,
			});

			if(json.data.status == 1) {
				yield put({type: 'saveInviteCode', payload: json.data.data.invite_code});
			} else {
				message.error(json.data.msg);
			}
		},

		//加入邀请
		*joinInvite ({ payload: {doc_id, doc_name}}, { call, put, select }) {
			const json = yield call(post, '/link/join', {
				...getTokenLocalstorage(),
				invite_code: getQuery('r'),
			});

			if(json.data.status == 1) {
				message.success('操作成功，需要通过邀请人审批。');
			} else {
				message.error(json.data.msg);
			}
		},

		//审批
		*auditInvite ({ payload: {allow_status, notice_id}}, { call, put, select }) {
			const json = yield call(post, '/allow/join', {
				...getTokenLocalstorage(),
				allow_status,
				notice_id
			});

			if(json.data.status == 1) {
				if(allow_status == 1) {
					message.success('已同意加入');
				} else {
					message.success('已拒绝加入');
				}
			} else {
				message.error(json.data.msg);
			}

		}
	},
	subscriptions: {},
};
