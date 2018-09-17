import React, { PureComponent } from 'react';
import { Row, Col, Switch } from 'antd';
import Image from '../../common/Image/Image';
import IconBlock from '../../common/IconBlock/IconBlock';
import {LinkMorePannel} from '../../commonPannel/TooltipPannel/TooltipPannel';
import {getLocalTime} from '../../../utils/utils';
import Dialog from 'rc-dialog';
import './ProjectNotice.scss';
import './NoticeModal.scss';


class ProjectNotice extends PureComponent{
    constructor(props) {
        super(props);
        this.state = {
            noticeModalShow: false
        };
    }

    render() {
        const {noticeModalShow} = this.state;

        return (
            <div className="project-notice-container">
                <div className="project-notice-title">
                    系统消息
                </div>
                <ul className="project-notice-list">
                    <li onClick={() => this.toggleNoticeModal(true)}>
                        <div className="pn-li">
                            <img src="" alt=""/>
                            <p>dadasdadasdaasdas</p>
                        </div>
                    </li>
                </ul>

                <div className="pn-more">
                    <div className="pn-more-btn">
                    展开更多
                    <IconBlock iconName="down3.svg"></IconBlock>
                    </div>
                </div>

                <div className="project-notice-title">
                    系统消息
                </div>
                <ul className="project-notice-list">
                    <li onClick={() => this.toggleNoticeModal(true)}>
                        <div className="pn-li">
                            <img src="" alt=""/>
                            <p>dadasdadasdaasdas</p>
                        </div>
                    </li>
                </ul>

              
            </div>   
        );
    }
}

export default ProjectNotice;