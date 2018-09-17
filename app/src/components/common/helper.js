import ReactDOM from 'react-dom';
import React, { PureComponent } from 'react';

class Helper {
    constructor(props) {
        this.component = props.component || '';
        this._target = null;
        this.show(props.properties || {});
    }

    show(properties) {
        let props = properties || {};
        this._target = document.createElement('div');
        this._target.style.zIndex = 1000;
        document.body.appendChild(this._target);
        let notification = ReactDOM.render(React.createElement(this.component, props), this._target);
    }

    destroy() {
        if (!this._target) return;
        ReactDOM.unmountComponentAtNode(this._target);
        document.body.removeChild(this._target);
        this._target = null;
    }
}

export default Helper;