import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Dialog from 'rc-dialog';
import Image from '@CC/Image';
import './index.scss';

class Modal extends PureComponent {
	constructor(props) {
		super(props);
	}

	renderHeader() {
		const {title, onClose, titleIcon, closeHide} = this.props;
		return (
			<header className="modal-two-header">
				<p className="title">{titleIcon ? <Image name={titleIcon}/> : null}{title}</p>
				{closeHide ? null : 
				<span onClick={onClose} >
					<img src={require('@assets/close2.svg')} alt=""/>
				</span>}
			</header>
		);
	}

	render() {
		const {visible, centerClass, bgColor} = this.props;

		return (
			<Dialog title={this.renderHeader()} 
					visible={visible} 
                    className="modal-rwo-body"
                    style={{backgroundColor: bgColor}}
					closable={false}
					wrapClassName="modal-container"
					>
					<section className="modal-two-section">
						{this.props.children}
					</section>
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

