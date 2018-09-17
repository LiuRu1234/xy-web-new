import React, { PureComponent } from 'react';
import './index.scss';

export default class WatermarkModal extends PureComponent{
    constructor(props) {
		super(props);
    }

    render () {
        
        return (
            <button className="modal-btn" onClick={this.props.onClick}>{this.props.children}</button>
        );
    }
}