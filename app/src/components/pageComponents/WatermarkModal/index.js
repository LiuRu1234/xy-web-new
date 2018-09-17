import React, { PureComponent } from 'react';
import Image from '@CC/Image';
import Modal from '@CC/Modal';
import ModalButton from '@CC/Button';
import CheckSVG from '../CheckSVG';
import {message, notification, Icon} from 'antd';
import UploadOSS from '@utils/uploadOSS';
import {getQuery} from '@utils/utils';
import './index.scss';

export default class WatermarkModal extends PureComponent{
    constructor(props) {
		super(props);
    }

    uploadImg = (e) => {
        const {watermarkList} = this.props;
        let maxUpload = 4 - watermarkList.length;
        let files = e.target.files;

        if (files.length > maxUpload) {
            message.warning('您还可以上传' + maxUpload + '张');
            return;
        }

        let sizeAll = 0;
        for (let i = 0; i < files.length; i++) {
            if (files[i].name) {
                if (files[i].type.indexOf('image/png') == -1  ) {
                    message.error('图片格式只能是png');
                    return;
                }

                if (files[i].size > 1024 * 1024 ) {
                    message.error('图片大小不能大于1M');
                    return;
                }

                sizeAll += files[i].size;
            }
        }
        

        this.props.dispatch({
            type: 'upload/getUploadSTS',
            payload: {
                sizeAll,
                files, 
                handleUpload: this.handleUpload
            }
        });
        
    }

    handleUpload = (clientConfig, uploadFile, objectKey) => {
        const _self = this;

        new UploadOSS({
            file: uploadFile,
            clientConfig,
            objectKey,
            successEvent(res) {                
                _self.props.dispatch({
                    type: 'watermark/getWatermark',
                    payload: {}
                });

                notification.close('water-upload');
            },
            progressEvent(progress, checkpoint, uploadClient){
            //    console.log(progress, checkpoint);
            },

            uploadFail() {
                message.error(uploadFile.name + '上传失败，请重新上传');
            }
        });
    }

    changeTab = watermarkTab => {
        this.props.dispatch({
            type: 'watermark/saveWatermarkTab',
            payload: watermarkTab
        });
    }

    setMarkPos = (position) => {
        this.props.dispatch({
            type: 'watermark/saveWaterparam',
            payload: {
                ...this.props.waterparam,
                position
            }
        });
    }

    setModalShow = watermarkModalShow => {
        this.props.dispatch({
            type: 'watermark/saveWatermarkModalShow',
            payload: watermarkModalShow
        });
    }

    selectWatermarkId = (watermark_id) => {
        const {waterparam} = this.props;
        this.props.dispatch({
            type: 'watermark/saveWaterparam',
            payload: {
                ...waterparam,
                watermark_id
            }
        });
    }
    
    setWater = () => {
        this.props.dispatch({
            type: 'watermark/setWater',
            payload: {}
        });
    }

    deleteWatermark = (e, item) => {
        e.stopPropagation();
        this.props.dispatch({
            type: 'watermark/deleteWatermark',
            payload: item.watermark_id
        });
    }

    setFileWater = () => {
        const {fileInfo} = this.props;
        this.props.dispatch({
            type: 'watermark/setFileWater',
            payload: {
                file_id: fileInfo.id,
                done: this.transcodeWater
            }
        });
    }

    //轮询水印打印
    transcodeWater = () => {
        const {fileInfo, waterTranscodeObj} = this.props;
        
        this.props.dispatch({
            type: 'watermark/saveWaterTranscodeObj',
            payload: null
        });

        notification.open({
            message: '正在打水印...',
            icon: <Icon type="loading" style={{ color: '#108ee9' }} />,
            key: 'water-print',
            duration: 10000
        });

        let t = setInterval(() => {
            if (this.props.waterTranscodeObj) {
                if(this.props.waterTranscodeObj.watermark_state == 1) {
                    message.success('水印生成完成');
                    notification.close('water-print');
                    clearInterval(t);
                    this.refetchFile(this.props.progressTime);
                    return;
                }
            }
            this.props.dispatch({
                type: 'watermark/transcodeFileWater',
                payload: fileInfo.id
            });
        }, 1000);
    }

    //生成之后的=后续操作
    refetchFile = (progressTime) => {
        const {projectActive, fileInfo} = this.props;

        this.props.dispatch({
            type: 'watermark/saveWatermarkModalShow',
            payload: false
        });

        this.props.dispatch({
            type: 'file/fetchFileInfo',
            payload: {
                project_id: projectActive,
                doc_id: fileInfo.id
            }
        });

        setTimeout(() => {
            const {fileInfo, paused, currentDefinition, currentSY, filePlayer} = this.props;

            let resolution = currentSY ? fileInfo.water_resolution : fileInfo.resolution ;

            resolution = resolution.filter(it => it.resolution == currentDefinition)[0];
            filePlayer.src = resolution.src;
            filePlayer.currentTime = progressTime;

            if(paused) {
                filePlayer.pause(); 
            } else {
                filePlayer.play();
            }
        }, 500);


    }

