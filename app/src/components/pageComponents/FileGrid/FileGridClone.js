import React, { PureComponent } from 'react';
import {Row, Col, Progress, Tooltip, Icon, Input} from 'antd';
import Image from '../../common/Image/Image';
import { FileMorePannel, FolderMorePannel } from '../../commonPannel/TooltipPannel/TooltipPannel.js';
import {size2Str, trigger} from '../../../utils/utils';
import { routerRedux } from 'dva/router';
import CheckSVG from '../CheckSVG';
import UploadOSS from '../../../utils/uploadOSS';
import './FileGrid.scss';


export default class FileGridClone extends PureComponent {
	constructor(props) {
        super(props);
        this.state = {
            uploadHover: false,
            scrubImgStyle: {},
            scrubHeadStyle: {},
            previewMoveItem: null,
            isDraging: false
        };
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

    render() {
        const {
            left,
            top,
            item
        } = this.props;

        return (
            <div className="drag-div" style={{left: left + 'px', top: top + 'px'}}>   
            <div style={{position: 'relative'}}>
            <div className="file-grid-body">
                <div className="file-grid-content">    
                    {this.isOtherFile2(item)? 
                    <div className="file-pre">
                        {item.review > 0 ? <div className="file-status" style={{color: statusColor}}>{statusText}</div> : null}
                        <div className="ext-block" style={{background: "url('ext.png')"}}>{item.ext}</div> 
                        {item.versions.length > 0 ? <div className="version-tag"><p>{item.versions.length + 1}</p></div> : null}
                    </div>:
                    <div className="file-pre">
                        {item.review > 0 ? <div className="file-status" style={{color: statusColor}}>{statusText}</div> : null}
                        {item.file_type == 'video' ? <img src={item.cover_img[0]} alt="" className="video-pre"/> : null}
                        {item.file_type == 'image' ? <img src={item.cover_img[0]} alt="" className="image-pre"/> : null}
                        {item.file_type == 'audio' ? <Image name="mp3.svg"/> :  null}
                        {['zip', 'rar'].indexOf(item.ext) > -1 ? <Image name="compress.svg"/> : null}
                        {item.versions.length > 0 ? <div className="version-tag"><p>{item.versions.length + 1}</p></div> : null}
                    </div>}

                    <div className="file-des" onMouseDown={e => {this.setState({isDraging: true});}}>
                        <div className="file-des-content">
                            <div className="file-tx">
                                {item.user_info.avatar != '' ? 
                                <img src={item.user_info.avatar} alt=""/> : 
                                <span style={{background: item.user_info.avatar_background_color}}>{item.user_info.realname[0]}</span>}
                            </div>
                            <div className="file-des-body">
                                <p className="file-des-name"  onClick={e => this.saveChangeNameId(e, item)}>{item.name}</p>
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
            </div>
            </div>
        );
    }
}