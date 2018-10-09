import React, {PureComponent} from 'react';
import {Tooltip} from 'antd';

import Image from '@CC/Image';
import IconBlock from '@CC/IconBlock';

import DrawUtil from '@utils/draw-util';
import './index.scss';

const src = 'http://video.uxinyue.com/23d3fe67ae094c62bfe20dbb4d1d0725/2a4453c5c810440c817640' +
        '337f6fbb51-5287d2089db37e62345123a1be272f8b.mp4';

class PlayerBody extends PureComponent {
    annotation = {};
    
    constructor(props) {
        super(props);
        this.state = {
            // 画板操作
            drawTypes: ['rect', 'arrow', 'pen'],
            colors: ['#E74A3C', '#E67422', '#1ABCA1', '#34A3DB'],
            colorActive: '#E74A3C',
            drawTypeActive: 'rect',
            rect: {tool: 'rect', color: '', x: '', y:'', w: '', h: '', size: 3},
            arrow: {tool: 'arrow', color: '', x1: '', y1:'', x2: '', y2: '', size: 3}, 
            pen: {tool: 'pen', color: '', xs: '', ys:'', size: 3},
        };
    }

    componentDidMount() {

        let t = setInterval(() => {
            if (!this.ctx1) return;
            
            clearInterval(t);

            this.props.dispatch({
                type: 'playerControl/getPlayerHeight',
                payload: {}
            });
        
            this.props.dispatch({
				type: 'playerControl/saveCtx',
				payload: {
                    ctx1: this.ctx1.getContext('2d'),
                    ctx2: this.ctx2.getContext('2d'),
                    ctx3: this.ctx3.getContext('2d'),
                    ctx4: this.ctx4.getContext('2d'),
                    ctx: this.ctx4
                }
            });	

            this.props.dispatch({
                type: 'playerControl/initVideoOffset',
                payload: {}
            });
           
        }, 10);
        
        window.addEventListener('resize', () => {
            this.props.dispatch({
				type: 'playerControl/videoResize',
				payload: {}
            });	
        });

        // setTimeout(() => {
        //     this.setPlayer(document.getElementById('video-audio'));
        // }, 300);
    }

    setPlayer = (node) => {
        const _self = this;
        _self.props.dispatch({
            type: 'playerControl/saveFilePlayer',
            payload: node
        });   
        if (!_self.props.filePlayer) return;
        // _self.props.filePlayer.addEventListener('canplay', (e) => {
        //     _self.props.dispatch({
        //         type: 'playerControl/saveFilePlayerTime',
        //         payload: e.target.duration
        //     });   
        // });
      
    }

    // 以下四个是对画板点坐标处理,百分比与数值相互转化
    getRelativeX (x) {
        return x / this.props.videoWH.w;
    }

    getRelativeY (y) {
        return y / this.props.videoWH.h;
    }

    getPositionXW(value){
        return value * this.props.videoWH.w;
    }

    getPositionYH(value){
        return value * this.props.videoWH.h;
    }
    //end

    // 开始画画
    onCanvasMouseDown = (e) => {
        const {ctx4, drawTypeActive, colorActive, videoWH, videoOffset} = this.props;
        this.drawing = true;
        let _self = this;
        this.posOrigin = {
            x: e.pageX - videoOffset.left,
            y: e.pageY - videoOffset.top
        };

        this.annotation = {
            tool: drawTypeActive,
            size: 3
        };

        ctx4.strokeStyle = colorActive;
        ctx4.fillStyle = colorActive;
        ctx4.lineWidth = 3;
        

        switch (drawTypeActive) {
            case 'rect':
                this.annotation.color = colorActive;
                this.annotation.x = this.posOrigin.x;
                this.annotation.y = this.posOrigin.y;
                break;
            case 'arrow':
                this.annotation.color = colorActive;
                this.annotation.x1 = this.posOrigin.x;
                this.annotation.y1 = this.posOrigin.y;
                break;
            case 'pen':
                this.annotation.color = colorActive;
                this.annotation.xs = [this.posOrigin.x];
                this.annotation.ys = [this.posOrigin.y];
                break;
        }
    }

