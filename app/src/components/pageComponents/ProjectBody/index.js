import React, { PureComponent } from 'react';
import IconBlock from '@CC/IconBlock';
import Image from '@CC/Image';
import {Row, Col, Tooltip, message} from 'antd';
import FileGrid from '../FileGrid';
import FileLi from '../FileLi';
import ProjectLink from '../ProjectLink';
import ProjectLikeLink from '../ProjectLikeLink';
// import ProjectNotice from '../ProjectNotice/ProjectNotice';
import ProjectApplication from '../ProjectApplication';
import SaveModal from '../SaveModal';
import Modal from '@CC/Modal';
import UploadOSS from '@utils/uploadOSS';
import { routerRedux } from 'dva/router';
import Clipboard from 'clipboard';
import { ProjectSettingPannel, ProjectSortPannel } from '@CCP/TooltipPannel';
import './index.scss';

class ProjectBody extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			fileBodyClient: null
		};
	}

	componentDidMount() {
		setTimeout(() => {
			if (!this.filebodyNode) return;
			this.setState({
				fileBodyClient: this.filebodyNode.getBoundingClientRect()
			});
		},100);
		
		window.addEventListener('resize', (e) => {
			if (!this.filebodyNode) return;
			this.setState({
				fileBodyClient: this.filebodyNode.getBoundingClientRect()
			});
		});
	}

	toDoc(doc) {
		this.props.dispatch(routerRedux.push({
			pathname: '/project',
			query: { p: this.props.projectActive, d: doc.id },
		}));
	}

	showProjectSet = () => {
		this.props.dispatch({
			type: 'project/toggleProjectSetting',
			payload: {
				isShow: true,
				showType: 'setting'
			}	 
		});
	}

	cancelShare = () => {
		this.props.dispatch({
			type: 'link/saveIsSharing',
			payload: false
		});
	}

	cancelUpload = (uploadNode) => {
		// console.log(uploadNode, uploadNode.uploadClient, uploadNode.uploadClient.listUploads, 'uploadNode.uploadClient');
		
		const _self = this;
		let un = () => {
			let currentUpload = _self.props.uploadFiles.filter(item => item.object_key == uploadNode.object_key)[0];
			let name = currentUpload.name.length > 15 ? currentUpload.name.substr(0, 10) + '...' + currentUpload.name.substr(-5): currentUpload.name;
            let newUploadFile = _self.props.uploadFiles.filter(item => item.doc_id != uploadNode.doc_id);
			_self.props.dispatch({type: 'upload/saveUploadFiles', payload: newUploadFile});
			return name;
		};

		if (uploadNode.uploadClient.abortMultipartUpload == undefined || uploadNode.uploadClient.listUploads == undefined) {
			message.warning('取消上传失败');
			return;
		}

		let abortUpload = () => {
			uploadNode.uploadClient.abortMultipartUpload(uploadNode.object_key, uploadNode.uploadId).then((a) => {
				uploadNode.uploadClient.listUploads().then((b) => {
					let uploadId = b.uploads.filter(item => item.uploadId == uploadNode.uploadId);
					// console.log(uploadId, 'uploadId')
					if (uploadId.length > 0) {
						abortUpload();
						return;
					}
					let name = un();
					message.warning(name + '--已取消上传，请重新上传');
				});
			}, (a) => {
				message.warning('取消失败');
				// console.log( _self.props.uploadFiles, uploadNode.object_key, 'uploadNode.object_key');
				// let currentUploadNode = _self.props.uploadFiles.filter(item => item.object_key == uploadNode.object_key);
				// if(currentUploadNode.length == 0) return;
				// abortUpload();
			});
		};
		abortUpload();
	}

	uploadFile = (clientConfig, uploadFile, objectKey, done) => {
        const {uploadFiles, dispatch, docActive} = this.props;
        const _self = this;
        let upload = (checkpoint) => {
            
            new UploadOSS({
                file: uploadFile.file,
                checkpoint,
                clientConfig,
                objectKey,
                successEvent(res) {
                    let uploadedFiles = JSON.parse(JSON.stringify(_self.props.uploadedFiles));
                    uploadedFiles.push(uploadFile.doc_id);
                    dispatch({type: 'upload/saveUploadedFiles', payload: uploadedFiles});

                    let t = setInterval(() => {
                        dispatch({type: 'upload/handleUploadedFile', payload: {objectKey, doc_id: uploadFile.doc_id, t, uploadItem: uploadFile }});
                    }, 1000);
                },
                progressEvent(progress, checkpoint, uploadClient){

					// uploadClient.listUploads().then((b) => {
					// 	console.log(progress, objectKey, b);
					// });
                    // console.log(progress, checkpoint, uploadClient, 'progress, checkpoint, uploadClient');
                    let uf = JSON.parse(JSON.stringify(_self.props.uploadFiles));
                    for (let k in uf) {
                        if (uf[k].object_key == objectKey) {
                            uf[k].progress = progress.toFixed(2) * 100;
                            uf[k].uploadClient = uploadClient;
                            uf[k].uploadId = checkpoint && checkpoint.uploadId;
                            uf[k].checkpoint = checkpoint;
                            uf[k].failCount = 0;
                        }
                    }
                    dispatch({type: 'upload/saveUploadFiles', payload: uf});
                },

                uploadFail() {
                    _self.uploadFail(clientConfig, uploadFile, objectKey, (checkpoint) => {
                        upload(checkpoint);  
                    });
                }
            });
        };

        upload();
    }

	uploadFail = (clientConfig, uploadFile, objectKey, done) => {
		const _self = this;
		let currentUpload = _self.props.uploadFiles.filter(item => item.object_key == objectKey)[0];
		if (!currentUpload) {
			return;
		}
		_self.props.uploadFiles.map(item => {
			if(item.object_key == objectKey){
				item.failCount++;
			}
			return item;
		});
		let name = currentUpload.name.length > 15 ? currentUpload.name.substr(0, 7) + '...' +  currentUpload.name.substr(-5): currentUpload.name;
		if (currentUpload.failCount > 3) {
			currentUpload.uploadClient.abortMultipartUpload && currentUpload.uploadClient.abortMultipartUpload(currentUpload.object_key, currentUpload.uploadId);
			let newUploadFile = _self.props.uploadFiles.filter(item => item.object_key != objectKey);
			_self.props.dispatch({type: 'upload/saveUploadFiles', payload: newUploadFile});
			message.warning(name + '--上传失败，请重新上传');
			return;
		} else {
			message.warning(name + '--上传失败，正在尝试继续上传');
		}

		setTimeout(() => {
			let uf = JSON.parse(JSON.stringify(_self.props.uploadFiles));
			let currentUpload = uf.filter(item => item.object_key == objectKey)[0];
			// console.log(uploadFile, 'uploadFile')
			if (uploadFile.file != undefined) {
				currentUpload.checkpoint.file = uploadFile.file;
				// done(currentUpload.checkpoint);
			} else {
				let newUploadFile = _self.props.uploadFiles.filter(item => item.object_key != objectKey);
				_self.props.dispatch({type: 'upload/saveUploadFiles', payload: newUploadFile});
				return;
			}
	
			done(currentUpload.checkpoint);  
		}, 3000);
	}

	sureShare = () => {
		const {dispatch, linkShare, userInfo, projectActive, projectsList, selectFiles} = this.props;
		if (selectFiles.length == 0) {
			message.warning('你还没选择文件');
			return;
		}
		let shareName = projectsList.filter((item, k) => item.id == projectActive)[0].name;

		dispatch({
			type: 'link/saveCreateOrChange',
			payload: 'create' 
		});

		dispatch({
			type: 'link/saveLinkShare',
			payload: {
				name: userInfo.realname + '分享的' + shareName + '(' + selectFiles.length + ')',
				review: 1,
				show_all_version: 1,
				download: 1,
				switch_password: 1,
				deadline: 0,
			}
		});

		dispatch({
			type: 'project/saveProjectLinkModalShow',
			payload: true	 
		});
	}

	createFolder = () => {
		this.props.dispatch({
			type: 'project/createFolder',
			payload: {}	 
		});
	}

	renderSaveFooter() {
		return (
			<div className="file-save-footer">
				<button>确定</button>
			</div>
		);
	}

	render() {
		const {
			tabIndex, 
			fileList, 
			lookType,
			breadcrumb, 
			projectsList,
			projectActive, 
			isSharing,
			selectFiles
			} = this.props;
		const {fileBodyClient} = this.state;

		let bc = JSON.parse(JSON.stringify(breadcrumb));
		if (breadcrumb.length > 0){
			let project= projectsList.find(item => item.id == projectActive);
			bc.unshift({name: project.name, id: 0});
		}	
		bc = bc.slice(-3);

		let currentProject = projectsList.filter(item => projectActive == item.id)[0];

		return (
			<div className="project-body-container">
			
				{tabIndex == 0 ? <header className="pb-header clearfix" style={{filter: isSharing ? 'blur(3px)' : ''}}>
					{isSharing ? <div className="pb-header-cover"></div> : null}
					<div className="pb-bread clearfix">
						{breadcrumb.length > 3 ? <span style={{color: '#7e879E'}}>......</span> : null}
						{breadcrumb.length > 3 ? <span>></span> : null}

						{bc.map((item, k) => {
							return (
								<span key={k}>
									<Tooltip placement="top" title={item.name} key={k}>
										<a href="javascript:;" onClick={() => this.toDoc(item)}>{item.name}</a>
									</Tooltip>
									{k == bc.length - 1 ? null : <span>></span>}
								</span>
							);
						})}
					</div>

					<div className="pb-set clearfix">
						<div className="pg-set-icon">
							<ProjectSortPannel {...this.props}/>
						</div>
						
						{currentProject && currentProject.type == 'admin' ? 
						<div className="pg-set-icon">
							{/* <ProjectSettingPannel /> */}
							<div className="project-setting-btn" onClick={this.showProjectSet}>
								<IconBlock iconName="setting.svg" direction="left" alt="项目设置" />
							</div>
						</div> : null}

						<div className="pg-set-icon" onClick={this.createFolder}>
							<IconBlock iconName="folder.svg" direction="left" alt="创建文件夹"></IconBlock>
						</div>
						
					</div>
				</header> : null}
				<section className="pb-body" style={{height: tabIndex == 0 ? 'calc(100vh - 64px - 50px - 50px)' : ''}}>
					{tabIndex == 0 ?
					<div className="pb-file-list" ref={node => this.filebodyNode = node} id="pb-body">
						{lookType == 'grid' ? 
						<FileGrid fileBodyClient={fileBodyClient}
						 {...this.props}
						 cancelUpload={this.cancelUpload}
						 uploadFail={this.uploadFail}
						 uploadFile={this.uploadFile}
						 />:
						<FileLi {...this.props} 
						cancelUpload={this.cancelUpload} 
						uploadFail={this.uploadFail}
						uploadFile={this.uploadFile}
						/>}
					</div>
					: null}

					{tabIndex == 1 ? <ProjectLink {...this.props}/> : null}		

					{tabIndex == 2 ? <ProjectLikeLink {...this.props}/> : null}	

					{tabIndex == 3 ? <ProjectApplication {...this.props}/> : null}	

					{tabIndex == 4 ? <ProjectNotice {...this.props}/> : null}	


					{isSharing ? 
					<div className="share-do">
						<span>已选中{selectFiles.length}项</span>
						<button className="share-do-cancel" onClick={this.cancelShare}>取消</button>
						<button className="share-do-sure" onClick={this.sureShare}>分享</button>
					</div> : null}

				</section>

				{/* <SaveModal {...this.props}/>  */}

			</div>
		);
	}
}

export default ProjectBody;
