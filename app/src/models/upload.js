import {LOGIN_ID, TOKEN} from '../config/constants';
import {post, get, getTokenLocalstorage, getQuery, Base64} from '../utils/utils';
import {message, notification, Icon} from 'antd';

export default {
  namespace: 'upload',
  state: {
	uploadFiles: [],		//正在上传的文件
	uploadedFiles: []		//上传完成未处理的文件
  },
  reducers: {
	saveUploadFiles(state, { payload: uploadFiles}) {
		return { ...state, uploadFiles };
	},

	saveUploadedFiles(state, { payload: uploadedFiles}) {
		return { ...state, uploadedFiles };
	},
  },
  effects: {
    // 开始添加文件
	*addFiles({ payload: {files, top_id, handleUpload, baseId}}, { call, put, select }) {
		// console.log(files, top_id, handleUpload, baseId, 'files, top_id, handleUpload');
		const {projectActive, docActive} = yield select(state => state.project);
		const {uploadFiles} = yield select(state => state.upload);
		let uf = JSON.parse(JSON.stringify(uploadFiles));

		if (uf.length + files.length > 3) {
			message.warning('最多同时上传三个文件, 您还可以再添加' + (3 - uf.length) + '个文件');
			return;
		}
		
		for(let k in files) {
			if (files[k].size) {
				let o = {
					projectId: projectActive,
					topId: top_id,
					doc_id: 0,
					progress: 0,
					transcode: -1,
					uploading: false,
					name: files[k].name,
					size: files[k].size,
					baseId,
				};
				o.file = files[k];
				uf.push(o);
			}
		}
		yield put({type: 'saveUploadFiles', payload: uf});
		let ufs = yield select(state => state.upload.uploadFiles);
		
		let sizeAll = 0;
		let uf1 = JSON.parse(JSON.stringify(uploadFiles));
	
		for (let k in uf1) {
			if (uf1[k].file.size) {
				sizeAll += uploadFiles[k].file.size;
			}
		}
		
		const json = yield call(get, '/restage', {...getTokenLocalstorage(), file_size: sizeAll});

		let udfs = yield select(state => state.upload.uploadedFiles);

		if (json.data.status == 1) {

			for (let k in ufs) {

				if (udfs.indexOf(ufs[k]) == -1 && JSON.parse(JSON.stringify(ufs[k].file)) != '{}' && !ufs[k].uploading) {
					let json1 = yield call(post, '/createoss', {
						...getTokenLocalstorage(),
							project_id: projectActive,
							top_id,
							file_size: ufs[k].file.size,
							filename: ufs[k].file.name
						});
					if (json1.data.status == 1) {
						let base = new Base64(); 
						let clientConfig = {
							region: 'oss-cn-shanghai',
							//云账号AccessKey有所有API访问权限，建议遵循阿里云安全最佳实践，创建并使用STS方式来进行API访问
							accessKeyId: json1.data.data.accessid,
							accessKeySecret: base.decode(json1.data.data.access_key_secret),
							bucket: 'xinyuetest',
							endpoint: 'https://oss-cn-shanghai.aliyuncs.com/',
							// stsToken: result.SecurityToken,
							signature:  json1.data.data.signature,
						};
						ufs[k] = Object.assign({}, ufs[k], json1.data.data, {uploading: true});

						yield put({type: 'saveUploadFiles', payload: ufs});

						// let pb = document.getElementById('pb-body');
						// if (pb) pb.scrollTop = pb.scrollHeight;

						// let vl = document.getElementById('versions-list');
						// if (vl) vl.scrollTop = vl.scrollHeight;

						handleUpload(clientConfig, ufs[k], json1.data.data.object_key);
					} else {
						let newUploadFiles = ufs.filter(item => item.size != undefined);
						yield put({type: 'saveUploadFiles', payload: newUploadFiles});
						message.error(json1.data.msg);
					}
					
				}
				
			}

		} else {
			message.error(json.data.msg);
		}
	},

	// handle uploaded file
	*handleUploadedFile({ payload: {objectKey, doc_id, t, uploadItem} }, { call, put, select }) {
		const json = yield call(get, '/cell/transcode1', {...getTokenLocalstorage(), doc_id});
		if (json.data.status == 1) {
			if (json.data.data.transcode_state == 1) {
				clearInterval(t);
				const {projectActive, docActive, uploadInput} = yield select(state => state.project);
				const {uploadFiles}  = yield select(state => state.upload);

				if (uploadItem.baseId == undefined) {
					yield put({type: 'project/fetchFiles', payload: {project_id: projectActive, doc_id: docActive}});
				} else {
					// console.log(uploadItem.projectId, uploadItem.baseId, doc_id, 'doc_id');
					const json2 = yield call(post, '/version', {
						...getTokenLocalstorage(),
						project_id: uploadItem.projectId,
						base_file: uploadItem.baseId,
						new_files: doc_id,
						_method: 'put'
					});
					if (json2.data.status == 1) {
						// 上传编码成功后添加一个版本
						let file = yield select(state => state.file);
						file.fileInfo.versions.push(json.data.data);
						yield put({type: 'saveFileInfo', payload: file.fileInfo});
					} else {
						message.error(json2.data.msg);
					}
				}

				let newUploadFiles = uploadFiles.filter(item => item.doc_id != doc_id);
				yield put({type: 'saveUploadFiles', payload: newUploadFiles});
			}
		} else {
			clearInterval(t);
			message.error(json.data.msg);
		}

	},

	//获取签名
	*getUploadSTS({ payload: {sizeAll, files, handleUpload} }, { call, put, select }) {
		const {projectActive, docActive} = yield select(state => state.project);

		const json = yield call(get, '/restage', {...getTokenLocalstorage(), file_size: sizeAll});
		if (json.data.status == 1) {
			
			for(let i = 0; i < files.length; i++) {
				if (!files[i].name) continue;

				notification.open({
					message: '正在上传水印图片--' + files[i].name + '...',
					icon: <Icon type="loading" style={{ color: '#108ee9' }} />,
					key: 'water-upload',
					duration: 10
				});
	

				let json1 = yield call(post, '/watermark/upload', {
					...getTokenLocalstorage(),
						project_id: projectActive,
						top_id: 0,
			
						file_size: files[i].size,
						filename: files[i].name,
						// filename: files[i]
					});
				if (json1.data.status == 1) {
					let base = new Base64(); 
					let clientConfig = {
						region: 'oss-cn-shanghai',
						//云账号AccessKey有所有API访问权限，建议遵循阿里云安全最佳实践，创建并使用STS方式来进行API访问
						accessKeyId: json1.data.data.accessid,
						accessKeySecret: base.decode(json1.data.data.access_key_secret),
						bucket: 'xinyuetest',
						endpoint: 'https://oss-cn-shanghai.aliyuncs.com/',
						// stsToken: result.SecurityToken,
						signature:  json1.data.data.signature,
					};
					handleUpload(clientConfig, files[i], json1.data.data.object_key);
				} else {
					message.error(json.data.msg);
				}
			}
		} else {
			message.error(json.data.msg);
		}
		
	},

	//处理水印上传的图片监听
	*handleUploadedWater({ payload: {objectKey, doc_id, t, uploadItem} }, { call, put, select }) {

	}
  },
  subscriptions: {},
};
