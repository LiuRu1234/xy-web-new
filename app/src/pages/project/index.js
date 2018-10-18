import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import {notification, message} from 'antd';
import withRouter from 'umi/withRouter';

import ComfirmModal from '@CC/ComfirmModal';
import Image from '@CC/Image';
import Loading from '@CC/Loading';

import {ProjectSettingModal} from '@CCP/ModalPanel';
import NoticeModal from '@CCP/NoticeModal';

import ProjectHeader from '@CPC/ProjectHeader';
import ProjectSlide from '@CPC/ProjectSide';
import ProjectBody from '@CPC/ProjectBody';
import PhoneAuth from '@CPC/PhoneAuth';
import PriceTip from '@CPC/PriceTip';

import { CURRENT_LOCATION } from '@config/constants';
import './index.scss';


function mapStateToProps(state) {
  return {
    ...state.project,
    ...state.user,
    ...state.upload,
    ...state.link,
    ...state.application,
    ...state.global,
    ...state.watermark,
	...state.invite,
	...state.price,
	...state.loading
  };
}

@withRouter
@connect(mapStateToProps)
class ProjectContainer extends PureComponent {
	constructor(props) {
		super(props);
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

	componentWillUnmount() {
		clearInterval(this.t);
	}

	deleteProject = () => {
		this.props.dispatch({
			type: 'project/deleteProject',
			payload: this.props.deleteProject.id
		});
	}

	quitProject = () => {
		this.props.dispatch({
			type: 'project/quitProject',
			payload: this.props.quitProject.id
		});
	}

	deleteFile = () => {
		this.props.dispatch({
			type: 'project/deleteFile',
			payload: {}
		});
	}

	hideDeleteProject = () => {
		this.props.dispatch({
			type: 'project/saveDeleteProjectModalShow',
			payload: false
		});
	}

	hideQuitProject = () => {
		this.props.dispatch({
			type: 'project/saveQuitProjectModalShow',
			payload: false
		});
	}

	hideDeleteFile = () => {
		this.props.dispatch({
			type: 'project/saveDeleteFileModalShow',
			payload: false
		});
	}

	toggleNoticeModal = (noticeModalShow) => {
        this.props.dispatch({
			type: 'global/saveNoticeModalShow',
			payload: noticeModalShow
        });
    }

	renderNoticeInfo() {
		const {systemMessage} = this.props;
		let content = '';
		if (systemMessage.type == 1) {
			content =
			<ul className="notice-info-content">
				{systemMessage.content.list.map((item, k) => {
					return (
						<li key={k}>
							<header>{item.title1}</header>
							<ul className="content-li">
							{item.content1.map((item, k) => {
								return (
									<li key={k}>{item}</li>
								);
							})}
							</ul>
						</li>
					);
				})}
			</ul>;
		} else {
			content =
			<div className="notice-info-content">
				您的账号通过系统升级为{systemMessage.content.vip_name}, 新的套餐为:<br/>
				1.{systemMessage.content.storage_max}G；<br/>
				2.{systemMessage.content.project_max}个项目数；<br/>
				3.{systemMessage.content.member_max}个人员数；<br/>
				4.有效期为{systemMessage.content.time_at}天。
			</div>;
		}

        return (
            <div className="notice-info">
				{content}
            </div>
        );
    }

	render() {
		const {
			projectActive,
			projectsList,
			deleteProjectModalShow,
			deleteFileModalShow,
			deleteFile,
			deleteProject,
			quitProject,
			noticeModalShow,
			systemMessage,
			quitProjectModalShow,
			phoneAuthModalShow,
			userInfo,
			isWarning,
			effects
		} = this.props;

		let deleteContent = (content, title) => {
			let dc = '';
			if (projectsList.length > 0 && projectActive) {
				dc = (
					<div className="delete-project">
						<div className="del-pro-title">
							<Image name="pd-warning.svg"></Image>
							{title}
						</div>
						{content}
					</div>
				);
			}
			return dc;
		};

		let currentProject = projectsList.filter((item, k) => item.id == projectActive)[0];

		let normalTemp =
		//  style={{paddingTop: "154px"}}
			<div className="project-container" style={{paddingTop: (userInfo.end_day <= 7 || isWarning) ? '154px': '' }}>
				<ProjectHeader {...this.props}/>
				<ProjectSlide {...this.props}/>
				<ProjectBody {...this.props}/>
				{/* <Linker {...this.props}/> */}
				<ProjectSettingModal {...this.props}/>
				<ComfirmModal
				visible={deleteProjectModalShow}
				content={deleteContent(`确定删除项目 “${deleteProject && deleteProject.name}” 吗？所有与之相关的媒体资源都将被删除且不可恢复`, '删除')}
				onSure={this.deleteProject}
				onClose={this.hideDeleteProject}
				/>

				<ComfirmModal
				visible={quitProjectModalShow}
				content={deleteContent(`确定要离开项目 “${quitProject && quitProject.name}” 吗？`, '退出')}
				onSure={this.quitProject}
				onClose={this.hideQuitProject}
				/>

				<ComfirmModal
				visible={deleteFileModalShow}
				content={deleteContent(deleteFile && `确定删除  ${deleteFile.name}   吗？`)}
				onSure={this.deleteFile}
				onClose={this.hideDeleteFile}
				/>

				<Loading visible={
					effects['project/fetchProjects'] ||  
					effects['project/fetchFiles'] || 
					effects['project/fetchMember'] || 
					effects['project/isLogined']
				}/>

				{systemMessage ?
				<NoticeModal visible={noticeModalShow}
				onClose={this.toggleNoticeModal}
				titile={systemMessage.content_name}
                >
                    {this.renderNoticeInfo()}
                </NoticeModal> : null}
			</div> ;

		let phoneTemp = <PhoneAuth {...this.props}/>;

		return phoneAuthModalShow ? phoneTemp : normalTemp;

	}
}

export default ProjectContainer;
