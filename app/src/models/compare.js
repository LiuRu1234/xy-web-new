import {post, get, getTokenLocalstorage, getQuery} from '../utils/utils';
import {message} from 'antd';

export default {
	namespace: 'compare',
	state: {
		fileInfoOne: null,
		fileInfoTwo: null,
		mutedId: 0
	},
	reducers: {
		saveFileInfoOne(state, { payload: fileInfoOne}) {
			return { ...state, fileInfoOne };
		},

		saveFileInfoTwo(state, { payload: fileInfoTwo}) {
			return { ...state, fileInfoTwo };
		},

		saveMutedId(state, { payload: mutedId}) {
			return { ...state, mutedId };
		},
	},
	effects: {
		*fetchFileInfo({ payload: {project_id, doc_id, type}}, { call, put, select, take }) {
			let json = yield call(get, '/file/info', {...getTokenLocalstorage(), doc_id, project_id});
			if (json.data.status == 1) {
				yield put({type, payload: json.data.data});
			} else {
				message.error(json.data.msg);
			}
			yield put({type: 'global/savePageLoading', payload: false});
		},

		*fetchFile({ payload: {}}, { call, put, select, take }) {
			let project_id = getQuery('p');
			let file_id = getQuery('f');
			let version_id = getQuery('v');
			yield put({type: 'fetchFileInfo', payload: {project_id, doc_id: file_id, type: 'saveFileInfoOne'}});
			yield put({type: 'fetchFileInfo', payload: {project_id, doc_id: version_id, type: 'saveFileInfoTwo'}});
			// yield put({type: 'project/saveDocActive', payload: file_id});
			yield put({type: 'project/saveProjectActive', payload: project_id});
			yield put({type: 'saveMutedId', payload: file_id});
		}

	},
	subscriptions: {
		setup({ dispatch, history } ) {
			return history.listen(({ pathname, search }, q) => {
				if (pathname === '/file_compare') {
					dispatch({ type: 'global/savePageLoading', payload: true });
					dispatch({ type: 'fetchFile', payload: {} });
				}
			});
		}
	},
};
