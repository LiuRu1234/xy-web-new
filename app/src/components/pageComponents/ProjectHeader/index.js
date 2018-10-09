import React, { PureComponent } from 'react';
import {Input, Icon, Tooltip, Switch} from 'antd';
import TooltipPannel from '@CC/Tooltip';
import IconBlock from '@CC/IconBlock';
import Image from '@CC/Image';
import Modal from '@CC/Modal';

import {MemberPannel} from '@CCP/TooltipPannel';
import HeaderRight from '@CPC/HeaderRight';
import ShareModal from '@CPC/ShareModal';

import {PROJECT_TABS} from '@config/constants';
import {size2Str} from '@utils/utils';
import './index.scss';

class ProjectHeader extends PureComponent {
	constructor(props) {
		super(props);
	}

	changeBody(tabIndex) {
		const {dispatch, projectActive, docActive, likeLinkParam} = this.props;

		new Promise((resolve, reject) => {
			dispatch({
				type: 'project/saveTabIndex',
				payload: tabIndex	 
			});
			if (tabIndex != 2) {
				dispatch({
					type: 'link/saveLikeLinkListAll',
					payload: false
				});
				dispatch({
					type: 'link/saveLikeLinkParam',
					payload: {
						page: 1,
						per_page: 10
					}
				});

				dispatch({
					type: 'link/saveLikeLinkList',
					payload: []
				});
			}
			
			resolve();
		}).then(() => {
			setTimeout(() => {
				switch(tabIndex) {
					case 0:
						dispatch({
							type: 'project/fetchFiles',
							payload: {
								project_id: projectActive,
								doc_id: docActive
							}	 
						});
						break;
					case 1:
						dispatch({
							type: 'link/fetchLink',
							payload: {
								project_id: projectActive,
								doc_id: docActive
							}	 
						});
						break;
					case 2: 
						if(this.props.likeLinkList.length < 10) {
							dispatch({
								type: 'link/saveLikeLinkParam',
								payload: {
									page: likeLinkParam.page,
									per_page: 1
								}	 
							});
							dispatch({
								type: 'link/saveLikeLinkList',
								payload: []
							});

							dispatch({
								type: 'link/fetchLikeLink',
								payload: {}	 
							});
						}
					
						break;
					case 3: 
						break;
				}
			}, 500);
		});
	}

	toggleProjectShare() {
		// this.props.dispatch({
		// 	type: 'project/saveProjectLinkModalShow',
		// 	payload: projectLinkModalShow	 
		// });
		
		this.props.dispatch({
			type: 'link/saveIsSharing',
			payload: true	 
		});
	}
	
	toggleAddMember(addMemberShow) {
		this.props.dispatch({
			type: 'project/saveAddMemberShow',
			payload: addMemberShow	 
		});
		if (addMemberShow) {
			this.props.dispatch({
				type: 'project/fetchAllMember',
				payload: {}	 
			});

			this.props.dispatch({
				type: 'invite/getInviteCode',
				payload: {}
			});
		} 
	}

	showPriceModal() {
		this.props.dispatch({
            type: 'price/savePriceModalShow',
            payload: true
		});
		
		this.props.dispatch({
            type: 'price/saveStep',
            payload: 0
        });
	}

