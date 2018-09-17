import React, { PureComponent } from 'react';
import Image from '@CC/Image';
import ComfirmModal from '@CC/ComfirmModal';
import {EXP_PHONE} from '@config/constants';
import {message} from 'antd';
import './index.scss';

class PhoneAuth extends PureComponent{
    phone = '';
    code = '';
    t = null;

    constructor(props) {
        super(props);
        this.state = {
            step: 1,
            sending: false,
            sec: 60,
            sureReplace: false,
            replaceMsg: ''
        };
    }

    nextStep = () => {
        this.setState({
            step: 2
        });
    }

    setPhone = e => {
        this.phone = e.target.value;
    }

    setCode = e => {
        this.code = e.target.value;
    }

    sendCode = () => {
        const _self = this;

        let djs = () => {
            this.setState({
                sending: true
            });
            let sec = _self.state.sec;
            _self.t = setInterval(() => {
                this.setState({
                    sec: --sec
                });
                if (_self.state.sec < 0) {
                    clearInterval(_self.t);
                    _self.t = null;
                    this.setState({
                        sending: false,
                        sec: 60
                    });
                    return;
                }
            }, 1000);
        };
     
        if (_self.t) {
            return;
        }

        this.props.dispatch({
            type: 'global/sendCode',
            payload: {
                phone: this.phone,
                done: djs   
            }
        });
    }

    savePhone = (replace) => {
        let done = null;
        if (replace == 0) {
            done = (replaceMsg) => {
                this.setState({
                    sureReplace: true,
                    replaceMsg 
                });
            };
        } else {
            done = () => {
                this.setState({
                    sureReplace: false,
                });
            };
        }
        
        this.props.dispatch({
            type: 'global/saveUserPhone',
            payload: {
                auth_code: this.code,
                phone: this.phone,
                replace,
                done
            }
        });
    }

    componentWillUnmount() {
        clearInterval(this.t);
    }

    render() {
        return (
            <div className="phone-auth-container">
                {this.state.step == 1 ? 
                <div className="phone-auth-part1">
                    <header>
                        <Image name="phone-warning.svg"></Image>
                    </header>

                    <section className="phone-auth-part1-section">
                        <p>您的账户需要手机号码认证！</p>
                        <p>请您认证您的手机号码，避免影响使用。</p>
                    </section>

                     <footer className="phone-auth-part1-footer">
                        <button className="phone-auth-btn" onClick={this.nextStep}>去认证</button>
                     </footer>
                </div> : null}

                 {this.state.step == 2 ? 
                 <div className="phone-auth-part2">
                    <header>
                        <Image name="signin_logo.png"></Image>
                    </header>

                    <section>
                        <div className="pa-from-1">
                            <div className="pa-form-block">
                                <div className="pa-input">
                                    <div className="pa-input-icon">
                                        <Image name="phone.svg"></Image>
                                    </div>
                                    <input type="text" placeholder="请输入手机号码" onChange={e => this.setPhone(e)}/>
                                </div>
                            </div>
                        </div>

                        <div className="pa-from-2 clearfix">
                            <div className="pa-form-block">
                                <input type="text" placeholder="请输入验证码" style={{border: 0, padding:0}}  
                                onChange={e => this.setCode(e)}/>
                            </div>
                            <div className="pa-form-block code-send" 
                                style={{cursor: this.state.sending ? 'disable' : 'pointer' }} 
                                onClick={this.sendCode}
                            >
                               {this.state.sending ? <span>重新发送（{this.state.sec}s）</span> : <span>发送验证码</span> }
                            </div>
                        </div>
                    </section>

                    <footer>
                        <button className="phone-auth-btn" style={{width: "100%"}} onClick={() => this.savePhone(0)}>保存</button>
                    </footer>
                </div> : null}

                 <ComfirmModal 
                visible={this.state.sureReplace}
                content={<span>{this.state.replaceMsg}</span>}
                onClose={() => this.setState({sureReplace: false})}
                onSure={() => this.savePhone(1)}
                />
            </div>
        );
    }
}

export default PhoneAuth;