import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Clipboard from 'clipboard';
import {Button, notification, Divider,  Modal, message } from 'antd';

import Image from '@CC/Image';

import { getQuery, beforeTime, getTokenLocalstorage } from '@utils/utils';
import {PRE_PAGE } from '@config/constants';
import { playStorage, clearStoragePlayTime, saveStoragePlayTime, recordPageStart, pageStayStorage } from '@APP_BRO/burying_point/local_record';
import { FILE_PLAY_TIME, PAGE_TYPES } from '@APP_BRO/burying_point/constants';

import './index.scss';


class MobileFileInfo extends PureComponent {
	constructor(props) {
    super(props);
		this.state = {
      password: '',
      preVisible: false,
      versionX: 0,
      isFocus: false,
      showCommentsReply: false,
      commentList:this.props.comments,
      events: ['delComment','delTouchStart', 'delTouchMove', 'delTouchEnd'],
      showDel: false,
      delTouching: false,
      tsx: 0,
      tsy: 0
		};
  }

  componentWillUnmount() {
    pageStayStorage();
    const fileInfo = this.props.fileInfo;
		playStorage(
			fileInfo.project_id, 
			fileInfo.id, 
			localStorage.getItem(FILE_PLAY_TIME), 
			fileInfo.file_type
		);
  }

