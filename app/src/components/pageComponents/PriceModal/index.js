import React, { PureComponent } from 'react';
import Image from '@CC/Image';
import ModalTwo from '@CC/ModalTwo';
import Dialog from 'rc-dialog';
import {getLocalTime, timeInt2Str} from '@utils/utils';
import './index.scss';

export default class PriceModal extends PureComponent{
    state = {
        priceType: 1,
        step: 0,
        fail: false,
        show: false,
        successModalShow: false,
        warningModalShow: false
    }  

    constructor(props){
        super(props);
    }

    componentDidMount() {
        const {userInfo, dispatch} = this.props;
    }

    changePriceType = (priceType) => {
        this.setState({
            priceType
        });
    }

    toNext = (price_id) => {
        if (price_id == 1) {
            this.props.dispatch({
                type: 'price/savePriceModalShow',
                payload: false
            });
            return;
        }
        let step = this.props.step + 1;
        this.props.dispatch({
            type: 'price/fetchWxPay',
            payload: {price_id}
        });

        this.props.dispatch({
            type: 'price/saveStep',
            payload: step
        });

        this.payInterval = setInterval(() => {
            const {currentPrice, paySuccess} = this.props;
            if (paySuccess) {
                clearInterval( this.payInterval );
                return;
            }
            this.props.dispatch({
                type: 'price/fetchPaySuccess',
                payload: {}
            });
        }, 1000);
    }

    clearPayInterval = () => {
        clearInterval( this.payInterval );
    }

    resetStep = () => {
        this.props.dispatch({
            type: 'price/saveStep',
            payload: 0
        });

        this.toggleFail(false);
    }

    toFail = () => {
        this.props.dispatch({
            type: 'price/saveStep',
            payload: 2
        });
        this.toggleFail(true);
    }

    toggleFail = (fail) => {
        this.props.dispatch({
            type: 'price/saveFail',
            payload: fail
        });
    }

    togglePriceModal = (show) => {
        this.props.dispatch({
            type: 'price/savePriceModalShow',
            payload: show
        });
        this.props.dispatch({
            type: 'price/saveStep',
            payload: 0
        });

        this.toggleFail(false);
    }

    initPriceState() {
        this.props.dispatch({
            type: 'price/saveInit',
            payload: {}
        });
        this.props.dispatch({
            type: 'price/saveSuccessModalShow',
            payload: true
        });
    }

    refreshUser() {
        
        this.props.dispatch({
            type: 'price/saveSuccessModalShow',
            payload: false
        });
        this.props.dispatch({
            type: 'user/fetchUserInfo',
            payload: {}
        });
    }
    

