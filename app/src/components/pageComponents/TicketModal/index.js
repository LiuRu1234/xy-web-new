import React, { Component, PropTypes } from 'react';
import { Row, Col, Modal, Carousel, Icon } from 'antd';

import './index.scss';

export default class TicketModal extends Component {

    render() {
        if (!this.props.visible) return null;

        return (
            <div className="ticket-modal" onClick={() => this.props.toggleTicketShow(false)}>
                <div className="ticket-modal-section">
                    <header className="ticket-modal-header">领取最高300元代金券，购买新阅服务更省钱</header>
                    <div className="tikect-modal-section">
                        <div className="tikect-body">
                            <p className="tikect-body-p1"><sub>¥</sub>50</p>
                            <p className="tikect-body-p2">
                                <span>新阅代金券</span><br/>
                                <span>2018年11月30日到期</span>
                            </p>
                        </div>
                        <div className="ticket-code">
                            <img src="" alt=""/>
                            <p>微信扫一扫<br/>领取50元代金券</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}