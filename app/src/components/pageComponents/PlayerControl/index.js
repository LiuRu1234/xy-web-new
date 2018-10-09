import React, { PureComponent } from 'react';
import {Tooltip} from 'antd';

import Image from '@CC/Image';
import IconBlock from '@CC/IconBlock';

import {
	FilePlayerCommentPannel,
	PlayerTimePannel, 
	PlayerSYPannel,
	PlayerDefinitionPannel,
	PlayerRatioPannel,
	PlayerVolumePannel
} from '@CCP/TooltipPannel';

import './index.scss';


class PlayerControl extends PureComponent{
	constructor(props){
		super(props);
		this.state = {
			width: 0,
			pbDown: false
		};
	}

	componentDidMount() {
		let t = setInterval(() => {
			const {filePlayer, dispatch, progressBody} = this.props;

			if (!filePlayer) return;
			clearInterval(t);
			filePlayer.volume = 0.5;
			// this.props.listenEvent();

		}, 300);

		document.addEventListener('mousemove', this.progressBtnMove);
		document.addEventListener('mouseup', this.progressBtnEnd);
	}

    playerPlayOrPause = () => {
		const {dispatch} = this.props;
		dispatch({
			type: 'playerControl/playerPlayOrPause',
			payload: {},
		});
	}
	
	saveProgressBody = (node) => {
		const {dispatch} = this.props;
		dispatch({
			type: 'playerControl/saveProgressBody',
			payload: node,
		});
	}

	setPlayTime = (e) => {
		const {dispatch, progressBody, filePlayer, filePlayerTime, ctx3, videoWH} = this.props;

		let pg =  progressBody.getBoundingClientRect();
		let progressWidth = e.clientX - pg.left;
		this.setProgress(progressWidth);
	}

	setProgress(progressWidth) {
		const {dispatch, progressBody, filePlayer, filePlayerTime, ctx3, videoWH} = this.props;

		let pg =  progressBody.getBoundingClientRect();
		let progress = progressWidth / pg.width; 
		let currentTime = progress * filePlayerTime;
		filePlayer.currentTime = currentTime;

		ctx3.clearRect(0, 0, videoWH.w, videoWH.h);
		
		dispatch({
			type: 'playerControl/saveProgressWidth',
			payload: progressWidth,
		});
		

		dispatch({
			type: 'playerControl/saveProgress',
			payload: progress,
		});

		dispatch({
			type: 'playerControl/saveProgressTime',
			payload: currentTime,
		});
	}

	enterFullScreen = () => {
		const {filePlayer} = this.props;
		if (filePlayer.webkitRequestFullscreen) {
			filePlayer.webkitRequestFullscreen();
		} else if (filePlayer.mozRequestFullscreen) {
			filePlayer.mozRequestFullscreen();
		} else if (filePlayer.msRequestFullscreen) {
			filePlayer.msRequestFullscreen();
		} else if (filePlayer.requestFullscreen) {
			filePlayer.requestFullscreen();
		}
	}

	setLoop = () => {
		const {playerLoop, filePlayer, dispatch} = this.props;
		dispatch({
			type: 'playerControl/savePlayerLoop',
			payload: playerLoop ? false : true,
		});
	}

	forwardCommentActive = (prevOrNext) => {
		this.props.dispatch({
			type: 'playerControl/forwardCommentActive',
			payload: prevOrNext
		});
	}

	// 进度条滑点拖拽 start
	progressBtnDown = (e) => {
		this.setState({
			pbDown: true
		});
	}

	progressBtnMove = (e) => {
		if (this.state.pbDown == undefined || !this.state.pbDown) return;
		const { progressBody } = this.props;
		let pg = progressBody.getBoundingClientRect();
		let progressWidth = e.clientX - pg.left;
		this.setProgress(progressWidth);
	}

	progressBtnEnd = (e) => {
		if (!this.state.pbDown) return;
		this.setState({
			pbDown: false
		});
	}
	// 进度条滑点拖拽 end

	progressOver = (e) => {
		const {dispatch, progressBody } = this.props;
		let pg = progressBody.getBoundingClientRect();
		let hoverLeft = e.clientX - pg.left;
		let everyProgressWidth = pg.width / 49;
		let everyProgressWidthLast = pg.width % 49;
		let videoPreviewIndex = Math.floor((hoverLeft / pg.width * 120 * 49) / 120);
		let videoPreviewLeft = -(120 * videoPreviewIndex + 60) + videoPreviewIndex * everyProgressWidth;

		dispatch({
			type: 'playerControl/saveVideoPreviewLeft',
			payload: videoPreviewLeft
		});
	}

	progressOverMove = (e) => {
		this.progressOver(e);
	}

