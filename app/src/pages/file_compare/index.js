import React, { PureComponent } from 'react';
import { routerRedux } from 'dva/router';
import withRouter from 'umi/withRouter';
import { connect } from 'dva';
import {Tooltip} from 'antd';

import Image from '@CC/Image';
import Loading from '@CC/Loading';

import {
	PlayerTimePannel,
	PlayerVolumePannel2,
	PlayerTimePannel2
} from '@CCP/TooltipPannel';

import {beforeTime} from '@utils/utils';

import './index.scss';

function mapStateToProps(state) {
    return {
      ...state.compare,
      ...state.project,
	  ...state.global,
	  ...state.loading
    };
  }
  

@withRouter
@connect(mapStateToProps)
class FileCompareContainer extends PureComponent {

	player1 = null;
	player2 = null;
	longVideo = null;

	constructor(props) {
		super(props);
		this.state = {
			videoWH: {w: 0, h: 0},
			playerLoop: false,
			isPause: true,
			duration: 0,
			longVideo: null,
			progress: 0,
			progressWidth: 0,
			volume1: 50,
			timeMode: 0,
			fileInfo: null
		};
	}

	componentWillUnmount() {
		this.setState({
			isPause: true
		});
		clearInterval(this.t);
	}

	componentDidMount() {
		setTimeout(() => {
			this.setState({
				videoWH: this.setVideoWH()
			});
		}, 50);

		window.addEventListener('resize', () => {
			this.setState({
				videoWH: this.setVideoWH()
			});
		});
		const _self = this;

		setTimeout(() => {

			_self.player1 && _self.player1.addEventListener('canplay', function(e) {
				_self.player1.volume = 0.5;

				if (e.target.duration > _self.state.duration) {
					_self.setState({
						duration: e.target.duration,
						fileInfo: _self.props.fileInfoOne
					});
					_self.longVideo =  _self.player1;
				}
			});

			_self.player2 && _self.player2.addEventListener('canplay', function(e) {
				_self.player2.volume = 0.5;

				if (e.target.duration > _self.state.duration) {
					_self.setState({
						duration: e.target.duration,
						fileInfo: _self.props.fileInfoTwo
					});
					_self.longVideo =  _self.player2;
				}
			});

			setTimeout(() => {
				_self.longVideo && _self.longVideo.addEventListener('timeupdate', function(e) {
					let width = _self.progressNode.getBoundingClientRect().width;
					let progress = e.target.currentTime / _self.state.duration;
					_self.setState({
						progress,
						progressWidth: progress * width
					});
				});
			}, 500);


		}, 200);

		let noticeClick = () => {
			let noticeContent = document.body.querySelector('.notice-content');
			noticeContent && noticeContent.addEventListener('click', (e) => {
				let newNotice = JSON.parse(e.target.dataset.notice);
				notification.close(newNotice.id);
				_self.props.dispatch({
					type: 'global/toNotice',
					payload: newNotice
				});
			});
		};

		let agreeJoin = (notice, done) => {
			if (notice.type == "invite_join") {
				_self.props.dispatch({
					type: 'project/joinProject',
					payload: notice.id
				});
			}

			if (notice.type == "link_join") {
				_self.props.dispatch({
					type: 'invite/auditInvite',
					payload: {
						allow_status: 1,
						notice_id: notice.id
					}
				});
			}
			
			done();
		};

		let refuseJoin = (notice, done) => {
			if (notice.type == "link_join") {
				_self.props.dispatch({
					type: 'invite/auditInvite',
					payload: {
						allow_status: 0,
						notice_id: notice.id
					}
				});
			}
			done();
		};

		_self.props.dispatch({ type: 'global/fetchNotice', payload: {noticeClick, isAjax: false, agreeJoin, refuseJoin} });
		_self.t = setInterval(() => {
			_self.props.dispatch({ type: 'global/fetchNotice', payload: {noticeClick, isAjax: true, agreeJoin, refuseJoin} });
		}, 5000);
	}

	setVideoWH = () => {
		// if (!this.video1) return;
		let video1Obj = this.video1.getBoundingClientRect();
		let w = document.documentElement.clientWidth / 2;
		if (w <= 200) {
			w = 200;
		}
		let h = w * ( 9 / 16);
		return {w, h};
	}

	setMutedId = (mutedId) => {
		this.props.dispatch({
			type: 'compare/saveMutedId',
			payload: mutedId
		});
	}

	setPause(isPause) {
		if (isPause) {
			this.player1.pause();
			this.player2.pause();
			this.setState({
				isPause: true
			});
		} else {
			let playTime = this.state.progress * this.state.duration;
			if (this.player2.duration > playTime) {
				this.player2.play();
			} else {
				this.player2.currentTime = playTime;
				this.player2.pause();
			}

			if (this.player1.duration > playTime) {
				this.player1.play();
			} else {
				this.player1.currentTime = playTime;
				this.player1.pause();
			}
			this.setState({
				isPause: false
			});


		}
	}

