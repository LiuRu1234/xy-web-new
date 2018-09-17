import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Dialog from 'rc-dialog';
import './index.scss';

class Modal extends PureComponent {
	constructor(props) {
		super(props);
	}

	renderHeader() {
		const {title, onClose} = this.props;
		return (
			<header className="modal-header">
				<p>{title}</p>
				<span onClick={onClose}>
					<img src={require('../../../assets/close.svg')} alt=""/>
				</span>
			</header>
		);
	}

	render() {
		const {visible, centerClass} = this.props;

		return (
			<Dialog title={this.renderHeader()} 
					visible={visible} 
					className="modal-body no-padding-bottom"
					closable={false}
					wrapClassName="modal-container"
					>
					<section className={"modal-section " + centerClass}>
						{this.props.children}
					</section>

					{this.props.footer ?
					<footer className="modal-footer">
						{this.props.footer}
					</footer> : null}
			</Dialog>
    	);
	}
}

Modal.propTypes = {
	title: PropTypes.string, //标题
	onClose: PropTypes.func, //关闭事件
	visible: PropTypes.bool,  //是否显示
	footer: PropTypes.node 
};

export default Modal;

