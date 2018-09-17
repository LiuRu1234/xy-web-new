import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Dialog from 'rc-dialog';
import './index.scss';

class TooltipModal extends PureComponent {
	constructor(props) {
		super(props);
    }

    render() {
        const {visible, left, top} = this.props;
        let x = left - 210 / 2;
        let y = top + 10;
        return (
            <Dialog
            visible={visible} 
            closable={false}
            wrapClassName="modal-container"
            onClose={this.props.onClose}
            >   
                <section className="tooltip-modal" style={{left: x + 'px', top: y + 'px'}}>
                    <span className="tooltip-modal-arrow"></span>
                    <div className="tooltip-modal-body">
                        {this.props.children}
                    </div>
                </section>
               
            </Dialog>
        );
    }
}

export default TooltipModal;