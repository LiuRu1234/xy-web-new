import React, { PureComponent } from 'react';
import {Tooltip, Checkbox, message} from 'antd';

import Image from '@CC/Image';
import IconBlock from '@CC/IconBlock';
import Modal from '@CC/Modal';

import {FileStatusPannel, FileVersionsPannel} from '@CCP/TooltipPannel';

import PlayerBody from '@CPC/PlayerBody';
import PlayerControl from '@CPC/PlayerControl';
import ShareModal from '@CPC/ShareModal';
import SaveModal from '@CPC/SaveModal';

import {timeToMS, isIE} from '@utils/utils';
import UploadOSS from '@utils/uploadOSS';

import './index.scss';


class FilePlayer extends PureComponent{

	drawTypes = ['pen', 'rect', 'arrow'];
	drawColors = ['#E74A3C', '#E67422', '#1ABCA1', '#34A3DB'];

	constructor(props){
		super(props);
		this.state = {
			checked: false,
			videoShow: false
		};
	}

	savePlayerBody(node) {
		this.props.dispatch({
			type: 'playerControl/savePlayerBody',
			payload: node	  
		});	
	}

	componentWillUnmount() {
		this.props.dispatch({
			type: 'comment/saveCommentProp',
			payload: {
				commentPage: 1, 
				commentSort: 1, 
				commentShowCompleted: 0,
				commentQuery: ''
			}
		});
		this.props.dispatch({
			type: 'playerControl/initControl',
			payload: {}
		});

		this.props.dispatch({
			type: 'comment/init',
			payload: {}
		});

		this.props.dispatch({
			type: 'file/init',
			payload: {}
		});

	}

	componentDidMount() {
		this.setState({
			videoShow: true
		});
		// setTimeout(() => {
		// 	this.props.dispatch({
		// 		type: 'playerControl/getPlayerHeight',
		// 		payload: {}
		// 	});	
			// this.setState({
			// 	videoShow: true
			// });
		// }, 500);

		this.props.dispatch({
			type: 'playerControl/getPlayerHeight',
			payload: {}
		});

		setTimeout(() => {
			this.setPlayer(document.getElementById('video-audio'));
			
			this.listenEvent();
        }, 100);
		
	}

	changeDrawType = (drawTypeActive) => {
		this.props.dispatch({
			type: 'playerControl/setIsDrawing',
			payload: drawTypeActive
		});
	}

	changeDrawColor = (colorActive) => {
		this.props.dispatch({
			type: 'playerControl/saveColorActive',
			payload: colorActive
		});
	}

	toggleTime(e) {
		const {filePlayer} = this.props;

		this.props.dispatch({
			type: 'playerControl/saveNeedTime',
			payload:  e.target.checked ? 0 : -1
		});

		if ( e.target.checked) {
			filePlayer.pause();
			this.props.dispatch({
				type: 'playerControl/savePaused',
				payload:  true
			});
		}
		
	}

	showProjectShare = () => {
		
		const {fileInfo, isFilesShare} = this.props;
		//判断是否分享的文件
		if (isFilesShare) {
			this.props.dispatch({
				type: 'link/saveCreatedLinkModalShow',
				payload: true
			});
		} else {
			this.props.dispatch({
				type: 'link/saveCreateOrChange',
				payload: 'create' 
			});
			this.props.dispatch({
				type: 'link/showProjectShare',
				payload: {
					doc_id: fileInfo.id,
					doc_name: fileInfo.name
				}
			});
		}

	}

	toggleDownloadModal = (downloadShow) => {
		const {projectsList, projectActive, isFilesShare} = this.props;

		if(!isFilesShare && downloadShow) {
			let currentProject = projectsList.filter((item) => {
				return item.id == projectActive;
			})[0];

			if (currentProject.collaborator_download == 0) {
				message.warning('请在项目设置里打开“可下载媒体”');
				return;
			}
		}

		this.props.dispatch({
			type: 'file/saveDownloadShow',
			payload: downloadShow	 
		});

		this.props.dispatch({
			type: 'global/getDownload',
			payload: this.props.fileInfo.id
		});
		
		// this.props.dispatch({
		// 	type: 'file/getDownload',
		// 	payload: this.props.fileInfo.id	
		// })
	}

    toggleSaveFileModal(saveFileModalShow) {
		this.props.dispatch({
			type: 'project/saveSaveFileModalShow',
			payload: saveFileModalShow	 
		});
	}

	drawBackRecover = (back) => {
		this.props.dispatch({
			type: 'playerControl/backRecoverDraw',
			payload: back	 
		});
	}