    render () {
        const { watermarkTab, waterparam, watermarkModalShow, watermarkList, watermarkActive, fileInfo } = this.props;

        return (
            <div className="watermark-container">
                {/* <ComfirmModal
                visible={false}
                content={deleteContent} 
                onSure={this.deleteLink} 
                onClose={this.hideDeleteLink}
                /> */}

                <Modal visible={watermarkModalShow}
                title="水印"
                onClose={() => this.setModalShow(false)}
                footer= {
                watermarkTab == 1 ? 
                <footer className="wmm-container-footer">
                    {fileInfo != undefined && fileInfo ?
                    <ModalButton onClick={this.setFileWater}>开始生成</ModalButton>:
                    <ModalButton onClick={this.setWater}>设置水印模版</ModalButton>}
                </footer> : null}
                centerClass="wmm-section"
                >
                 
                    <div className="wmm-container">
                        <ul className="wmm-tab clearfix">
                            {['简介', '设置'].map((item, k) => {
                                return (
                                    <li key={k}
                                    className={k == watermarkTab ? "active" : ""} 
                                    onClick={() => this.changeTab(k)}
                                    >{item}</li>
                                );
                            })}
                        </ul>

                        {watermarkTab == 0 ? 
                        <div className="wmm-do">
                            亲爱的新阅用户：<br/>
                            您好，首先感谢您一直以来对新阅产品的支持，<br/>
                            能够为您服务，我们感到非常荣幸。<br/>
                            为增强视频作品标识，并保护您的视频作品不被滥用，<br/>
                            我们推出了一个简单易制作的【水印】功能。<br/>

                            - 自由添加或删除水印<br/>
                            - 无损压缩，水印高清<br/>
                            - 自定义水印位置<br/>
                            - 自由分享有水印版或无水印版视频<br/>
                            - 可预览水印效果<br/>

                            点击【查看】，给自己的视频打上水印吧。
                        </div> : null}

                       {watermarkTab == 1 ?
                       <div className="wmm-do">
                            <p className="wmm-do-title">选择水印 &nbsp;<span className="wmm-do-tip">(水印图片只支持png格式)</span></p>
                            <ul className="wmm-do-img-list clearfix">
                                {watermarkList && watermarkList.map((item, k) => {
                                    let cn = waterparam.watermark_id == item.watermark_id ? "wmm-img active" : "wmm-img";
                                    return (
                                        <li onClick={() => this.selectWatermarkId(item.watermark_id)} key={k}>
                                            <div className={cn}>
                                                <img src={item.src} alt=""/>
                                                <div className="wmm-img-del" onClick={e => this.deleteWatermark(e, item)}></div>
                                            </div>
                                        </li>
                                    );
                                })}
                                
                                {/* <li>
                                    <div className="wmm-img">
                                        <img src="" alt=""/>
                                        <div className="wmm-img-del"></div>
                                    </div>
                                </li>
                                <li>
                                    <div className="wmm-img">
                                        <img src="" alt=""/>
                                        <div className="wmm-img-del"></div>
                                    </div>
                                </li>
                                <li>
                                    <div className="wmm-img">
                                        <img src="" alt=""/>
                                        <div className="wmm-img-del"></div>
                                    </div>
                                </li> */}
                                {watermarkList.length < 4 ?
                                <li>
                                    <div className="wmm-img wmm-input">
                                        <input type="file" multiple 
                                        accept="image/png" 
                                        onChange={this.uploadImg} 
                                        />
                                    </div>
                                </li> : null}
                            </ul>
                            <p className="wmm-do-title">选择位置</p>
                            <ul className="wmm-do-position clearfix">

                                {['tl', 'rt', 'bl', 'rb'].map((item, k) => {
                                    return (
                                        <li className={waterparam.position == item ? "active" : ""} key={k} onClick={() => this.setMarkPos(item)}>
                                            <div className="wmm-do-check">
                                                {waterparam.position == item ? <CheckSVG/> : null}
                                            </div>
                                        </li>
                                    );
                                })}
                                {/* <li className="active">
                                    <div className="wmm-do-check">
                                        <CheckSVG/>
                                    </div>
                                </li>
                                <li> 
                                    <div className="wmm-do-check">
                                    </div>
                                </li>
                                <li></li>
                                <li></li> */}
                            </ul>
                        </div> : null}

                       
                    </div>
                   
                </Modal>
            </div>

        );
    }
}