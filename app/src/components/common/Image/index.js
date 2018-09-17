import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import './index.scss';

class Image extends PureComponent {
    constructor(props) {
        super(props);
    }

    render() {
        const {name, style} = this.props;
        if (name == undefined || name == '') return null;
        return (
            <img src={require('@assets/' + name)} alt="" style={style}/>
        );
    }
}

Image.propTypes = {
    name: PropTypes.string, //assets文件名, 
    style: PropTypes.object 
};

export default Image;