    onCanvasMouseMove = (e) => {
        const {ctx4, videoWH, drawTypeActive, videoOffset} = this.props;
        if (!this.drawing) return;

        const canvasWidth = videoWH.w;
        const canvasHeight = videoWH.h;

        let _self = this;
        this.posCurrent = {
            x: e.pageX - videoOffset.left,
            y: e.pageY - videoOffset.top
        };

        switch (drawTypeActive) {
            case 'rect':
                ctx4.clearRect(0, 0, canvasWidth, canvasHeight);
                const width = this.posCurrent.x - this.posOrigin.x;
                const height = this.posCurrent.y  - this.posOrigin.y;
                DrawUtil.drawRect(ctx4, this.posOrigin.x, this.posOrigin.y, width, height);
                this.annotation.w = Math.abs(width);
                this.annotation.h = Math.abs(height);
                break;
            case 'arrow':
                ctx4.clearRect(0, 0, canvasWidth, canvasHeight);
                DrawUtil.drawArrow(ctx4, this.posOrigin.x, this.posOrigin.y, this.posCurrent.x, this.posCurrent.y);
                this.annotation.x2 = this.posCurrent.x;
                this.annotation.y2 = this.posCurrent.y;
                break;
            case 'pen':
                DrawUtil.drawLine(ctx4, this.posOrigin.x, this.posOrigin.y, this.posCurrent.x, this.posCurrent.y);
                this.posOrigin = Object.assign({}, this.posCurrent);
                this.annotation.xs.push(this.posCurrent.x);
                this.annotation.ys.push(this.posCurrent.y);
                break;
        }

    }

    onCanvasMouseUp = () => {
        const {ctx4, drawTypeActive, allDrawObj, videoWH} = this.props;
        if (!this.drawing) return;
        this.drawing = false;
        switch (drawTypeActive) {
            case 'rect':
                this.annotation.x = Math.min(this.annotation.x, this.posCurrent.x);
                this.annotation.y = Math.min(this.annotation.y, this.posCurrent.y);
                this.annotation.x = this.getRelativeX(this.annotation.x);
                this.annotation.y = this.getRelativeY(this.annotation.y);
                this.annotation.w = this.getRelativeX(this.annotation.w);
                this.annotation.h = this.getRelativeY(this.annotation.h);
                break;
            case 'arrow':
                this.annotation.x1 = this.getRelativeX(this.annotation.x1);
                this.annotation.y1 = this.getRelativeY(this.annotation.y1);
                this.annotation.x2 = this.getRelativeX(this.annotation.x2);
                this.annotation.y2 = this.getRelativeY(this.annotation.y2);
                break;
            case 'pen':
                this.annotation.xs = this.annotation.xs.map(x => this.getRelativeX(x));
                this.annotation.ys = this.annotation.ys.map(y => this.getRelativeY(y));
                break;
            default:
                break;
        }
        
        allDrawObj.push(this.annotation);
        // ctx4.clearRect(0, 0, videoWH.w, videoWH.h);
        
        this.props.dispatch({
            type: 'playerControl/saveDeleteDrawObj',
            payload: []
        });
        
        this.props.dispatch({
            type: 'playerControl/saveAllDrawObj',
            payload: allDrawObj
        });
        setTimeout(() => {
            this.props.dispatch({
                type: 'playerControl/drawAll',
                payload: this.props.allDrawObj
            });
        });
    }

    setPlayPause = () => {
        const {filePlayer, paused, dispatch, ctx3, ctx4, videoWH} = this.props;
        if (paused) {
            filePlayer.play();
            dispatch({
                type: 'playerControl/savePaused',
                payload: false
            });
            ctx4.clearRect(0, 0, videoWH.w, videoWH.h);
            ctx3.clearRect(0, 0, videoWH.w, videoWH.h);
        } else {
            filePlayer.pause();
            dispatch({
                type: 'playerControl/savePaused',
                payload: true
            });
        }
    }

    dataURLtoBlob (dataurl) {
        const arr = dataurl.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = window.atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        return new window.Blob([u8arr], {type: mime});
    }

