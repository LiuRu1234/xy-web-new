import React, { PureComponent } from 'react';
import TooltipPannel from '@CC/Tooltip';
import IconBlock from '@CC/IconBlock';
import { ProjectLabelPannel } from '@CCP/TooltipPannel';
import Image from '@CC/Image';
import {Input, Icon, Tooltip, Progress, Switch, List} from 'antd';
import { routerRedux } from 'dva/router';
import './index.scss';

class ProjectSide extends PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			personOpened: false,
			projectNameSearch: '',
			otherClick: false
		};
	}

	onChangeUserName = (e) => {
		this.setState({ projectNameSearch: e.target.value });
	}

	emitEmpty = () => {
		this.setState({ projectNameSearch: '' });
		this.props.dispatch({
			type: 'project/searchProject',
			payload: ''
		});
	}

	showProjectSet = (e) => {
		e.stopPropagation();

		this.props.dispatch({
			type: 'project/toggleProjectSetting',
			payload: {
				isShow: true,
				showType: 'create'
			}	 
		});
	}

	// 跳转项目
	pushProject = (project) => {
		const {otherClick, dispatch, tabIndex, projectActive, docActive} = this.props;

		if (otherClick) return; 

		this.props.dispatch({
			type: 'global/savePageLoading',
			payload: true
		});
		
		this.props.dispatch(routerRedux.push({
            pathname: '/project',
            query: { d: 0, p: project.id},
		}));

		if (tabIndex == 1) {
			dispatch({
				type: 'link/fetchLink',
				payload: {
					project_id: projectActive,
					doc_id: docActive
				}	 
			});
		}
	}

	//转为GB
	toGb = (n, floatN) => {
		if (floatN) {
			return parseFloat(n / Math.pow(1024, 3)).toFixed(floatN);
		} else {
			return n / Math.pow(1024, 3);
		}
	}

	searchProject = (e) => {
		this.props.dispatch({
			type: 'project/searchProject',
			payload: e.target.value
		});
	}

	backHome = () => {
		if(process.env.NODE_ENV === 'production') {
			window.location.href = 'http://' + window.location.host;
		} else {
			window.location.href = 'http://' + window.location.host + '/#/project';
		}
	}

	toggleHideAdminPl = () => {
		const {plAdminShow} = this.props;

		if (plAdminShow) {
			this.props.dispatch({
				type: 'project/savePlAdminShow',
				payload: false
			});
		} else {
			this.props.dispatch({
				type: 'project/savePlAdminShow',
				payload: true
			});
		}	
	}

	toggleHideMemberPl = () => {
		const {plMemberShow} = this.props;

		if (plMemberShow) {
			this.props.dispatch({
				type: 'project/savePlMemberShow',
				payload: false
			});
		} else {
			this.props.dispatch({
				type: 'project/savePlMemberShow',
				payload: true
			});
		}	
	}

	renderLogo() {
		return (
			<div className="ps-logo-body tooltip-cover-btn" onClick={this.backHome}>
				<Image name="logo.svg" /> 
				{/* <IconBlock iconName="down.svg" renderClass={this.state.personOpened ? 'up-animate' : ''}/> */}
			</div>
		);
	}


	render() {
		const { projectNameSearch } = this.state;
		const {projectSetModalShow, projectsList, projectActive, isSharing, userInfo, plAdminShow, plMemberShow} = this.props;
		const suffix = projectNameSearch ? <Icon type="close-circle" onClick={this.emitEmpty} /> : null;

		let amdinPlLength = projectsList.filter(item => item.type == 'admin').length;
		let memberPlLength = projectsList.filter(item => item.type == 'member').length;

		let adminPlHeight = plAdminShow ? amdinPlLength * 50 : 0;
		let memberPlHeight = plMemberShow ? memberPlLength * 50 : 0;

		return (
		<div className="project-side-container" style={{filter: isSharing ? 'blur(3px)' : ''}}>
			<div className="ps-header">
				<div className="ps-logo">
					{this.renderLogo()}
					{/* <TooltipPannel
						btnTitle={() => this.renderLogo()}
						width={150}
						// height={100}
						onClick={() => this.setState({personOpened: true})}
						onHide={() => this.setState({personOpened: false})}
						renderTemplate={() => <div>888</div>}
					/> */}

					<div className="ps-search-project">
						<Input
							placeholder="项目名称"
							prefix={<Icon type="search" style={{ color: 'rgba(255,255,255,0.3)' }} />}
							suffix={suffix}
							value={projectNameSearch}
							onChange={(e) => this.onChangeUserName(e)}
							ref={node => this.userNameInput = node}
							onPressEnter={e => this.searchProject(e)}
						/>
					</div>
				</div>


				<ul className="ps-cate">
					<li>
						<div className="ps-title" onClick={() => this.toggleHideAdminPl()}>
							<span>我的项目</span>
							<IconBlock
							 iconName="add-pro.svg" 
							 renderClass="add-icon" 
							 alt="创建项目" 
							 imgId='create-project'
							 onClick={this.showProjectSet}/>
						</div>
						<ul className="ps-projects" style={{height: adminPlHeight + 'px'}}>
							{projectsList.map((item, k) => {
								if (item.type == 'admin') {
									return (
										<li key={k} style={{background: projectActive == item.id ? '#1B1C24' : ''}} 
										onClick={() => this.pushProject(item)}>
											<div className="ps-li">
												{/* color-2 */}
												<span className="ps-label">
													<span style={{background: item.color}}></span>
												</span>
												{item.name.length <= 18 ? 
												<span className="ps-name">
													{item.name}	
												</span> : 
												<Tooltip placement="top" title={item.name}>
													<span className="ps-name">
														{item.name}	
													</span>
												</Tooltip>}
												<ProjectLabelPannel {...this.props} type='admin' data={item}/>
											</div>	
										</li>
									);
								}
							})}
						</ul>
					</li>
					<li>
						<div className="ps-title" onClick={() => this.toggleHideMemberPl()}>
							<span>参与项目</span>
						</div>
						<ul className="ps-projects" style={{height: memberPlHeight + 'px'}}>
							{projectsList.map((item, k) => {
								if (item.type == 'member') {
									return (
										<li key={k} style={{background: projectActive == item.id ? '#1B1C24' : ''}}
										onClick={() => this.pushProject(item)}>
											<div className="ps-li">
												<span className="ps-label">
													<span style={{background: item.color}}></span>
												</span>
												{item.name.length <= 18 ? 
												<span className="ps-name">
													{item.name}	
												</span> : 
												<Tooltip placement="top" title={item.name}>
													<span className="ps-name">
														{item.name}	
													</span>
												</Tooltip>}
												<ProjectLabelPannel  {...this.props} type='member' data={item}/>
											</div>	
										</li>
									);
								}
							})}
						</ul>
					</li>
				</ul>
				
			</div>

			<div className="user-volume">
				<Progress percent={this.toGb(parseInt(userInfo.storage / userInfo.storage_max * 100))} status="active" format={() => null}/>
				<p>{this.toGb(userInfo.storage, 2)}G / {this.toGb(userInfo.storage_max)}G</p>
			</div>

			{isSharing ? <div className="project-share-cover"></div> : ''}
		</div>
		);
	}
}

export default ProjectSide;