	setProgress = (e) => {
		let pn = this.progressNode.getBoundingClientRect();
		let w = e.clientX - pn.left;
		let progress = w / pn.width;
		this.setState({
			progressWidth: w,
			progress
		});

		let playTime =  progress * this.state.duration;
		this.player2.currentTime = playTime;
		this.player1.currentTime = playTime;
		if (!this.state.isPause) {
			if (playTime < this.player1.duration) {
				this.player1.play();
			}

			if (playTime < this.player2.duration) {
				this.player2.play();
			}
		}
	}

	changeVolume = (value) => {
		this.setState({
			volume1: value / 100
		});
		this.player2.volume = value / 100;
		this.player1.volume = value / 100;
	}

	changeTimeMode = (timeMode) => {
		this.setState({
			timeMode
		});
	}

	goBack = () => {
		this.props.dispatch(routerRedux.goBack());
	}

	render() {
		const {videoWH, playerLoop, isPause, progress, progressWidth, volume1, timeMode, duration, fileInfo} = this.state;
		const {fileInfoOne, fileInfoTwo, mutedId, effects} = this.props;

		let progressTime = progress * duration;
		if (!fileInfoOne || !fileInfoTwo) return null;

		return (
			<div className="file-compare-container">
				<header className="fm-header">
					<div className="fm-back" onClick={() => this.goBack()}>
						<Image name="back.svg"/>
						<p>返回</p>
					</div>
				</header>
				<section className="fm-section">
					<ul className="clearfix">
						<li>
							<div className="fm-volume">
								<div className="fm-volume-block" onClick={() => this.setMutedId(fileInfoOne.id)}
								style={{background: fileInfoOne && mutedId == fileInfoOne.id ? "#FFC53D" : '' }}>
									<Image name="ej.svg"></Image>
								</div>
							</div>
							<p className="fm-create">版本 | {fileInfoOne && beforeTime(fileInfoOne.created_at)}</p>
							<p className="fm-name">{fileInfoOne && fileInfoOne.name}</p>
							<div className="fm-video" style={{width: videoWH.w + 'px', height: videoWH.h + 'px'}}>
								<video src={fileInfoOne && fileInfoOne.resolution[fileInfoOne.resolution.length - 1].src}
									width={videoWH.w}
									height={videoWH.h}
									ref={node => this.player1 = node}
									muted={fileInfoOne && mutedId == fileInfoOne.id ? false : true}
									// loop={playerLoop}
									crossOrigin='anonymous'
									>
										<source src={fileInfoOne && fileInfoOne.resolution[fileInfoOne.resolution.length - 1].src} type='video/mp4'/>
								</video>
							</div>
						</li>
						<li>
							<div className="fm-volume">
								<div className="fm-volume-block" onClick={() => this.setMutedId(fileInfoTwo.id)}
								style={{background: fileInfoTwo && mutedId == fileInfoTwo.id ? "#FFC53D" : '' }}>
									<Image name="ej.svg"></Image>
								</div>
							</div>
							<p className="fm-create">版本 | {fileInfoTwo && beforeTime(fileInfoTwo.created_at)}</p>
							<p className="fm-name">{fileInfoTwo && fileInfoTwo.name}</p>
							<div className="fm-video" ref={node => this.video1 = node} style={{width: videoWH.w + 'px', height: videoWH.h + 'px'}}>
								<video src={fileInfoTwo && fileInfoTwo.resolution[fileInfoTwo.resolution.length - 1].src}
									width={videoWH.w}
									height={videoWH.h}
									ref={node => this.player2 = node}
									// loop={playerLoop}
									muted={fileInfoTwo && mutedId == fileInfoTwo.id ? false : true}
									crossOrigin='anonymous'
									>
										<source src={fileInfoTwo && fileInfoTwo.resolution[fileInfoTwo.resolution.length - 1].src} type='video/mp4'/>
								</video>
							</div>
						</li>
					</ul>
				</section>
				<footer className="fm-footer">
					<div className="fmf-progress" ref={node => this.progressNode = node} onClick={(e) => this.setProgress(e)}>
						<span style={{width: progressWidth + 'px'}}></span>
					</div>

					<div className="fmf-controller">
						<Tooltip placement="top" title="播放">
							<div className="fmf-controller-btn" onClick={() => this.setPause(isPause ? false : true)}>
								<Image name={isPause ? "play.svg" : "pause.svg"} />
							</div>
						</Tooltip>

						{/* <Tooltip placement="top" title="循环播放">
							<div className="fmf-controller-btn">
								<Image name="loop-play.svg" />
							</div>
						</Tooltip> */}

						{/* <Tooltip placement="top" title="音量">
							<div className="fmf-controller-btn">
								<Image name="volume.svg" />
							</div>
						</Tooltip> */}

						<PlayerVolumePannel2 {...this.props} volume1={volume1} changeVolume={this.changeVolume}/>

						<PlayerTimePannel2 {...this.props}
						changeTimeMode={this.changeTimeMode}
						timeMode={timeMode}
						progressTime={progressTime}
						fileInfo={fileInfo}
						duration={duration}
						/>
					</div>
				</footer>
				{/* <Linker /> */}
				
				<Loading visible={
					effects['compare/fetchFile'] ||  
					effects['compare/fetchFileInfo']
				}/>
			</div>
		);
	}
}

export default FileCompareContainer;