	seekVideo = (k) => {
		const { progressBody } = this.props;
		let pg = progressBody.getBoundingClientRect();
		let progressWidth = k / 50 * pg.width;
		this.setProgress(progressWidth);
	}

	renderComments() {
		const {comments, filePlayerTime, progressBody} = this.props;

		return comments.map((item, k) => {
			if (item.media_time == -1 || !progressBody) return null;
			let maxWidth = progressBody.getBoundingClientRect().width;
			let left = item.media_time / filePlayerTime * maxWidth;
			return (
				<li key={k}>
					<FilePlayerCommentPannel {...this.props} left={left} data={item}/>
				</li>
			);
		});
	}

	renderProgressController() {
		const {progressWidth, fileInfo, videoPreviewLeft} = this.props;

		let hoverStyle1 = {
			height: '12px',
			borderRadius: '6px'
		};

		let hoverStyle2 = {
			borderRadius: '6px',
			width: progressWidth + 'px'
		};

		if (!this.state.pbDown) {
			hoverStyle1 = {};
			hoverStyle2 = {width: progressWidth + 'px'};
		}

		return (
			<div className="video-progress">
				<div className="fps-control-progress" 
					ref={node => this.saveProgressBody(node)} 
					onClick={(e) => this.setPlayTime(e)}
					onMouseDown={this.progressBtnDown}
					onMouseEnter={this.progressOver}		
					onMouseMove={this.progressOverMove}	
					style={hoverStyle1}
					>
					<div className="video-progress-body" style={hoverStyle2}></div>
					<div className="video-progress-btn" 
					style={{left: progressWidth + 'px'}}
					></div>
				</div>
				{fileInfo.file_type == 'video' ?
				<ul className="video-progress-preview clearfix" style={{left: videoPreviewLeft + 'px'}}>
					{Array(50).fill(1).map((item, k) => {
						return (
							<li key={k} onClick={() => this.seekVideo(k)}>
								<img src={fileInfo.preview} alt="" style={{top: (-67.5 * (1 + k)) + 'px'}}/>
							</li>
						);
					})}
				</ul> : null}
			</div>
		);
	}

  	render() {
		const {paused, isFilesShare, shareWater, progressWidth, playerLoop, comments, drawTypeActive, fileInfo, commentDrawObj} = this.props;

		return (
			<div className="fps-control">
				{/* 进度条 */}
				{/*  && commentDrawObj.length == 0  */}
				{drawTypeActive == ''? 
				this.renderProgressController(): 
				<div className="fps-control-progress">
					<div style={{width: progressWidth + 'px'}}></div>
				</div>}

				{/* 评论模块 */}
				<ul className="fps-control-commet">
					{this.renderComments()}
				</ul>

				{/* 控制器模块 */}
				
				<div className={drawTypeActive == '' ? 'player-controller' : 'player-controller disable'}> 
					
					<div className="player-controller-left">
						<Tooltip placement="top" title="播放">
							<div className="fps-controller-btn" onClick={this.playerPlayOrPause}>
								{ paused ? <Image name="play.svg" /> : <Image name="pause.svg" />}
							</div>
						</Tooltip>

						<Tooltip placement="top" title="循环播放">
							<div className="fps-controller-btn" onClick={this.setLoop}>
								{ playerLoop ? <Image name="loop-play-active.svg" /> : <Image name="loop-play.svg" />}
							</div>
						</Tooltip>


						<Tooltip placement="top" title="音量">
							<PlayerVolumePannel {...this.props}/>
						</Tooltip>

						<PlayerTimePannel {...this.props}/>
					</div>
					<div className="player-controller-center">
						<Tooltip placement="top" title="上一条评论">
							<div className="fps-controller-btn" onClick={() => this.forwardCommentActive('prev')}>
								<Image name="before-comment.svg" />
							</div>
						</Tooltip>
						<Tooltip placement="top" title="下一条评论">
							<div className="fps-controller-btn" onClick={() => this.forwardCommentActive('next')}>
								<Image name="after-comment.svg" />
							</div>
						</Tooltip>
					</div>
					{fileInfo.file_type == 'video' ?
					<div className="player-controller-right">
						{!isFilesShare ? <PlayerSYPannel {...this.props}/> : null}
						<PlayerDefinitionPannel {...this.props}/>
						<PlayerRatioPannel {...this.props}/>						
						
						<Tooltip placement="top" title="全屏">
							<div className="fps-controller-btn" onClick={() => this.enterFullScreen()}>
								<Image name="full-screen.svg" />
							</div>
						</Tooltip>
					</div> : null }
				</div>
				
			</div>
		);
  	}
}

export default PlayerControl;