  componentDidMount() {
    clearStoragePlayTime();
    recordPageStart(PAGE_TYPES[9]);

    setTimeout(() => {
      this.setState({
        commentList: this.props.comments
      });

      let statusW = 0;
      if (document.getElementById('status-select'))  {
        statusW = document.getElementById('status-select').clientWidth;
      }

      this.setState({
        versionX: statusW + 40,
        showFileStatus: false,
        showFileVersion: false
      });
      // 触底事件
      let self = this;
      if (document.getElementById('comment-list')) {
        document.getElementById('comment-list').onscroll = function(e) {
          var marginBot = 0;
          var J=e.target.scrollHeight;
          var I=e.target.scrollTop;
          var K=e.target.clientHeight;
          marginBot=J-I-K;
          if(marginBot<=0) {
            if(self.props.comments.length == self.props.commentsTotal) {
              return;
            } else {
              self.loadMoreComment();
            }
          }
        };
      }
      this.video = document.getElementById('videoInfo');

      setTimeout(() => {
        this.video.addEventListener('timeupdate', (e) => {
          saveStoragePlayTime(e.target.currentTime);
        });
      }, 200);
     
    }, 100);
  }
  status = [
    {
        review: 3,
        text: '待审核',
        color: 'color-1',
        colorText: ''
    },
    {
        review: 2,
        text: '进行中',
        color: 'color-2',
        colorText: ''
    },
    {
        review: 1,
        text: '审核通过',
        color: 'color-3',
        colorText: ''
    },
    {
        review: 4,
        text: '意见搜集完成',
        color: 'color-4',
        colorText: ''
    },
  ];
  timeToMinAndSec = (time) => {
    if (time >= 1) {
        let minute = parseInt(time / 60) < 10 ? `0${parseInt(time / 60)}` : parseInt(time / 60);
        let seconds = parseInt(time % 60) < 10 ? `0${parseInt(time % 60)}` : parseInt(time % 60);
        return `${minute}:${seconds}`;
    } else {
      return '00:00';
    }
  }
  showChangeFileStatusTips = () => {
    this.setState({
      showFileStatus: true
    });
  }
  showChangeFileVersionTips = () => {
    this.setState({
      showFileVersion: true
    });
  }
  changeFileStatus = (review) => {
    this.props.dispatch({
        type: 'file/changeFileStatus',
        payload: review
    });
  }
  toFile = (file,k) => {
    window.verindex = k+1;
    const {dispatch, commentPage, commentSort, commentShowCompleted, commentQuery, projectActive} = this.props;
        this.props.dispatch({
            type: 'playerControl/initControl',
            payload: {}
        });

        let commentProps = {
            commentPage: 1,
            commentSort: 1,
            commentShowCompleted: 0,
            commentQuery: ''
        };

        this.props.dispatch({
            type: 'comment/saveCommentProp',
            payload: commentProps
        });

        this.props.dispatch({
            type: 'comment/saveIsCommentPageAll',
            payload: false,
		    });

        this.props.dispatch({
            type: 'file/saveContainerShow',
            payload: false,
        });

        this.props.dispatch({
          type: 'file/fetchShareFileInfo',
          payload: file
        });

        let param = {
            ...getTokenLocalstorage(),
            doc_id: file.id,
            project_id: projectActive,
            page: 1,
            sort: 0,
            show_completed: 0,
            query: '',
            pre_page: PRE_PAGE
        }, url = '/comment';

        if (getQuery('r')) {
            param.code = getQuery('r');
            url = '/sharecomment';
        }
        this.props.dispatch({
            type: 'comment/fetchCommentCommon',
            payload: {
                param,
                url,
            }
        });
        this.setState({
          showFileVersion: false
        });
  }
  inputFocus = () => {
    this.setState({
      isFocus: true
    });
  }
  quitFocus = () => {
    this.setState({
      isFocus: false
    });
  }
  changeCommentInput = (e) => {
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
  toCommentsReply = (callbackBlockShow,id) => {
    this.setState({
      showCommentsReply: true
    });

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
  toFileInfo = () => {
    this.setState({
      showCommentsReply: false
    });
  }
  changeCallbackText = (e) => {
		this.props.dispatch({
			type: 'comment/saveCallbackText',
			payload: e.target.value
		});
  }
  sendCallback = () => {
		this.props.dispatch({
			type: 'comment/sendCallback',
			payload: {}
		});
  }
  delComment = (e,id) => {
    e.stopPropagation();
    this.props.dispatch({
			type: 'comment/deleteComment',
			payload: id
		});
  }
  // delTouchStart = (e,index) => {
  //   // console.log(e.touches[0].clientX,'e.touches[0].clientX')
  //   this.state.commentList.map(item => {
  //     item.translateX = 0;
  //     item.delTranstion = '';
  //   });
  //   this.setState({
  //     commentList: this.state.commentList
  //   });

  //   this.setState({
  //     tsx: e.touches[0].clientX,
  //     tsy: e.touches[0].clientY,
  //     delTouching: true
  //   });
  // }
  // delTouchMove = (e,index) => {
  //   console.log('delTouchMove');
  //   if (!this.state.delTouching) return;
  //   let tmx = e.touches[0].clientX;
  //   let tmy = e.touches[0].clientY;
  //   let moveX = tmx - this.state.tsx;
  //   if (!this.state.delTouching || Math.abs(tmy - this.state.tsy) > 5) return;
  //   let commentList = this.state.commentList;
  //   if (!this.state.showDel) {
  //     if (moveX > 0) return;
  //     if (moveX < -100) {
  //       moveX = -100;
  //     }

  //     commentList[index].translateX = moveX;
  //     this.setState({
  //       commentList: commentList,
  //       tex: tmx
  //     });
  //   } else {
  //     if (moveX < 0) return;

  //     if (moveX > 100) {
  //       moveX = 0;
  //     }
  //     commentList[index].translateX = moveX;
  //     this.setState({
  //       commentList: commentList,
  //       tex: tmx
  //     });
  //   }
  // }
  // delTouchEnd = (e,index) => {
  //   console.log('delTouchEnd');
  //   e.stopPropagation();

  //   if (!this.state.delTouching) return;

  //   this.setState({
  //     delTouching: false
  //   });

  //   let commentList = this.state.commentList;

  //   if (commentList[index].translateX < -15) {
  //     commentList[index].translateX = -90;
  //     commentList[index].delTranstion = 'del-transtion';
  //     this.setState({
  //       commentList: commentList,
  //       showDel: true,
  //     });
  //   } else {
  //     this.state.commentList[index].translateX = 0;
  //     this.state.commentList[index].delTranstion = 'del-transtion';
  //     this.setState({
  //       commentList: this.state.commentList,
  //       showDel: false
  //     });
  //   }
  // }
  videoPlay = (e) => {
    e.stopPropagation();
    this.video.play();
  }
	render() {
    const { pageLoading, fileInfo, codeIsLike, comments, review, commentText, isCommentPageAll, isPageCommentLoading, commentsTotal, callbackText, callbackComment } = this.props;

    if (!fileInfo) return null;
    let index = fileInfo.versions.findIndex((v,i) => {
      return v.id === fileInfo.id;
    });
    const statusList = ['审核通过', '进行中', '待审核', '意见搜集完成'];
    const statusColors = [ '#2ae8cb', '#42c0ff', '#ff7f36', '#d3b520'];
    let viewColor = statusColors[this.props.review-1];
    let commentsList = comments.map((item,k) => {
      return (
        <div className="list-body" key={k}>
          <div className="comment-body"
          >
            <div className="comment-master">
              <div className="comment-tou">
                <img src={item.avatar}></img>
              </div>
              <div className="comment-master-text">
                <div className="comment-header clearfix">
                  <span className="comment-name">{item.realname}</span>
                  {item.media_time!=-1?<span className="comment-timer">{this.timeToMinAndSec(item.media_time)}</span>:null}
                </div>
                <div className="comment-body1">
                  <span>{item.content}</span>
                  {this.state.showCommentsReply?null:<div className="comment-do clearfix" onClick={() => this.toCommentsReply(true,item.id)}>
                    <span>回复</span>
                  </div>}
                </div>
              </div>
            </div>
            {item.replies.length?<div className="comment-back" onClick={() => this.toCommentsReply(true,item.id)}>
              {item.replies.length>1?<div className="comment-look-back">查看{item.replies.length - 1}条往期的回复</div>:null}
              <div className="back-body">
                <div className="back-tou">
                  <img src={item.replies[item.replies.length - 1].avatar}></img>
                </div>
                <div className="back-info">
                  <span className="back-name">{item.replies[item.replies.length - 1].realname}</span>
                  <span className="back-text">{item.replies[item.replies.length - 1].content}</span>
                </div>
              </div>
            </div>:null}
          </div>
          <a className="comment-del" onTouchEnd={(e) => this.delComment(e, item.id)} href="javascript:;" style={{backgroundColor: 'red'}}>
            删除
          </a>
        </div>
      );
    });
		return (
      <div className="mobileFileInfo-box">
        {this.state.showCommentsReply?<div className="comments-reply">
          <div className="header" onClick={() => this.toFileInfo()}>
            <div><Image name="backMobile.svg"></Image></div>
            <div><span>{callbackComment.replies.length}条回复</span></div>
            <div></div>
          </div>
          <div className="comment-list">
            <div className="list-body">
              <div className="comment-body">
                <div className="comment-master">
                  <div className="comment-tou">
                    <img src={callbackComment.avatar}></img>
                  </div>
                  <div className="comment-master-text">
                    <div className="comment-header clearfix">
                      <span className="comment-name">{callbackComment.realname}</span>
                      {callbackComment.media_time != -1?<span className="comment-timer">{this.timeToMinAndSec(callbackComment.media_time)}</span>:null}
                    </div>
                    <div className="comment-body1">
                      <span>{callbackComment.content}</span>
                    </div>
                  </div>
                </div>
                {callbackComment.replies.length?<div className="comment-back">
                  {callbackComment.replies.map((item,k) => {
                    return (
                      <div className="back-body" key={k}>
                        <div className="back-tou">
                          <img src={item.avatar}></img>
                        </div>
                        <div className="back-info">
                          <span className="back-name">{item.realname}</span>
                          <span className="back-text">{item.content}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>:null}
              </div>
            </div>
          </div>
          <div className="reply">
            <input
              type="text"
              value={callbackText}
							placeholder="回复评论"
							onChange={(e) => this.changeCallbackText(e)}
							/>
            <div className="comment-footer-right" onClick={() => this.sendCallback()}>
                发送
            </div>
          </div>
        </div>:<div className="mobileFileInfo-container">
          {fileInfo.file_type == 'video'?<div className="section">
            <div className="cover-img">
              <img src={fileInfo.cover_img[0]} alt=""/>
              <div className="play-logo"  onClick={(e) => this.videoPlay(e)}>
                <div className="sanjiao"></div>
              </div>
            </div>
            <video id="videoInfo" controls="controls" src={fileInfo && fileInfo.resolution[0].src} crossOrigin='anonymous'>
              <source src={fileInfo.resolution[0].src} type='video/mp4'/>
            </video>
          </div>:null}
          {fileInfo.file_type == 'audio'?<div className="section">
            <audio controls="controls" src={fileInfo && fileInfo.resolution[0].src}></audio>
          </div>:null}
          {fileInfo.file_type == 'image'?<div className="section">
            <img src={fileInfo.cover_img[0]}></img>
          </div>:null}
          {this.state.isFocus?<div className="comment-box">
            <div className="comment-footer">
              <div className="comment-footer-left" onClick={() => this.quitFocus()}>
                取消
              </div>
              <div className="comment-footer-right" onClick={() => this.sendComment()}>
                发送
              </div>
            </div>
            <div className="push-comment-input clearfix">
                <textarea placeholder="发表评论..." onChange={(e) => this.changeCommentInput(e)} value={commentText} ></textarea>
            </div>
          </div>:<div>
            <div className="video-info">
              <div className="video-make clearfix">
                <div className="video-make-li" id="status-select" onClick={() => this.showChangeFileStatusTips()}>
                  <div className="video-make-status" style={{color:viewColor}}>{this.props.review==0 ? '审核' : statusList[this.props.review-1]}</div>
                  <div className="video-make-arrow"></div>
                </div>
                <div className="video-make-li" id="version-select" onClick={() => this.showChangeFileVersionTips()}>
                  <div className="video-make-status">V{window.verindex?window.verindex:fileInfo.versions.length}版本</div>
                  <div className="video-make-arrow"></div>
                </div>
              </div>
              <div className="video-author">{fileInfo.realname} · {beforeTime(fileInfo.created_at)}</div>
            </div>
            <div className="comment-list"  style={{height: '400px'}} id="comment-list">
              {commentsList}
              {commentsTotal == 0 ?<div className="sofa">
                <Image name="empty.png"></Image>
                <div className="sofa-text">暂时没有评论哦</div>
              </div>:null}
            </div>
            <div className="info-footer-comment-btn">
              <div className="info-footer-comment-btn-body" onClick={() => this.inputFocus()}>
                <div className="comment-btn-text">发表评论</div>
              </div>
              <div className="comment-comment-count">
                {commentsTotal}
              </div>
            </div>
          </div>}

          {this.state.showFileStatus?<div className="info-cover">
            <div className="info-cover-mask" onClick={() => {
              this.setState({
                showFileStatus: false
              });
            }}></div>
            <div className="info-cover-select">
              <div className="info-arrow" style={{left: '20px'}}></div>
              <ul className="info-cover-select-ul">
                <li onClick={() => this.changeFileStatus(0)} className="version-p-li status-name">
                    <div style={{color:'#010101'}}>
                    移除标签
                    </div>
                </li>
                {statusList.map((item, k) => {
                  let color = statusColors[k];
                    return (
                      <li  className="version-p-li status-name" onClick={() => this.changeFileStatus(k+1)} style={{color:color}} key={k}>
                          {item}
                      </li>
                    );
                  })}
              </ul>
            </div>
          </div>:null}
          {this.state.showFileVersion?<div className="info-cover">
            <div className="info-cover-mask" onClick={() => {
              this.setState({
                showFileVersion: false
              });
            }}></div>
            <div className="info-cover-select">
              <div className="info-arrow" style={{left: this.state.versionX+'px'}}></div>
              <ul className="info-cover-select-ul">
                {fileInfo.versions.map((item, k) => {
                    return (
                      <li  className="version-p-li" onClick={() => this.toFile(item,k)} key={k}>
                          <div className="version-name">V{k+1}版本</div>
                          <div className="video-name">{item.name}</div>
                      </li>
                    );
                  })}
              </ul>
            </div>
          </div>:null}
        </div>}
      </div>
		);
	}
}

export default MobileFileInfo;
