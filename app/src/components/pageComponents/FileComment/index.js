import React, { PureComponent } from 'react';
import {Input, Icon, Tooltip, Button} from 'antd';

import IconBlock from '@CC/IconBlock';
import Image from '@CC/Image';
import ComfirmModal from '@CC/ComfirmModal';
import {CommentSortPannel} from '@CCP/TooltipPannel';

import {getLocalTime, size2Str, timeToMS, beforeTime, getTokenLocalstorage, trigger} from '@utils/utils';
import DrawUtil from '@utils/draw-util';
import {PRE_PAGE, COMMENT_RECORD_PREFIXER} from '@config/constants';

import './index.scss';

class FileComment extends PureComponent{
	constructor(props){
		super(props);
		this.state = {
			deleteModalShow: false,
			deleteModalTitle: '',
      		commentId: ''
		};
	}

	changeTab(tabIndex) {
		this.props.dispatch({
			type: 'comment/saveCommentTabIndex',
			payload: tabIndex
		});
	}

	toggleCommentPannel(commentClosed) {
		this.props.dispatch({
			type: 'comment/saveCommentClosed',
			payload: commentClosed
		});

		this.props.dispatch({
            type: 'playerControl/offRatioCover',
            payload: {}
        });

		setTimeout(() => {
			this.props.dispatch({
				type: 'playerControl/videoResize',
				payload: {}
            });
		}, 400);
	}

	toggleCallbackBlock(callbackBlockShow, id) {
		if (callbackBlockShow) {
			this.props.dispatch({
				type: 'comment/showCallback',
				payload: id
			});
		} else {
			this.props.dispatch({
				type: 'comment/saveShowAllCallback',
				payload: false
			});

			this.props.dispatch({
				type: 'comment/saveCallbackComment',
				payload: null
			});
		}
		this.props.dispatch({
			type: 'comment/saveCallbackBlockShow',
			payload: callbackBlockShow
		});
	}

	toggleShowAllCallback(show) {
		this.props.dispatch({
			type: 'comment/saveShowAllCallback',
			payload: show
		});
	}

	changeCommentActive = (item) => {

		this.props.dispatch({
			type: 'playerControl/changeCommentActive',
			payload: item
		});

		if(item.record) {
			this.handleCommentRecordPlay(item.record, item.id);
		} else {
			this.commentRecord.src = '';
			this.commentRecord.pause();
		}
	}


	handleCommentRecordPlay = (record, id) => {
		let clearTimer = () => {
			clearInterval(this.audioCommentTimer);
			this.audioCommentTimer = null;
			this.props.dispatch({
				type: 'comment/saveCommentPlayTimer',
				payload: 0
			});

			this.props.dispatch({
				type: 'comment/saveCommentPlaying',
				payload: false
			});

			this.props.dispatch({
				type: 'comment/saveCommentPlayId',
				payload: 0
			});
		};

		if (id == this.props.commentPlayId) {
			clearTimer();
			this.commentRecord.src = '';
			this.commentRecord.pause();
			return;
		}

		clearInterval(this.audioCommentTimer);
		this.audioCommentTimer = null;
		this.props.dispatch({
			type: 'comment/saveCommentPlayId',
			payload: id
		});
		this.props.dispatch({
			type: 'comment/saveCommentPlaying',
			payload: true
		});

		this.commentRecord.src = record.path;
		this.commentRecord.play();

		let commentPlayTimer = parseInt(record.duration);
		this.props.dispatch({
			type: 'comment/saveCommentPlayTimer',
			payload: commentPlayTimer
		});
        this.audioCommentTimer = setInterval(() => {
			commentPlayTimer--;
			
            if (commentPlayTimer <= 0) {
				clearTimer();
                return;
			} else {
				this.props.dispatch({
					type: 'comment/saveCommentPlayTimer',
					payload: commentPlayTimer
				});
			}
        }, 1000);
	}

	componentWillUnmount() {
		clearInterval(this.audioCommentTimer);
	}

