/**
 * Created by bll on 2017/10/9.
 */
import React, { Component, PropTypes } from 'react';
import { Modal, message } from 'antd';
import './index.scss';
// import $ from 'jquery';

// 判断是否是移动端
let isMobile = '';
if (/Android|webOS|iPhone|iPad|BlackBerry/i.test(navigator.userAgent)) {
	isMobile = true;
} else {
	isMobile = false;
}
let url = '';
// 判断开发环境
if (process.env.NODE_ENV === 'production') {
	url = '/';
} else {
	// url = 'http://10.255.1.23:7777/'
	// url = 'http://www.uxinyue.com:81/'
	url = 'https://www.uxinyue.com/';
}
// 跳转
function jump() {
	if (process.env.NODE_ENV === 'production') {
		if (window.loginIndex == 4) {
			window.location.href = url + 'caseDemo';
		} else {
			window.location.href = url + 'xyapp/#/project';
		}
	} else if (process.env.NODE_ENV !== 'production') {
		if (window.loginIndex == 4) {
			// window.location.href = 'http://localhost:63342/caseDemogit/index.html'
			window.location.href = 'http://localhost:7777/caseDemo/index.html';
		} else {
			window.location.href = 'http://localhost:7777/xyapp/#/project';
		}
	}
}
// 登录成功后保存数据跳转页面
function siginSuccess(data) {
	localStorage.setItem('LOGIN_ID', data.data.login_id);
	localStorage.setItem('TOKEN', data.data.token);

	message.success('登录成功', 2);
	jump();
}
let LOGIN_ID = localStorage.getItem('LOGIN_ID');
let TOKEN = localStorage.getItem('TOKEN');
class LoginModal extends Component {
	constructor(props) {
		super(props);
		this.state = {
			// wxsignin: caseDemo && isMobile == false ? true : false,
			wxsignin: false,
			// passwordsignin: caseDemo && isMobile ? true : false,
			// passwordsignin: caseDemo ? true : false,
			passwordsignin: false,
			register: false,
			code: false,
			scene_id: '',
			poll: false,
			findPassword: false,
			// codeSignin: isMobile ? true : false,
			codeSignin: false,
			sec: 60,
			canSendCode: false,
			stopPoll: false,
			avatar: '',
			email: '',
			realname: '',
			hasAccount: false,
			showmobileUserDropdown: false
		};
		message.config({
			top: 68,
			duration: 2
		});
	}
	componentDidMount() {
		window.loginIndex = 0;

		// 得到用户信息
		let self = this;
		let newurl = url + 'api/user/info?login_id=' + LOGIN_ID + '&token=' + TOKEN;

		// $.ajax({
		// 	url: newurl,
		// 	type: 'GET',
		// 	dataType: 'json',
		// 	headers: {
		// 		'Content-Type': 'application/x-www-form-urlencoded'
		// 	},
		// 	success: function (res) {
		// 		if (res.status == 1) {
		// 			self.setState({
		// 				hasAccount: true,
		// 				avatar: res.data.avatar,
		// 				email: res.data.email,
		// 				realname: res.data.realname,
		// 				wxsignin: false,
		// 				passwordsignin: false,
		// 				register: false,
		// 				code: false,
		// 				poll: false,
		// 				findPassword: false
		// 			});
		// 		} else {
		// 			self.setState({
		// 				hasAccount: false
		// 			});
		// 		}
		// 	}
		// });
	}
	// 得到SceneId
	getSceneId() {
		let self = this;
		let newurl = url + 'api/sceneid';

		// $.ajax({
		// 	url: newurl,
		// 	type: 'GET',
		// 	dataType: 'json',
		// 	headers: {
		// 		'Content-Type': 'application/x-www-form-urlencoded'
		// 	},
		// 	success: function (data) {
		// 		self.setState({
		// 			scene_id: data.data.scene_id
		// 		});
		// 		self.pollSceneId();
		// 	}
		// });
	}
	// 轮询SceneId
	pollSceneId() {
		let self = this;
		let newurl = url + 'api/update/express/time?scene_id=' + self.state.scene_id;
		function polling() {
			// $.ajax({
			// 	url: newurl,
			// 	type: 'GET',
			// 	dataType: 'json',
			// 	headers: {
			// 		'Content-Type': 'application/x-www-form-urlencoded'
			// 	},
			// 	success: function (data) {
			// 		if (process.env.NODE_ENV !== 'production') {
			// 			console.log(data, 'data');
			// 		}
			// 		if (data.data) {
			// 			self.setState({
			// 				stopPoll: true
			// 			});
			// 			clearInterval(t);
			// 			localStorage.setItem('SIGININ_STYLE', 'code');
			// 			siginSuccess(data);
			// 		}
			// 		if (self.state.poll === false) {
			// 			clearInterval(t);
			// 		}
			// 	}
			// });
		}
		polling();
		let t = setInterval(polling, 3000);
	}
	// 根据用户上一次的登录方式显示登录方式的modal
	showSigninModal() {
		let self = this;
		let lastsigin = localStorage.getItem('SIGININ_STYLE');
		if (lastsigin == 'code') {
			self.showWXSigninModal();
		} else if (lastsigin == 'phone') {
			self.setState({
				codeSignin: true
			});
			self.showPasswordSigninModal();
		} else if (lastsigin == 'email') {
			self.setState({
				codeSignin: false
			});
			self.showPasswordSigninModal();
		} else if (isMobile) {
			self.showPasswordSigninModal();
		} else {
			self.showWXSigninModal();
		}
	}
	// modal的隐藏显现
	showWXSigninModal() {
		this.setState({
			wxsignin: true,
			passwordsignin: false,
			register: false,
			code: false,
			poll: true,
			findPassword: false
		});
		this.getSceneId();
	}
	handleWXSigninCancel() {
		this.setState({
			wxsignin: false,
			poll: false
		});
	}
	showPasswordSigninModal() {
		this.setState({
			passwordsignin: true,
			wxsignin: false,
			register: false,
			code: false,
			poll: false,
			findPassword: false
		});
	}
	handlePasswordSigninCancel() {
		this.setState({
			passwordsignin: false
		});
	}
	showRegisterModal() {
		this.setState({
			register: true,
			wxsignin: false,
			passwordsignin: false,
			code: false,
			poll: true,
			findPassword: false
		});
		this.getSceneId();
	}
	handleRegisterCancel() {
		this.setState({
			register: false,
			poll: false
		});
	}
	showFindPasswordModal() {
		this.setState({
			findPassword: true,
			passwordsignin: false,
			wxsignin: false,
			register: false,
			code: false,
			poll: false
		});
	}
	handleFindPasswordCancel() {
		this.setState({
			findPassword: false
		});
	}
	// 移动端显示下拉用户信息
	showUserDropdown() {
		let self = this;
		self.setState({
			showmobileUserDropdown: !self.state.showmobileUserDropdown
		});
	}
	// 退出账号
	quitAccount() {
		let self = this;
		localStorage.removeItem('LOGIN_ID');
		localStorage.removeItem('TOKEN');
		self.setState({
			hasAccount: false,
			showmobileUserDropdown: false
		});
		window.hasAccount = false;
	}
	// 进入工作台
	toXinYueApp() {
		if (this.state.hasAccount) {
			jump();
		} else {
			message.error('您还未登录，请先登录', 2);
		}
	}
	// 忘记密码
	findPassword(e) {
		e.preventDefault();
		let inputs = document.querySelectorAll('#findPassword input');
		let submitObj = {};

		for (let i = 0; i < inputs.length; i++) {
			let validateResult = this.validate(inputs[i]);
			if (!validateResult.status) {
				message.error(validateResult.name, 2);
				return;
			} else {
				submitObj[inputs[i].name] = inputs[i].value;
			}
		}
		submitObj.type = 1;

		let findPasswordurl = url + 'api/self_invite';
		// $.ajax({
		// 	url: findPasswordurl,
		// 	type: 'POST',
		// 	data: submitObj,
		// 	dataType: 'json',
		// 	headers: {
		// 		'Content-Type': 'application/x-www-form-urlencoded'
		// 	},
		// 	success: function (data) {
		// 		if (data.status == -1) {
		// 			message.error(data.msg, 2);
		// 		} else {
		// 			message.success(data.msg, 2);
		// 		}
		// 	}
		// });
	}
	// 表单验证
	validate(input) {
		let validateName = input.getAttribute('validate');
		switch (validateName) {
			case 'email':
				if (!input.value) {
					return {
						status: false,
						name: '请输入邮箱'
					};
				}
				if (!(/^[a-zA-Z0-9._%+-]+@(?!.*\.\..*)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(input.value))) {
					return { status: false, name: '请填写正确的电子邮箱' };
				}
				break;
			case 'phone':
				if (!input.value) {
					return {
						status: false,
						name: '请输入手机号'
					};
				}
				if (!(/^1[34578]\d{9}$/.test(input.value))) {
					return { status: false, name: '请填写正确的手机号码' };
				}
				break;
			case 'validate':
				if (!input.value) {
					return {
						status: false,
						name: '请输入验证码'
					};
				}
				break;
			case 'sms_code':
				if (!input.value) {
					return {
						status: false,
						name: '请输入验证码'
					};
				}
				if (!(/^[0-9]{6}$/.test(input.value))) {
					return { status: false, name: '请填写正确的验证码' };
				}
				break;
			case 'password':
				if (!input.value) {
					return {
						status: false,
						name: '请输入登录密码'
					};
				}
				break;
			default:
				return { status: true, name: '' };
		}
		return { status: true, name: '' };
	}
	// 邮箱验证登录
	handleFormSubmit(e) {
		e.preventDefault();
		let self = this;
		let inputs = document.querySelectorAll('#signIn input');
		let submitObj = {};

		for (let i = 0; i < inputs.length; i++) {
			let validateResult = this.validate(inputs[i]);
			if (!validateResult.status) {
				message.error(validateResult.name, 2);
				return;
			} else {
				submitObj[inputs[i].name] = inputs[i].value;
			}
		}
		let signincounturl = url + 'api/authentication';
		// $.ajax({
		// 	url: signincounturl,
		// 	type: 'POST',
		// 	dataType: 'json',
		// 	headers: {
		// 		'Content-Type': 'application/x-www-form-urlencoded'
		// 	},
		// 	data: submitObj,
		// 	success: function (data) {
		// 		if (data.status == -1) {
		// 			message.error(data.msg, 2);
		// 			self.setState({
		// 				code: true
		// 			});
		// 		} else {
		// 			localStorage.setItem('SIGININ_STYLE', 'email');
		// 			siginSuccess(data);
		// 		}
		// 	}
		// });
	}
	// 手机号验证登录
	handleFormPhoneSubmit(e) {
		e.preventDefault();
		let self = this;
		let inputs = document.querySelectorAll('#signInPhone input');
		let submitObj = {};
		for (let i = 0; i < inputs.length; i++) {
			let validateResult = this.validate(inputs[i]);
			if (!validateResult.status) {
				message.error(validateResult.name, 2);
				return;
			} else {
				submitObj[inputs[i].name] = inputs[i].value;
			}
		}
		let signincounturl = url + 'api/signin/with/phone';

		// $.ajax({
		// 	url: signincounturl,
		// 	type: 'POST',
		// 	data: submitObj,
		// 	dataType: 'json',
		// 	headers: {
		// 		'Content-Type': 'application/x-www-form-urlencoded'
		// 	},
		// 	success: function (data) {
		// 		if (data.status == -1) {
		// 			message.error(data.msg, 2);
		// 			self.setState({
		// 				code: true
		// 			});
		// 			window.loginIndex = 0;
		// 		} else {
		// 			localStorage.setItem('SIGININ_STYLE', 'phone');
		// 			siginSuccess(data);
		// 		}
		// 	}
		// });
	}
	// 点击切换验证码
	changePic() {
		let validatepic = document.querySelector('.code-img img');
		validatepic.src = url + 'api/vercode?t=' + Math.round(new Date().getTime() / 1000);
	}
	// 验证码登录
	codeSignin() {
		this.setState({
			codeSignin: !this.state.codeSignin
		});
	}
	// 发送手机验证码倒计时
	sendCode() {
		let self = this;
		let submitObj = {};
		let inputs = document.querySelectorAll('#signInPhone input');
		submitObj[inputs[0].name] = inputs[0].value;

		self.setState({
			canSendCode: false,
			sec: 59
		});
		let codeurl = url + 'api/signin/send/sms';
		if (!(self.state.sec > 0 && self.state.sec < 60)) {
			// $.ajax({
			// 	url: codeurl,
			// 	type: 'POST',
			// 	dataType: 'json',
			// 	data: submitObj,
			// 	headers: {
			// 		'Content-Type': 'application/x-www-form-urlencoded'
			// 	},
			// 	success: function (data) {
			// 		if (data.status == -1) {
			// 			message.error(data.msg, 2);
			// 			self.setState({
			// 				canSendCode: true,
			// 				sec: 0
			// 			});
			// 			clearInterval(t);
			// 			return;
			// 		} else {
			// 			message.success(data.msg, 2);
			// 		}
			// 	}
			// });
		}

		let t = setInterval(() => {
			self.setState({
				sec: --self.state.sec
			});
			if (self.state.sec <= 0) {
				self.setState({
					canSendCode: true,
					sec: 0
				});
				clearInterval(t);
				return;
			}
			if (self.state.codeSignin == false) {
				self.setState({
					canSendCode: true,
					sec: 0
				});
				clearInterval(t);
				return;
			}
		}, 1000);
	}
	render() {
		window.hasAccount = this.state.hasAccount;
		const maskStyle = {
			// background: 'rgb(34,42,56)'
		};
		const bodyStyle = {
			background: '#fff',
			borderRadius: '4px',
			padding: '28px'
		};

		const {
			passwordsignin,
			wxsignin,
			register,
			findPassword
		} = this.props;
		
		return (
			<div className="container-fluid">
				<Modal
					title=""
					visible={this.state.passwordsignin}
					onCancel={() => this.handlePasswordSigninCancel()}
					maskStyle={maskStyle}
					bodyStyle={bodyStyle}
					footer={null}
					closable={false}
					width="376px"
					wrapClassName="signInModal vertical-center-modal"
				>
					<div className="signIn_header">
						<div className="tran_tips toScan_tips"></div>
						<div className="tran_pic toScan_pic" onClick={() => this.showWXSigninModal()}></div>
					</div>
					<div className="signIn_logo"></div>
					{this.state.codeSignin ?
						<div className="signin_input" id="signInPhone">
							<div className="input_box">
								<div className="input_icon phone_icon"></div>
								<div className="input_fe"></div>
								<input type="text" defaultValue="" className="email" name="phone" validate="phone" placeholder="请输入手机号"/>
							</div>
							<div className="input_box2">
								<input type="text" className="code" name="sms_code" validate="sms_code" placeholder="请输入验证码"/>
								<div className="sendCode" onClick={this.state.sec > 0 && this.state.sec < 60 ? null : () => this.sendCode()}>{this.state.sec > 0 && this.state.sec < 60 ? this.state.sec + '秒重发' : '获取验证码'}</div>
							</div>
						</div> : <div className="signin_input" id="signIn">
							<div className="input_box">
								<div className="input_icon email_icon"></div>
								<div className="input_fe"></div>
								<input autoComplete="on" type="email" defaultValue="" className="email" name="email" validate="email" placeholder="请输入邮箱"/>
							</div>
							<div className="input_box">
								<div className="input_icon password_icon"></div>
								<div className="input_fe"></div>
								<input autoComplete="on" type="password" className="password" name="password" validate="password" placeholder="请输入登录密码"/>
							</div>
							{this.state.code ?
								<div className="input_box code-box">
									<input type="text" className="code" name="validate" validate="validate" placeholder="请输入验证码！"/>
									<div className="input_fe2"></div>
									<div className="code-img">
										<img alt="" title="点击刷新" onClick={(e) => this.changePic()} src={url + 'api/vercode?t=9999'}/>
									</div>
								</div> : null}
						</div>}
					<div className="tips">
						<div className="tips_register" onClick={() => this.showRegisterModal()}>注册账号</div>
						<div className="tips_right">
							{this.state.codeSignin ? null : <div className="forget_password" onClick={() => this.showFindPasswordModal()}>忘记密码&nbsp;|&nbsp;</div>}
							<div className="codeSignin" onClick={() => this.codeSignin()}>{this.state.codeSignin ? '邮箱登录' : '手机验证码登录'}</div>
						</div>
					</div>
					{this.state.codeSignin ? <div className="signIn_btn" onClick={(e) => this.handleFormPhoneSubmit(e)}>
						<span>登录</span>
					</div> : <div className="signIn_btn" onClick={(e) => this.handleFormSubmit(e)}>
						<span>登录</span>
					</div>}
				</Modal>
				<Modal
					title=""
					visible={this.state.wxsignin}
					onCancel={() => this.handleWXSigninCancel()}
					maskStyle={maskStyle}
					bodyStyle={bodyStyle}
					footer={null}
					closable={false}
					width="376px"
					wrapClassName="signInModal vertical-center-modal"
				>
					<div className="signIn_header">
						<div className="tran_tips toPassword_tips"></div>
						<div className="tran_pic toPassword_pic" onClick={() => this.showPasswordSigninModal()}></div>
					</div>
					<div className="signIn_logo"></div>
					<div className="wxCode">
						{this.state.stopPoll ? <p>恭喜您，扫码成功！</p> : <img src={url + 'wxapi/login?scene_id=' + this.state.scene_id} alt=""></img>}
					</div>
					<div className="wxCode_scan">
						<div className="scan"></div>
						<span>请使用微信扫描二维码登录</span>
					</div>
					<div className="signIn_footer">
						<span onClick={() => this.showPasswordSigninModal()} className="toPassword">邮箱登录</span>
						<span> | </span>
						<span className="toRegister" onClick={() => this.showRegisterModal()}>免费注册</span>
					</div>
				</Modal>
				<Modal
					title=""
					visible={this.state.register}
					onCancel={() => this.handleRegisterCancel()}
					maskStyle={maskStyle}
					bodyStyle={bodyStyle}
					footer={null}
					closable={false}
					width="376px"
					wrapClassName="signInModal vertical-center-modal"
				>
					<div className="signIn_header">

					</div>
					<div className="signIn_logo"></div>
					<div className="wxCode">
						{this.state.stopPoll ? <p>恭喜您，扫码成功！</p> : <img src={url + 'wxapi/login?scene_id=' + this.state.scene_id} alt=""></img>}
					</div>
					<div className="wxCode_scan">
						<div className="scan"></div>
						<span>请使用微信扫描二维码</span>
					</div>
					<div className="signIn_footer">
						<span onClick={() => this.showWXSigninModal()} className="backSignin">返回登录</span>
					</div>
				</Modal>
				<Modal
					title=""
					visible={this.state.findPassword}
					onCancel={() => this.handleFindPasswordCancel()}
					maskStyle={maskStyle}
					bodyStyle={bodyStyle}
					footer={null}
					closable={false}
					width="376px"
					wrapClassName="signInModal findPassword vertical-center-modal"
				>
					<div className="signIn_header back_signin" onClick={() => this.showWXSigninModal()}>
						返回登录
					</div>
					<div className="findPassword_tips">
						请输入你需要找回登录密码的账户名
					</div>
					<form className="signin_input" id="findPassword">
						<div className="input_box">
							<div className="input_icon email_icon"></div>
							<div className="input_fe"></div>
							<input type="email" className="email" name="email" validate="email" placeholder="请输入邮箱"/>
						</div>
						<div className="input_box code-box">
							<input type="text" className="code" name="validate" validate="validate" placeholder="请输入验证码！"/>
							<div className="input_fe2"></div>
							<div className="code-img" id="validate">
								<img alt="" title="点击刷新" onClick={(e) => this.changePic()} src={url + 'api/vercode?t=9999'}/>
							</div>
						</div>
					</form>
					<div className="signIn_btn" onClick={(e) => this.findPassword(e)}>
						<span>提交</span>
					</div>
				</Modal>
				<div style={{ opacity: 0, width: 0, height: 0 }}>
					<a onClick={() => this.toXinYueApp()} ref={node => window.toNode = node}>进入</a>
					<a onClick={() => this.showSigninModal()} ref={node => window.loginNode = node}>登录</a>
					<a onClick={() => this.showRegisterModal()} ref={node => window.registerNode = node}>免费注册</a>
					<a onClick={() => this.quitAccount()} ref={node => window.quitAccount = node}>退出</a>
				</div>
			</div>
		);
	}
}

export default LoginModal;
