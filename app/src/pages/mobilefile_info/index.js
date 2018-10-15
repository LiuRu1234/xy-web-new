import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import {notification, message} from 'antd';
import withRouter from 'umi/withRouter';

import MobileFileInfo from '@CPC/MobileFileInfo';

function mapStateToProps(state) {
    return {
      ...state.comment,
      ...state.playerControl,
      ...state.project,
      ...state.file,
      ...state.user,
      ...state.upload,
      ...state.link,
      ...state.global
    };
}

@withRouter
@connect(mapStateToProps)
class ProjectContainer extends PureComponent {
    render() {
        return (
            <div><MobileFileInfo {...this.props}></MobileFileInfo></div>
        );
    }
}

export default ProjectContainer;