	showDeleteModal = (comment) => {
		let content =
			<span>
				确定删除内容为&nbsp;
					<span style={{color: '#f00'}}>
						“{comment.content.substr(0,20)} {comment.content.length > 20 ? '...' : ''}”
					</span>
				&nbsp;的评论吗？
			</span>;
		this.setState({
			deleteModalShow: true,
			deleteModalTitle: content,
			commentId: comment.id
		});
	}

	deleteComment() {
		this.props.dispatch({
			type: 'comment/deleteComment',
			payload: this.state.commentId
		});
	}

	callbackPerson(name) {
		this.props.dispatch({
			type: 'comment/callbackPerson',
			payload: name
		});
		this.callbackNode.focus();
	}

	changeCallbackText(e) {
		this.props.dispatch({
			type: 'comment/saveCallbackText',
			payload: e.target.value
		});
	}

	sendCallback() {
		this.props.dispatch({
			type: 'comment/sendCallback',
			payload: {}
		});
	}

	onSearchComment = (e) => {
		const {commentShowCompleted, commentSort, fileInfo} = this.props;
        let param = {
            sort: commentSort,
            page: 1,
            show_completed: commentShowCompleted,
            query:  e.target.value,
            pre_page: PRE_PAGE,
            doc_id: fileInfo.id,
            project_id: fileInfo.project_id,
            ...getTokenLocalstorage()
		};

		this.props.dispatch({
            type: 'comment/saveIsCommentPageAll',
            payload: false,
		});

		this.props.dispatch({
            type: 'comment/fetchCommentCommon',
            payload: {
                param,
                url: '/comment'
            }
        });
	}

	toggleCommentCompleted = () => {
		const {commentShowCompleted, commentSort, fileInfo, commentQuery} = this.props;
		let show_completed = commentShowCompleted == 1 ? 0 : 1;
        let param = {
            sort: commentSort,
            page: 1,
            show_completed,
            query: commentQuery,
            pre_page: PRE_PAGE,
            doc_id: fileInfo.id,
            project_id: fileInfo.project_id,
            ...getTokenLocalstorage()
		};

		this.props.dispatch({
            type: 'comment/saveCommentShowCompleted',
            payload: show_completed
		});

		this.props.dispatch({
            type: 'comment/saveIsCommentPageAll',
            payload: false
		});

		this.props.dispatch({
            type: 'comment/fetchCommentCommon',
            payload: {
                param,
                url: '/comment'
            }
        });
	}


	loadMoreComment = () => {
		let {commentShowCompleted, commentSort, commentPage, commentQuery, fileInfo} = this.props;
		commentPage += 1;
        let param = {
            sort: commentSort,
            page: commentPage,
            show_completed: commentShowCompleted,
            query:  commentQuery,
            pre_page: PRE_PAGE,
            doc_id: fileInfo.id,
            project_id: fileInfo.project_id,
            ...getTokenLocalstorage()
		};

		this.props.dispatch({
            type: 'comment/saveCommentPage',
            payload: commentPage,
		});
		this.props.dispatch({
            type: 'comment/saveIsCommentPageAll',
            payload: false,
		});


		this.props.dispatch({
            type: 'comment/pushComment',
            payload: {
                param,
                url: '/comment'
            }
        });
	}

	labelComplete = (e, item) => {
		e.stopPropagation();
		let review = item.review == 1 ? 0 : 1;
		this.props.dispatch({
			type: 'comment/labelComplete',
			payload: {
				comment_id: item.id,
				review
			}
		});
	}

	componentDidMount() {
		// this.commentListNode.addEventListener('scroll', (e) => {
		// 	console.log(e);
		// });
		this.audioCommentTimer = null;
		this.commentRecord = document.getElementById("comment-record");

		this.commentRecord.addEventListener('ended', () => {
			// clearInterval(this.audioCommentTimer)
		});
	}

	changeFileInfoEditing = () => {
		this.props.dispatch({
			type: 'comment/saveFileInfoEditing',
			payload: !this.props.fileInfoEditing
		});
	}

	saveFileDesContent = (value) => {
		this.props.dispatch({
			type: 'comment/saveFileDesContent',
			payload: value
		});
	}

