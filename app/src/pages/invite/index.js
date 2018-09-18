import React, { PureComponent } from 'react';
import { getTokenLocalstorage } from '@utils/utils';
import {message} from 'antd';
import { connect } from 'dva';
import withRouter from 'umi/withRouter';
import './index.scss';

function mapStateToProps(state) {
    return {
        ...state.project,
        ...state.file,
        ...state.user,
        ...state.global,
        ...state.invite
    };
}

@withRouter
@connect(mapStateToProps)
class InviteContainer extends PureComponent {

    componentDidMount() {
        this.props.dispatch({
            type: 'invite/fetchInvite',
            payload: {}
        });
    }

    joinInvite = () => {
        if (!getTokenLocalstorage()) {
            message.warning('您还未登录，请先登录');
            if (process.env.NODE_ENV === 'production') {
                window.location.href = '//' + window.location.host;  
            }
            return;
        }
        this.props.dispatch({
            type: 'invite/joinInvite', 
            payload: {}
        });
    }

    render () {
        const {inviteInfo} = this.props;
        if (!inviteInfo) return null;

        return (
            <div className="invite-container">
                <div className="invite-section">
                    <div className="invite-avatar">
                        {inviteInfo.avatar == '' ? <span>{inviteInfo.realname[0]}</span> : <img src={inviteInfo.avatar} alt=""/>}
                    </div>
                    <p>{inviteInfo.realname} 邀请您加入&lt;{inviteInfo.name}&gt;项目</p>
                    <button className="invite-btn" onClick={this.joinInvite}>同意</button>
                </div>
            </div>
        );
    }
}

export default InviteContainer;
