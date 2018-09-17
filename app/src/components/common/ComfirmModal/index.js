import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Dialog from 'rc-dialog';
import {Button} from 'antd';
import styles from './index.scss';

class ComfirmModal extends PureComponent {
	constructor(props) {
		super(props);
	}

	_closeComfirm() {
		this.props.onClose();
	}

	_sureConfirm() {
		this.props.onClose();
		this.props.onSure();
	}

	renderContent() {
		return (
			<p className="confirm-content">{this.props.content}</p>
		);
	}

	render() {
		const {visible} = this.props;
		return (
		<Dialog title={this.renderContent()} 
			visible={visible} 
			className="comfirm-body"
			closable={false}
			wrapClassName="comfirm-container"
			>
			<section className="comfirm-section">
				<Button className="comfirm-cancel" onClick={() => this._closeComfirm()}>取消</Button>
				<Button className="comfirm-sure" onClick={() => this._sureConfirm()}>确定</Button>
			</section>
		</Dialog>
		);
	}
}

ComfirmModal.propTypes = {
	visible: PropTypes.bool, //是否显示
	content: PropTypes.node, //内容
	onClose: PropTypes.func, //关闭事件
	onSure: PropTypes.func  //确定事件
};

export default ComfirmModal;
