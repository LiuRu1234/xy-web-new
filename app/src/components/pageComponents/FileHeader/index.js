import React, { PureComponent } from 'react';
import { UserPannel, UserNoticePannel }from '@CCP/TooltipPannel';
import Image from '@CC/Image';
import IconBlock from '@CC/IconBlock';
import HeaderRight from '../HeaderRight';
import { routerRedux } from 'dva/router';
import {Input, Icon, Tooltip} from 'antd';
import './index.scss';

class FileHeader extends PureComponent{
	constructor(props){
		super(props);
	}

	backProject = () => {
		this.props.dispatch(routerRedux.push({
            pathname: '/project',
            query: { p: this.props.projectActive, d: this.props.docActive},
        }));
	}

	render() {
		return (
		<div className="file-header-container clearfix">
			<div className="fh-left">
				<IconBlock iconName="back.svg" direction="left" alt="返回" renderClass="fh-back" onClick={this.backProject}/>
				<div className="fh-left-name">
				<IconBlock iconName="info-folder.svg" direction="left"/>
						<p>{this.props.fileInfo && this.props.fileInfo.name}</p>
				</div>
			</div>
			<HeaderRight {...this.props}/>
		</div>
		);
	}
}

export default FileHeader;
