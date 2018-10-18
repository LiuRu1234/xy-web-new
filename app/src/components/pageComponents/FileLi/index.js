import React, { PureComponent } from 'react';
import {Row, Col, Progress, Tooltip, Icon, message} from 'antd';
import { routerRedux } from 'dva/router';
import LazyLoad from 'react-lazy-load';

import Image from '@CC/Image';
import IconBlock from '@CC/IconBlock';
import { FileMorePannel, FolderMorePannel } from '@CCP/TooltipPannel';

import CheckSVG from '../CheckSVG';

import {getLocalTime, size2Str, trigger, isIE} from '@utils/utils';
import UploadOSS from '@utils/uploadOSS';
import {FILE_STATUS} from '@config/constants';
import {recordPageStart, pageStayStorage} from '@APP_BRO/burying_point/local_record';
import {PAGE_TYPES} from '@APP_BRO/burying_point/constants';

import './index.scss';


class FileLi extends PureComponent {
	constructor(props) {
        super(props);
        this.state = {
            uploadHover: false
        };
    }

    saveUploadNode = (uploadInput) => {
		this.props.dispatch({
			type: 'project/saveUploadInput2',
			payload: uploadInput
		});
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

        trigger(this.props.uploadInput2, 'click');
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
                handleUpload: this.uploadFile
            }
        });
    }

    uploadDragEnter = (e) => {
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

        const {uploadFiles, dispatch, docActive, uploadInput, projectsList, projectActive} = this.props;

        let currentProject = projectsList.filter(item => item.id == projectActive)[0];
        if (currentProject.id.indexOf('D') > -1) {
            message.warning('演示项目不可上传，您可以创建新项目进行相关操作');
            return;
        }
        
        const files = e.dataTransfer.files;
        if (files.length > 3) {
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
    
    uploadFile = (clientConfig, uploadFile, objectKey) => {
        this.props.uploadFile(clientConfig, uploadFile, objectKey);
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

    toFile = (id) => {
        if (!this.props.allowToFile) return;
        saveFid(id);
        this.props.dispatch({
			type: 'price/handleWarning',
			payload: {}
        });

        this.props.dispatch(routerRedux.push({
            pathname: '/file',
            query: {},
        }));
    
    }

    toDoc = (id) => {
        if (!this.props.allowToFile) return;

        this.props.dispatch({
			type: 'price/handleWarning',
			payload: {}
        });
        
        this.props.dispatch({
            type: 'project/toDoc',
            payload: {
                project_id: this.props.projectActive,
                doc_id: id
            }
        });

    }

    componentDidMount() {
        recordPageStart(PAGE_TYPES[1]);
    }

    componentWillUnmount() {
        pageStayStorage();
    }

    render() {
        const {
            fileList, 
            uploadFiles,
            userInfo, 
            projectActive,
            docActive, 
            uploadInput, 
            uploadedFiles, 
            isSharing,
            selectFiles
        } = this.props;

        let uploadingFiles = [];
        let transcodeFiles = [];

        if(uploadFiles.length > 0) {
            uploadingFiles = uploadFiles.filter(item => uploadedFiles.indexOf(item.doc_id) == -1 && item.projectId == projectActive && item.topId == docActive && !item.baseId);
            transcodeFiles = uploadFiles.filter(item => uploadedFiles.indexOf(item.doc_id) > -1 && item.projectId == projectActive && item.topId == docActive && !item.baseId);
        }


        let renderCoverImg = (item) => {
            let cover_img = <div className="file-li-img-body">{item.ext}</div>;
            if (item.cover_img.length > 0){
                cover_img =  <img src={item.cover_img[0]} alt=""/>;
            }

            if (item.file_type == 'audio') {
                cover_img = <div style={{width: '30px',height: '30px'}}><Image name="mp3.svg"/></div> ;
            }

            if (['zip', '7z', 'rar'].indexOf(item.ext) > -1) {
                cover_img = <div style={{width: '30px',height: '30px'}}><Image name="compress.svg"/></div> ;
            }
            return cover_img;
        };

        return (
            <div className="file-li">
            	{!isIE() ?
                <input type='file'
						ref={node => this.saveUploadNode(node) }
						multiple
						// accept='video/*,flv-application/*'
						onChange={this.onInputChange}
						style={{display: 'none'}}
                /> : null}
                <ul>
                    {/* 上传块 */}
                    <li style={{border: this.state.uploadHover ? '2px dashed #fff' : ''}}>
                    
                        {!isIE() ?
                        <div className="file-li-content"
                              onDragEnter={this.uploadDragEnter} 
                              onDragLeave={this.uploadDragLeave}  
                              onDragOver={e => { e.preventDefault();}} 
                              onDrop={this.uploadDrop}
                        >
                            {/* <input type="file" style={{display: 'none'}}/> */}
                            <div className="file-li-upload-icon">
                                <Image name="upload-li.svg" />
                            </div>
                            <span className="file-li-upload-p1">拖拽或 <a href="javascript:;"  onClick={(e) => this.selectUploadFiles(e)}>选择</a> 文件</span>   
                        </div>:
                        <div className="file-li-content">
                            <div className="file-li-upload-icon">
                                <Image name="upload-li.svg" />
                            </div>
                            <span className="file-li-upload-p1">上传文件</span>  
                            <input type='file'
                                ref={node => this.saveUploadNode(node) }
                                multiple
                                // accept='video/*,flv-application/*'
                                onChange={this.onInputChange}
                                className="grid-ie-file-input"
                            />
                        </div>}
                       
                    </li>

                    {/* 正在上传 */}
                    {uploadingFiles.map((item, k) => {
                        return (
                        <li key={k}>
                            <Row>
                                <Col span={16}  className="file-li-des">
                                    <div className="file-li-img is-uploading">
                                        <Progress type="circle" percent={parseInt(item.progress)} width={35} />
                                    </div>
                                    <div className="file-li-des-content">
                                        <p>{item.name}</p>
                                        <p>正在上传...</p>
                                    </div>
                                </Col>
                                <div className="file-upload-cancel">
                                    <Tooltip placement="top" title="取消上传">
                                        <button  onClick={() => this.cancelUpload(item)}>
                                            <Image name="upload-cancel.svg"/>
                                        </button>
                                    </Tooltip>
                                </div>
                            </Row>
                        </li>
                        );
                    })}

                    {/* 文件处理 */}
                    {transcodeFiles.map((item, k) => {
                        return (
                        <li key={k}>
                            <Row>
                                <Col span={16}  className="file-li-des">
                                    <div className="file-li-img is-handle">
                                        <p>文件处理中...</p>
                                        <div className="is-handle-icon"><Icon type="loading" style={{ fontSize: 20, color: '#323745' }}/></div>
                                    </div>
                                    <div className="file-li-des-content is-folder">
                                        <p>{item.name}</p>
                                    </div>
                                </Col>
                            </Row>
                        </li>
                        );
                    })}

                    {fileList.map((item,k) => {
                         if (item.type == 'file'){
                            {/* 文件 */}
                            let status_text;
                            if (item.review == 0 ) {
                                status_text = '-';
                            } else {
                                let status = FILE_STATUS.filter(it => it.review == item.review)[0];
                                status_text = status.text;
                            }

                            return (
                                <li key={k}>
                                    {isSharing ? 
                                    <div className="file-select-cover" onClick={() => this.selectShareFiles(item)}>
                                        {selectFiles.indexOf(item.id) > -1 ? <CheckSVG /> :<div className="file-select-block"></div>}
                                    </div> : null}
                                    <LazyLoad height={64} offsetVertical={300}>
                                    <Row className="file-li-complete" onClick={() => this.toFile(item.new_id)}>
                                        <Col span={8}  className="file-li-des">
                                            <div className="file-li-img">
                                                {renderCoverImg(item)}
                                            </div>
                                            <div className="file-li-des-content">
                                                <p>{item.name}</p>
                                                <p>V{item.versions.length + 1}</p>
                                            </div>
                                        </Col>
            
                                        <Col span={3}  className="file-li-status">
                                            {status_text}
                                        </Col>
            
                                        <Col span={5}  className="file-li-create">
                                            {item.user_info.avatar != '' ?
                                            <div className="file-li-tx">
                                                <img src={item.user_info.avatar} alt=""/>
                                            </div>:
                                            <div className="file-li-tx">
                                                <span style={{background: item.user_info.avatar_background_color}}>{item.user_info.realname[0]}</span>
                                            </div>}
                                          
                                            <p>上传于{getLocalTime(item.created_at)}</p>
                                        </Col>
                                        <Col span={4}  className="file-li-comment">
                                            {item.comment_count}条评论
                                        </Col>
                                        <Col span={3}  className="file-li-size">
                                            {size2Str(item.size)}
                                        </Col>
                                        
            
                                        <Col span={1}  className="file-li-set">
                                            <Tooltip placement="left" title="设置">
                                                <FileMorePannel {...this.props} data={item} type='li'/>       
                                            </Tooltip>
                                        </Col>
                                        
                                    </Row>
                                    </LazyLoad>
                                </li>
                            );
                         } else {
                            {/* 文件夹 */}
                             return (
                                <li key={k}>
                                    {isSharing ? 
                                    <div className="file-select-cover" onClick={() => this.selectShareFiles(item)}>
                                        {selectFiles.indexOf(item.id) > -1 ? <CheckSVG /> :<div className="file-select-block"></div>}
                                    </div> : null}
                                    <LazyLoad height={64} offsetVertical={300}>
                                    <Row className="file-li-complete" onClick={() => this.toDoc(item.id)} >
                                        <Col span={8}  className="file-li-des">
                                            <div className="file-li-img">
                                                <Image name="folder_li.svg"></Image>
                                            </div>
                                            <div className="file-li-des-content is-folder">
                                                <p>{item.name}</p>
                                            </div>
                                        </Col>
            
                                        <Col span={3}  className="file-li-status">
                                            {/* 意见搜集完成 */}
                                            -
                                        </Col>
            
                                        <Col span={5}  className="file-li-create">
                                            {item.user_info.avatar != '' ?
                                            <div className="file-li-tx">
                                                <img src={item.user_info.avatar} alt=""/>
                                            </div>:
                                            <div className="file-li-tx">
                                                <span style={{background: item.user_info.avatar_background_color}}>{item.user_info.realname[0]}</span>
                                            </div>}
                                          
                                            <p>创建于{getLocalTime(item.created_at)}</p>
                                        </Col>
                                        <Col span={4}  className="file-li-comment">
                                            {/* {item.comment_count}条评论 */}
                                            -
                                        </Col>
                                        <Col span={3}  className="file-li-size">
                                            {size2Str(item.size)}
                                        </Col>
                                        
            
                                        <Col span={1}  className="file-li-set">
                                            <Tooltip placement="left" title="设置">
                                                <FileMorePannel {...this.props} data={item} type='li'/>       
                                            </Tooltip>
                                        </Col>
                                        
                                    </Row>
                                    </LazyLoad>
                                </li>
                             );
                         }
                    })}
                   

                </ul>
            </div>
        );
    }
}

export default FileLi;