import {LOGIN_ID, TOKEN} from '@config/constants';
import {post, get, getTokenLocalstorage, getQuery, saveFid, getFid, getPidDid, getUser} from '@utils/utils';
import {message} from 'antd';
import { routerRedux } from 'dva/router';

export default {
	namespace: 'file',
	
	state: {
		downloadShow: false,	//下载modal是否显示
		fileInfo: null,    		//当前文件信息
		uploadInput3: null,		//版本上传input
		isFilesShare: false,	//是否分享的状态
		shareFileList: [],		//分享文件列表
		shareDownload: 1,		//分享是否允许下载
		shareReview: 1,			//分享是否允许审阅
		shareShowAllVersion: 1,   	//是否显示所有版本
		sharePass: false,		//分享密码是否通过
		firstSharePass: true,	//第一次进入分享判断是否弹密码错误
		review: 0,				//审阅状态
		containerShow: false,  //用来跳转显示触发
		code: '',
		codeIsLike: false,
		downloadFile: null
	},

	reducers: {
		init(state, { payload: {}}) {
			return { ...state, ...{
				downloadShow: false,	//下载modal是否显示
				// fileInfo: null,    		//当前文件信息
				uploadInput3: null,		//版本上传input
				// shareDownload: 1,		//分享是否允许下载
				// shareReview: 1,			//分享是否允许审阅
				// shareShowAllVersion: 1,   	//是否显示所有版本
				firstSharePass: true,	//第一次进入分享判断是否弹密码错误
				review: 0,				//审阅状态
				containerShow: false,  //用来跳转显示触发,
			}};
		},

		saveDownloadShow(state, { payload: downloadShow}) {
			return { ...state, downloadShow };
		},

		saveDownloadFile(state, { payload: downloadFile}) {
			return { ...state, downloadFile };
		},

		saveCodeIsLike(state, { payload: codeIsLike}) {
			return { ...state, codeIsLike };
		},

		saveCode(state, { payload: code}) {
			return { ...state, code };
		},

		saveContainerShow(state, { payload: containerShow}) {
			return { ...state, containerShow };
		},

		saveFileInfo(state, { payload: fileInfo}) {
			return { ...state, fileInfo };
		},

		saveUploadInput3(state, { payload: uploadInput3}) {
			return { ...state, uploadInput3 };
		},

		saveIsFilesShare(state, { payload: isFilesShare}) {
			return { ...state, isFilesShare };
		},

		saveShareFileList(state, { payload: shareFileList}) {
			return { ...state, shareFileList };
		},

		saveShareDownload(state, { payload: shareDownload}) {
			return { ...state, shareDownload };
		},

		saveShareReview(state, { payload: shareReview}) {
			return { ...state, shareReview };
		},

		saveShareShowAllVersion(state, { payload: shareShowAllVersion}) {
			return { ...state, shareShowAllVersion };
		},

		saveSharePass(state, { payload: sharePass}) {
			return { ...state, sharePass };
		},

		saveFirstSharePass(state, { payload: firstSharePass}) {
			return { ...state, firstSharePass };
		},

		saveReview(state, { payload: review}) {
			return { ...state, review };
		},
	},

	effects: {
		*isLogined({ payload: {}}, { call, put, select, take }) {
			let code = getQuery('r');
			let user = yield select(state => state.user);
			
			if (!code) {
				if (JSON.stringify(user.userInfo) == '{}') {
					let json = yield call(get, '/user/info', getTokenLocalstorage());
					if (json.data.status == 1) {
						yield put({type: 'user/saveUser', payload: json.data.data});	
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
						if (json.data.data.phone == '') {
							yield put({type: 'global/savePhoneAuthModalShow', payload: true});
							return;
						}		
					} else {
						// window.location = 'https://www.uxinyue.com';
						if(process.env.NODE_ENV === 'production') {
							window.location = '//' + window.location.host;
						} else {
							// window.location = '/';
						}
						return;
					}
				}
			} else {
				yield put({type: 'user/saveUser', payload: {...user.userInfo, ...getUser()}});
			}
		
			if (code) {
				yield put({type: 'saveIsFilesShare', payload: true});
				yield put({type: 'fetchShareList', payload: {code, password: ''}});
			} else {
				let file_id = getFid();
				if(!file_id) {
					yield put(routerRedux.push({
						pathname: '/project',
					}));
					return;
				}
				let {project_id, doc_id} = getPidDid();
				yield put({type: 'fetchFileInfo', payload:{project_id, doc_id: file_id}});
				yield put({type: 'comment/fetchComments', payload: {}});
				yield put({type: 'project/fetchProjects2', payload: {}});
			}
		},

		*fetchFileInfo({ payload: {project_id, doc_id}}, { call, put, select, take }) {
			let json = yield call(get, '/file/info', {...getTokenLocalstorage(), doc_id, project_id});
			
			if (json.data.status == 1) {
				yield put({type: 'saveFileInfo', payload: json.data.data});
				yield put({type: 'saveReview', payload: json.data.data.review});
				yield put({type: 'project/saveDocActive', payload: json.data.data.top_id});
				yield put({type: 'project/saveProjectActive', payload: json.data.data.project_id});
				yield put({type: 'playerControl/saveCurrentSY', payload: json.data.data.is_watermark});

				yield put({
					type: 'playerControl/saveFilePlayerTime',
					payload: json.data.data.time
				});   
			} else {
				message.error(json.data.msg);
			}
			yield put({type: 'saveContainerShow', payload: true});
		},

		*fetchShareFileInfo({ payload: file}, { call, put, select, take }) {
			let json = yield call(get, '/sharefileinfo', {doc_id: file.id, code: getQuery('r')});
			if (json.data.status == 1) {
				yield put({type: 'saveFileInfo', payload: json.data.data});
				yield put({type: 'saveReview', payload: json.data.data.review});
				yield put({type: 'project/saveDocActive', payload: json.data.data.top_id});
				yield put({type: 'project/saveProjectActive', payload: json.data.data.project_id});
				yield put({type: 'playerControl/saveCurrentSY', payload: json.data.data.is_watermark});
				yield put({
					type: 'playerControl/saveFilePlayerTime',
					payload: json.data.data.time
				});   
			} else {
				message.error(json.data.msg);
			}
			yield put({type: 'saveContainerShow', payload: true});
			yield put({type: 'comment/saveCommentProp', payload: {	
				commentPage: 1,
				commentSort: 1,
				commentShowCompleted: 0,
				commentQuery: ''
			}});

			yield put({type: 'comment/fetchShareComments', payload: file});
		},

		//事件监听
		*listenEvent({ payload: file}, { call, put, select, take }) {
			let playerControl = yield select(state => state.playerControl);
			// let project = yield select(state => state.project);
			let timeupdate = function *() {
		
				yield put({
					type: 'playerControl/saveProgressTime',
					payload: e.target.currentTime,
				});
				let progress = e.target.currentTime / e.target.duration;
				let width = progress * progressBody.getBoundingClientRect().width;

				yield put({
					type: 'playerControl/saveProgressWidth',
					payload: width,
				});
				
				yield put({
					type: 'playerControl/saveProgress',
					payload: progress,
				});
			};

			playerControl.filePlayer.addEventListener("timeupdate", (e) => {
				timeupdate();
			});

			let ended = function *() {
				yield put({
					type: 'playerControl/playerPlayOrPause',
					payload: {},
				});
			};
	
			playerControl.filePlayer.addEventListener("ended", (e) => {
				ended();
			});
		},

		*fetchShareList({ payload: {code, password}}, { call, put, select, take }) {
			let json = yield call(get, '/sharefilelist', {code, password});
			if (json.data.status == 1) {
				let list = json.data.data.list.filter(item => item.doc_status == 1);
				if (list.length == 0) {
					message.error('该分享已经不存在文件');
					return;
				}
				yield put({type: 'saveShareFileList', payload: list});
				yield put({type: 'saveShareDownload', payload: json.data.data.download});
				yield put({type: 'saveShareReview', payload: json.data.data.review});
				yield put({type: 'saveShareShowAllVersion', payload: json.data.data.show_all_version});
				yield put({type: 'saveSharePass', payload: true});
				yield put({type: 'saveCode', payload: getQuery('r')});
				let file = yield select(state => state.file);
				yield put({type: 'fetchShareFileInfo', payload: file.shareFileList[0]});
				yield put({type: 'link/saveCreatedLinkModalData', payload: json.data.data});
			} else {
				let file = yield select(state => state.file);
				if (file.firstSharePass) {
					yield put({type: 'saveFirstSharePass', payload: false});
				} else {
					message.error(json.data.msg);
				}
			}
		},

		*changeFileStatus({ payload: review}, { call, put, select, take }) {
			let file = yield select(state => state.file);
			let project = yield select(state => state.project);

			let json = yield call(post, '/file/review', {
				...getTokenLocalstorage(),
				review,
				doc_id: file.fileInfo.id,
				project_id: project.projectActive,
				_method: 'put'
			});

			if (json.data.status == 1) {
				message.success('状态修改成功');
				yield put({type: 'saveReview', payload: review});
			} else {
				message.error(json.data.msg);
			}

		},

		*setCoverImg({ payload: {}}, { call, put, select, take }) {
			let playerControl = yield select(state => state.playerControl);
			let file = yield select(state => state.file);
			let json = yield call(post, '/file/coverimg', {
				...getTokenLocalstorage(),
				timestamp: playerControl.progressTime * 1000,
				mvs_id: file.fileInfo.mvs_id,
				_method: 'put'
			});

			if (json.data.status == 1) {
				message.success('修改封面成功');
			} else {
				message.error(json.data.msg);
			}
		},

		// 收藏操作
		*getLike({ payload: collect_status}, { call, put, select, take }) {
			let file = yield select(state => state.file);
			let json = yield call(post, '/collect/link', {
				...getTokenLocalstorage(),
				collect_status,
				share_code: file.code,
			});

			if (json.data.status == 1) {
				yield put({type: 'saveCodeIsLike', payload: collect_status});
			} else {
				message.error('请先登录再收藏');
			}
		},

		// 下载文件
		*download({ payload: url}, { call, put, select, take }) {
			let json = yield call(post, '/collect/link', {
				...getTokenLocalstorage(),
				
			});

			if (json.data.status == 1) {
				// yield put({type: 'saveCodeIsLike', payload: collect_status});
			} else {
				message.waring('请先登录再收藏');
			}
		},

		//请求下载地址
		*getDownload({ payload: doc_id}, { call, put, select, take }) {
			let json = yield call(get, '/downloadAliyunDoc', {
				...getTokenLocalstorage(),
				doc_id
			});

			// if (json.data.status == 1) {
			// 	// yield put({type: 'saveCodeIsLike', payload: collect_status});
			// } else {
			// 	message.waring('请先登录再收藏');
			// }
		},

		//复制文件到某个项目
		*copyFile2Project({ payload: {source_project_id, to_project_id, doc_id}}, { call, put, select, take }) {

			let json = yield call(post, '/move/doc', {
				...getTokenLocalstorage(),
				source_project_id,
				to_project_id,
				doc_id
			});

			if (json.data.status == 1) {
				message.success('复制文件成功');
				yield put({
					type: 'project/saveSaveFileModalShow',
					payload: false	 
				});
			} else {
				message.waring(json.data.msg);
			}
		}
		
	},
	subscriptions: {
		setup({ dispatch, history } ) {
			return history.listen(({ pathname, search }, q) => {
				if (pathname === '/file') {
					dispatch({ type: 'isLogined', payload: {} });
				}
			});
		}
	},
};
