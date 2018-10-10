import React, { PureComponent } from 'react';
import {Tooltip} from 'antd';

import IconBlock from '@CC/IconBlock';
import Image from '@CC/Image';
import './index.scss';

export class FileMoreBody extends PureComponent{
    constructor(props) {
        super(props);
    }

    toggleSaveFileModal(saveFileModalShow) {
		this.props.dispatch({
			type: 'project/saveSaveFileModalShow',
			payload: saveFileModalShow	 
		});
    }
    
    showProjectShare = (file) => {
        this.props.dispatch({
			type: 'link/saveCreateOrChange',
			payload: 'create' 
		});

		this.props.dispatch({
            type: 'link/showProjectShare',
            payload: {
                doc_id: file.id,
                doc_name: file.name
            }
        });
    }
    
    deleteFile = (file) => {
        this.props.dispatch({
            type: 'project/saveDeleteFile',
            payload: file
        });

        this.props.dispatch({
            type: 'project/saveDeleteFileModalShow',
            payload: true
        });
    }

    relieveFile = (file) => {
        this.props.dispatch({
            type: 'project/relieveFile',
            payload: file
        });
    }

    render() {
        const {toggleDownload,downloadUrl, downloadBlockShow, data} = this.props;

		let source = downloadUrl.filter(item => item.resolution == 'source')[0];
		let download = downloadUrl.filter(item => item.resolution != 'source');

        if (data.type == 'file') {
            return (
                <div className="file-more-body clearfix" style={{ transform: downloadBlockShow ? 'translateX(-50%)' : 'translateX(0)'}}>
                    <ul onClick={e => e.target.className == 'file-more-body-ul' &&  e.stopPropagation()} className="file-more-body-ul">
                        <li onClick={(e) => this.showProjectShare(data)}>
                            <div>
                                <IconBlock iconName="fm-share.svg" direction="left"></IconBlock>
                                <p>分享</p>
                            </div>
                        </li>
                        <li onClick={(e) => {e.stopPropagation();toggleDownload(true);}}>
                            <div>
                                <IconBlock iconName="fm-down.svg" direction="left"></IconBlock>
                                <p>下载</p>
                                <IconBlock iconName="fm-down-r.svg"></IconBlock>
                            </div>
                        </li>
                        {/* <li onClick={(e) => {this.toggleSaveFileModal(true);}}>
                            <div>
                                <IconBlock iconName="fm-save.svg" direction="left"></IconBlock>
                                <p>保存到我的项目</p>
                            </div>
                        </li> */}
                        { data.versions.length == 0 ?
                        <li onClick={() => this.deleteFile(data)}>
                            <div>
                                <IconBlock iconName="fm-delete.svg" direction="left"></IconBlock>
                                <p>删除</p>
                            </div>
                        </li> : null}
                    
                        { data.versions.length > 0 ?
                        <li onClick={() => this.relieveFile(data)}>
                            <div>
                                <IconBlock iconName="fm-dv.svg" direction="left"></IconBlock>
                                <p>解除版本</p>
                            </div>
                        </li> : null}

                        { data.versions.length > 0 ?
                        <li onClick={() => this.deleteFile(data)}>
                            <div>
                                <IconBlock iconName="fm-delete.svg" direction="left"></IconBlock>
                                <p>删除所有版本</p>
                            </div>
                        </li> : null}
                    </ul>

                    {downloadBlockShow && source != undefined ?
                    <div className="file-more-two" onClick={(e) => e.stopPropagation()}>
                        <div className="file-down-body" >
                            <div className="file-down-header">
                                <div className="file-down-back" onClick={(e) => {e.stopPropagation();toggleDownload(false);}}>
                                    <Image name="fm-down-back.svg"></Image>
                                </div>
                                <p>下载</p>
                            </div>
                            <p className="file-down-title">原始文件</p>
                            <ul className="file-down-list">
                                <Tooltip placement='top' title='点击/右击存储'>
                                    <li>
                                        <a href={source && source.url} download={source && source.name} target="_blank">{source.name}</a>
                                    </li>
                                </Tooltip>
                            </ul>

                            {download.length > 1 ?
                            <div>
                                <p className="file-down-title">其他</p>
                                <ul className="file-down-list">
                                    {download && download.map((item, k) => {
                                        return (
                                            <Tooltip key={k} placement='top' title='点击/右击存储'>
                                                <li>
                                                    <a href={item.url}  download={item.name} target="_blank">{item.name}</a>
                                                </li>
                                            </Tooltip>
                                        );
                                    })}
                                
                                </ul>
                            </div> : null}
                        
                        </div>
                    </div> : null}

                </div>
            );

        } else {
            return (
                <div className="file-more-body">
                    <ul>
                        <li onClick={() => this.deleteFile(data)}>
                            <div>
                                <IconBlock iconName="fm-delete.svg" direction="left"></IconBlock>
                                <p>删除</p>
                            </div>
                        </li>
                    </ul>
                </div>
            );
        }
    }
}

export class FolderMoreBody extends PureComponent{
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="file-more-body">
                <ul>
                     <li>
                        <div>
                            <IconBlock iconName="fm-delete.svg" direction="left"></IconBlock>
                            <p>删除</p>
                        </div>
                    </li>
                </ul>
            </div>
        );
    }
}