	changeCommentInput = (e) => {
		if (e.target.value != '') {
			this.props.dispatch({
				type: 'playerControl/saveNeedTime',
				payload: 0
			});

			this.props.filePlayer.pause();
			this.props.dispatch({type: 'playerControl/savePaused', payload: true});
		}
		
		this.props.dispatch({
			type: 'playerControl/saveCommentText',
			payload: e.target.value	 
		});

	
	}

	sendComment = () => {
		this.props.dispatch({
			type: 'playerControl/sendComment',
			payload: {} 
		});
	}

    onInputChange = (e) => {
		const {uploadInput3, docActive, fileInfo} = this.props;
		if (e.target.files.length > 3) {
            message.warning('最多同时上传三个文件');
            return;
        }
		this.props.dispatch({
			type: 'upload/addFiles',
			payload: {
                files: e.target.files,
                top_id: docActive,
				handleUpload: this.uploadFile,
				baseId: fileInfo.id
            }
        });
	}
	
	uploadFile = (clientConfig, uploadFile, objectKey) => {
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
						dispatch({type: 'upload/handleUploadedFile', payload: {objectKey, doc_id: uploadFile.doc_id, t,  uploadItem: uploadFile }});
					}, 1000);
				},
				progressEvent(progress, checkpoint, uploadClient){

					// console.log(progress, checkpoint, uploadClient, 'progress, checkpoint, uploadClient');
					// let uf = JSON.parse(JSON.stringify(_self.props.uploadFiles));
					let uf = window.uploadFiles;
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
					let name = currentUpload.name.length > 15 ? currentUpload.name.substr(0, 10) + '...' + currentUpload.name.substr(-5): currentUpload.name;

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
						// console.log(uploadFile.file);
						let uf = JSON.parse(JSON.stringify(_self.props.uploadFiles));
						let currentUpload = uf.filter(item => item.object_key == objectKey)[0];
						// console.log(currentUpload.checkpoint, uploadFile.file, 'uploadFile.file');
						currentUpload.checkpoint.file = uploadFile.file;

						if (uploadFile.file != undefined) {
							currentUpload.checkpoint.file = uploadFile.file;
							done(currentUpload.checkpoint);
						} else {
							let newUploadFile = _self.props.uploadFiles.filter(item => item.object_key != objectKey);
							_self.props.dispatch({type: 'upload/saveUploadFiles', payload: newUploadFile});
							return;
						}
						upload(currentUpload.checkpoint);  
					}, 3000);
				}
			});
		};

		upload();
	}
	
	cancelUpload = (uploadNode) => {
		const _self = this;
		let un = () => {
			let currentUpload = _self.props.uploadFiles.filter(item => item.object_key == uploadNode.object_key)[0];
			let name = currentUpload.name.length > 15 ? currentUpload.name.substr(0, 10) + '...' + currentUpload.name.substr(-5) : currentUpload.name;
            let newUploadFile = this.props.uploadFiles.filter(item => item.doc_id != uploadNode.doc_id);
			this.props.dispatch({type: 'upload/saveUploadFiles', payload: newUploadFile});
			return name;
		};

		if (uploadNode.uploadClient.abortMultipartUpload == undefined) {
			message.warning('取消上传失败');
			return;
		}

		let abortUpload = () => {
			uploadNode.uploadClient.abortMultipartUpload(uploadNode.object_key, uploadNode.uploadId).then((a) => {
				uploadNode.uploadClient.listUploads().then((b) => {
					let uploadId = b.uploads.filter(item => item.uploadId == uploadNode.uploadId);
					if (uploadId.length > 0) {
						abortUpload();
						return;
					}
					let name = un();
					message.warning(name + '--已取消上传，请重新上传');
				});
			}, (a) => {
				message.warning('取消失败');
				// abortUpload();
			});
		};
		abortUpload();
    }

	saveUploadNode = (uploadInput) => {
		this.props.dispatch({
			type: 'file/saveUploadInput3',
			payload: uploadInput
		});
	}

	setPlayPause = () => {
		const {filePlayer, paused, dispatch, fileInfo} = this.props;
		if (fileInfo.file_type == 'audio') {
			if (paused) {
				filePlayer.play();
				dispatch({
					type: 'playerControl/savePaused',
					payload: false
				});
			} else {
				filePlayer.pause();
				dispatch({
					type: 'playerControl/savePaused',
					payload: true
				});
			}
		}
      
    }

	renderDownloadFooter = () => {
		return (
			<div className="file-download-footer">
				<button onClick={() => this.toggleDownloadModal(false)}>关闭</button>
			</div>
		);
	}

	setPlayer = (node) => {
		const _self = this;
        _self.props.dispatch({
            type: 'playerControl/saveFilePlayer',
            payload: node
        });   
		if (!_self.props.filePlayer) return;

		// 这边再获取一下视频时间，防止不准问题
        _self.props.filePlayer.addEventListener('canplay', (e) => {
            _self.props.dispatch({
                type: 'playerControl/saveFilePlayerTime',
                payload: e.target.duration
            });   
        });
	}
	
	download = (url) => {

	}


	listenEvent = () => {
		const {filePlayer, dispatch, progressBody} = this.props;

		if (!filePlayer) {return;}
		filePlayer.pause();
		dispatch({
            type: 'playerControl/saveProgressWidth',
            payload: 0,
		});


		filePlayer.addEventListener("timeupdate", (e) => {
			dispatch({
				type: 'playerControl/saveProgressTime',
				payload: e.target.currentTime,
			});
			let progress = e.target.currentTime / e.target.duration;
			let width = progress * progressBody.getBoundingClientRect().width;

			dispatch({
				type: 'playerControl/saveProgressWidth',
				payload: width,
			});

			dispatch({
				type: 'playerControl/saveProgress',
				payload: progress,
			});

		});

		filePlayer.addEventListener("ended", (e) => {
			dispatch({
				type: 'playerControl/playerPlayOrPause',
				payload: {},
			});
		});

		filePlayer.addEventListener("play", e => {
			dispatch({
				type: 'playerControl/saveCommentDrawObj',
				payload: [],
			});
		});
		
	}

  	render() {
		const {
			videoWH, 
			downloadShow,
			drawTypeActive, 
			colorActive,
			needTime, 
			progressTime,
			commentText,
			shareReview,
			shareShowAllVersion,
			shareDownload,
			isFilesShare,
			fileInfo,
			playerLoop,
			downloadUrl
		} = this.props;
		const {checked, videoShow} = this.state;
		let playerBody = 
				<div className="fps-body"
						style={{
						height: videoWH.h + 'px'
						}}
					>
					<div className="fps-body-center">
						{fileInfo && fileInfo.ext}
					</div>
				</div>;
		if (fileInfo && fileInfo.file_type == 'video') {
			playerBody = <PlayerBody {...this.props} videoShow={videoShow} savePlayerBody={(node) => this.savePlayerBody(node)}/>;
		}

		if (fileInfo && fileInfo.file_type == 'audio') {
			playerBody = 
			<div className="fps-body"
				style={{
				height: videoWH.h + 'px'
				}}
				// ref={node => this.savePlayerBody(node)}
				onClick={() => this.setPlayPause()}
			>
				<audio src={fileInfo && fileInfo.resolution[0].src}
				// ref={node => this.setPlayer(node)}
				id="video-audio"
				loop={playerLoop} style={{display: 'none'}}
				></audio>

				<Image name="mp3_big.svg"></Image>
			</div>;
		}


		if (fileInfo && fileInfo.file_type == 'image') {
			playerBody = 
			<div className="fps-body"
				style={{
				height: videoWH.h + 'px'
				}}
			>
				<img src={fileInfo.cover_img[0]} alt="" style={{width: 'auto', height: '100%'}}/>
			</div>;
		}

		if (fileInfo && ['zip','7z', 'rar'].indexOf(fileInfo.ext) > -1) {
			playerBody = 
			<div className="fps-body"
				style={{
				height: videoWH.h + 'px'
				}}
			>
				<Image name="compress_big.svg"></Image>
			</div>;
		}
		let source = downloadUrl.filter(item => item.resolution == 'source')[0];
		let download = downloadUrl.filter(item => item.resolution != 'source');

		return (
			<div className="file-player-container">
				{!isIE()?
				<input type='file'
						ref={node => this.saveUploadNode(node) }
						multiple
						// accept='video/*,flv-application/*'
						onChange={this.onInputChange}
						style={{display: 'none'}}
                /> : null}
				<header className="file-player-header clearfix">
					{((isFilesShare && shareReview) || !isFilesShare) ? <FileStatusPannel {...this.props}/> : null}
					
					{((isFilesShare && shareShowAllVersion) || !isFilesShare) ?
					<div className="file-versions" id="file-versions">
						<FileVersionsPannel {...this.props} 
							listenEvent={this.listenEvent} 
							cancelUpload={this.cancelUpload} 
							uploadFile={this.uploadFile}
							saveUploadNode={this.saveUploadNode}
							onInputChange={this.onInputChange}
						/>
					</div> : null}

					<div className="file-other-do clearfix">
					
						<div className="file-other-do-block" onClick={() => this.showProjectShare()} id="file-share">
							<Image name="file-share.svg" />
							分享
						</div>

						{((isFilesShare && shareDownload) || !isFilesShare) ? 
					
						<div className="file-other-do-block" onClick={() => this.toggleDownloadModal(true)}>
							<Image name="file-download.svg" />
							高速下载
						</div>
						: null}

						{!isFilesShare ? 
						<div className="file-other-do-block" onClick={() => this.toggleSaveFileModal(true)}>
							<Image name="file-save.svg" />
							另存为
						</div>
						: null}
					</div>
				</header>

				
				<section className="file-player-section" id="file-player-section">
					<div ref={node => this.savePlayerBody(node)} style={{width: '100%'}}>
						{playerBody}
					</div>

					{/* 控制器模块 */}
					{fileInfo && ['video', 'audio'].indexOf(fileInfo.file_type) > -1 ? <PlayerControl {...this.props} listenEvent={this.listenEvent}/> : null}
				</section>

				<footer className="file-player-footer">
					{/* 画图工具模块 */}
					{fileInfo && ['video', 'audio'].indexOf(fileInfo.file_type) > -1 ? 
					<div className="fpt-draw clearfix" id="fpt-draw">
						<ul className="fpt-draw-type clearfix">
							{this.drawTypes.map((item, k) => {
								return (
									<li onClick={() => this.changeDrawType(item)} key={k}>
										<div>
											<Image name={drawTypeActive == item ? item + "-active.svg" : item + ".svg"} />
										</div>
									</li>
								);
							})}
						</ul>
						
						<ul className="fpt-draw-color clearfix">
							<li className={colorActive == '#E74A3C' ? "ftp-draw-color-active" : ''} onClick={() => this.changeDrawColor('#E74A3C')}><div></div></li>
							<li className={colorActive == '#E67422' ? "ftp-draw-color-active" : ''} onClick={() => this.changeDrawColor('#E67422')}><div></div></li>
							<li className={colorActive == '#1ABCA1' ? "ftp-draw-color-active" : ''} onClick={() => this.changeDrawColor('#1ABCA1')}><div></div></li>
							<li className={colorActive == '#34A3DB' ? "ftp-draw-color-active" : ''} onClick={() => this.changeDrawColor('#34A3DB')}><div></div></li>
						</ul>
						
						<ul className="fpt-draw-other-do clearfix">
							<li onClick={() => this.drawBackRecover(true)}><Tooltip placement="top" title="撤销上一步"><div><Image name="back-draw.svg" /></div></Tooltip></li>
							<li onClick={() => this.drawBackRecover(false)}><Tooltip placement="top" title="恢复撤销"><div><Image name="go-draw.svg" /></div></Tooltip></li>
						</ul>
					</div> : null}

					{/* 评论模块 */}
					<div className="fpt-commet clearfix">
						{/* 输入框 */}
						<div className="fpt-input clearfix" style={{paddingRight: fileInfo && ['video', 'audio'].indexOf(fileInfo.file_type) == -1 ? 0 : ''}}>
							<input 
							type="text" 
							placeholder="留下你的评论..." 
							value={commentText} 
							onInput={(e) => this.changeCommentInput(e)}
							/>

							{/* 时间块 */}
							{fileInfo && ['video', 'audio'].indexOf(fileInfo.file_type) > -1 ? 
							<div className="fpt-time">
								<Tooltip placement="top" title="是否需要时间">
									<div className="fpt-time-body">
										<IconBlock iconName="comment-time.svg" direction="left"/>
										<span>{timeToMS(progressTime)}</span>
										<Checkbox checked={needTime == -1 ? false : true} onChange={(e) => {e.stopPropagation();this.toggleTime(e);}}></Checkbox>
									</div>
								</Tooltip>
							</div> : null}
						</div>
						
						{/* 发送按钮 */}
						<div className="ftp-send">
							<button onClick={() => this.sendComment()}>发送</button>
						</div>
					</div>
				</footer>

				<ShareModal {...this.props}/>
				<Modal visible={downloadShow}
                    title="下载"
					onClose={() => this.toggleDownloadModal(false)}
					footer={this.renderDownloadFooter()}
                    >
                    <div className="file-download">
						<p className="file-download-title">原始文件</p>
						<Tooltip placement="top" title="点击/右击保存">
							<div>
								<a href={source && source.url} download={source && source.name} target="_blank" >{source && source.name}</a>
							</div>
						</Tooltip>
						{download.length > 0 ? <p className="file-download-title">其他</p> : null}
						{download && download.map((item, k) => {
							return (
								<Tooltip placement="top" title="点击/右击保存" key={k}>
									<div>
										<a href={item.url} target="_blank" download={item.name}>{item.name}</a>
									</div>
								</Tooltip>
							);
						})}
						
                    </div>
                </Modal>

				<SaveModal {...this.props}/>
			</div>
		);
  	}
}

export default FilePlayer;