	render() {
		const { tabIndex, projectLinkModalShow, members, projectActive, projectsList, isSharing, userInfo, isWarning } = this.props;

		let currentProject= null;
		if (projectsList.length > 0 && projectActive) {
			currentProject = projectsList.filter(item => item.id == projectActive)[0];
		}

		return (
			// style={{height: '154px'}}
		<div className="project-header-container" style={{height: (userInfo.end_day <= 7 || isWarning) ? '154px': '' }}>
			{(userInfo.end_day <= 7 || isWarning) ? 
			<p className="project-header-tip"> 
				{isWarning ? 
				<span>您的账户目前等级为免费用户，目前用量已超过限制，请您及时
					<a href="javascript:;" onClick={() => this.showPriceModal()}>升级</a>
					账号用量或者进行用量删减，以避免账户使用受限。
				</span>:
				<span>
					您的账户会员即将到期，请前去
					<a href="javascript:;" onClick={() => this.showPriceModal()}>升级</a>
					避免影响正常使用
				</span>}
				<Image name="vip-tip.jpg"></Image>
				<span className="project-header-contact">如有问题，请联系：400-650-0116</span>
			</p> : null}
			<div className="ph-one clearfix" style={{filter: isSharing ? 'blur(3px)' : '' }}>
				<div className="ph-one-left clearfix">
					<div className="ph-one-img">
						{/* <img src="" alt=""/> */}
						{currentProject && currentProject.name[0]}
					</div>
					{currentProject ? 
					<div className="ph-one-des">
						<p className="ph-one-p1">{currentProject.name}</p>
						<p className="ph-one-p2">{currentProject.file_count}项 共{size2Str(currentProject.storage_count)}</p>
					</div> : null}
				</div>
				<div className="ph-one-right clearfix">
					<HeaderRight {...this.props}/>
				</div>
	
			</div>
			<div className="ph-two clearfix" style={{filter: isSharing ? 'blur(3px)' : '' }}>
				<div className="ph-two-left">
					<ul className="clearfix">
						{PROJECT_TABS.map((item, k) => {
							return (
								<li className={tabIndex == k ? 'tab-active' : ''} key={k} onClick={() => this.changeBody(k)}>
									<IconBlock iconName={item.icon} direction="left" renderClass="icon-none"></IconBlock>
									<IconBlock iconName={item.iconActive} direction="left" renderClass="icon-active"></IconBlock>
									<span>{item.name}</span>
								</li>
							);
						})}
					
						{/* <li className={tabIndex == 1 ? 'tab-active' : ''} onClick={() => this.changeBody(1)}>
							<IconBlock iconName="link.svg" direction="left" renderClass="icon-none"></IconBlock>
							<IconBlock iconName="link-active.svg" direction="left" renderClass="icon-active"></IconBlock>
							<span>分享</span>
						</li>
						<li className={tabIndex == 2 ? 'tab-active' : ''} onClick={() => this.changeBody(2)}>
							<IconBlock iconName="like.svg" direction="left" renderClass="icon-none"></IconBlock>
							<IconBlock iconName="like-active.svg" direction="left" renderClass="icon-active"></IconBlock>
							<span>收藏</span>
						</li>
						<li className={tabIndex == 3 ? 'tab-active' : ''} onClick={() => this.changeBody(3)}>
							<IconBlock iconName="notice-tab.svg" direction="left" renderClass="icon-none"></IconBlock>
							<IconBlock iconName="notice-tab-active.svg" direction="left" renderClass="icon-active"></IconBlock>
							<span>消息</span>
						</li>

						<li className={tabIndex == 4 ? 'tab-active' : ''} onClick={() => this.changeBody(4)}>
							<IconBlock iconName="pack.svg" direction="left" renderClass="icon-none"></IconBlock>
							<IconBlock iconName="pack-active.svg" direction="left" renderClass="icon-active"></IconBlock>
							<span>应用</span>
						</li> */}
					</ul>
				</div>
				<div className="ph-two-right">
					{tabIndex == 0 ? 
					<div className="ph-share">
						<button onClick={() => this.toggleProjectShare(true)}><Image name="add-share.svg"/>分享</button>
					</div> : null}
					<div className="ph-member">
						<ul className="clearfix">
							{currentProject && currentProject.type != 'member' ? 
							<li>
								{/* <Image name="add-member.svg"></Image> */}
								<MemberPannel {...this.props} toggleAddMember={(addMemberShow) => this.toggleAddMember(addMemberShow)}/>
							</li> : null}

							{members.map((item, k) => {
								if (k <= 4){
									return (
										<li key={k}>
											{item.avatar == '' ? <span className="ph-member-avatar" style={{background: item.avatar_background_color}}>{item.realname[0]}</span> : <img src={item.avatar}></img>}				
										</li>
									);
								}
							})}
	
						</ul>
					</div>
					
				</div>
			</div>

			<ShareModal {...this.props}/>
			{isSharing ? <div className="project-share-cover"></div> : ''}
		</div>
		);
	}
}

export default ProjectHeader;