    render() {
        const {
            priceModalShow,
            priceArgs,
            codeUrl, 
            currentPrice, 
            step, 
            successModalShow, 
            warningModalShow, 
            fail,
            successObj,
            userInfo,
            isWarning
        } = this.props;

        return (
            <div>

                <ModalTwo visible={priceModalShow && step == 0}
                    title="选择购买方案"
                    onClose={() => this.togglePriceModal(false)}
                    closeHide={isWarning}
                >
                    {/* <div className="price-type">
                        <p className={priceType == 1 ? 'active' : ''} onClick={() => this.changePriceType(1)}>月</p>
                        <p className={priceType == 2 ? 'active' : ''} onClick={() => this.changePriceType(2)}>季</p>
                    </div> */}
                
                    <ul className="price-step1">
                        {priceArgs.map((item,k) => {
                            // if (item.type != '月') {
                            //     return  null;
                            // }
                            return (
                                <li key={k}>
                                    <p className="price-step1-tittle">{item.name}</p>
                                    <p className="price-step1-des">{item.des}</p>
                                    <p className="price-step1-p">¥{item.price}/月</p>
                                    {/* <p className="price-step-origin">{item.priceDesc()}</p> */}
                                    {/* <p className="price-step1-tittle2">功能</p> */}
                                    {/* <p className="price-step1-des">{item.configDesc()}</p> */}
                                    {/* <p className="price-step1-tittle2">服务</p> */}
                                    <p className="price-step1-des">
                                        {item.detail.map((item, k) => {
                                            return (
                                                <span key={k}>
                                                    {item}<br/>
                                                </span>
                                            );
                                        })}
                                    </p>
                                    <button className="price-step1-button" onClick={() => this.toNext(item.id)}>立即使用</button>
                                </li>
                            );
                        })}
                    </ul>
                </ModalTwo>

                {currentPrice && priceModalShow && step == 1 ?
                <ModalTwo visible={priceModalShow && step == 1}
                    title="确定已购买方案"
                    onClose={() => {this.togglePriceModal(false);this.clearPayInterval(); }}
                    closeHide={isWarning}
                >
                    <div className="price-info">
                        <h2>{currentPrice.name}</h2>
                        <ul className="clearfix">
                            <li>
                                价格: {currentPrice.price}元/月
                            </li>
                            <li>
                                空间容量: {currentPrice.vip.storage_max / Math.pow(1024, 3)}GB
                            </li>
                            <li>
                                项目数量: {currentPrice.vip.project_max}个
                            </li>
                            {/* <li>
                                项目成员数: {currentPrice.vip.member_max}个
                            </li> */}
                        </ul>
                    </div>


                    <div className="price-pay">
                        <div className="price-code">
                            <div className="price-code-body">
                                <div className="price-code-img">
                                    <img src={`/api/showqrcode?code_url=${codeUrl}`} alt=""/>
                                    {/* <div className="price-code-refresh">
                                        <img src="" alt=""/>
                                        <p>请点击刷新</p>
                                    </div> */}
                                </div>
                            </div>
                        </div>

                        <div className="price-code-right">
                            <p className="price-code-p1">
                                <span>¥{currentPrice.price}元</span>
                                {/* <span>（已优惠119元）</span> */}
                            </p>

                            <p className="price-code-p2">
                                使用微信扫码支付
                            </p>
                            <p className="price-code-p3">
                                <Image name="wxpay.jpg"></Image>
                            </p>
                        </div>
                    </div>

                    {/* <div className="price-pay-btn">
                        <button  onClick={this.toFail}>下一步</button>
                    </div> */}
                </ModalTwo> : null}


                <ModalTwo visible={priceModalShow && step == 2 && !fail}
                    title="您已完成购买!"
                    titleIcon="price-ok.jpg"
                    onClose={() => this.togglePriceModal(false)}
                    closeHide={isWarning}
                >
                    <div className="pay-complete">
                        {/* <p className="pay-title">您已完成购买!</p> */}
                        <a href="/account/#/myorder" className="look-order">查看订单</a>
                        <p className="look-p">如需要开具发票，请前往 <a href="/account/#/myaccount">我的账户</a>中选择发票</p>
                        <button className="pay-complete-btn" onClick={() => {this.initPriceState();}}>完成</button>
                    </div>
                </ModalTwo>

                 <ModalTwo visible={priceModalShow && fail && step == 2}
                    title="抱歉!购买失败"
                    titleIcon="price-fail.jpg"
                    onClose={() => this.togglePriceModal(false)}
                    closeHide={isWarning}
                >
                    <div className="pay-complete">
                        <a href="" className="look-order">查看订单</a>
                        <p className="look-p">如需要开具发票，请前往 <a href="">我的账户</a>中选择发票</p>
                        <button className="pay-complete-btn" onClick={this.resetStep}>重新购买</button>
                    </div>
                </ModalTwo>
           
                <Dialog 
                    visible={warningModalShow} 
                    closable={false}
                    className="modal-vip-tip"
					wrapClassName="modal-vip-container"
					>
                    <div className="vip-header">
                        <Image name="vip-warning.jpg"></Image>
                    </div>
                    <div className="vip-text-warning">
                        <h2>您的账户用量已超出限制!</h2>
                        <h4>您的账户目前登记为lv.{userInfo.vip_name}，目前用量已超过限制，请您即使联系客服升级账户以避免使用受限。</h4>
                    </div>

                    <div className="vip-modal-footer">
                        <button onClick={() => {
                            this.togglePriceModal(true);
                            this.props.dispatch({
                                type: 'price/saveWarningModalShow',
                                payload: false
                            });
                        }}>升级</button>
                    </div>
			    </Dialog>


                <Dialog 
                    visible={successModalShow} 
                    closable={false}
                    className="modal-vip-tip"
					wrapClassName="modal-vip-container"
					>
                    <div className="vip-header">
                        <Image name="vip-success.jpg"></Image>
                    </div>
                    {successObj ? 
                    <div className="vip-text-success">
                        <h2>您的账户已经于{timeInt2Str(successObj.created_at)}通过系统自动升级为lv.{successObj.vip_id}</h2>
                        <ul>
                            <li>1.套餐容量为{successObj.vip.storage_max / Math.pow(1024, 3)}GB</li>
                            <li>2.项目数为{successObj.vip.project_max}个</li>
                            <li>3.人员数为{successObj.vip.member_max}</li>
                            <li>4.有效期{successObj.vip.time_at}天</li>
                        </ul>
                    </div> : null}

                    <div className="vip-modal-footer vip-success">
                        <button onClick={() => this.refreshUser()}>知道了</button>
                        {/* <p>有疑问？联系客服</p> */}
                    </div>
			    </Dialog>
              
            </div>
        );
    }
}