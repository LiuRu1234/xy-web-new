import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from 'antd';
import './index.scss';

// 父元素必须relative
class IconBlock extends PureComponent {
    constructor(props) {
        super(props);
    }

    render() {
        const {iconName, iconAlt, renderClass, direction, alt, tipDirection, onClick, id, imgId} = this.props;
        if (iconName == undefined || iconName == '') return null;
       
        let className = 'icon-block ' + (renderClass != undefined ? renderClass: '') + ' ' + (direction == 'left' ? direction : 'right'  );
        return (
            <div className={className} onClick={(e) => onClick && onClick(e)} style={{cursor: onClick ? 'pointer' : ''}} id={id}>
            	<Tooltip placement={tipDirection} title={alt}>
                    <img src={require('../../../assets/' + iconName)} alt={iconAlt} id={imgId}/>
                </Tooltip>
            </div>
        );
    }
}

IconBlock.propTypes = {
    iconName: PropTypes.string, //assets文件名
    iconAlt: PropTypes.string,  //alt 
    renderClass: PropTypes.string, //渲染样式
    direction: PropTypes.string, //方向
    alt: PropTypes.string,      //tip文字
    tipDirection: PropTypes.string,  //tip文字方向
    onClick: PropTypes.func,
    id: PropTypes.string,   //id
    imgId: PropTypes.string,   //imgId
};

export default IconBlock;