	saveFileInfoDes = () => {
		this.props.dispatch({
			type: 'comment/saveFileInfoDes',
			payload: this.props.fileDesContent
		});
	}

	// 以一分钟为单位计算长度
	getRecordWidth(duration, isComment) {
		let d = Math.ceil(duration / 10) / 6 * 275;
		return d;
	}

	renderCallback = (item, k) => {
		const {
			commentPlayId,
			commentPlaying,
			commentPlayTimer
		} = this.props;

		item.record = null;
		if (item.content.indexOf(COMMENT_RECORD_PREFIXER) > -1) {
			item.record = JSON.parse(JSON.parse(item.content)[COMMENT_RECORD_PREFIXER]);
		}

		return (
			<div className="fc-callback-li" key={k}>
				<div className="fc-callback-li-tx">
					<img src={item.avatar} alt=""/>
				</div>
				<div className="fc-callback-section">
					<header className="fc-callback-header">
						<p>{item.realname}</p>
					</header>
					{item.record ? 
					<p className="record-content" 
					onClick={() => this.handleCommentRecordPlay(item.record, item.id)}
					style={{width: this.getRecordWidth(item.record.duration) + 'px'}}
					>
						{ commentPlayId == item.id && commentPlaying ? <Image name="audio.gif" style={{height: '20px', marginLeft: '-5px'}}/> : <Image name="audio-static.jpg" /> }
						<span>{commentPlayId == item.id && commentPlaying ? commentPlayTimer + '"' :  item.record.duration + '"'}</span>
					</p> : 
					<section className="fc-callback-section" >
						{item.content}
					</section>}
					<footer className="fc-callback-footer">
						<p>{beforeTime(item.created_at)}</p>
						<p onClick={() => this.callbackPerson(item.realname)}>回复</p>
					</footer>
				</div>
			</div>
		);
	}