    downloadStill = (e) => {
        e.stopPropagation();
        const {ctx1, filePlayer, videoWH, fileInfo} = this.props;
        const canvas = document.createElement('canvas');
        canvas.width = fileInfo.width ;
        canvas.height = fileInfo.height ;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(filePlayer, 0, 0, canvas.width, canvas.height);
    
        const dataURL = canvas.toDataURL('image/png');
        const blob = this.dataURLtoBlob(dataURL);
        const objectURL = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.target = '_blank';
        link.href = objectURL;
        link.download = fileInfo.name + '.png';

        const evt = new window.MouseEvent('click');
        link.dispatchEvent(evt);
    }

    setCoverImg = (e) => {
        e.stopPropagation();
        this.props.dispatch({
            type: 'file/setCoverImg',
            payload: {}
        });
    }

    showWaterModal = e => {
        e.stopPropagation();
        this.props.dispatch({
            type: 'watermark/showWaterModal',
            payload: {}
        });
    }

    renderVideo() {
        const {videoWH, videoShow, fileInfo, playerLoop, volume, drawTypeActive, currentSY, currentDefinition, isFilesShare} = this.props;
        let resolution = [], src = '';

        if (fileInfo == null) return null;
        if (fileInfo.resolution.length == 0) return null;

        if (isFilesShare) {
            src = fileInfo.resolution.filter(item => item.resolution == currentDefinition)[0].src;
        } else {
            resolution  = fileInfo.is_watermark && currentSY ? fileInfo.water_resolution : fileInfo.resolution;
            src = resolution.filter(item => item.resolution == currentDefinition)[0].src;
        }
     
        let ctx4 = null;

        return (
            <div
                className="fps-body"
                style={{
                height: videoWH.h + 'px'
                }}
                id="fps-body"
            >
                {/* video */}
                {videoShow?
                <div style={{height:"100%"}}>
                    <video src={src}
                     width={videoWH.w} 
                     height={videoWH.h}
                    //  ref={node => this.setPlayer(node)}
                     loop={playerLoop}
                     id="video-audio"
                     crossOrigin='anonymous'
                     >
                         <source src={src} type='video/mp4'/>
                     </video>
                </div>
                : null}

                {/* 截图canvas */}
                <div className="first-canvas-block">
                    <canvas className="first-canvas" width={videoWH.w} height={videoWH.h} ref={node => this.ctx1 = node}></canvas>
                </div>

                {/* 比例canvas  这里左边有个边没遮罩住，加个-1px*/}
                <div className="first-canvas-block">
                    <canvas className="second-canvas" width={videoWH.w + 1} height={videoWH.h} ref={node => this.ctx2 = node}></canvas>
                </div>

                {/* 显示所有画图的block */}
                <div className="second-canvas-block">
                    <canvas className="third-canvas" width={videoWH.w} height={videoWH.h} ref={node => this.ctx3 = node}></canvas>
                </div>

                {/* 画图block */}
                <div className="second-canvas-block">
                    <canvas className="fourth-canvas" 
                        width={videoWH.w} height={videoWH.h} 
                        ref={node => this.ctx4 = node}
                        onMouseDown={this.onCanvasMouseDown}
                        onMouseMove={this.onCanvasMouseMove}
                        onMouseUp={this.onCanvasMouseUp}
                    ></canvas>
                </div>

                {/* 其他操作 */}
                {drawTypeActive == '' ?
                <div className="fps-body-other">
                    <div
                        className="fps-body-other-block"
                        style={{
                        width: videoWH.w + 'px',
                        height: videoWH.h + 'px'
                        }}
                        onClick={() => this.setPlayPause()}
                    >
                        <div className="fps-body-other-do">
                            { !isFilesShare ?
                            <Tooltip placement="left" title="设置当前帧为封面">
                                <div className="other-do-li" onClick={this.setCoverImg}>
                                    <Image name="cover-img.svg"/>
                                </div>
                            </Tooltip> : null}
                            <Tooltip placement="left" title="快速截图">
                                <div className="other-do-li" onClick={this.downloadStill}>
                                    <Image name="photo.svg"/>
                                </div>
                            </Tooltip>
                            {!isFilesShare ? 
                            <Tooltip placement="left" title="水印管理">
                                <div
                                    className="other-do-li"
                                    onClick={this.showWaterModal}
                                >
                                    <Image name="sy.svg"/>
                                </div>
                            </Tooltip> : null}
                        </div>
                    </div>
                </div> : null}

            </div>
        );
    }

    render() {
        return this.renderVideo();
    }
}

export default PlayerBody;