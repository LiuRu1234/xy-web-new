import React, { PureComponent } from 'react';
import Dialog from 'rc-dialog';

import Image from '@CC/Image';

import './index.scss';

class NoticeModal extends PureComponent {
    constructor(props) {
        super(props);
    }

    render() {
        const {visible} = this.props;

        return (
            <Dialog
            visible={visible} 
            className="modal-body no-padding-bottom notice"
            closable={false}
            wrapClassName="modal-container"
            >   
                <section className="modal-section notice1 notice-pc" style={{paddingBottom: this.props.footer ? '' : '20px'}}>
                    <span className="notice-modal-close" onClick={() => this.props.onClose(false)}>
                        <Image name="close-notice.svg"></Image>
                    </span>
                    <header className="notice-modal-header">{this.props.titile}</header>
                    {this.props.children}
                    {this.props.footer ?
                    <footer className="modal-footer notice1">
                        {this.props.footer}
                    </footer> : null}
                </section>
            </Dialog>
        );
    }
}

export default NoticeModal;