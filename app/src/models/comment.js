import {LOGIN_ID, TOKEN} from '@config/constants';
import { routerRedux } from 'dva/router';
import {post, get, getTokenLocalstorage, getQuery, getFid, getPidDid} from '@utils/utils';
import {PRE_PAGE, COMMENT_RECORD_PREFIXER} from '@config/constants';
import {message} from 'antd';

export default {
	namespace: 'comment',
	state: {
		commenTabIndex: 0,				//评论区tab切换
		commentClosed: false,			//是否收起评论区
		callbackBlockShow: false,		//是否显示回复区
		comments: [],					//评论列表
		commentsTotal: 0,       //评论总数量
		commentPage: 1,					//评论页码
		commentSort: 1,					//评论排序
		commentShowCompleted: 0,		//评论是否已完成
		commentQuery: '',				//评论搜索关键字
		// code: '',						//分享code
		callbackComment: null,			//当前回复的评论
		showAllCallback: false, 		//判断是否少于5条
		callbackText: '',				//当前回复的评论内容
		isCallbacking: false,			//回复发送中
		isCommentPageAll: false,			//是否已经全部加载
		isPageCommentLoading: false,		//评论分页加载中
		fileInfoEditing: false,				//文件信息编辑中
		fileDesContent: '',
		//评论录音相关state
		commentPlayId: 0,
        commentPlayTimer: 0,
        commentPlaying: false
	},
	reducers: {
		saveCommentTabIndex(state, { payload: commenTabIndex}) {
			return { ...state, commenTabIndex };
		},

		saveCommentPlayId(state, { payload: commentPlayId}) {
			return { ...state, commentPlayId };
		},

		saveCommentPlayTimer(state, { payload: commentPlayTimer}) {
			return { ...state, commentPlayTimer };
		},

		saveCommentPlaying(state, { payload: commentPlaying}) {
			return { ...state, commentPlaying };
		},

		saveFileInfoEditing(state, { payload: fileInfoEditing}) {
			return { ...state, fileInfoEditing };
		},

		saveFileDesContent(state, { payload: fileDesContent}) {
			return { ...state, fileDesContent };
		},

		saveIsPageCommentLoading(state, { payload: isPageCommentLoading}) {
			return { ...state, isPageCommentLoading };
		},

		saveIsCommentPageAll(state, { payload: isCommentPageAll}) {
			return { ...state, isCommentPageAll };
		},

		saveCommentClosed(state, { payload: commentClosed}) {
			return { ...state, commentClosed };
		},

		saveCallbackBlockShow(state, { payload: callbackBlockShow}) {
			return { ...state, callbackBlockShow };
		},

		saveComments(state, { payload: comments}) {
			return { ...state, comments };
    },

    saveCommentsTotal(state, { payload: commentsTotal}) {
			return { ...state, commentsTotal };
		},

		saveCallbackComment(state, { payload: callbackComment}) {
			return { ...state, callbackComment };
		},

		saveShowAllCallback(state, { payload: showAllCallback}) {
			return { ...state, showAllCallback };
		},

		saveCallbackText(state, { payload: callbackText}) {
			return { ...state, callbackText };
		},

		saveIsCallbacking(state, { payload: isCallbacking}) {
			return { ...state, isCallbacking };
		},

		saveCommentProp(state, { payload: {commentPage, commentSort, commentShowCompleted, commentQuery}}) {
			return { ...state, commentPage, commentSort, commentShowCompleted, commentQuery };
		},

		saveCommentSort(state, { payload: commentSort}) {
			return { ...state, commentSort};
		},

		saveCommentPage(state, { payload: commentPage}) {
			return { ...state, commentPage};
		},

		saveCommentShowCompleted(state, { payload: commentShowCompleted}) {
			return { ...state, commentShowCompleted};
		},

		init(state, { payload: {}}) {
			return { ...state, ...{
				commenTabIndex: 0,				//评论区tab切换
				commentClosed: false,			//是否收起评论区
				callbackBlockShow: false,		//是否显示回复区
				comments: [],					//评论列表
				commentPage: 1,					//评论页码
				// commentSort: 1,					//评论排序
				// commentShowCompleted: 0,		//评论是否已完成
				commentQuery: '',				//评论搜索关键字
				// code: '',						//分享code
				callbackComment: null,			//当前回复的评论
				showAllCallback: false, 		//判断是否少于5条
				callbackText: '',				//当前回复的评论内容
				isCallbacking: false,			//回复发送中
				isCommentPageAll: false,			//是否已经全部加载
				isPageCommentLoading: false,
				fileInfoEditing: false
			}};
		}
	},
	effects: {
		*fetchComments({ payload: {}}, { call, put, select, take }) {
			let comment = yield select(state => state.comment);
			// let doc_id = getFid('f');
			// let project_id = getQuery('p');

			let {project_id, doc_id} = getPidDid();
			let file_id = getFid();

			let param = {
				...getTokenLocalstorage(),
				doc_id: file_id,
				project_id,
				page: comment.commentPage,
				sort: comment.commentSort,
				show_completed: comment.commentShowCompleted,
				query: comment.commentQuery,
				pre_page: PRE_PAGE
			};

			yield put({ type: 'fetchCommentCommon', payload: {url: '/comment', param}});

			if (comment.callbackComment) {
				let comment = yield select(state => state.comment);
				let callbackComment = comment.comments.filter(item => item.id == comment.callbackComment.id)[0];
				yield put({ type: 'saveCallbackComment', payload: callbackComment });
			}
		},

		*fetchShareComments({ payload: fileItem}, { call, put, select, take }) {
			let comment = yield select(state => state.comment);
			let param = {
				doc_id: fileItem.id,
				project_id: fileItem.project_id,
				page: comment.commentPage,
				sort: comment.commentSort,
				show_completed: comment.commentShowCompleted,
				query: comment.commentQuery,
				code: getQuery('r'),
				pre_page: PRE_PAGE
      		};

			yield put({ type: 'saveIsCommentPageAll', payload: false});

			yield put({ type: 'fetchCommentCommon', payload: {url: '/sharecomment', param}});
		},

		// 获取评论
		*fetchCommentCommon({ payload: {param, url}}, { call, put, select, take }) {
			let json = yield call(get, url, param);
			if (json.data.status == 1) {
				let commentList = json.data.data.list;
				commentList = commentList.map(item => {
					item.record = null;
					if (item.content.indexOf(COMMENT_RECORD_PREFIXER) > -1) {
						item.record = JSON.parse(JSON.parse(item.content)[COMMENT_RECORD_PREFIXER]);
						item.content = '';
					}
					return item;
				});
				yield put({ type: 'saveCommentsTotal', payload: json.data.data.total });
				yield put({ type: 'saveComments', payload: commentList });
				if ( json.data.data.list.length < PRE_PAGE) {
					yield put({type: 'saveIsCommentPageAll', payload: true});
				}
			} else {
				message.error(json.data.msg);
			}
	  	},

		*showCallback({ payload: id }, { call, put, select, take }) {
			let comment = yield select(state => state.comment);
			let currentComment = comment.comments.filter(item => item.id == id)[0];
			yield put({ type: 'saveCallbackComment', payload: currentComment });
		},

		*deleteComment({ payload: comment_id }, { call, put, select, take }) {
			let file = yield select(state => state.file);
			let comment = yield select(state => state.comment);
			const {
				project_id
			} = file.fileInfo;

			const json = yield call(post, '/comment', {
				...getTokenLocalstorage(),
				comment_id,
				project_id,
				_method: 'delete'
			});

			if (json.data.status == 1) {
				message.success('删除评论成功');
				if (comment.callbackComment) {
					yield put({type: 'saveCallbackBlockShow', payload: false});
					yield put({type: 'saveCallbackComment', payload: null});
				}

				let comments = comment.comments.filter(item => item.id != comment_id);
				yield put({ type: 'saveComments', payload: comments});
			} else {
				message.error('删除评论失败');
			}
		},

		*callbackPerson({ payload: personName }, { call, put, select, take }) {
			yield put({type: 'saveCallbackText', payload: '@' + personName + '  '});
		},

		*sendCallback({ payload: {} }, { call, put, select, take }) {
			let comment = yield select(state => state.comment);
			let file = yield select(state => state.file);

			const {
				callbackComment,
				callbackText
			} = comment;

			if (callbackText == '') return;

			let param = {
				...getTokenLocalstorage(),
				content: callbackText,
				top_id: callbackComment.id,
				doc_id: file.fileInfo.id,
				project_id: file.fileInfo.project_id,
			};


			yield put({type: 'saveIsCallbacking', payload: true});

			const json = yield call(post, '/comment', param);

			if (json.data.status == 1) {
				message.success('回复成功');


				yield put({type: 'saveCallbackText', payload: ''});
				yield put({type: 'saveIsCallbacking', payload: false});

				let user = yield select(state => state.user);

				let getCallback = () => {
					return {
						avatar: user.userInfo.avatar,
						avatar_background_color: user.userInfo.avatar_background_color,
						content: callbackText,
						created_at: Date.parse(new Date()),
						realname: user.userInfo.realname,
						user_id: user.userInfo.id,
						top_id: callbackComment.id,
						id: json.data.data.id
					};
				};
				let cc = JSON.parse(JSON.stringify(callbackComment));
				cc.replies.push(getCallback());

				let cm = JSON.parse(JSON.stringify(comment.comments));
				cm.map((item) => {
					if (item.id == callbackComment.id) {
						item.replies.push(getCallback());
					}
					return item;
				});
				yield put({type: 'saveComments', payload: cm});
				yield put({type: 'saveCallbackComment', payload: cc});
				yield put({type: 'saveShowAllCallback', payload: true});

				// 自动滚到底部
				setTimeout(() => {
					let callbackBody = document.getElementById('callback-body');
					callbackBody.scrollTop = callbackBody.scrollHeight;
				});

			} else {
				message.error('回复失败');
			}
		},

		//分页
		*pushComment({ payload: {param, url}}, { call, put, select, take }) {
			let comment = yield select(state => state.comment);
			if (comment.isCommentPageAll){
				return;
			}
			yield put({type: 'saveIsPageCommentLoading', payload: true});
			let comments = JSON.parse(JSON.stringify(comment.comments));
			let json = yield call(get, url, param);
			if (json.data.status == 1) {
				//判断所有的是否已经加载完成
				if (json.data.data.list.length < PRE_PAGE) {
					yield put({type: 'saveIsCommentPageAll', payload: true});
				}
				yield put({type: 'saveIsPageCommentLoading', payload: false});
				
				let list = json.data.data.list.map(item => {
					item.record = null;
					if (item.content.indexOf(COMMENT_RECORD_PREFIXER) > -1) {
						item.record = JSON.parse(JSON.parse(item.content)[COMMENT_RECORD_PREFIXER]);
						item.content = '';
					}
					return item;
				});
				comments = [...comments, ...list];
				yield put({ type: 'saveComments', payload: comments });
			} else {
				message.error(json.data.msg);
			}
		},

		//标记完成
		*labelComplete({ payload: {comment_id, review}}, { call, put, select, take }) {
			let file = yield select(state => state.file);
			let comment = yield select(state => state.comment);
			let json = yield call(post, '/comment', {
				...getTokenLocalstorage(),
				comment_id,
				review,
				project_id: file.fileInfo.project_id,
				_method: 'put'
			});

			if (json.data.status == 1) {
				message.success('评论已标记');
				let cm = comment.comments.filter(item => item.id != comment_id);
				yield put({ type: 'saveComments', payload: cm });
			} else {
				message.error(json.data.msg);
			}
		},

		//保存文件描述
		*saveFileInfoDes({ payload: description}, { call, put, select, take }) {
			let file = yield select(state => state.file);

			let json = yield call(post, '/doc', {
				...getTokenLocalstorage(),
				id: file.fileInfo.id,
				description,
				project_id: file.fileInfo.project_id,
				_method: 'put'
			});

			if (json.data.status == 1) {
				message.success('文件描述保存成功');
				yield put({ type: 'saveFileInfoEditing', payload: false });
			} else {
				message.error(json.data.msg);
			}
		}

	},
	subscriptions: {},
};
