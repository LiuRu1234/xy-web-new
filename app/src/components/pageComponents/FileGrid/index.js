import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import {Row, Col, Progress, Tooltip, Icon, Input, message} from 'antd';
import Image from '@CC/Image';
import { FileMorePannel, FolderMorePannel } from '@CCP/TooltipPannel';
import {size2Str, trigger, isIE, saveFid} from '@utils/utils';
import { routerRedux } from 'dva/router';
import CheckSVG from '../CheckSVG';
// import FileGridClone from './FileGridClone';
import UploadOSS from '@utils/uploadOSS';
import './index.scss';

const FILE_WIDTH = 240;

function closest(el, selector) {
    var matchesSelector = el.matches || el.webkitMatchesSelector || el.mozMatchesSelector || el.msMatchesSelector;

    while (el) {
        if (matchesSelector.call(el, selector)) {
            break;
        }
        el = el.parentElement;
    }
    return el;
}

class FileGrid extends PureComponent {
	constructor(props) {
        super(props);
        this.state = {
            uploadHover: false,
            scrubImgStyle: {},
            scrubHeadStyle: {},
            previewMoveItem: null,
            isDraging: false,  //处理视频图片拖动出现残影，增加一层透明遮罩覆盖
            dragEnterId: '',
            toolTipShow: false,
            dragingId: 0,
        };
    }

    needDragFile = null;   //被合并版本的文件
    needMergeFile = null;   //合并到版本的文件

    toFile = (id) => {
        if (!this.props.allowToFile) return;
        saveFid(id);

        this.props.dispatch(routerRedux.push({
            pathname: '/file',
            query: {},
        }));
        // this.props.dispatch(routerRedux.push({
        //     pathname: '/file',
        //     query: { f: id, p: this.props.projectActive},
        // }));
    }

    toDoc = (id) => {
        if (!this.props.allowToFile) return;

        this.props.dispatch({
            type: 'project/toDoc',
            payload: {
                project_id: this.props.projectActive,
                doc_id: id
            }
        });
        
        // this.props.dispatch(routerRedux.push({
        //     pathname: '/project',
        //     query: { d: id, p: this.props.projectActive},
        // }));
    }

    isOtherFile(file) {
        if (['video', 'audio', 'image'].indexOf(file.file_type) == -1 && ['doc', 'docx', 'rar', 'zip'].indexOf(file.ext) == -1) {
            return true;
        } else {
            return false;
        }
    }

    isOtherFile2(file) {
        if (['video', 'audio', 'image'].indexOf(file.file_type) == -1 && ['rar', 'zip'].indexOf(file.ext) == -1) {
            return true;
        } else {
            return false;
        }
    }

    selectUploadFiles = (e) => {
        e.stopPropagation();

        if(!!window.ActiveXObject || "ActiveXObject" in window){
			message.config({
                top: 10,
                duration: 3,
            });
            message.warning('推荐使用市面上主流浏览器进行操作（谷歌，火狐等）');
		}

        const {projectsList, projectActive} = this.props;
        
        let currentProject = projectsList.filter(item => item.id == projectActive)[0];
        if (currentProject.id.indexOf('D') > -1) {
            message.warning('演示项目不可上传，您可以创建新项目进行相关操作');
            return;
        }

        trigger(this.props.uploadInput, 'click');
    }
    
    uploadDragEnter = (e) => {
        if (this.state.dragingId != 0) {
            return;
        }
        if (e.target === e.currentTarget) {
            this.setState({uploadHover: true});
        }
    }

    uploadDragLeave = (e) => {
        if (e.target === e.currentTarget) {
            this.setState({uploadHover: false});
        }
    }

