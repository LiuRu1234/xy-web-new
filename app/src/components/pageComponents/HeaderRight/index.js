import React, { PureComponent } from 'react';
import Image from '@CC/Image';
import { UserPannel, UserNoticePannel }from '@CCP/TooltipPannel';
import { Tooltip, message } from 'antd';
import HelperView from '@CPC/HelperView';
import './index.scss';

class HeaderRight extends PureComponent{
    constructor(props){
        super(props);
    }

    toggleMoreNotice() {
        let moreNoticeShow = !this.props.moreNoticeShow;
        this.props.dispatch({
			type: 'project/saveMoreNoticeShow',
			payload: moreNoticeShow
		});
    }

    showHelp = () => {
        if (this.props.commentClosed && window.location.hash.indexOf('#/project?') == -1 ) {
            message.warning('请先打开评论区进行完全提示帮助');
            return ;
        }
        this.props.dispatch({
            type: 'global/saveHelpShow',
            payload: true
        });
    }

    render() {
        const {helpShow} = this.props;
        return (
            <div className="header-right-container">
                <div className="header-right-do">
                    <Tooltip placement="bottom" title="帮助">
                        <div className="header-right-question" onClick={this.showHelp}>
                            <Image name="help.svg"/>
                        </div>
                    </Tooltip>
                    <UserNoticePannel showMore={() => this.toggleMoreNotice()} {...this.props}/>
                </div>

                <div className="header-right-user">
                    <UserPannel {...this.props}/>
                </div>
                {helpShow ? <HelperView {...this.props}/> : null}
            </div>    
        );
    }
}

export default HeaderRight;