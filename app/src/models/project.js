import {LOGIN_ID, TOKEN, EXP_EMAIL} from '../config/constants';
import { routerRedux } from 'dva/router';
import {post, get, getTokenLocalstorage, sortBy, search, savePidDid, getPidDid} from '../utils/utils';
import {message, notification, Icon} from 'antd';

let projectSetting = {
	name: '',
	is_open: 1,
	is_notice: 1,
	collaborator_download: 1,
	collaborator_invite: 1,
	my_comment: 1,
	my_upload: 1,
	my_join: 1,
	else_comment: 1,
	else_upload: 1,
	else_join: 1,
	color: '#FF635D',
};

// 判断当前是否已经在查看的项目
const handleProjectIsEmpty = (list) => {
	if (list.length > 0){
		let myProject = list.filter(item => item.type == 'admin');
		let memberProject = list.filter(item => item.type == 'member');
		let {project_id, doc_id} = getPidDid();
		// 检查是否该项目是否已经删除
		let currentProject = list.find((item) => {
			return item == project_id;
		});
		if (project_id && project_id != '' && !!currentProject) {
			return project_id;
		} else {
			savePidDid(myProject.length > 0 ? myProject[0].id : memberProject[0].id, 0);
			return myProject.length > 0 ? myProject[0].id : memberProject[0].id;
		}
	} else {
		savePidDid(0, 0);
		location.href = '#/project';
		return null;
	}
};

