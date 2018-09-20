/*
* 有时候多个触发点，可以通过在 btnTitle 添加 tooltip-cover-btn 这个 class 解决
*/

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';
import './index.scss';

class Tooltip extends PureComponent {
    width = 150;
    height = 50;
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            rect: {}
        };
    }

    hidePannel() {
        this.setState({
            visible: false
        });

        this.props.onHide && this.props.onHide();
    }


    getClient(e) {
        this.showTooptip(e);
    }

    showTooptip(e) {
        let rect = e.target.getBoundingClientRect();
        this.setState({
            visible: true,
            rect: {
                x: rect.left,
                y: rect.top,
                width: rect.width,
                height: rect.height
            },
            visible: true
        });
        this.props.onShow && this.props.onShow();
    }

    handleContextMenu(e) {
        e.preventDefault();
        this.showTooptip(e);
    }

    getPostionVertical() {
        const { direction, width, height } = this.props;
        const { rect } = this.state;
        let w = width ? width : this.width;
        let h = height ? height : this.height;
        let finalX, finalY;
        if (direction) {
            let direct = direction.split(',');
      
            switch (direct[0]) {
                case 'top':
                    finalY = rect.y + rect.height + 15;
                    break;
                case 'bottom':
                    finalY = rect.y - h - 15 ;
                    break;
            }

            switch (direct[1]) {
                case 'left':
                    finalX = rect.x;
                    break;
                case 'right':
                    finalX = rect.x -  (w - rect.width);
                    break;
                case 'center': 
                    finalX =  rect.x - (w - rect.width) / 2;
                    break;
            }

        } else {
            finalX =  rect.x - (w - rect.width) / 2;
            finalY =  rect.y + rect.height + 15;
        }
        return {x: finalX, y: finalY};
    }

    getPositionHorizontal() {
        const { direction, width, height } = this.props;
        const { rect } = this.state;
        let w = width ? width : this.width;
        let h = height ? height : this.height;
        let finalX, finalY;
        if (direction && direction == 'right') {
            finalX = rect.x - w - rect.width;
            finalY =  rect.y - h / 2 + rect.height / 2;
        } else {
            finalX =  rect.x + rect.width;
            finalY =  rect.y - h / 2 + rect.height / 2;
        }
        return {x: finalX, y: finalY};
    }

    render () {
        const { direction, width, height, renderTemplate, btnTitle, trigger, marginLeft, contentClickIsHide, horizontal } = this.props;
        const { rect } = this.state;
        let directClass = horizontal ? 'tooltip-arrow-left' : 'tooltip-arrow-top';
        let tranformOrigin = horizontal ? '-12% 50%' : '50% -10px';
        let finalWidth = width ? width : this.width;
        let finalHeight = height ? height : '';
      
        if (direction) {
            let direct = direction.split(',');
            directClass = `tooltip-arrow-${direct[0]} ${direct[1]}`;

            let horizontalOrigin, verticalOrigin;
            switch (direct[1]) {
                case 'left': 
                    horizontalOrigin = '18%';
                    break;
                case 'right': 
                    horizontalOrigin = '83%';
                    break;
                case 'center':
                    horizontalOrigin = '50%';
                    break;
            }

            switch (direct[0]) {
                case 'top': 
                    verticalOrigin = '-10px';
                    break;
                case 'bottom': 
                    verticalOrigin = '112%';
                    break;
            }
            tranformOrigin = horizontalOrigin + ' ' + verticalOrigin;
        }

        if (horizontal && direction == 'right') {
            tranformOrigin = '110% 50%';
        }

        let position = horizontal ? this.getPositionHorizontal() : this.getPostionVertical();

        //判断是否为右击
        let clickType = {};
        let _self = this;
        if (trigger == 'rightclick') {
            clickType = {
                onContextMenu:(e) => this.handleContextMenu(e)
            };
        } else {
            clickType = {
                onClick:(e) => {
                    e.stopPropagation();
                    _self.getClient(e);
                    _self.props.onClick && _self.props.onClick();
                }
            };
        }
        let triggerRender = <div style={{cursor: 'pointer'}} {...clickType}>{btnTitle ? btnTitle() : 'click' }</div>;

        //判断是否为hover效果
        if (trigger == "hover") {
            triggerRender = <div onClick={() => _self.props.onClick && this.props.onClick()} onMouseEnter={(e) => this.getClient(e)} onMouseLeave={(e) => this.hidePannel()} style={{cursor: 'pointer'}}>{btnTitle ? btnTitle() : 'click' }</div>;
        }

        return (
            <div className="tooltip-container">
                {triggerRender}
                {this.state.visible ? 
                <div >
                    {trigger == "hover" ? null : <div className="tooltip-cover" 
                        onClick={(e) => {e.stopPropagation();this.hidePannel();}}
                        ></div>}
                    <div className="tooltip-pannel" 
                        style={{height: finalHeight + 'px',
                                width: finalWidth + 'px',
                                top: position.y + 'px',
                                left: position.x + 'px',
                                transformOrigin: tranformOrigin,
                                marginLeft: marginLeft + 'px'
                                }} 
                        ref={(node) => { this.node = node; }}>
                        <div className={directClass}></div>
                        <div className="tooltip-body" onClick={(e) => {
                            if (e.target.className == 'tooltip-body') {
                                return;
                            }
                            contentClickIsHide && this.hidePannel();
                            }}
                        >
                            {renderTemplate()}
                        </div>
                    </div>
                    
                </div>
                : null}
            </div> 
        );
    }
} 


Tooltip.propTypes = {
    direction: PropTypes.string,    // 箭头方向， 以逗号分割如：’top, left‘, 不设置默顶部居中
    width: PropTypes.number,        // 设置宽度
    height: PropTypes.number,       // 高度
    btnTitle: PropTypes.func,       // 按钮内容，可以是组件
    renderTemplate: PropTypes.func, // 显示的内容组件
    trigger: PropTypes.string,      // 触发事件
    marginLeft: PropTypes.number,    // 用于修正水平位置
    onClick: PropTypes.func,        //  点击触发事件
    contentClickIsHide: PropTypes.bool, //内容点击完之后是否需要隐藏
    onHide: PropTypes.func,              //隐藏后触发事件
    onShow: PropTypes.func,              //显示后触发事件
    horizontal: PropTypes.bool          //是否水平显示
};

export default Tooltip;


