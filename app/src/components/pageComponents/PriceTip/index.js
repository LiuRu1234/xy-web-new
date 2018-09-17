import React, { PureComponent } from 'react';
import Dialog from 'rc-dialog';
import Image from '@CC/Image';
import './index.scss';

const PRICE_TIP = '_xy2018_price_tips';

class PriceTip extends PureComponent {

    state = {
        priceTipShow: false
    }

    componentDidMount() {
        this.setState({
            priceTipShow: parseInt(localStorage.getItem(PRICE_TIP)) == 1 ? false : true
        });
    }
    
    setPriceTipShow = () => {
        localStorage.setItem(PRICE_TIP, 1);
        this.setState({
            priceTipShow: false
        });
    }

    render() {
        return (
            <Dialog 
                visible={this.state.priceTipShow} 
                closable={false}
                className="modal-vip-tip"
                wrapClassName="modal-vip-container"
                >
                <div className="vip-header">
                    <Image name="price_tip.jpg"></Image>
                </div>
         
                <div className="vip-text-success">
                    <h2>新阅正式版即将发布</h2>
                    <ul style={{padding: 0}}>
                        <li>内测结束，正式版将于9月25日发布，更大空间，更灵活，更好用！</li>
                        <li style={{marginTop: '25px'}}>- 免费版：10GB存储空间，1个项目</li>
                        <li>- 99元基础版：30GB存储空间，5个项目</li>
                        <li>- 199元专业版：100GB存储空间，15个项目</li>
                        <li>请留意您的用量，以免影响使用，请及时调整</li>
                    </ul>
                </div> 

                <div className="vip-modal-footer vip-success" style={{padding: '20px 0 40px'}}>
                    <button onClick={this.setPriceTipShow}>知道了</button>
                </div>
            </Dialog>
        );
    }
}

export default PriceTip;