export default {
	namespace: 'project',
	state: {
		tabIndex: 0,    //tab切换
		projectSetModalShow: false,   
		projectLinkModalShow: false,
		moreNoticeShow: false,
		addMemberShow: false,
		memberEdit: false,
		saveFileModalShow: false,
		projectsList: [],
		projectsListTemp: [],
		projectActive: null,   //当前项目id
		docActive: 0,			//当前目录id
		breadcrumb: [],			//面包屑
		fileList: [],			//文件列表
		members: [],			//成员
		membersTemp: [],
		allowToFile: true,		//文件允许跳转
		lookType: 'grid',              //grid, li
		uploadInput: null,				//上传input grid
		uploadInput2: null,				//上传input li
		createOrSetting: 'create',     // create, setting
		projectSetting,				//项目设置参数
		deleteProjectModalShow: false,	//删除项目modal
		deleteFileModalShow: false,
		quitProjectModalShow: false,  //确认退出弹框
		deleteFile: null,
		deleteProject: null,
		quitProject: null,
		changeNameFileId: null,   //需要修改的文件id
		membersManage: false,    //成员管理
		sortIndex: 0,  	//枚举，0:最近， 1:名称， 2：类型， 3：文件大小（升序）， 4:文件大小（降序）
		projectNotice: [],
		searchedMembers: [],
		otherClick: false,
		allMembers: [],
		searchedAllMembers: [],
		plAdminShow: true,
		plMemberShow: true
	},
	reducers: {
		saveTabIndex(state, { payload: tabIndex}) {
			return { ...state, tabIndex };
		},

		savePlAdminShow(state, { payload: plAdminShow}) {
			return { ...state, plAdminShow };
		},

		savePlMemberShow(state, { payload: plMemberShow}) {
			return { ...state, plMemberShow };
		},

		saveAllMembers(state, { payload: allMembers}) {
			return { ...state, allMembers };
		},

		saveSearchedAllMembers(state, { payload: searchedAllMembers}) {
			return { ...state, searchedAllMembers };
		},

		saveDeleteProject(state, { payload: deleteProject}) {
			return { ...state, deleteProject };
		},

		saveQuitProject(state, { payload: quitProject}) {
			return { ...state, quitProject };
		},

		saveQuitProjectModalShow(state, { payload: quitProjectModalShow}) {
			return { ...state, quitProjectModalShow };
		},

		initProjectSetting(state, { payload: {}}) {
			let projectSetting = {
				name: '',
				is_open: 1,
				is_notice: 1,
				collaborator_download: 1,
				collaborator_invite: 1,
				my_comment: 1,
				my_upload: 1,
				my_join: 1,
				else_comment: 1,
				else_upload: 1,
				else_join: 1,
				color: '#FF635D',
			};
			return { ...state, projectSetting };
		},

		saveOtherClick(state, { payload: otherClick}) {
			return { ...state, otherClick };
		},

		saveSearchedMembers(state, { payload: searchedMembers}) {
			return { ...state, searchedMembers };
		},

		saveProjectNotice(state, { payload: projectNotice}) {
			return { ...state, projectNotice };
		},

		saveSortIndex(state, { payload: sortIndex}) {
			return { ...state, sortIndex };
		},

		saveMembersManage(state, { payload: membersManage}) {
			return { ...state, membersManage };
		},

		saveChangeNameFileId(state, { payload: changeNameFileId}) {
			return { ...state, changeNameFileId };
		},

		saveLookType(state, { payload: lookType}) {
			return { ...state, lookType };
		},

		saveProjectSetModalShow(state, { payload: projectSetModalShow}) {
			return { ...state, projectSetModalShow };
		},

		saveProjectLinkModalShow(state, { payload: projectLinkModalShow}) {
			return { ...state, projectLinkModalShow };
		},

		saveMoreNoticeShow(state, { payload: moreNoticeShow}) {
			return { ...state, moreNoticeShow };
		},

		saveAddMemberShow(state, { payload: addMemberShow}) {
			return { ...state, addMemberShow };
		},

		saveMemberEdit(state, { payload: memberEdit}) {
			return { ...state, memberEdit };
		},

		saveSaveFileModalShow(state, { payload: saveFileModalShow}) {
			return { ...state, saveFileModalShow };
		},

		saveProjectsList(state, { payload: projectsList}) {
			return { ...state, projectsList, projectsListTemp: projectsList };
		},

		saveProjectsList2(state, { payload: projectsList}) {
			return { ...state, projectsList };
		},

		saveProjectActive(state, { payload: projectActive}) {
			return { ...state, projectActive };
		},

		saveBreadFiles(state, { payload: {breadcrumb, fileList}}) {
			return { ...state, breadcrumb, fileList };
		},

		saveMembers(state, { payload: {members, membersTemp}}) {
			return { ...state, members, membersTemp};
		},

		saveAllowToFile(state, { payload: allowToFile}) {
			return { ...state, allowToFile };
		},

		saveUploadInput(state, { payload: uploadInput}) {
			return { ...state, uploadInput };
		},

		saveUploadInput2(state, { payload: uploadInput2}) {
			return { ...state, uploadInput2 };
		},

		saveDocActive(state, { payload: docActive}) {
			return { ...state, docActive };
		},

		saveCreateOrSetting(state, { payload: createOrSetting}) {
			return { ...state, createOrSetting };
		},

		saveProjectSetting(state, { payload: projectSetting}) {
			return { ...state, projectSetting };
		},

		saveDeleteProjectModalShow(state, { payload: deleteProjectModalShow}) {
			return { ...state, deleteProjectModalShow };
		},

		saveDeleteFileModalShow(state, { payload: deleteFileModalShow}) {
			return { ...state, deleteFileModalShow };
		},
		
		saveDeleteFile(state, { payload: deleteFile}) {
			return { ...state, deleteFile };
		},
	},
	effects: {
		// 判断登录
		*isLogined({ payload: {}}, { call, put, select, take }) {
			const loginId = localStorage.getItem(LOGIN_ID);
			const token = localStorage.getItem(TOKEN);
			let user = yield select(state => state.user);
			let global = yield select(state => state.global);
			yield put({ type: 'global/savePageLoading', payload: true });
			yield put({type: 'saveOtherClick', payload: false});
			if (JSON.stringify(user.userInfo) == '{}') {
				let json = yield call(get, '/user/info', {login_id: loginId, token});
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
						yield put({ type: 'global/savePageLoading', payload: false });
						return;
					}		
				} else {
					if(process.env.NODE_ENV === 'production') {
						window.location = '//' + window.location.host;
					} else {
						// window.location = '/';
					}
					return;
				}
			}
			yield put({type: 'fetchProjects', payload:{}});
			yield put({ type: 'global/savePageLoading', payload: false });

		},

		// 获取项目列表
		*fetchProjects({ payload: {}}, { call, put, select }) {
			const localLogin = getTokenLocalstorage();
			let json = yield call(get, '/project', localLogin);

			if (json.data.status == 1) {
				let list = json.data.data.list;
				yield put({ type: 'saveProjectsList', payload: list});

				//判断是否不存在项目
				let projectActive = handleProjectIsEmpty(list);
				if (!projectActive) return;

				let {project_id, doc_id} = getPidDid();
				console.log(project_id, doc_id, 'project_id');
				if (project_id == 0) {
					savePidDid(projectActive, doc_id);
					yield put({ type: 'saveDocActive', payload: 0});
					yield put({ type: 'saveProjectActive', payload: projectActive});
				} else {
					yield put({ type: 'saveDocActive', payload: doc_id});
					yield put({ type: 'saveProjectActive', payload: project_id});
				}
				yield put({ type: 'fetchFiles', payload: {project_id, doc_id}});
		 		yield put({ type: 'fetchMember', payload: {project_id}});
			} else {
				message.error(json.data.msg);
			}

		},

		// 项目点击处理
		*toProject({ payload: {project_id}}, { call, put, select }) {
			savePidDid(project_id, 0);
			yield put({ type: 'saveDocActive', payload: 0});
			yield put({ type: 'saveProjectActive', payload: project_id});
			yield put({ type: 'fetchFiles', payload: {project_id, doc_id: 0}});
			yield put({ type: 'fetchMember', payload: {project_id}});
			yield put({ type: 'global/savePageLoading', payload: false });
		},

		// 文件夹点击处理
		*toDoc({ payload: {project_id, doc_id}}, { call, put, select }) {
			savePidDid(project_id, doc_id);
			yield put({ type: 'global/savePageLoading', payload: true });
			yield put({ type: 'fetchFiles', payload: {project_id, doc_id}});
			yield put({ type: 'saveDocActive', payload: doc_id});
			yield put({ type: 'saveProjectActive', payload: project_id});
			// yield put({ type: 'fetchMember', payload: {project_id}});
			yield put({ type: 'global/savePageLoading', payload: false });
		},

		// 获取项目文件列表
		*fetchFiles({ payload: {project_id, doc_id}}, { call, put, select }) {
			const localLogin = getTokenLocalstorage();
			let json = yield call(get, '/project/file', {...localLogin, project_id, doc_id: doc_id || 0});
			if (json.data.status == 1) {
				let breadcrumb = json.data.data.breadcrumb;
				let fileList = json.data.data.list;
				yield put({ type: 'saveBreadFiles', payload: {breadcrumb, fileList}});
				yield put({ type: 'saveDocActive', payload: getPidDid().doc_id});
				yield put({ type: 'sortFile', payload: {}});
			} else {
				message.error(json.data.msg);
			}
		},

		// 获取项目成员
		*fetchMember({ payload: {project_id}}, { call, put, select }) {
			const localLogin = getTokenLocalstorage();
			let json = yield call(get, '/member/project', {...localLogin, project_id,});
			if (json.data.status == 1) {
				let members = json.data.data.list;
				yield put({ type: 'saveMembers', payload: {members, membersTemp: members} });
				yield put({type: 'saveSearchedMembers', payload: members});
			} else {
				message.error(json.data.msg);
			}
		},


		// 显示项目设置modal
		*toggleProjectSetting({ payload: {isShow, showType}}, { call, put, select }) {
			if (isShow) {
				yield put({type: 'saveCreateOrSetting', payload: showType});
				if (showType != undefined && showType != 'create') {
					let project = yield select(state => state.project);
					let currentProject = project.projectsList.filter(item => item.id == project.projectActive)[0];
					for (let k in projectSetting) {
						projectSetting[k] = currentProject[k];
					}
					yield put({type: 'saveProjectSetting', payload: projectSetting});
				
				}
			} else {
				let projectSetting = {
					name: '',
					is_open: 1,
					is_notice: 1,
					collaborator_download: 1,
					collaborator_invite: 1,
					my_comment: 1,
					my_upload: 1,
					my_join: 1,
					else_comment: 1,
					else_upload: 1,
					else_join: 1,
					color: '#FF635D'
				};
				yield put({type: 'saveProjectSetting', payload: projectSetting});
			}

			yield put({type: 'saveProjectSetModalShow', payload: isShow});

		},

		// 创建/修改项目
		*saveProject({ payload: {}}, { call, put, select }) {
			let project = yield select(state => state.project);

			notification.open({
				message: project.createOrSetting != 'create' ? '正在修改项目设置...' : '正在创建新项目...',
				icon: <Icon type="loading" style={{ color: '#108ee9' }} />,
				key: 'create-project',
				duration: 10
			});

			let param = {
				...project.projectSetting, 
				...getTokenLocalstorage(), 
			};

			if (project.createOrSetting != 'create') {
				param._method = 'put',
				param.project_id = project.projectActive;
			}

			const json = yield call(post, '/project', param);
			notification.close('create-project');

			if (json.data.status == 1) {
				project.createOrSetting == 'create' ? message.success('创建成功') : message.success('修改成功');
				// yield put({type: 'fetchProject2', payload: {}});
				yield put({type: 'saveProjectSetModalShow', payload: false});
				yield put({type: 'initProjectSetting', payload: {}});
				if (project.createOrSetting == 'create' ) {
					yield put({ type: 'saveProjectActive', payload:  json.data.data.id});

					savePidDid(json.data.data.id, 0);
					yield put({ type: 'fetchProjects2', payload: {}});
					yield put({
						type: 'toProject',
						payload: {
							project_id: json.data.data.id
						}
					});
				} else {
					yield put({ type: 'fetchProjects2', payload: {}});
				}
			} else {
				message.error(json.data.msg);
			}
		},

		// 获取项目
		*fetchProject2({ payload: {}}, { call, put, select }) {
			let json1 = yield call(get, '/project', {...getTokenLocalstorage()});

			if (json1.data.status == 1) {
				let list = json1.data.data.list;
				yield put({ type: 'saveProjectsList', payload: list});
				yield put({ type: 'saveProjectSetModalShow', payload: false});
			} else {
				message.error(json.data.msg);
			}
		},

		// 删除项目
		*deleteProject({ payload: project_id}, { call, put, select }) {
			let project = yield select(state => state.project);
			let param = {
				...getTokenLocalstorage(),
				project_id,
				_method: 'delete'
			};

			notification.open({
				message: '正在删除...',
				icon: <Icon type="loading" style={{ color: '#108ee9' }} />,
				key: 'delete-project',
				duration: 10
			});

			notification.open({
				message: '正在删除...',
				icon: <Icon type="loading" style={{ color: '#108ee9' }} />,
				key: 'delete-project',
			});

			let json = yield call(post, '/project', param);
			notification.close('delete-project');
			
			if (json.data.status == 1) {
				message.success('删除成功');
				yield put({type: 'fetchProject2', payload: {}});
				if (project_id == project.projectActive) {

					let list = project.projectsList.filter(item => item.id != project_id);
					let projectActive = handleProjectIsEmpty(list);
					yield put({type: 'saveProjectsList', payload: list});
					if (!projectActive) {
						yield put({type: 'saveBreadFiles', payload: {breadcrumb: [], fileList: []}});
						return;
					}

					// let projectActive = project.projectsList.filter(item => item.type == 'admin')[0].id;
					yield put({ type: 'saveProjectActive', payload: projectActive});
					yield put({ type: 'fetchFiles', payload: {project_id:projectActive, doc_id: 0}});
					
				}
			} else {
				message.error(json.data.msg);
			}
		},

		// 删除文件
		*deleteFile({ payload: {}}, { call, put, select }) {
			let project = yield select(state => state.project);

			const json = yield call(post, '/doc', {
				...getTokenLocalstorage(),
				doc_ids: [project.deleteFile.id],
				project_id: project.projectActive,
				delete_all_versions: 1,
				_method: 'delete'
			});
			yield put({type: 'saveDeleteFile', payload: {}});
			if (json.data.status == 1) {
				message.success('删除成功');
				yield put({type: 'fetchFiles', payload: {project_id: project.projectActive, doc_id: project.docActive}});
			} else {
				message.error(json.data.msg);
			}
		},


		// 解除版本
		*relieveFile({ payload: file}, { call, put, select }) {
			let project = yield select(state => state.project);
			const json = yield call(post, '/unversion', {
				...getTokenLocalstorage(),
				doc_id: file.id,
				_method: 'delete'
			});

			if (json.data.status == 1) {
				message.success('解除版本成功');
				yield put({type: 'fetchFiles', payload: {project_id: project.projectActive, doc_id: project.docActive}});
			} else {
				message.error(json.data.msg);
			}
		},

		// 新建文件夹
		*createFolder({ payload: {}}, { call, put, select }) {
			let project = yield select(state => state.project);
			let {project_id, doc_id} = getPidDid();
			
			const json = yield call(post, '/doc', {
				...getTokenLocalstorage(),
				name: '新建文件夹',
				top_id: doc_id,
				project_id: project_id,
			});

			if (json.data.status == 1) {
				message.success('创建文件夹成功');
				yield put({type: 'fetchFiles', payload: {project_id: project.projectActive, doc_id: project.docActive}});
			} else {
				message.error(json.data.msg);
			}
		},

		// 修改文件名称
		*changeFileName({ payload: name}, { call, put, select }) {
			let project = yield select(state => state.project);

			let file = project.fileList.filter((item, k) => item.id == project.changeNameFileId)[0];
			if (file.name == name) {
				yield put({type: 'saveChangeNameFileId', payload: null});
				return;
			}

			const json = yield call(post, '/doc', {
				...getTokenLocalstorage(),
				name,
				id: project.changeNameFileId,
				project_id: project.projectActive,
				_method: 'put'
			});
			if (json.data.status == 1) {
				message.success('修改名称成功');
				yield put({type: 'saveChangeNameFileId', payload: null});
				yield put({type: 'fetchFiles', payload: {project_id: project.projectActive, doc_id: project.docActive}});
			} else {
				message.error(json.data.msg);
			}
		},

		// 合并版本
		*mergeVersion({ payload: {base_file, new_files}}, { call, put, select }) {
			let project = yield select(state => state.project);

			let json = yield call(post , '/version', {
				...getTokenLocalstorage(),
				base_file,
				new_files,
				project_id: project.projectActive,
				_method: 'put'
			});

			if (json.data.status == 1) {
				message.success('合并成功');
				yield put({type: 'fetchFiles', payload: {project_id: project.projectActive, doc_id: project.docActive}});
			} else {
				// message.error(json.data.msg);
			}
		},

		// 移动文件到文件夹
		*moveFile({ payload: {doc_ids, dir_id}}, { call, put, select }) {
			let project = yield select(state => state.project);

			let json = yield call(post , '/doc/move', {
				...getTokenLocalstorage(),
				doc_ids,
				dir_id,
				project_id: project.projectActive,
				_method: 'put'
			});

			if (json.data.status == 1) {
				message.success('移动文件成功');
				yield put({type: 'fetchFiles', payload: {project_id: project.projectActive, doc_id: project.docActive}});
			} else {
				message.error(json.data.msg);
			}
		},


		//邀请邮箱
		*inviteMember({ payload: emails}, { call, put, select }) {
			const project = yield select(state => state.project);

			const json = yield call(post , '/invite', {
				...getTokenLocalstorage(),
				emails,
				project_id: project.projectActive,
			});

			if (json.data.status == 1) {
				message.success(json.data.msg);
			} else {
				message.error(json.data.msg);
			}
		},


		//搜索邮箱
		*searchEmail({ payload: name}, { call, put, select }) {
			const project = yield select(state => state.project);
			if (name == '') {
				yield put({type: 'saveSearchedMembers', payload: project.membersTemp});
			} else {
				const exp = new RegExp(name);
				// const exp2 = new RegExp(EXP_EMAIL);
				let member = project.membersTemp.filter(item => exp.test(item.realname) || exp.test(item.email));
				yield put({type: 'saveSearchedMembers', payload: member});
			}
		},

		//删除成员
		*deleteMember({ payload: member_id}, { call, put, select }) {
			const project = yield select(state => state.project);

			const json = yield call(post , '/member', {
				...getTokenLocalstorage(),
				member_id,
				project_id: project.projectActive,
				_method: 'delete'
			});

			if (json.data.status == 1) {
				message.success(json.data.msg);
				yield put({type: 'fetchMember', payload: {project_id: project.projectActive}});
			} else {
				message.error(json.data.msg);
			}
		},

		*fetchProjects2({ payload: {}}, { call, put, select }) {
			const json = yield call(get, '/project', {
				...getTokenLocalstorage(),
			});
			if (json.data.status == 1) {
				let list = json.data.data.list;
				yield put({ type: 'saveProjectsList', payload: list});
			} else {
				message.error(json.data.msg);
			}
		},

		//退出项目
		*quitProject({ payload: project_id}, { call, put, select }) {
			const project = yield select(state => state.project);

			const json = yield call(post , '/quit', {
				...getTokenLocalstorage(),
				project_id,
				_method: 'put'
			});

			if (json.data.status == 1) {
				message.success(json.data.msg);

				let list = project.projectsList.filter(item => item.id != project_id);
				yield put({type: 'saveProjectsList', payload: list});

				if ( project.projectActive != project_id) return;

				let projectActive = handleProjectIsEmpty(list);
				if (!projectActive) {
					yield put({type: 'saveBreadFiles', payload: {breadcrumb: [], fileList: []}});
					return;
				}
				yield put({ type: 'saveProjectActive', payload: projectActive});
				yield put({ type: 'fetchFiles', payload: {project_id:projectActive, doc_id: 0}});

				
			} else {
				message.error(json.data.msg);
			}
		},

		//文件排序
		*sortFile({ payload: {}}, { call, put, select }) {
			const project = yield select(state => state.project);
			const {fileList, breadcrumb} = project;

			let files = JSON.parse(JSON.stringify(fileList));
			switch(project.sortIndex){
				case 0: 
					files = files.sort((a, b) => b.created_at - a.created_at);
					break;
				case 1: 
					files = files.sort(sortBy('name'));
					break;
				case 2: 
					files = files.sort(sortBy('ext'));
					break;
				case 3: 
					files = files.sort((a, b) => a.size - b.size);
					break;
				case 4: 
					files = files.sort((a, b) => b.size - a.size);
					break;
			}
			yield put({ type: 'saveBreadFiles', payload: {breadcrumb, fileList: files}});
		},

		//搜索项目
		*searchProject({ payload: projectName}, { call, put, select }) {
			const project = yield select(state => state.project);
			const projects = JSON.parse(JSON.stringify(project.projectsListTemp));
			if (projectName != '') {
				const exp = new RegExp(projectName);
				let ps = projects.filter(item => exp.test(item.name));
				yield put({type: 'saveProjectsList2', payload: ps});
			} else {
				yield put({type: 'saveProjectsList2', payload: projects});
			}
		},

		//修改角色
		*changeRole({ payload: {member_id, type}}, { call, put, select }) {
			const project = yield select(state => state.project);

			const json = yield call(post, '/project/type', {
				...getTokenLocalstorage(),
				project_id: project.projectActive,
				member_id,
				type,
				_method: 'put'
			});
			if (json.data.status == 1) {
				yield put({type: 'fetchMember', payload: {project_id: project.projectActive}});
			} else {
				message.error(json.data.msg);
			}
		},

		//修改项目颜色
		*changeProjectColor({ payload: {project_id, color}}, { call, put, select }) {
			const project = yield select(state => state.project);

			const json = yield call(post, '/mark/project', {
				...getTokenLocalstorage(),
				project_id,
				color,
				_method: 'put'
			});
			if (json.data.status == 1) {
				let pl = JSON.parse(JSON.stringify(project.projectsList));
				pl.forEach(item => {
					if (item.id == project_id) {
						item.color = color;
					}
				});
				yield put({type: 'saveProjectsList', payload: pl});
			} else {
				message.error(json.data.msg);
			}
		},

		//获取所有项目成员
		*fetchAllMember({ payload: {}}, { call, put, select }) {
			const json = yield call(get, '/project/user', {
				...getTokenLocalstorage(),
			});

			if(json.data.status == 1) {
				yield put({type: 'saveAllMembers', payload: json.data.data});
			} else {
				message.error(json.datya.msg);
			}
		},

		//搜索邀请成员
		*searchAllMembers({ payload: value}, { call, put, select }) {
			const project = yield select(state => state.project);
			let searchedAllMembers = [];

			if (value != '') {
				searchedAllMembers = search(value, project.allMembers);
			} 

			searchedAllMembers = searchedAllMembers.slice(0, 9);
			
			yield put({type: 'saveSearchedAllMembers', payload: searchedAllMembers});
		},

		//邀请成员
		*newInvite({ payload: invite_user}, { call, put, select }) {
			const project = yield select(state => state.project);
			const json = yield call(post, '/invite/user', {
				...getTokenLocalstorage(),
				project_id: project.projectActive,
				invite_user
			});

			if (json.data.status == 1) {
				message.success('邀请成功');
			} else {
				message.error(json.data.msg);
			}
		},

		//加入项目
		*joinProject({ payload: notice_id}, { call, put, select }) {
			const project = yield select(state => state.project);
			const json = yield call(post, '/project/join', {
				...getTokenLocalstorage(),
				notice_id,
				join_status: 1
			});

			if(json.data.status == 1) {
				message.success('加入项目成功');
				yield put({type: 'fetchProjects2', payload: {}});
			} else {
				message.error(json.data.msg);
			}
		},

	},
	subscriptions: {
		setup({ dispatch, history } ) {
			return history.listen(({ pathname, search }, q) => {
				if (pathname === '/project') {
					dispatch({ type: 'isLogined', payload: {} });
				}
			});
		}
	},
};
