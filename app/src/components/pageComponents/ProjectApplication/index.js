import React, { PureComponent } from 'react';
import {Input, Select, message} from 'antd';
import Dialog from 'rc-dialog';

import IconBlock from '@CC/IconBlock';
import Image from '@CC/Image';
import Modal from '@CC/Modal';

import WatermarkModal from  '@CPC/WatermarkModal';

import {USE_ICON, PR_FIELD} from '@config/constants';
import { recordPageStart, pageStayStorage } from '@APP_BRO/burying_point/local_record';
import {PAGE_TYPES} from '@APP_BRO/burying_point/constants';

import './index.scss';

const Option = Select.Option;

class UseModal extends PureComponent {
    render () {
        const {visible} = this.props;
        return (
            <Dialog
            visible={visible} 
            className="modal-body use-section"
            closable={false}
            wrapClassName="modal-container"
            >
                <div className="use-body-close" onClick={this.props.onClose}>
                    <Image name="close-notice.svg"></Image>
                </div>
                {this.props.children}
            </Dialog>
        );
    }
}

class Xcx extends PureComponent {
    constructor(props) {
        super(props);
    }

    onClose = () => {
        this.props.dispatch({
            type: 'application/saveXcxShow',
            payload: false
        });
    }

    render() {
        const {xcxShow} = this.props;
        return (
            <UseModal visible={xcxShow} onClose={this.onClose}>
                <section className="use-body">
                    <header className="xcx-header">扫码登录小程序</header>
                    <div className="xcx-img">  
                        <Image name="xcxxy.jpg"></Image>
                    </div>
                    <button className="xcx-btn" onClick={this.onClose}>暂不登录</button>
                </section>
            </UseModal> 
        );
    }
}

class PrModal extends PureComponent {

    prParam = {
        name: '',
        phone: '',
        company_name: '',
        work_email: '',
        operation_system: 'windows'
    }

    constructor(props) {
        super(props);
    }

    setPrParam = (value, field) => {
        this.prParam[field] = value;
    }

    closeModal = () => {
        this.props.dispatch({
            type: 'application/savePrModalShow',
            payload: false
        });
    }

    submit = () => {
        for (let k in PR_FIELD) {

            if (this.prParam[PR_FIELD[k].field] == ''){
                message.warning(PR_FIELD[k].name + '不能为空');
                return;
            }

            if (PR_FIELD[k].parrent != undefined && !PR_FIELD[k].parrent.test(this.prParam[ PR_FIELD[k].field])) {
                message.warning(PR_FIELD[k].name + '格式不正确');
                return;
            }
        }
        this.props.dispatch({
            type: 'application/applyApp',
            payload: this.prParam
        });
    }

    renderPrFooter() {
        return (
            <div className="pr-modal-footer">
                <button onClick={this.submit}>提交申请</button>
            </div>
        );
    }

    render() {
        const {prModalShow} = this.props;
        return (
            <Modal visible={prModalShow}
            title="申请信息"
            onClose={() => this.closeModal()}
            footer={this.renderPrFooter()}
            >  
                <ul className="pr-form">
                    {PR_FIELD.map((item,k) => {
                        return (
                        <li key={k}>
                            <p>{item.name}</p>
                            <Input size="large" placeholder={item.placeholder} onChange={(e) => this.setPrParam(e.target.value, item.field)}/>
                        </li>
                        );
                    })}
                    <li>
                        <p>系统</p>
                        <Select defaultValue="windows" size="large" style={{width: "100%"}} onChange={(value) => this.setPrParam(value, 'operation_system')}>
                            <Option value="windows">Windows</Option>
                            <Option value="mac">Mac</Option>
                        </Select>
                    </li>
                </ul>
            </Modal>
        );
    }
}

class ProjectApplication extends PureComponent {
	constructor(props) {
		super(props);
    }

    componentDidMount() {
        recordPageStart(PAGE_TYPES[4]);
    }

    componentWillUnmount() {
        pageStayStorage();
    }

    appClick = (item) => {
        const {dispatch} = this.props;

        switch(item.key) {
            case 'xcx':
                dispatch({
                    type: 'application/saveXcxShow',
                    payload: true
                });
                break;
            case 'pr':
                dispatch({
                    type: 'application/savePrModalShow',
                    payload: true
                });
                break;
            case 'jpal':
                window.location.href = '//' + window.location.host + '/case_card/index.html';
                break;
            case 'watermark':
                this.props.dispatch({
                    type: 'watermark/showWaterModal',
                    payload: {}
                });
                break;
        }
       
    }

    render() {
        return (
            <div className="project-use-container">
                <ul className="clearfix">
                    {USE_ICON.map((item, k) => {
                        return (
                            <li key={k} onClick={() => this.appClick(item)}>
                                <Image name={item.icon}/>
                                <p>{item.name}</p>
                            </li>
                        );
                    })}
                </ul>
                <Xcx {...this.props}></Xcx>
                <PrModal {...this.props}></PrModal>
                <WatermarkModal {...this.props}/>
            </div>
        );
    }
}

export default ProjectApplication;