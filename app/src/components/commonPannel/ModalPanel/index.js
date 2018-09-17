import React, { PureComponent } from 'react';
import Modal from '@CC/Modal';
import IconBlock from '@CC/IconBlock';
import Image from '@CC/Image';
import {Switch}from 'antd';
import {PRO_COLOR} from '@config/constants';
import styles from './index.css';


class CreateLi extends PureComponent{
	constructor(props) {
		super(props);

	}

	switchChange = (v) => {
		const {projectSetting, dispatch, field} = this.props;
		projectSetting[field] = v ? 1 : 0;
		dispatch({
			type: 'project/saveProjectSetting',
			payload: projectSetting
		});
	}

	setColor = (projectColor) => {
		// console.log(projectColor, 'projectColor');
		const {projectSetting, dispatch, field} = this.props;
		let ps = JSON.parse(JSON.stringify(projectSetting));
		ps[field] = projectColor;
		dispatch({
			type: 'project/saveProjectSetting',
			payload: ps
		});
	}

	render() {
		const {first, icon, labelName, field, projectSetting, projectSetModalShow} = this.props;
		if (!projectSetModalShow) return null; 
		
		return (
			<div className="ps-create-group-li clearfix" style={{paddingLeft: icon ? '' : 0}}>
				{icon ? <IconBlock iconName={icon} direction="left"/> : null}
				<p>{labelName}</p>
				{labelName != '标记' ? 
				<div className="ps-create-li-switch">
					{first ? 
					<Switch  checkedChildren="公开" unCheckedChildren="私有" defaultChecked={parseInt(projectSetting[field]) == 1 ? true : false} onChange={this.switchChange}/> :
					<Switch  onChange={this.switchChange} defaultChecked={parseInt(projectSetting[field]) == 1 ? true : false}/>}
				</div>:
				<ul className="ps-create-label-list">
					{PRO_COLOR.map((item, k) => {
						return (
							<li className={projectSetting.color == item ? "active" : ""} key={k}
							onClick={() => this.setColor(item)}></li>
						);
					})}
				</ul>
				}
			</div>
		);
	}
}

// 项目设置/创建项目
export class ProjectSettingModal extends PureComponent{
    constructor(props) {
		  super(props);
		  this.state = {
			projectColor: '#FF635D'
		};
	}

	closeProjectSet = () => {
		this.props.dispatch({
			type: 'project/toggleProjectSetting',
			payload: {
				isShow: false
			}	 
		});

		this.props.dispatch({
			type: 'project/initProjectSetting',
			payload: {}
		});
	}

	setName = (e) => {
		const {projectSetting, dispatch} = this.props;
		projectSetting['name'] = e.target.value;
		dispatch({
			type: 'project/saveProjectSetting',
			payload: projectSetting
		});
	}

	saveProject = () => {
		this.props.dispatch({
			type: 'project/saveProject',
			payload: {}
		});
	}

	deleteProject = () => {
		this.props.dispatch({
			type: 'project/saveProjectSetModalShow',
			payload: false
		});
		this.props.dispatch({
			type: 'project/saveDeleteProjectModalShow',
			payload: true
		});
		let deleteProject = this.props.projectsList.filter(item => item.id == this.props.projectActive)[0];
		this.props.dispatch({
			type: 'project/saveDeleteProject',
			payload: deleteProject
		});
	}

	renderCreateFooter() {
		let createFooter = (
			<div className="ps-create-footer">
				<button className="create" onClick={this.saveProject}>创建项目</button>
			</div>
		);

		let settingFooter = (
			<div className="ps-create-footer">
				<button className="delete" onClick={this.deleteProject}>删除项目</button>
				<button className="save" onClick={this.saveProject}>保存项目</button>
			</div>
		);

		return this.props.createOrSetting == 'create' ? createFooter : settingFooter;
	}

	
	render () {
		const {projectSetModalShow, createOrSetting, projectSetting, projectsList, projectActive} = this.props;
		if (!projectSetModalShow) return null;
		let currentProject, projectName = '';
		if (projectsList.length > 0 && projectActive && createOrSetting != 'create') {
			currentProject = projectsList.filter((item, k) => item.id == projectActive)[0];
			projectName = currentProject.name;
		}

		return (
			<Modal visible={projectSetModalShow}
				title={createOrSetting == 'create' ? '创建项目' : '编辑项目'}
				onClose={() => this.closeProjectSet()}
				footer={this.renderCreateFooter()}
				>
				<div className="ps-create">
					<div className="ps-create-name">
						<input type="text" placeholder="新建链接" onChange={this.setName} defaultValue={projectName}/>
					</div>
					<div className="ps-create-group">
						<CreateLi icon="create-label.svg" labelName="标记" field='' {...this.props} projectColor={this.state.projectColor} field="color"/>
						{/* <CreateLi icon="create-public.svg" first={true} labelName="你在团队中的任何人都可以看到这个项目" field='is_open' {...this.props}/> */}
						<CreateLi icon="create-notice.svg" labelName="接受通知" field='is_notice' {...this.props}/>
					</div>
					<p className="ps-create-intro">合作者权限</p>
					<div className="ps-create-group">
						<CreateLi labelName="可下载媒体" field='collaborator_download' {...this.props}/>
						<CreateLi labelName="可邀请合作者" field='collaborator_invite' {...this.props}/>
					</div>
					<p className="ps-create-intro">我的邮件提醒</p>
					<div className="ps-create-group">
						<CreateLi labelName="新的评论" field='my_comment' {...this.props}/>
						<CreateLi labelName="新的媒体上传" field='my_upload' {...this.props}/>
						<CreateLi labelName="新的成员加入" field='my_join' {...this.props}/>
					</div>
					<p className="ps-create-intro">其他人的邮件提醒</p>
					<div className="ps-create-group">
						<CreateLi labelName="新的评论" field='else_comment' {...this.props}/>
						<CreateLi labelName="新的媒体上传" field='else_upload' {...this.props}/>
						<CreateLi labelName="新的成员加入" field='else_join' {...this.props}/>
					</div>
				</div>
			</Modal>
		);
	}
}


