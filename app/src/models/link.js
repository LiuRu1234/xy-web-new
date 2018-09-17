import {LOGIN_ID, TOKEN} from '../config/constants';
import { routerRedux } from 'dva/router';
import {post, get, getTokenLocalstorage, getQuery, ts2Ti} from '../utils/utils';
import {message, notification, Icon} from 'antd';

let linkShare = {
	name: '',
	review: 1,
	show_all_version: 1,
	download: 1,
	switch_password: 1,
	deadline: 0,
	water_status: 1
};

export default {
	namespace: 'link',
	state: {
		shareLinkList: [], 				//分享列表
		selectFiles: [],				//选择的分享文件列表
		isSharing: false,				//是否处于正在分享中
		linkShare,						//分享属性
		createdLinkModalShow: false,	//分享modal是否显示
		createdLinkModalData: {},		//已创建好的分享modal的数据
		createOrChange: 'create',		//创建或修改分享 create, change
		changeLink: {},					//获取已创建的分享链接属性
		deleteLinkModalShow: false,		//删除链接的modal显示
		likeLinkList: [],
		likeLinkParam: {
			page: 1,
			per_page: 10
		},
		likeLinkListAll: false
	},
	reducers: {
		saveShareLinkList(state, { payload: shareLinkList}) {
			return { ...state, shareLinkList };
		},

		saveLikeLinkListAll(state, { payload: likeLinkListAll}) {
			return { ...state, likeLinkListAll };
		},

		saveLikeLinkParam(state, { payload: likeLinkParam}) {
			return { ...state, likeLinkParam };
		},

		saveLikeLinkList(state, { payload: likeLinkList}) {
			return { ...state, likeLinkList };
		},

		saveSelectFiles(state, { payload: selectFiles}) {
			return { ...state, selectFiles };
		},

		saveIsSharing(state, { payload: isSharing}) {
			return { ...state, isSharing };
		},

		saveLinkShare(state, { payload: linkShare}) {
			return { ...state, linkShare };
		},

		saveCreatedLinkModalShow(state, { payload: createdLinkModalShow}) {
			return { ...state, createdLinkModalShow };
		},

		saveCreatedLinkModalData(state, { payload: createdLinkModalData}) {
			return { ...state, createdLinkModalData };
		},

		saveCreateOrChange(state, { payload: createOrChange}) {
			return { ...state, createOrChange };
		},

		saveChangeLink(state, { payload: changeLink}) {
			return { ...state, changeLink };
		},

		saveDeleteLinkModalShow(state, { payload: deleteLinkModalShow}) {
			return { ...state, deleteLinkModalShow };
		},
	},
	effects: {
		// 获取分享链接
		*fetchLink({ payload: {}}, { call, put, select }) {
			let project = yield select(state => state.project);
			const json = yield call(get, '/sharelink/list', {...getTokenLocalstorage(), project_id: project.projectActive});
			if (json.data.status == 1) {
				yield put({type: 'saveShareLinkList', payload: json.data.data.list});
			} else {
				message.error(json.data.msg);
			}
		},

		// 获取收藏链接
		*fetchLikeLink({ payload: {}}, { call, put, select }) {
			let link = yield select(state => state.link);
			if (link.likeLinkListAll) return;
			const json = yield call(get, '/collect/link', {...getTokenLocalstorage(), ...link.likeLinkParam});
			if (json.data.status == 1) {
				let likeLinkList = JSON.parse(JSON.stringify(link.likeLinkList));
				likeLinkList = [...likeLinkList, ...json.data.data.list];
				yield put({type: 'saveLikeLinkList', payload: likeLinkList});

				if (json.data.data.list.length < 10) {
					//如果加载的还是空数据不在增加页码
					yield put({type: 'saveLikeLinkListAll', payload: true});
					return;
				}
				yield put({type: 'saveLikeLinkParam', payload:  {
					page: ++link.likeLinkParam.page,
					per_page: 10
				}});
				if (json.data.data.list.length < 10) {
					yield put({type: 'saveLikeLinkListAll', payload: true});
				} 
			} else {
				message.error(json.data.msg);
			}
		},

		// 改变分享状态
		*changeLinkStatus({ payload: {link, checked}}, { call, put, select }) {
			link.status = checked ? 1 : 0;
			let doc_ids = link.files.map(item => item.id);
			const json = yield call(post, '/sharelink', {
				...getTokenLocalstorage(),
				...link, 
				doc_ids,
				sharelink_id: link.id,
				_method: 'put'
			});
			if (json.data.status == 1) {
				message.success('修改成功');
			} else {
				message.error(json.data.msg);
			}
		},

		// 创建/修改分享
		*createChangeLinkShare({ payload: {}}, { call, put, select }) {
			let project = yield select(state => state.project);

			let link = yield select(state => state.link);
			let ls = JSON.parse(JSON.stringify(link.linkShare));

			if (ls.deadline !== 0) {
				if (ls.deadline == '') {
					message.warning('有效期还没设置');
					return;
				}
				ls.deadline = typeof(link.linkShare.deadline) === 'string'? ts2Ti(link.linkShare.deadline) : link.linkShare.deadline;
				if (Date.parse(new Date()) / 1000 > ls.deadline) {
					message.warning('有效期不能小于当前时间');
					return;
				}
			}

			let param = {
				...getTokenLocalstorage(),
				project_id:  project.projectActive,
				...ls,
				doc_ids: link.selectFiles
			};

			if (link.createOrChange != 'create') {
				param._method = 'put';
				param.sharelink_id = link.changeLink.id;
			}

			const json = yield call(post, '/sharelink', param);
			yield put({type: 'saveSelectFiles', payload: []});

			if (json.data.status == 1) {
				link.createOrChange == 'create' ? message.success('创建分享成功') : message.success('保存分享成功');
				yield put({type: 'saveIsSharing', payload: false});
				yield put({type: 'project/saveProjectLinkModalShow', payload: false});
				if (link.createOrChange == 'create') {
					yield put({type: 'saveCreatedLinkModalShow', payload: true});
					yield put({type: 'saveCreatedLinkModalData', payload: json.data.data});
				}

				if(project.tabIndex == 1) {
					yield put({type: 'fetchLink', payload: {}});
				}
			} else {
				yield put({type: 'project/saveProjectLinkModalShow', payload: false});
				message.error(json.data.msg);
			}
		},

		// 删除分享
		*deleteLinkShare({ payload: {sharelink_id}}, { call, put, select }) {
			const json = yield call(post, '/sharelink', {
				...getTokenLocalstorage(),
				_method: 'delete',
				sharelink_id
			});
			if (json.data.status == 1) {
				message.success('删除成功');
				yield put({type: 'fetchLink', payload: {}});
			} else {
				message.error(json.data.msg);
			}
		},

		//删除收藏分享
		*deleteLikeLinkShare({ payload: {share_code}}, { call, put, select }) {
			const json = yield call(post, '/collect/link', {
				...getTokenLocalstorage(),
				share_code,
				collect_status: 0
			});
			if (json.data.status == 1) {
				message.success('删除成功');
				let link = yield select(state => state.link);
				let lk = link.likeLinkList.filter(item => item.code != share_code);
				yield put({type: 'saveLikeLinkList', payload: lk});
			} else {
				message.error(json.data.msg);
			}
		},

		// 选择分享文件
		*selectShareFiles({ payload: file}, { call, put, select }) {
			let link = yield select(state => state.link);
			let selectFiles = JSON.parse(JSON.stringify(link.selectFiles));
              
			if (selectFiles.indexOf(file.id) > -1) {
			   selectFiles = selectFiles.filter(item => item != file.id);
			} else {
				selectFiles.push(file.id);
			}

			yield put({type: 'saveSelectFiles', payload: selectFiles});
		},

		// 显示分享modal
		*showProjectShare({ payload: {doc_id, doc_name}}, { call, put, select }) {
			let link = yield select(state => state.link);
			let user = yield select(state => state.user);
			let selectFiles = JSON.parse(JSON.stringify(link.selectFiles));
			selectFiles.push(doc_id);
			yield put({type: 'saveSelectFiles', payload: selectFiles});
			yield put({type: 'saveLinkShare', payload: {
				name: user.userInfo.realname + '分享的' + doc_name ,
				review: 1,
				show_all_version: 1,
				download: 1,
				switch_password: 1,
				deadline: 0,
				water_status: 1
			}});
			yield put({type: 'project/saveProjectLinkModalShow', payload: true});
		}
	},
	subscriptions: {},
};