	render() {
		const {
			commenTabIndex,
			commentClosed,
			callbackBlockShow,
			fileInfo,
			comments,
			callbackComment,
			showAllCallback,
			commentActive,
			callbackText,
			isCallbacking,
			isFilesShare,
			isCommentPageAll,
			isPageCommentLoading,
			commentShowCompleted,
			fileInfoEditing,
			commentPlayId,
			commentPlayTimer,
			commentPlaying
		} = this.props;

		// is-share 判断是否为分享的样式
		let isCommentClosedClass = commentClosed ? 'file-comment-container file-comment-closed' : 'file-comment-container';
		isCommentClosedClass = isFilesShare ? isCommentClosedClass + ' is-share' : isCommentClosedClass;

		return (
		<div className={isCommentClosedClass}>
			<audio src="someaudio.wav" id="comment-record">
			您的浏览器不支持 audio 标签。
			</audio>
			{!commentClosed ?
			<Tooltip placement="left" title="关闭评论" onClick={() => this.toggleCommentPannel(true)}>
				<div className="comment-close-btn">
					<Image name="comment-close.svg"></Image>
				</div>
			</Tooltip> :
			<Tooltip placement="left" title="打开评论" onClick={() => this.toggleCommentPannel(false)}>
				<div className="comment-show-btn">
					<Image name="comment-open.svg"></Image>
					<div className="square"></div>
				</div>
			</Tooltip>}
			<header className="fc-header">
				<ul>
					<li className={commenTabIndex == 0 ? "tab-active": ""} onClick={() => this.changeTab(0)}>
					<span>{comments.length}条评论</span>
					</li>
					<li className={commenTabIndex == 1 ? "tab-active": ""} onClick={() => this.changeTab(1)}>
					<span>文件信息</span>
					</li>
				</ul>
			</header>
			<section className="fc-body" id="fc-body">
				{ commenTabIndex == 0 ?
				<div className="fc-comment-list show-ani">
					<header className="comment-list-do clearfix">
						<div className="search-comment">
							<Input
								placeholder=""
								prefix={<Icon type="search" style={{ color: '#828CA6' }} />}
								onPressEnter={this.onSearchComment}
								ref={node => this.userNameInput = node}
							/>
						</div>

						<div className="other-do clearfix">

							<Tooltip placement="left" title={commentShowCompleted == 1 ? "所有评论" : "未完成的评论"}>
								<div className="do-complete" onClick={() => this.toggleCommentCompleted()}>
									{commentShowCompleted == 1 ?
									<Image name="complete-active.svg"/>:
									<Image name="complete.svg"/>}
								</div>
							</Tooltip>
							{/* <Tooltip placement="top" title="下载评论">
								<div className="do-download">
									<Image name="comment-download.svg"/>
								</div>
							</Tooltip> */}
							<div className="do-sort">
								<CommentSortPannel {...this.props}/>
							</div>
						</div>
					</header>

					<div className="comment-all" ref={node => this.commentListNode = node}>
						{/* 评论列表 */}
						{!callbackBlockShow ?
						<div className="comment-list">
						{ comments.map((item, k) => {
							return (
								<div  key={k} className={commentActive && commentActive.id == item.id ? "comment-li-block active" : "comment-li-block"}
								onClick={() => this.changeCommentActive(item)}>
									<div className="comment-li">
										<div className="cl-tx">
											<img src={item.avatar} alt=""/>
										</div>
										<div className="cl-section">
											<header className="cl-header clearfix">
												<p className="cl-username">{item.realname}</p>
												<p className="cl-time">{timeToMS(item.media_time)}</p>
												{item.label != '[]' ? <div className="cl-is-draw">
													<Image name="draw-comment.svg" />
												</div> : null}
												<div className="cl-complete">
													<Tooltip placement="left" title={item.review == 1 ? '标记未完成' : '标记完成'}>
														<div className="cl-complete-icon" onClick={(e) => {e.stopPropagation();this.labelComplete(e, item);}}>
														{item.review == 1 ? 
														<Image name="complete-comment-active.svg"/>:
														<Image name="complete-comment.svg"/>}
														</div>
													</Tooltip>
												</div>
											</header>
											<section className="cl-content">
												{item.record ? 
												<p className="record-content" style={{width: this.getRecordWidth(item.record.duration) + 'px'}}>
													{ commentPlayId == item.id && commentPlaying ? <Image name="audio.gif" style={{height: '20px', marginLeft: '-5px'}}/> : <Image name="audio-static.jpg" /> }
													<span>{commentPlayId == item.id && commentPlaying ? commentPlayTimer + '"':  item.record.duration + '"'}</span>
												</p> : item.content}
											</section>
											<footer className="cl-footer">
												<p className="cl-delete" onClick={e => {e.stopPropagation();this.showDeleteModal(item);}}>删除</p>
												<p className="cl-create">{beforeTime(item.created_at)}</p>
												<p className="cl-callback" onClick={(e) => {e.stopPropagation();this.toggleCallbackBlock(true, item.id);}}>回复({ item.replies.length})</p>
											</footer>

										</div>
									</div>
								</div>
							);
						})}

							<div className="cl-more-comment">
								{ isCommentPageAll ?
								<button className="load-more">{comments.length == 0 ? '暂无评论':  '已加载全部评论'}</button>:
								<div>
									{!isPageCommentLoading ?
									<button className="load-more" onClick={() => this.loadMoreComment()}>加载更多</button>:
									<Button loading shape="circle" type="primary"></Button>
									}
								</div>}
							</div>
						</div> : null }


						<div className={ callbackBlockShow ? 'fc-callback-body active': 'fc-callback-body'} id="callback-body">
							<div className="comment-list" style={{paddingBottom: 0, height: 'auto'}}>

								{callbackComment ?
								<div className="comment-li">
									<div className="cl-tx">
										<img src={callbackComment.avatar} alt=""/>
									</div>
									<div className="cl-section">
										<header className="cl-header clearfix">
											<p className="cl-username">{callbackComment.realname}</p>
											<p className="cl-time">{timeToMS(callbackComment.media_time)}</p>
											{callbackComment.label != '[]' ?
											<div className="cl-is-draw">
												<Image name="draw-comment.svg" />
											</div> : null}
											<div className="cl-complete">
												<Tooltip placement="left" title="标记完成">
													<div className="cl-complete-icon">
														<Image name="complete-comment.svg"/>
													</div>
												</Tooltip>
											</div>
										</header>
										<section className="cl-content">
											{callbackComment.content}
										</section>
										<footer className="cl-footer">
											<p className="cl-delete" onClick={e => {e.stopPropagation();this.showDeleteModal(callbackComment);}}>删除</p>
											<p className="cl-create">{beforeTime(callbackComment.created_at)}</p>
											<p className="cl-callback" onClick={() => this.toggleCallbackBlock(false)}>收起回复</p>
										</footer>

									</div>
								</div>
								: null}
							</div>

							{/* 回复列表 */}
							{callbackComment ?
							<div className="fc-callback-list">
								{ callbackComment.replies.map((item, k) => {

									if (!showAllCallback && k <= 4){
										return this.renderCallback(item, k);
									}

									if (showAllCallback) {
										return this.renderCallback(item, k);
									}
								})}

							</div> : null}

							{callbackComment && !showAllCallback && callbackComment.replies.length > 5 ?
							<div className="fc-callback-other">
								<span>还有<span>{callbackComment.replies.length - 5}</span>条回复，</span>
								<span onClick={() => this.toggleShowAllCallback(true)}>点击查看</span>
							</div>: null}

							<textarea name="" id="" cols="30" rows="10" className="fc-callback-textarea"
							value={callbackText}
							placeholder="我也说两句..."
							onChange={(e) => this.changeCallbackText(e)}
							ref={node => this.callbackNode = node}
							></textarea>
							{/* <div className="fc-callback-send">
								<button onClick={() => this.sendCallback()}>发送</button>
							</div> */}
							<Button type="primary" size="small" loading={isCallbacking} className="fc-callback-send-btn" onClick={() => this.sendCallback()}>
								{isCallbacking ? '发送中...' : '发送'}
							</Button>
						</div>

					</div>
				</div> : null}

				{ commenTabIndex == 1 ?
				<div className="fc-file-info show-ani">
					<ul className="info-list clearfix">
						<li><p>文件名</p><p>{fileInfo.name}</p></li>
						<li><p>上传者</p><p> {fileInfo.realname}</p></li>
						<li><p>上传日期</p><p> {getLocalTime(fileInfo.created_at)}</p></li>
						<li><p>视频编码</p><p> {fileInfo.encoding}</p></li>
						<li><p>分辨率</p><p> {fileInfo.width} * {fileInfo.height}</p></li>
						<li><p>帧率</p><p> {fileInfo.fps} </p></li>
						<li><p>音频编码</p><p> {fileInfo.audio}</p></li>
						<li><p>文件大小</p><p> {size2Str(fileInfo.size)}</p></li>
						<li><p>时长</p><p>	{timeToMS(fileInfo.time)}</p></li>
					</ul>

					{/* 描述暂时屏蔽 */}
					{ false ?
					<div className="info-des">
						<div className="info-header">
							<div className="info-header-p" onClick={() => this.changeFileInfoEditing()}>
								描述
								<IconBlock iconName="des.svg"></IconBlock>
							</div>
						</div>
						{/* <p>飒飒 咋说</p> */}
						<div className="edit-info-des">
							{fileInfoEditing ?
							<textarea name="" id="" cols="30" rows="10" placeholder="说点什么..." onChange={e => this.saveFileDesContent(e.target.value)}></textarea>:
							fileInfo.description}
						</div>
						{fileInfoEditing ?
						<div className="edit-info-complete">
							<button onClick={() => this.saveFileInfoDes()}>保存</button>
						</div> : null}
					</div> : null}

				</div> : null}


			</section>

			<ComfirmModal
			 visible={this.state.deleteModalShow}
			 content={this.state.deleteModalTitle}
			 onClose={() => this.setState({deleteModalShow: false})}
			 onSure={() => this.deleteComment()}>
			</ComfirmModal>
		</div>
		);
	}
}

export default FileComment;
