

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import FileHeader from '@CPC/FileHeader';
import FileComment from '@CPC/FileComment';
import FilePlayer from '@CPC/FilePlayer';
import ShareList from '@CPC/ShareList';
import PhoneAuth from '@CPC/PhoneAuth';
import WatermarkModal from  '@CPC/WatermarkModal';
import Image from '@CC/Image';
import {Button, notification} from 'antd';
import Loading from '@CC/Loading';
import {getQuery} from '@utils/utils';
// import {Linker} from '../../dev/Link';
import withRouter from 'umi/withRouter';
import { connect } from 'dva';
import './index.scss';

function mapStateToProps(state) {
    return {
      ...state.comment,
      ...state.playerControl,
      ...state.project,
      ...state.file,
      ...state.user,
      ...state.upload,
      ...state.link,
      ...state.global,
      ...state.watermark,
	  ...state.invite,
	  ...state.price,
	  ...state.loading
    };
}

@withRouter
@connect(mapStateToProps)
class FileContainer extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			password: ''
		};
	}

	componentDidMount() {
		const _self = this;
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
		if (!getQuery('r')) {

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
	
	}

	componentWillUnmount() {
		clearInterval(this.t);
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

	render() {
		const {commentClosed, isFilesShare, sharePass, containerShow, pageLoading, phoneAuthModalShow, effects} = this.props;
		// is-share 判断是否为分享的样式
		let classN = isFilesShare ? 'file-container is-share' : 'file-container';

		let normalTemp =
			<div className={classN} style={{paddingRight: commentClosed ? 0 : '340px'}}>
				{isFilesShare ? <ShareList {...this.props}/> : <FileHeader {...this.props}/> }
				{containerShow ? <FilePlayer {...this.props} listenEvent={this.listenEvent}/> : null}
				{containerShow ? <FileComment {...this.props}/> : null}
				{/* <Linker {...this.props}/> */}
				{isFilesShare && !sharePass ?
				<div className="file-password-container">
					<div className="file-password-body">
						<div className="link-lock">
							<Image name="icon-link-lock.svg"></Image>
						</div>
						<p>该分享链接受到密码保护</p>
						<input type="text" onChange={this.passwordChange}/>
						<Button type="primary" onClick={this.toShare}>进入</Button>
					</div>
				</div> : null}
				<WatermarkModal {...this.props}/>
				<Loading visible={
					effects['comment/fetchCommentCommon'] ||  
					effects['comment/fetchComments'] || 
					effects['file/fetchFileInfo'] || 
					effects['file/isLogined'] ||
					effects['playerControl/getPlayerHeight'] ||
					effects['playerControl/initVideoOffset'] 
				}/>
			</div>;

		let phoneTemp = <PhoneAuth {...this.props}/>;

		return phoneAuthModalShow ? phoneTemp : normalTemp;
	}
}

export default FileContainer;
