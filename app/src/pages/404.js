import React, { PureComponent } from 'react';
import { message } from 'antd';
import { routerRedux } from 'dva/router';
import './404.scss';

export default class NotFound extends PureComponent{

    componentDidMount() {
      message.warning('您访问的页面不存在，即将返回项目页', 2);
      setTimeout(() => {
        this.props.history.push('/project');
      }, 2000);
    }
  
    render() {
      return (
        <div className="not-find">
        </div>
      );
    }
  }