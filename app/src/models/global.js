
// 消息以及其他全局数据
import {notification, message} from 'antd';
import { routerRedux } from 'dva/router';
import {openNotification, getTokenLocalstorage, get, post, getQuery} from '../utils/utils';
import {PRE_PAGE, NOTICE_TIME, EXP_PHONE, ALERT_NOTICE_TIME} from '../config/constants';

export default {
	namespace: 'global',
	state: {
		pageLoading: false,
		notices: [],
		helpShow: false,
		noticeModalShow: false,
		systemMessage: null,
		noreadCount: 0,
		downloadUrl: [],
		linkMoreShow: false,
		linkMoreGlobalData: null,
		isAllowLinkMoreShow: true,
		phoneAuthModalShow: false
	},
	reducers: {
		savePageLoading(state, { payload: pageLoading}) {
			return { ...state, pageLoading };
		},

		savePhoneAuthModalShow(state, { payload: phoneAuthModalShow}) {
			return { ...state, phoneAuthModalShow };
		},

		saveIsAllowLinkMoreShow(state, { payload: isAllowLinkMoreShow}) {
			return { ...state, isAllowLinkMoreShow };
		},

		saveLinkMoreGlobalData(state, { payload: linkMoreGlobalData}) {
			return { ...state, linkMoreGlobalData };
		},

		saveLinkMoreShow(state, { payload: linkMoreShow}) {
			return { ...state, linkMoreShow };
		},

		saveDownloadUrl(state, { payload: downloadUrl}) {
			return { ...state, downloadUrl };
		},

		saveNoreadCount(state, { payload: noreadCount}) {
			return { ...state, noreadCount };
		},

		saveSystemMessage(state, { payload: systemMessage}) {
			return { ...state, systemMessage };
		},

		saveNoticeModalShow(state, { payload: noticeModalShow}) {
			return { ...state, noticeModalShow };
		},

		saveHelpShow(state, { payload: helpShow}) {
			return { ...state, helpShow };
		},

		saveNotices(state, { payload: notices}) {
			return { ...state, notices };
		},
	},
	effects: {
		//获取消息
		*fetchNotice({ payload: {noticeClick, isAjax, agreeJoin, refuseJoin}}, { call, put, select, take }) {
			const json = yield call(get, '/new/notice', getTokenLocalstorage());
			if (json.data.status == 1) {
				let list = json.data.data.list;
				// 增加消息是否已经弹框属性
				let notices = yield select(state => state.global.notices);
				list.forEach((item, k) => {
					let notice = notices.filter(it => item.id == it.id);
					if (notice.length > 0) {
						item.alert = notice[0].alert;
					} else {
						item.alert = 0;
					}					
				});
				yield put({type: 'saveNotices', payload: list});
				yield put({type: 'cateHandleMessage', payload: {noticeClick, isAjax, agreeJoin, refuseJoin}});
			} else {
				message.error(json.data.msg);

				if (process.env.NODE_ENV === 'production') {
					setTimeout(() => {
						if (json.data.status == -2) {
							window.location.href = '//' + window.location.host;
						}
					}, 1000);
				}
			}
		},

		*cateHandleMessage({ payload: {noticeClick, isAjax, agreeJoin, refuseJoin}}, { call, put, select, take }) {
			let time = parseInt(localStorage.getItem(NOTICE_TIME));
			let notices = yield select(state => state.global.notices);
			let userInfo = yield select(state => state.user.userInfo);
			// 将邀请的已同意的过滤掉
			notices = notices.filter(item => (['link_join', 'invite_join'].indexOf(item.type) > -1 && item.is_agree != 1) || ['link_join', 'invite_join'].indexOf(item.type) == -1 );
			let newNotice = notices.filter(item => 	item.created_at > time && item.alert == 0 ); //&& item.user_id != userInfo.user_id
			// let newNotice2 = notices.filter(item => item.created_at > time && ['join', 'deleteprojectuser'].indexOf(item.type) > -1 && item.alert == 0);
			// newNotice = [...newNotice, ...newNotice2];
			
			if (newNotice.length > 0) {
				notification.config({
					duration: 5
				});
				notices = JSON.parse(JSON.stringify(notices));
				
				for(let i = 0; i < newNotice.length; i++) {
					let notice = JSON.stringify(newNotice[i]);

					// 将该消息设为已经弹过框
					let l = notices.length;
					for(let k = 0; k < l; k++) {
						if(newNotice[i].id == notices[k].id) {
							notices[k].alert = 1;
						}
					}
					yield put({type: 'saveNotices', payload: notices});

					let iconImg = newNotice[i].type == 'system' ?
					<span className="notification-img system">
						<img src={require('../assets/laba.svg')}>
						</img>
					</span> :
					<img src={newNotice[i].avatar} className="notification-img"></img>;

					let icon = newNotice[i].avatar != '' ? 
					iconImg :
					<span className="notification-icon-span">{newNotice[i].realname[0]}</span>;

					let alertNT = localStorage.getItem(ALERT_NOTICE_TIME);  //弹框只弹一次判断

					if (!alertNT || parseInt(alertNT) < newNotice[i].created_at) {

						if (newNotice[i].type == 'invite_join' || newNotice[i].type == 'link_join' ) {
						
							notification.open({
								icon,
								message: 
								<div className="notice-content clearfix" style={{cursor: 'pointer'}} data-notice={notice}>
									<div className="notice-content-left">{newNotice[i].content}</div>
									<div className="notice-content-right">
										<a href="javascript:;" onClick={() => agreeJoin(newNotice[i], () => {
											notification.close(newNotice[i].id);
										})}>同意</a>
										{newNotice[i].type == 'invite_join' ? 
										<a href="javascript:;" onClick={() => notification.close(newNotice[i].id)}>忽略</a>:
										<a href="javascript:;" onClick={() => refuseJoin(newNotice[i], () => {
											notification.close(newNotice[i].id);
										})}>拒绝</a>
										}
									</div>
								</div>,
								key: newNotice[i].id
							});

						
						} else {
							notification.open({
								icon,
								message: <div className="notice-content" style={{cursor: 'pointer'}} data-notice={notice}>{newNotice[i].content}</div>,
								key: newNotice[i].id
							});
						}

					}

				}

				let currentAlertTime = new Date().getTime();
				localStorage.setItem(ALERT_NOTICE_TIME, parseInt(currentAlertTime / 1000));
			
				let notices2 = yield select(state => state.global.notices);
				let noreadNotice = notices2.filter(item => item.created_at > time); // && item.user_id != userInfo.user_id
				yield put({type: 'saveNoreadCount', payload: noreadNotice.length});

				noticeClick();

				yield put({type: 'noticeAction', payload: {newNotice, isAjax}});

				// setTimeout(() => {
				// 	localStorage.setItem(NOTICE_TIME, newNotice[0].created_at);
				// }, 100);

			}
		},

		*noticeAction({ payload: {newNotice, isAjax}}, { call, put, select, take }) {
			if(window.location.href.indexOf('/project?') > -1 && isAjax) {
				// 成员变化
				yield put({type: 'noticeMember', payload: newNotice});
				// 文件变化
				yield put({type: 'noticeFileProject', payload: newNotice});
			}
			if(window.location.href.indexOf('/file?') > -1 && isAjax) {
				// 版本变化
				yield put({type: 'noticeFileCommentProject', payload: newNotice});
				// 状态变化
				yield put({type: 'noticeFileVersionProject', payload: newNotice});
				// 评论变化
				yield put({type: 'noticeFileStatusProject', payload: newNotice});
			}
		},

		//消息全局轮询处理 start
		// 创建/删除/退出项目消息处理
		*noticeCreateProject({ payload: {}}, { call, put, select, take }) {
		
		},

		// 项目成员添加/删除消息处理
		*noticeMember({ payload: newNotice}, { call, put, select, take }) {
			let memberArgs = newNotice.filter(item => ['join', 'deleteprojectuser'].indexOf(item.type) > -1);
			if(memberArgs.length == 0) return;
			let project_id = yield select(state => state.project.projectActive);
			let currentNotice = memberArgs.filter(item => item.project_id == project_id);
			if (currentNotice.length > 0) {
				yield put({type: 'project/fetchMember', payload: {project_id}});
			}
		},

		// 上传/删除文件，创建文件夹，删除版本消息处理, 修改状态消息处理, 添加版本消息处理
		*noticeFileProject({ payload: newNotice}, { call, put, select, take }) {
			let fileNoticeArgs = newNotice.filter(item => [
				'upload', 
				'changecover', 
				'merge', 
				'deletedoc',
				'deleteversion',
				'created_doc', 
				'change'
			].indexOf(item.type) > -1);
			if(fileNoticeArgs.length == 0) return;
			let project_id = yield select(state => state.project.projectActive);
			let currentNotice = fileNoticeArgs.filter(item => item.project_id == project_id);
			let doc_id = yield select(state => state.project.docActive);
			if (currentNotice.length > 0) {
				yield put({type: 'project/fetchFiles', payload: {project_id, doc_id}});
			}
		},

		// 评论/删除评论消息处理
		*noticeFileCommentProject({ payload: newNotice}, { call, put, select, take }) {
			let commentNoticeArgs = newNotice.filter(item => [
				'comment',
				'deletecomment'
			].indexOf(item.type) > -1);
			if(commentNoticeArgs.length == 0) return;
			let project_id = yield select(state => state.project.projectActive);
			let fileInfo = yield select(state => state.file.fileInfo);
			let userInfo = yield select(state => state.user.userInfo);
			let currentCommentNotice = commentNoticeArgs.filter(item => item.file_id == fileInfo.id && item.user_id != userInfo.user_id);
			if (currentCommentNotice.length == 0) return;
			let comment = yield select(state => state.comment);
			let param = {
				...getTokenLocalstorage(),
				doc_id: fileInfo.id,
				project_id,
				page: 1,
				sort: 1,
				show_completed: 0,
				query: '',
				pre_page: PRE_PAGE
			};
			let json = yield call(get, '/comment', param);
			if (json.data.status == 1) {
				let time = parseInt(localStorage.getItem(NOTICE_TIME));
				let newComment = json.data.data.list.filter((item) => {return  item.created_at > time;});
				let comments = [...newComment, ...comment.comments];
				yield put({ type: 'comment/saveComments', payload: comments });
			} else {
				message.error(json.data.msg);
			}
		},

		// 添加版本消息处理
		*noticeFileVersionProject({ payload: newNotice}, { call, put, select, take }) {
			let versionNoticeArgs = newNotice.filter(item => [
				'merge',
				'deleteversion'
			].indexOf(item.type) > -1);
			if(versionNoticeArgs.length == 0) return;
			let project_id = yield select(state => state.project.projectActive);
			let fileInfo = yield select(state => state.file.fileInfo);
			let currentVersionNotice = versionNoticeArgs.filter(item => item.file_id == fileInfo.id);
			if (currentVersionNotice.length == 0) return;
			let json = yield call(get, '/file/info', {...getTokenLocalstorage(), doc_id: fileInfo.id, project_id});
			if (json.data.status == 1) {
				fileInfo.versions = json.data.data.versions;
				yield put({type: 'file/saveFileInfo', payload: fileInfo});
			} else {
				message.error(json.data.msg);
			}
		},

		// 修改状态消息处理
		*noticeFileStatusProject({ payload: newNotice}, { call, put, select, take }) {
			let statusNoticeArgs = newNotice.filter(item => [
				'change',
			].indexOf(item.type) > -1);
			if(statusNoticeArgs.length == 0) return;
			let project_id = yield select(state => state.project.projectActive);
			let fileInfo = yield select(state => state.file.fileInfo);
			let currentStatusNotice = statusNoticeArgs.filter(item => item.file_id == fileInfo.id);
			if (currentStatusNotice.length == 0) return;
			let json = yield call(get, '/file/info', {...getTokenLocalstorage(), doc_id: fileInfo.id, project_id});
			if (json.data.status == 1) {
				fileInfo.review = json.data.data.review;
				yield put({type: 'file/saveFileInfo', payload: fileInfo});
				yield put({type: 'file/saveReview', payload: json.data.data.review});
			} else {
				message.error(json.data.msg);
			}
		},

		//系统消息处理
		*noticeSystemProject({ payload: {}}, { call, put, select, take }) {

		},
		//消息全局轮询处理 end

		//全局消息点击触发处理 start
		*toNotice({ payload: notice}, { call, put, select, take }) {
			const projectType = [
				'join',
				'deleteprojectuser',
				'upload',
				'deletedoc',
				'deleteversion',
				'created_doc',
				];
			const fileType = [
				'changecover',
				'merge',
				'deleteversion',
				'comment',
				'change',
				'deletecomment'
				];

			if (projectType.indexOf(notice.type) > -1) {
				yield put(routerRedux.push({
					pathname: '/project',
					query: { d: 0, p: notice.project_id},
				}));
			}

			if (fileType.indexOf(notice.type) > -1) {
				yield put(routerRedux.push({
					pathname: '/file',
					query: { f: notice.file_id, p: notice.project_id},
				}));
			}


			if (notice.type == 'system') {
				yield put({type: 'saveNoticeModalShow', payload: true});

				const json = yield call(get, '/system/detail', {...getTokenLocalstorage(), content_id: notice.content_id});
				if (json.data.status == 1) {
					yield put({type: 'saveSystemMessage', payload: json.data.data});
				} else {
					message.error(json.data.msg);
				}
			}
		},
		
		// //文件操作消息点击
		// *noticeClickCommentStatusVersion({ payload: {}}, { call, put, select, take }) {
			
		// },

		// // 创建项目
		// *noticeClickProject({ payload: {}}, { call, put, select, take }) {

		// },

		// // 项目文件添加/删除
		// *noticeClickProjectFile({ payload: {}}, { call, put, select, take }) {

		// },

		// // 项目成员添加/删除
		// *noticeClickMember({ payload: {}}, { call, put, select, take }) {

		// },

		//文件下载
		*getDownload({ payload: doc_id}, { call, put, select, take }) {
			let url, param = {};
			let code = yield select(state => state.file.code);

			if (code == '') {
				url = '/new/download';
				param = {...getTokenLocalstorage(), doc_id};
			} else {
				url = '/share/download';
				param = {code, doc_id};
			}

			const json = yield call(get, url, param);

			if (json.data.status == 1) {
				yield put({type: 'saveDownloadUrl', payload: json.data.data});
			} else {
				message.error(json.data.msg);
			}
		},

		// 发送验证码
		*sendCode({ payload: {phone, done}}, { call, put, select, take }) {
			if (!EXP_PHONE.test(phone)) {
				message.error('手机号码格式不正确');
				return;
			}

			let userInfo = yield select(state => state.user.userInfo);

			const json = yield call(post, '/bind/sms', {
				...getTokenLocalstorage(),
				phone
			});
			
			if (json.data.status == 1) {
				message.success('验证码发送成功');
			} else {
				message.error('验证码发送失败');
			}

			done();
		},


		// 绑定号码
		*saveUserPhone({ payload: {phone, auth_code, replace, done}}, { call, put, select }) {
			const json = yield call(post, '/bind/phone', {
				...getTokenLocalstorage(),
				phone,
				auth_code,
				replace
			});

			if (json.data.status == 2) {
				done(json.data.msg);
				return;
			}

			if (json.data.status == 1) {
				message.success('手机绑定成功, 即将进入项目');
				done();
				setTimeout(() => {
					window.location.reload();
				}, 2000);
			} else {
				message.error(json.data.msg);
			}
		}
			
	},
	subscriptions: {
		setup({ dispatch, history } ) {
			if(getQuery('r')) return;

			let noticeTime = localStorage.getItem(NOTICE_TIME);
			if (!noticeTime || noticeTime == '') {
				// let nt = new Date().getTime() / 1000 - (24 * 60 * 7);
				let nt = new Date().getTime() / 1000;
				localStorage.setItem(NOTICE_TIME, nt);
			}
			
			//消息触发点击效果
			// let noticeClick = () => {
			// 	let noticeContent = document.body.querySelector('.notice-content');
			// 	noticeContent && noticeContent.addEventListener('click', (e) => {
			// 		let newNotice = JSON.parse(e.target.dataset.notice);
			// 		notification.close(newNotice.id);
			// 		dispatch({
			// 			type: 'toNotice',
			// 			payload: newNotice
			// 		});
			// 	});
			// };
			
		
			// dispatch({ type: 'fetchNotice', payload: {noticeClick, isAjax: false} });
			// setInterval(() => {
			// 	dispatch({ type: 'fetchNotice', payload: {noticeClick, isAjax: true} });
			// }, 5000);
		}
		
	},
};