    uploadDrop = (e) => {
        e.preventDefault();
        if (this.state.dragingId != 0) {
            return;
        }
        const {uploadFiles, dispatch, docActive, uploadInput, projectsList, projectActive} = this.props;
        
        let currentProject = projectsList.filter(item => item.id == projectActive)[0];
        if (currentProject.id.indexOf('D') > -1) {
            message.warning('演示项目不可上传，您可以创建新项目进行相关操作');
            return;
        }
       
        const files = e.dataTransfer.files;
        if (files.length > 3){
            message.warning('最多同时上传三个文件');
            return;
        }
        if (!files.length) return false;

        dispatch({
            type: 'upload/addFiles',
            payload: {
                files,
                top_id: docActive,
                handleUpload: this.uploadFile
            }
        });        

        if (e.target === e.currentTarget) {
          this.setState({uploadHover: false});
        }

        return false;
    }

    onInputChange = (e) => {
        const {docActive, uploadInput} = this.props;
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
            }
        });
	}

    uploadFile = (clientConfig, uploadFile, objectKey) => {
       this.props.uploadFile(clientConfig, uploadFile, objectKey);
    }

    saveUploadNode = (uploadInput) => {
		this.props.dispatch({
			type: 'project/saveUploadInput',
			payload: uploadInput
		});
    }
    
    cancelUpload = (uploadNode) => {
        this.props.cancelUpload(uploadNode);
    }

    selectShareFiles = (file) => {
        this.props.dispatch({
            type: 'link/selectShareFiles',
            payload: file
        });
    }

    saveChangeNameId = (e, file) => {
        e.stopPropagation();
        this.props.dispatch({
            type: 'project/saveChangeNameFileId',
            payload: file.id
        });
    }

    changeFileName = (e) => {
        this.props.dispatch({
            type: 'project/changeFileName',
            payload: e.target.value
        });
    }

    getPositionInPreview = (e) => {
        const previewPos = e.target.getBoundingClientRect();
        const x = e.pageX - previewPos.left;
        const y = e.pageY - previewPos.top;
        return {x, y};
    }
      
    onPreviewMouseMove = (e, item) => {    
        e.stopPropagation();
        const left = this.getPositionInPreview(e).x;
        const width = 240;
        const progress = left / width;
        const top = -Math.round(progress * 50) *  135 + 'px';
        const scrubImgStyle = {
          display: 'block',
          top
        };
        const scrubHeadStyle = {
          display: 'block',
          left
        };
        this.setState({
          scrubImgStyle,
          scrubHeadStyle,
          previewMoveItem: item
        });
    }

    getFile = (e, item) => {
        if(this.state.toolTipShow) {return;}
        let left = e.pageX - 120;
        let top = e.pageY - 102;
        this.needDragFile = item;
        // this.setState({
        //     dragingId: item.id
        // });
        // ReactDOM.render(
        //     <FileGridClone item={item} left={left} top={top}/>,
        //     document.getElementById('drop')
        // );
    }

    setFileClonePos = (e, item) => {
        if(this.state.toolTipShow) {return;}
        let left = e.pageX - 120;
        let top = e.pageY - 102;
        // ReactDOM.render(
        //     <FileGridClone item={item} left={left} top={top}/>,
        //     document.getElementById('drop')
        // );
    }

    endDragEnd = (e, item) => {
        if(!this.state.isDraging || this.state.toolTipShow) {return;}
        this.setState({
            isDraging: false,
            dragEnterId: '',
            dragingId: 0
        });
        // ReactDOM.render(
        //     <div />,
        //     document.getElementById('drop')
        // );

        if ( this.needMergeFile.type == 'folder') {
            this.props.dispatch({
                type: 'project/moveFile',
                payload: {
                    dir_id: this.needMergeFile.id,
                    doc_ids: this.needDragFile.id
                }
            });
        } else {
            this.props.dispatch({
                type: 'project/mergeVersion',
                payload: {
                    base_file: this.needMergeFile.id,
                    new_files: this.needDragFile.id
                }
            });
        }

       
        this.needMergeFile = null;
        this.needDragFile = null;
    }
    
    getCurrentBaseVersion = (e, item) => {
        if(this.state.toolTipShow) return;
        this.needMergeFile = item;
        this.setState({
            dragEnterId: item.id
        });
    }

    setDraging = (isDraging, dragingId) => {
        this.setState({
            isDraging,
            dragingId
        });
    }

    setToolTipShow = (toolTipShow) => {
        this.setState({
            toolTipShow
        });
    }

    componentWillUnmount() {
        this.props.dispatch({
            type: 'project/saveChangeNameFileId',
            payload: null
        });

        // this.props.dispatch({
        //     type: 'project/saveBreadFiles',
        //     payload: {breadcrumb: [], fileList: []}
        // });
    }
    componentDidMount() {
        const _self = this;
        document.body.addEventListener('click', function(e) {
            if (e.target.className == 'change-name-input' || (e.target.tagName == 'INPUT' && e.target.className.indexOf('change-name') > -1)) {
                return;
            }

            _self.props.dispatch({
                type: 'project/saveChangeNameFileId',
                payload: null
            });
        });
    }

    render() {
        const {
            fileBodyClient, 
            fileList, 
            uploadFiles, 
            userInfo, 
            projectActive, 
            docActive, 
            uploadInput,
            uploadedFiles,
            selectFiles,
            isSharing,
            changeNameFileId
        } = this.props;

        let ColNum  = 6;
        if (fileBodyClient) {
            let w =  Math.floor(fileBodyClient.width / (FILE_WIDTH + 16));  
            ColNum = Math.ceil(24 / w);
        }

        if (ColNum == 5)  {
            ColNum = 6;
        }

        let uploadingFiles = [];
        let transcodeFiles = [];

        if(uploadFiles.length > 0) {
            uploadingFiles = uploadFiles.filter(item => uploadedFiles.indexOf(item.doc_id) == -1  && item.projectId == projectActive && item.topId == docActive && !item.baseId);
            transcodeFiles = uploadFiles.filter(item => uploadedFiles.indexOf(item.doc_id) > -1&& item.projectId == projectActive && item.topId == docActive && !item.baseId);
        } else {
            if (uploadInput) {
                    // 由于传相同文件导致不能传第二遍，所以这边处理上传所有之后将input 设为空方便触发onchange事件
                uploadInput.value = '';
            }
        }

        let isFolderNoImg = (img) => {
            return img != undefined && (img.indexOf('audio_icon.png') > -1 || img.indexOf('otherdoc_icon.png') > -1);
        };
        

        return (
            <Row gutter={16}>
            	{!isIE() ? 
                <input type='file'
                    ref={node => this.saveUploadNode(node) }
                    multiple
                    // accept='video/*,flv-application/*'
                    onChange={this.onInputChange}
                    style={{display: 'none'}}
                /> : null}
                {/* 上传块 */}
                <Col span={ColNum} className="file-grid">
                
                    {!isIE() ? 
                    <div className="file-grid-upload" 
                    style={{border: this.state.uploadHover ? '2px dashed #fff' : ''}}
                    onDragEnter={this.uploadDragEnter} 
                    onDragLeave={this.uploadDragLeave}  
                    onDragOver={e => { e.preventDefault();}} 
                    onDrop={this.uploadDrop}
                    >
                        <Image name="upload-grid.svg"></Image>
                        <p>拖拽或&nbsp;<a href="javascript:;" onClick={(e) => this.selectUploadFiles(e)}>选择</a>&nbsp;文件</p>
                    </div>:

                    <div className="file-grid-upload">
                         <Image name="upload-grid.svg"></Image>
                         <p>上传文件</p>
                        <input type="file"
                            ref={node => this.saveUploadNode(node) }
                            multiple
                            // accept='video/*,flv-application/*'
                            onChange={this.onInputChange}
                            className="grid-ie-file-input"
                        />
                    </div>}

                </Col>

                {/* 正在上传块 */}
                {uploadingFiles.map((item, k) => {
                    return (
                        <Col span={ColNum} className="file-grid" key={k}>
                            <div className="file-grid-body file-uploading">
                                <div className="file-upload-progress">
                                    <Progress type="circle" percent={parseInt(item.progress)}  width={100} strokeWidth={5} status="active"/>
                                </div>
        
                                <p className="file-upload-p1">正在上传...</p>
                                <p className="file-upload-p2">{item.name}</p>
                                
                                <Tooltip placement="bottom" title="取消上传">
                                    <button className="file-upload-cancel" onClick={() => this.cancelUpload(item)}>
                                        <Image name="upload-cancel.svg"/>
                                    </button>
                                </Tooltip>
                            </div> 
                        </Col>
                    );
                })}


                 {/* 文件处理块 */}
                 {transcodeFiles.map((item, k) => {
                    return (
                        <Col span={ColNum} className="file-grid" key={k}>
                            <div className="file-grid-body">
                                <div className="file-pre file-pre-txt">
                                    <p>文件处理中......</p>
                                    <div className="file-is-handle">
                                        <Icon type="loading" style={{ fontSize: 100, color: '#272C39' }} />
                                    </div>
                                </div>
                                <div className="file-des">
                                    <div className="file-des-content">
                                        <div className="file-tx">
                                            {userInfo.avatar != '' ? 
                                            <img src={userInfo.avatar} alt=""/> : 
                                            <span style={{background: userInfo.avatar_background_color}}>{userInfo.realname[0]}</span>}
                                        </div>
                                        <div className="file-des-body">
                                            <p className="file-des-name">{item.name}</p>
                                            <div className="file-des-footer">
                                                <div className="file-size">
                                                    <Image name="type_file2.svg"/>
                                                    <span>{size2Str(item.size)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
        
                                </div>
        
                            </div> 
                        </Col>
                    );
                })}
               
                {/* 文件 */}
                {fileList.map((item,k) => {
                    if (item.type == 'file'){
                        let statusColor = '', statusText = '';
                        let fileSelectCoverImg = item.cover_img[0];
                        let fileSelectCoverImgH = '';
            
                        if (item.cover_img.length == 0) {
                            if (item.file_type == 'audio') {
                                fileSelectCoverImg = 'mp3.svg';
                                fileSelectCoverImgH = 50;
                            }
    
                            if (['zip', 'rar'].indexOf(item.ext) > -1) {
                                fileSelectCoverImg = 'compress.svg';
                                fileSelectCoverImgH = 50;
                            }
    
                            if (this.isOtherFile2(item)) {
                                fileSelectCoverImg = 'ext.png';
                                fileSelectCoverImgH = 50;
                            }
                        }

                        switch (item.review) {
                            case 1:
                                statusColor = '#1DC0A6';
                                statusText = '审核通过';
                                break;
                            case 2:
                                statusColor = '#61CAFF';
                                statusText = '进行中';
                                break;
                            case 3:
                                statusColor = '#FF9658';
                                statusText = '待审核';
                                break;
                            case 4:
                                statusColor = '#D3B521';
                                statusText = '意见搜集完成';
                                break;
                        }

                        return (
                        <Col span={ColNum} className="file-grid" key={k}>
                            <div className="file-grid-body" style={{border: this.state.dragEnterId == item.id ? '1px solid #fff' : ''}}>
                                {isSharing ? 
                                <div className="file-select-cover"  draggable="true" onClick={() => this.selectShareFiles(item)}>
                                    {selectFiles.indexOf(item.id) > -1? 
                                    <CheckSVG /> :
                                    <div className="file-select-block">
                                    </div>}
                                </div> : null}
                                
                                <div
                                onDragStart= {(e) => {this.getFile(e, item);}}
                                onDragEnter= {(e) => this.getCurrentBaseVersion(e, item)}
                                onDrag={e => {this.setFileClonePos(e, item);}}
                                onDragEnd={(e) => { this.endDragEnd(e, item);}}
                                onDragLeave={e =>  this.setState({dragEnterId: null})}
                                onDragOver={e => e.preventDefault()}
                                onClick={() => this.toFile(item.new_id)} 
                                className="file-grid-content"
                                >    
                     
                                    {this.state.isDraging && this.state.dragingId == item.id?
                                    <div className="file-select-cover" draggable="true">
                                        {item.cover_img.length != 0 ? <img src={fileSelectCoverImg} alt=""/> : null}
                                        {item.cover_img.length == 0 ? <Image name={fileSelectCoverImg} style={{height: fileSelectCoverImgH + 'px'}}>  </Image> : null}
                                    </div> : null}
                                    {this.isOtherFile2(item)? 
                                    <div className="file-pre">
                                        {item.review > 0 ? <div className="file-status" style={{color: statusColor}}>{statusText}</div> : null}
                                        <div className="ext-block" style={{background: "url('ext.png')"}}>{item.ext}</div> 
                                        <FileMorePannel {...this.props} data={item} type='grid'setDraging={this.setDraging} setToolTipShow={this.setToolTipShow}/>       
                                        {item.versions.length > 0 ? <div className="version-tag"><p>{item.versions.length + 1}</p></div> : null}
                                        <div className="video-preview-cover" 
                                        onMouseDown={e => {this.setState({isDraging: true, dragingId: item.id});}}
                                        ></div> 
                                    </div>:
                                    <div className="file-pre">
                                        {item.review > 0 ? <div className="file-status" style={{color: statusColor}}>{statusText}</div> : null}
                                        {item.file_type == 'video' ? <img src={item.cover_img[0]} alt="" className="video-pre"/> : null}
                                        {item.file_type == 'image' ? <img src={item.cover_img[0]} alt="" className="image-pre"/> : null}
                                        {item.file_type == 'audio' ? <Image name="mp3.svg"/> :  null}
                                        {['zip', 'rar'].indexOf(item.ext) > -1 ? <Image name="compress.svg"/> : null}
                                        <FileMorePannel {...this.props} data={item} type='grid' setDraging={this.setDraging} setToolTipShow={this.setToolTipShow}/>       
                                        {item.versions.length > 0 ? <div className="version-tag"><p>{item.versions.length + 1}</p></div> : null}
                                       
                                        {item.file_type == 'video' && this.state.previewMoveItem && this.state.previewMoveItem.id == item.id ?
                                        <div className="video-preview">
                                            <img src={item.preview}  alt="" style={this.state.scrubImgStyle}/>
                                        </div> : null}
                                        {this.state.previewMoveItem && this.state.previewMoveItem.id == item.id ? <span style={this.state.scrubHeadStyle} className="video-preview-line"></span> : null}
                                         
                                        <div className="video-preview-cover" 
                                        onMouseDown={e => {this.setState({isDraging: true, dragingId: item.id});}}
                                        onMouseMove={e => {if (item.file_type != 'video') return ;this.onPreviewMouseMove(e, item);}} 
                                        onMouseLeave={e => this.setState({previewMoveItem: null})}
                                        ></div>
                                    </div>}

                                    <div className="file-des" onMouseDown={e => {this.setState({isDraging: true, dragingId: item.id});}}>
                                        <div className="file-des-content">
                                            <div className="file-tx">
                                                {item.user_info.avatar != '' ? 
                                                <img src={item.user_info.avatar} alt=""/> : 
                                                <span style={{background: item.user_info.avatar_background_color}}>{item.user_info.realname[0]}</span>}
                                            </div>
                                            <div className="file-des-body">
                                                {changeNameFileId == item.id ? 
                                                <div className="change-name-input">
                                                    <Input placeholder="" 
                                                    defaultValue={item.name} 
                                                    onClick={e => e.stopPropagation()} 
                                                    onPressEnter={this.changeFileName} 
                                                    onMouseDown={e => e.stopPropagation()}
                                                    className='change-name'
                                                    /> 
                                                </div>:
                                                <p className="file-des-name"  onMouseDown={e => e.stopPropagation()} onClick={e => this.saveChangeNameId(e, item)}>{item.name}</p>}
                                                <div className="file-des-footer">
                                                    {this.isOtherFile(item) ? 
                                                    <div className="file-size">
                                                        <Image name="type_file2.svg"/> 
                                                        <span>{size2Str(item.size)}</span>
                                                    </div>:
                                                    <div className="file-size">
                                                        {item.file_type == 'audio' ? <Image name="type_mp3.svg"/> :  null}
                                                        {item.file_type == 'video' ? <Image name="type_video.svg"/> : null}
                                                        {item.file_type == 'image' ? <Image name="type_pic.svg"/> : null}
                                                        {['zip', 'rar'].indexOf(item.ext) > -1 ? <Image name="type_compress.svg"/> : null}
                                                        {['doc', 'docx'].indexOf(item.ext) > -1 ? <Image name="type_file.svg"/> : null}
                                                        <span>{size2Str(item.size)}</span>
                                                    </div>}
                                                    <div className="file-comment">
                                                        <Image name="type_comment.svg"/>
                                                        <span>{item.comment_count}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </Col>
                        );
                    } else {
                        {/* 文件夹 */}
                        return (
                            <Col span={ColNum} className="file-grid" key={k} > 
                                <div className="file-grid-body"  
                                style={{
                                    border: this.state.dragEnterId == item.id ? '1px solid #fff' : '',
                                }}>
                                    {isSharing ? 
                                    <div className="file-select-cover" onClick={() => this.selectShareFiles(item)}>
                                        {selectFiles.indexOf(item.id) > -1 ? 
                                        <CheckSVG /> :
                                        <div className="file-select-block">
                                        </div>}
                                    </div> : null}
                                    <div className="file-grid-content"
                                        onClick={() => this.toDoc(item.id)} 
                                        onDragEnter= {(e) => {this.getCurrentBaseVersion(e, item);}}
                                    >
                                        {/* {this.state.isDraging ?
                                        <div className="file-select-cover"  draggable="true">
                                        </div> : null} */}
                                        <div className="folder-top clearfix">
                                            <div className="folder-img-left">
                                                <img src={item.cover_img[0]} alt="" 
                                                style={{height: item.cover_img.length > 0 && isFolderNoImg(item.cover_img[0]) ? '50px' : ''}}
                                                />
                                            </div>
                                            <div className="folder-img-right clearfix">
                                                <div className='folder-img-two'>
                                                    <img src={item.cover_img[1]} alt=""
                                                     style={{height: item.cover_img.length > 0 && isFolderNoImg(item.cover_img[1]) ? '30px' : ''}}
                                                    />
                                                </div>
                                                <div className='folder-img-three'>
                                                    <img src={item.cover_img[2]} alt=""
                                                     style={{height: item.cover_img.length > 0 && isFolderNoImg(item.cover_img[2]) ? '30px' : ''}}
                                                    />
                                                </div>
                                            </div>
                                            <FileMorePannel {...this.props} data={item} type='grid' setToolTipShow={this.setToolTipShow} setDraging={this.setDraging}/>  
                                        </div> 

                                        <div className="file-des">
                                            <div className="file-des-content">
                                                <div className="file-tx">
                                                    {item.user_info.avatar != '' ? 
                                                    <img src={item.user_info.avatar} alt=""/> : 
                                                    <span style={{background: item.user_info.avatar_background_color}}>{item.user_info.realname[0]}</span>}
                                                </div>
                                                <div className="file-des-body">
                                                    {changeNameFileId == item.id ? 
                                                    <div className="change-name-input">
                                                        <Input placeholder=""
                                                        defaultValue={item.name} 
                                                        onClick={e => e.stopPropagation()} 
                                                        onPressEnter={this.changeFileName} 
                                                        onMouseDown={e => e.stopPropagation()}
                                                        className='change-name'
                                                        /> 
                                                    </div>:
                                                    <p className="file-des-name"  onClick={e => this.saveChangeNameId(e, item)}>{item.name}</p>}
                                               
                                                    <div className="file-des-footer">
                                                        <div className="file-size">
                                                            <Image name="type_folder.svg"/>
                                                            <span>{size2Str(item.size)}</span>
                                                        </div>
                                                        <div className="file-comment">
                                                            <Image name=""/>
                                                            <span>{item.file_count}项</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        );
                    }
                })}


            </Row>
        );
    }
}

export default FileGrid;