import {post, get, getTokenLocalstorage, getQuery} from '@utils/utils';
import {message, notification, Icon} from 'antd';

export default {
	namespace: 'watermark',
	state: {
		watermarkList: [],
		watermarkTab: 1,
		waterparam: {
			watermark_id: 0,
			position: 'tl'
		},
		watermarkModalShow: false,
		watermarkActive: 0,
		waterTranscodeObj: null,
	},
	reducers: {
		saveWatermarkList(state, { payload: watermarkList}) {
			return { ...state, watermarkList };
		},

		saveWaterTranscodeObj(state, { payload: waterTranscodeObj}) {
			return { ...state, waterTranscodeObj };
		},

		saveWatermarkTab(state, { payload: watermarkTab}) {
			return { ...state, watermarkTab };
		},

		saveWaterparam(state, { payload: waterparam}) {
			return { ...state, waterparam };
		},

		saveWatermarkModalShow(state, { payload: watermarkModalShow}) {
			return { ...state, watermarkModalShow };
		},

		saveWatermarkActive(state, { payload: watermarkActive}) {
			return { ...state, watermarkActive };
		},

	},
	effects: {
		*getWatermark({ payload: {}}, { call, put, select, take }) {
			let project = yield select(state => state.project);

			const json = yield call(get, '/watermark/images', {...getTokenLocalstorage(), project_id: project.projectActive});

			if(json.data.status == 1) {
				yield put({type: 'saveWatermarkList', payload: json.data.data ? json.data.data : []});
			} else {
				message.error(json.data.msg);
			}
		},

		*getWatermarkSetting({ payload: {}}, { call, put, select, take }) {
			let project = yield select(state => state.project);
			let watermark = yield select(state => state.watermark);

			const json = yield call(get, '/watermark/set', {
				...getTokenLocalstorage(), 
				project_id: project.projectActive
			});

			if(json.data.status == 1) {
				if (json.data.data) {
					yield put({type: 'saveWaterparam', payload: {
						watermark_id: json.data.data.watermark_id,
						position: json.data.data.position
					}});
				}
			} else {
				message.error(json.data.msg);
			}
		},

		// 显示水印moal
		*showWaterModal({ payload: {}}, { call, put, select, take }) {
			yield put({type: 'saveWatermarkModalShow', payload: true});
			yield put({type: 'getWatermark', payload: {}});
			yield put({type: 'getWatermarkSetting', payload: {}});
		},

		//设置水印
		*setWater({ payload: {}}, { call, put, select, take }) {
			let project = yield select(state => state.project);
			let watermark = yield select(state => state.watermark);

			if (watermark.waterparam.watermark_id == 0) {
				message.warning('您还没选择水印图片');
				return;
			}
			
			const json = yield call(post, '/watermark/set', {
				...getTokenLocalstorage(), 
				...watermark.waterparam,
				project_id: project.projectActive
			});

			if(json.data.status == 1) {
				let currentProject = project.projectsList.filter(item => item.id == project.projectActive)[0];
				message.success(currentProject.name + '--水印设置成功');
				yield put({type: 'saveWatermarkModalShow', payload: false});
			} else {
				message.error(json.data.msg);
			}
		},

		//删除水印
		*deleteWatermark({ payload: watermark_id}, { call, put, select, take }) {
			let project = yield select(state => state.project);
			let watermark = yield select(state => state.watermark);
			const json = yield call(post, '/watermark/images', {
				...getTokenLocalstorage(), 
				watermark_id,
				_method: 'delete'
			});
			if (json.data.status == 1) {
				message.success('删除水印图片成功');
				
				//如果选择的被删除了...
				if (watermark_id == watermark.waterparam.watermark_id) {
					yield put({type: 'saveWaterparam', payload: {
						...watermark.waterparam,
						watermark_id: 0
					}});
				}

				yield put({type: 'getWatermark', payload: {}});
			} else {
				message.error(json.data.msg);
			}
		},

		//水印打印中
		*transcodeFileWater({ payload: doc_id}, { call, put, select, take }) {
			const json = yield call(get, '/cell/transcode1', {...getTokenLocalstorage(), doc_id});
			if (json.data.status == 1) {
				let waterTranscodeObj = json.data.data;
				yield put({type: 'saveWaterTranscodeObj', payload: waterTranscodeObj});
			} else {
				message.error(json.data.msg);
			}
		},


		//生成水印
		*setFileWater({ payload: {file_id, done}}, { call, put, select, take }) {
			let project = yield select(state => state.project);
			let watermark = yield select(state => state.watermark);

			if (watermark.waterparam.watermark_id == 0) {
				message.warning('您还没选择水印图片');
				return;
			}

			notification.open({
				message: '正在为打水印做准备...',
				icon: <Icon type="loading" style={{ color: '#108ee9' }} />,
				key: 'water-file',
				duration: 10
			});

			const json = yield call(post, '/watermark/set', {
				...getTokenLocalstorage(), 
				...watermark.waterparam,
				project_id: project.projectActive
			});

			if (json.data.status == 1) {
				const json1 = yield call(post, '/watermark/setVideo', {
					...getTokenLocalstorage(), 
					file_id,
					project_id: project.projectActive
				});

				notification.close('water-file');

				if (json1.data.status == 1) {
					// message.success('视频水印开始生成');
					done();
				} else {
					message.error(json1.data.msg);
				}
				
				
			} else {
				message.error(json.data.msg);
			}

		}
	},
	subscriptions: {},
};
