import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

class HelperDes extends PureComponent {
    constructor(props) {
        super(props);
    }

    render() {
        const {
            content, 
            cancel, 
            sure, 
            title, 
            left, 
            top, 
            arrowLeft, 
            arrowDirection, 
            cancelText, 
            sureText, 
            direction,
        } = this.props;
        let arrowClass = 'help-arrow';

        if (arrowDirection == 'right') {
            arrowClass = 'help-arrow right';
        }

        if (arrowDirection == 'left') {
            arrowClass = 'help-arrow left';
        }

        arrowClass = direction == 'bottom' ? arrowClass + ' bottom' : arrowClass;

        return (
            <div className="help-block" style={{left: left + 'px',top: (top + 15) + 'px'}}>
                <div className={arrowClass} style={{left: arrowLeft + 'px'}}></div>
                <div className="help-body">
                    <header className="help-body-header">{title}</header>
                    <section className="help-body-section">{content}</section>
                    <footer className="help-body-footer">
                        <button onClick={cancel}>{cancelText}</button>
                        <button onClick={sure}>{sureText}</button>
                    </footer>
                </div>
            </div>
        );
    }
}

HelperDes.propTypes = {
    content: PropTypes.string,          //内容
    title: PropTypes.string,            //标题
    cancel: PropTypes.func,             //取消
    sure: PropTypes.func,               //确定
    cancelText: PropTypes.string,       //取消文字
    sureText: PropTypes.string,         //确定文字
    left: PropTypes.number,             //左偏移量
    top: PropTypes.number,              //上偏移量
    arrowLeft: PropTypes.number,        //箭头左偏移量
};

export default HelperDes;