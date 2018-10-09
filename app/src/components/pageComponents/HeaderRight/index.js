import React, { PureComponent } from 'react';
import { Tooltip, message } from 'antd';
import Dialog from 'rc-dialog';

import Image from '@CC/Image';
import ModalTwo from '@CC/ModalTwo';
import { UserPannel, UserNoticePannel }from '@CCP/TooltipPannel';

import HelperView from '@CPC/HelperView';
import PriceModal from '@CPC/PriceModal';
import './index.scss';

class HeaderRight extends PureComponent{
    constructor(props){
        super(props);
    }

    componentDidMount() {
        this.fetchPrice();
    }

    fetchPrice = () => {
        this.props.dispatch({
            type: 'price/fetchPrices',
            payload: {}
        });
    }

    toggleMoreNotice() {
        let moreNoticeShow = !this.props.moreNoticeShow;
        this.props.dispatch({
			type: 'project/saveMoreNoticeShow',
			payload: moreNoticeShow
		});
    }

    showHelp = () => {
        if (this.props.commentClosed && window.location.hash.indexOf('#/project?') == -1 ) {
            message.warning('请先打开评论区进行完全提示帮助');
            return ;
        }
        this.props.dispatch({
            type: 'global/saveHelpShow',
            payload: true
        });
    }

    payContinue = () => {
        const {userInfo, priceArgs} = this.props;

        this.props.dispatch({
            type: 'price/saveStep',
            payload: 1
        });
        this.props.dispatch({
            type: 'price/savePriceModalShow',
            payload: true
        });
        let currentPrice = priceArgs.filter((item, k) => {
            return userInfo.product_id == item.id;
        })[0];

        this.props.dispatch({
            type: 'price/fetchWxPay',
            payload: {
                price_id: userInfo.product_id
            }
        });

        this.props.dispatch({
            type: 'price/saveCurrentPrice',
            payload: currentPrice
        });
    }

    render() {
        const {helpShow, userInfo} = this.props;
        return (
            <div className="header-right-container">
   
                <div className="header-right-do">
                    <Tooltip placement="bottom" title="帮助">
                        <div className="header-right-question" onClick={this.showHelp}>
                            <Image name="help.svg"/>
                        </div>
                    </Tooltip>
                    <UserNoticePannel showMore={() => this.toggleMoreNotice()} {...this.props}/>
                </div>

                <div className="header-right-user">
                    <UserPannel {...this.props}/>
                </div>
                {userInfo.product_id == 1 ? null : <button className="price-later2" onClick={this.payContinue}>立即续费</button> }
                {helpShow ? <HelperView {...this.props} /> : null}
                <PriceModal {...this.props}></PriceModal>
            </div>    
        );
    }
}

export default HeaderRight;