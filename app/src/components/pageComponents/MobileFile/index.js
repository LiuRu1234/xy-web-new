import React, { PureComponent } from 'react';
import {Button, notification, Divider,  Modal, message } from 'antd';
import Clipboard from 'clipboard';
import { routerRedux } from 'dva/router';
import PropTypes from 'prop-types';
import Dialog from 'rc-dialog';

import Image from '@CC/Image';

import {getQuery, getLocalTime} from '@utils/utils';
import { playStorage, clearStoragePlayTime, saveStoragePlayTime, recordPageStart, pageStayStorage, relayStorage } from '@APP_BRO/burying_point/local_record';
import { FILE_PLAY_TIME, PAGE_TYPES } from '@APP_BRO/burying_point/constants';

import './index.scss';


class MobileFile extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
      password: '',
      preVisible: false,
      visible:  window.showModal==false? false:true
		};
  }

  componentDidMount() {
    const _self = this;
    recordPageStart(PAGE_TYPES[8]);
    if (!this.clipboard) {
        this.clipboard = new Clipboard('#copy-mobile-share-link', {
            text: () => {
                const { createdLinkModalData } = this.props;
                let shareLink = window.location.host + '/xyapp/#/file?r=' + createdLinkModalData.code;
                if (createdLinkModalData.password != '') {
                    shareLink = '链接：' + shareLink + '密码：' + createdLinkModalData.password;
                }
                return shareLink;
            }
        });
        this.clipboard.on('success', (e) => {
            if (_self.copying) return;

            // 埋点
            if (_self.props.history.location.query.r) {
                relayStorage('移动端分享内页转发');
            } else {
                relayStorage('移动端内页转发');
            }
            message.success('复制链接成功');
            _self.copying = true;
            setTimeout(() => {
                _self.copying = false;
            }, 2000);
        });
    }
  }

  componentWillUnmount() {
    pageStayStorage();
    this.clipboard && this.clipboard.destroy();
  }

  showPreModal = () => {
    this.setState({
      preVisible: true,
    });
  }
  handlePreOk = (e) => {
    this.setState({
      preVisible: false,
    });
  }
  handlePreCancel = (e) => {
    this.setState({
      preVisible: false,
    });
  }
  saveLike = () => {
		this.props.dispatch({
			type: 'file/getLike',
			payload: !this.props.codeIsLike ? 1 : 0
		});
  }
  toMobileInfo = (e,item) => {
    e.stopPropagation();
    window.verindex = item.versions.length;
    this.setState({
      visible:false
    });
    window.showModal = false;
    if(item.file_type!='video' && item.file_type!='audio' && item.file_type!='image'){
      message.error('当前文件格式暂时不支持查看');
      return;
    }
    let code = getQuery('r');
    this.props.dispatch(routerRedux.push({
      pathname: '/mobilefile_info',
      query: { r: code, f: item.id },
    }));
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
			payload: item
		});
  }

  passwordChange = (e) => {
		this.setState({
			password: e.target.value
		});
	}

	toShare = () => {
		let code = getQuery('r');
		this.props.dispatch({
			type: 'file/fetchShareList',
			payload: {code, password: this.state.password}
		});
  }
  videoPlay = (e,k) => {
    e.stopPropagation();
    let video = document.getElementById('video'+k);
    video.play();
  }
	render() {
    const {commentClosed, isFilesShare, sharePass, containerShow, pageLoading, shareFileList, fileInfo, codeIsLike, createdLinkModalData } = this.props;
    let codeUrl = '//www.uxinyue.com/api/getqrcode?code=' + createdLinkModalData.code;
    // let codeUrl = '//www.uxinyue.com/api/getqrcode?code=526620837b8805b3';
    let shareFileListView = shareFileList.map((item,k) => {
      return (
        <div className="share-list-view-video" key={k}>
          <div className="share-list-video">
            { item.file_type == 'image' ?
						<div className="sharelist">
							<img src={item.cover_img[0]} alt=""/>
						</div> : null}
						{ item.file_type == 'video' ? <div className="sharelist">
            <div className="cover-img">
              <img src={item.cover_img[0]} alt=""/>
              <div className="play-logo"  onClick={(e) => this.videoPlay(e,k)}>
                <div className="sanjiao"></div>
              </div>
            </div>
            <video id={'video'+ k} controls="controls" src={item.project_file.url}>
              <source src={item.project_file.url} type='video/mp4'/>
            </video>
            </div> : null}
            {['zip', 'rar', '7z'].indexOf(item.ext) > -1 ? <div className="sharelist"><div className="share-li-img-block"><Image name="compress_big.svg"></Image> </div></div>: null}
						{item.file_type == 'audio' ? <div className="sharelist"><audio controls="controls" src={item.project_file.url}></audio></div> : null}
            {['zip', 'rar', '7z'].indexOf(item.ext) == -1 && ['video', 'audio', 'image'].indexOf(item.file_type) == -1 ?
						<div className="sharelist"><div className="share-li-img-block bg">{item.ext}</div></div>  : null}

            <div className="info">
                <div className="info-left">
                  <div className="avatar">
                    <img src={item.user_info.avatar}></img>
                  </div>
                  <div className="info-name">
                    <div className="name">{item.user_info.realname}</div>
                    <div className="count">{item.review}次播放</div>
                  </div>
                </div>
                <div className="comment" onClick={(e) => this.toMobileInfo(e,item)}>
                  <Image name="pen.png"></Image>
                  <span>意见评论</span>
                </div>
            </div>
          </div>
        </div>
      );
    });
    const maskStyle = {
      background:'#010101'
    };
    const bodyStyle = {
      background:'#fff',
      borderRadius: 0,
      padding: 0,
      margin: 0,
      top: '50%',
      marginTop:'-200px'
    };
		return (
      <div>
        <div className="mobileFile-box">
        <div className="share-list-top clearfix">
              <div className="wx-logo" onClick={() => this.showPreModal()}>
                <img src={codeUrl}></img>
              </div>
              <div className="list-info">
                <div className="share-list-name">{createdLinkModalData.share_name}</div>
                <div className="share-list-info">
                    <div>查看数：<span className="white_info">{createdLinkModalData.review}</span></div>
                    <div>包含<span className="white_info">{shareFileList.length}</span>个文件</div>
                    <div className="deadline">有效期：<span>{createdLinkModalData.deadline == 0 ? '永久有效' : getLocalTime(createdLinkModalData.deadline)}</span></div>
                    <div>密码：<span className="white_info">{createdLinkModalData.password?createdLinkModalData.password:'无'}</span></div>
                </div>
              </div>
            </div>
            <div className="share_btns">
              <div className="share_link_btn" id="copy-mobile-share-link">
                {createdLinkModalData.password?<div className="share-list-copyBtn">
                  <span>复制链接及密码</span>
                </div>:<div className="share-list-copyBtn">
                  <span>复制链接</span>
                </div>}

              </div>
              {/* <div className="share_btns_text share_link">
                <div className="toshare">
                  <button>
                    <Image name="share_btn.svg"></Image>
                    <div>转发</div>
                  </button>
                </div>
              </div> */}
              <div className="share_btns_text collection_link">
                <div className="button" onClick={() => this.saveLike()}>
                {codeIsLike ? <div>
                    <Image name="collected.svg"></Image>
                    <div>已收藏</div>
                  </div> : <div>
                    <Image name="collection.svg"></Image>
                    <div>收藏</div>
                  </div>}
                </div>
              </div>
            </div>
          <div className="mobileFile-container">
            <Modal
              footer={null}
              closable={false}
              maskStyle={maskStyle}
              style={bodyStyle}
              visible={this.state.preVisible}
              onOk={() => this.handlePreOk()}
              onCancel={() => this.handlePreCancel()}
              wrapClassName = "prePicModal"
            >
              <div className="wxcode">
                <img src={codeUrl}></img>
              </div>
            </Modal>

            {shareFileListView}
          </div>
          <div className="bottom">
            <div className="hadBottom">到底了</div>
            <Image name="bottom_bac.png"></Image>
          </div>
        </div>
        {isFilesShare && !sharePass ?
				<div className="info-password-cover">
          <div className="info-password-modal">
          <form>
            <div className="info-password-title">密码</div>
            <div className="info-password-input">
                <input type="text" name="linkPassword" onChange={(e) => this.passwordChange(e)}/>
            </div>
            <div className="passwordSure" onClick={() => this.toShare()}>确定</div>
          </form>
        </div>
        </div> : null}

        {/* 弹窗 */}
        {sharePass?<div>
          <Dialog
            visible={this.state.visible}
            className="modal-body no-padding-bottom notice"
            closable={false}
            wrapClassName="modal-container2"
            >
              <section className="modal-section notice" style={{paddingBottom: this.props.footer ? '' : '20px'}}>
                <Image className="background" name="modal-back.png"></Image>
                <div className="modal-header2">
                  新阅小程序已上线，可更快更便捷操作，并支持圈点化评论
                  {/* <div className="modal-tips">更多操作，请长按二维码<br/>进入小程序</div> */}
                </div>
                <div className="modal-bodyer">
                  <div className="modal-wxcode">
                    <Image name="wxcode-scan.svg"></Image>
                    <div className="wxpic">
                      <img src={codeUrl}></img>
                    </div>
                  </div>
                  <div className="tips">
                    长按二维码进入小程序
                  </div>
                  <div className="modal-know" onClick={() => {
                    setTimeout(() => {
                      document.body.style['overflow'] = 'visible';
                    }, 300);
                    this.setState({visible:false});

                  }}>
                    <div>关闭</div>
                  </div>
                </div>
              </section>
            </Dialog>
        </div>:null}

      </div>
		);
	}
}

export default MobileFile;
