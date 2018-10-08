import React, { PureComponent } from 'react';
import TooltipPannel from '@CC/Tooltip';
import Image from '@CC/Image';
import IconBlock from '@CC/IconBlock';
import {FileMoreBody} from '../FileFolderMore';
import { Tooltip, Input, Icon, Slider, Progress, message } from 'antd';
import { routerRedux } from 'dva/router';
import Clipboard from 'clipboard';
import {PRE_PAGE, PRO_COLOR, NOTICE_TIME, EXP_EMAIL} from '@config/constants';
import {beforeTime, timeToMS, formatTimecode, trigger, getTokenLocalstorage, getQuery, isIE} from '@utils/utils';
import './index.scss';

// 文件操作
export class FileMorePannel extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            downloadBlockShow: false
        };
    }

    changeAllowToFile = (allowToFile, data) => {
        // 是否允许文件跳转
        this.props.dispatch({type: 'project/saveAllowToFile', payload: allowToFile});
        if (allowToFile) {
            this.props.setDraging(false, 0);
            this.props.setToolTipShow(false);
        } else {
            this.props.setDraging(true, data.id);
            this.props.setToolTipShow(true);
        }
  
    }

    toggleDownload(downloadBlockShow) {
        const {data, projectsList, projectActive} = this.props;
        let currentProject = projectsList.filter(item => item.id == projectActive)[0];
        if (currentProject.collaborator_download == 0) {
            message.warning('请在项目设置里打开“可下载媒体”');
            return;
        }

        if (downloadBlockShow) {
            this.props.dispatch({type: 'global/getDownload', payload: data.id});
        }

        this.setState({
            downloadBlockShow: downloadBlockShow
        });
    }

    renderBtn() {
        const {type} = this.props;

        if (type == 'grid') {
            return (
                <div className="file-more-btn">
                    <Image name="more-hor.svg" />
                </div>
            );
        } else {
            return (
                <div className="file-more-btn more-icon">
                    <Image name="more_if.svg" />
                </div>
            );
        }
 
    }

    render() {
        const {data, type} = this.props;
        if (type == 'grid') {
            return (
                <TooltipPannel
                        btnTitle={() => this.renderBtn()}
                        width={210}
                        // height={100}
                        onShow={() => this.changeAllowToFile(false, data)}
                        onHide={() => this.changeAllowToFile(true, data)}
                        renderTemplate={() => <FileMoreBody toggleDownload={(downloadBlockShow) => this.toggleDownload(downloadBlockShow)}
                                                    downloadBlockShow={this.state.downloadBlockShow} {...this.props}
                                                    data={data} {...this.props}
                                                />}
                        marginLeft={18}
                        direction="top,right"
                        contentClickIsHide={true}
                />
            );
        } else {

            let menu = ['分享', '下载', '删除'];
            if (data.versions.length > 0) {
                menu = ['分享', '下载', '解除版本', '删除所有版本'];
            }

            let menuH = menu.length * 30 + (menu.length - 1) * 5 + 20;
            if (this.state.downloadBlockShow) {
                menuH = 250;
            }

            if (data.type == 'folder') {
                menuH = 50;
            }

            return(
                <TooltipPannel
                    btnTitle={() => this.renderBtn()}
                    width={210}
                    height={menuH}
                    onShow={() => this.changeAllowToFile(false, data)}
                    onHide={() => this.changeAllowToFile(true, data)}
                    renderTemplate={() => <FileMoreBody toggleDownload={(downloadBlockShow) => this.toggleDownload(downloadBlockShow)}
                                            downloadBlockShow={this.state.downloadBlockShow} {...this.props}
                                            data={data} {...this.props}
                                    />}                   
                    marginLeft={10}
                    direction="right"
                    horizontal={true}
                    contentClickIsHide={true}
                />
            );
        }
    }
}

// 文件夹操作
export class FolderMorePannel extends PureComponent {
    constructor(props) {
        super(props);
    }

    renderBtn() {
        return (
            <div className="file-more-btn">
                <Image name="more-hor.svg" />
            </div>
        );
    }

    render() {
        return (
            <TooltipPannel
                    btnTitle={() => this.renderBtn()}
                    width={150}
                    // height={100}
                    onClick={() => this.setState({personOpened: true})}
                    onHide={() => this.setState({personOpened: false})}
                    renderTemplate={() => <div>888</div>}
                    marginLeft={12}
                    direction="top,right"
            />
        );
    }
}

// 成员操作
export class MemberPannel extends PureComponent {

    email = '';

    constructor(props) {
        super(props);
    }

    inviteEmail = () => {
        this.props.dispatch({
            type: 'project/inviteMember',
            payload: this.email
        });
    }

    searchEmail = () => {
        this.props.dispatch({
            type: 'project/searchEmail',
            payload: this.emailSearch
        });
    }

    setMembersManage = (membersManage) => {
        this.props.dispatch({
            type: 'project/saveMembersManage',
            payload: membersManage
        });

        if (!membersManage) {
            this.props.dispatch({
                type: 'project/saveAddMemberShow',
                payload: false	 
            });
        }
    }

    toggleSetMembersManage = () => {
        this.setMembersManage(!this.props.membersManage);
    }

    deleteMember = (member_id) => {
        this.props.dispatch({
            type: 'project/deleteMember',
            payload: member_id
        });
    }

    changeRole = (item) => {
        if (!this.props.membersManage) return;
        this.props.dispatch({
            type: 'project/changeRole',
            payload: {
                member_id: item.user_id,
                type: item.type == 'member' ? 'reviewer' : 'member'
            }
        });
    }

    isAddMember = (e) => {
        const {projectsList, projectActive} = this.props;
        let currentProject = projectsList.filter(item => projectActive == item.id)[0];
        
        if (currentProject.collaborator_invite == 0) {
            e.stopPropagation();
            message.warning('请在项目设置里打开“可邀请合作者”');
            return;
        }
    }

    searchUser = e => {
        this.email = e.target.value;
        this.props.dispatch({
            type: 'project/searchAllMembers',
            payload: e.target.value
        });
    }

    invite = user => {
        this.props.dispatch({
            type: 'project/newInvite',
            payload: user.email
        });
    }

    sendEmail = () => {
        if (!EXP_EMAIL.test(this.email)) {
            message.warning('邮件格式不正确');
            return;
        }

        this.props.dispatch({
            type: 'project/newInvite',
            payload: this.email
        });
    }

    componentDidMount() {
        const _self = this;
        if (!this.clipboard) {
            this.clipboard = new Clipboard('#copy-invite', {
                text: () => {
                    const {inviteCode} = this.props;
                    let inviteUrl = '';
                    
                    if(process.env.NODE_ENV === 'production') {
                        if (window.location.host.indexOf(':81') > -1) {
                            inviteUrl =  'http://' + window.location.host + '/xyapp/#/invite?r=' + inviteCode;
                        } else {
                            inviteUrl =  'https://' + window.location.host + '/xyapp/#/invite?r=' + inviteCode;
                        }
                    } else {
                        inviteUrl = window.location.host + '/#/invite?r=' + inviteCode;
                    }

                    return inviteUrl;
                }
            });
            this.clipboard.on('success', (e) => {
                if (_self.copying) return;
                message.success('复制链接成功');
                _self.copying = true;
                setTimeout(() => {
                    _self.copying = false;
                }, 2000);
            });
        }
    }
    
    componentWillUnmount() {
        this.clipboard && this.clipboard.destroy();
    }
    
    renderBtn() {
        return (
            <Tooltip placement="top" title='添加/管理成员'>
                <div className="add-mamber tooltip-cover-btn" onClick={this.isAddMember} id="add-member" >
                    <Image name="add-member.svg" />
                </div>
            </Tooltip>
        );
    }

    renderBody() {
        const {
            toggleAddMember, 
            addMemberShow, 
            members, 
            membersManage, 
            searchedMembers,
            allMembers,
            searchedAllMembers,
            inviteCode
        } = this.props;

        let inviteUrl = '';

        if(process.env.NODE_ENV === 'production') {
            inviteUrl = '/xyapp/#/invite?r=' + inviteCode;
        } else {
            inviteUrl = '/#/invite?r=' + inviteCode;
        }
        
        return (
            <div className="member-body">
                {!addMemberShow ? 
                <header className="member-body-header">
                    <p onClick={() => toggleAddMember(true)}>
                        <IconBlock iconName="add-m.svg" direction="left" />
                        <span>添加</span>
                    </p>
                    <p>成员</p>
                    <p onClick={() => this.toggleSetMembersManage()}>
                        <IconBlock iconName="manage-m.svg" direction="left" />
                        <span>管理</span>
                    </p>
                </header>:
                 <header className="member-body-header">
                    <p onClick={() => toggleAddMember(false)} style={{paddingLeft:0}}>
                        <span>取消</span>
                    </p>
                    <p>添加成员</p>
                    <p></p>
                    {/* <p style={{textAlign: 'right'}} onClick={this.inviteEmail}>邀请</p> */}
                </header>}

                <div className="member-body-all clearfix" style={{transform: addMemberShow ? 'translateX(-50%)' : ''}}>
                    <section className="member-body-section">
                        <div className="member-search">
                            <Input
                                placeholder="筛选名称或者邮箱"
                                prefix={<Icon type="search" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                onChange={e => this.emailSearch = e.target.value}
                                ref={node => this.userNameInput = node}
                                onPressEnter={this.searchEmail}
                            />
                        </div>

                        <ul className="member-list">
                            {searchedMembers.map((item, k) => {
                                return (
                                    <li key={k}>
                                        <div>
                                            {item.avatar == '' ? <span className="member-avatar" style={{background: item.avatar_background_color}}>{item.realname[0]}</span> : <img src={item.avatar} alt=""/>}
                                            <div className="member-content">
                                                <p>{item.realname}</p>
                                                <p> 最新一次登录：{beforeTime(item.last_login_time)}</p>
                                            </div>
                                            <div className="member-right">
                                                {item.type == 'admin' ? 
                                                <span style={{background: '#1a3bde', cursor: 'pointer'}}>管</span>: null}

                                                {item.type == 'reviewer' ? 
                                                <Tooltip placement="top" title='切换角色'>
                                                    <span style={{cursor: 'pointer'}} onClick={() => this.changeRole(item)}>审</span>
                                                </Tooltip>: null}

                                                {item.type == 'member' ? 
                                                <Tooltip placement="top" title='切换角色'>
                                                    <span style={{cursor: 'pointer'}} onClick={() => this.changeRole(item)}>制</span>
                                                </Tooltip>: null}
                                                
                                                {membersManage && item.type != 'admin' ? 
                                                <div className="member-delete" onClick={() => this.deleteMember(item.user_id)}> </div> : null}
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </section>

                     <section className="member-body-section" style={{borderTop: '1px solid #E6E9EB'}}>
                        {/* <div className="member-search">
                            <Input
                                placeholder="请输入邮箱"
                                prefix={<Icon type="plus-circle-o" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                onChange={e => this.email = e.target.value}
                                ref={node => this.userNameInput = node}
                                onPressEnter={this.inviteEmail}
                            />
                        </div> */}

                        <div className="member-search-do">
                            <p className="msd-p">请将链接粘贴发送给新的成员</p>
                            <div className="msd-group clearfix">
                                <div className="msd-input">
                                    <Input type="text" placeholder="" disabled value={inviteUrl}/>
                                </div>
                                <button id="copy-invite">复制链接</button>
                            </div>
                            <p className="msd-p">在下输入昵称、邮箱或者手机号</p>
                            <div className="msd-group clearfix">
                                <div className="msd-input">
                                    <Input type="text" placeholder="请输入昵称、邮箱" 
                                    onChange={e => this.searchUser(e)}
                                    onPressEnter={this.inviteEmail}
                                    />
                                    <ul className="msd-search-list">
                                        {searchedAllMembers.map((item, k) => {
                                            return (
                                                <li key={k} onClick={() => this.invite(item)}>
                                                    <div className="msd-search-li">
                                                        {item.avatar != '' ? 
                                                        <img src={item.avatar} alt=""/>:
                                                        <span style={{background: item.avatar_background_color}}>{item.realname[0]}</span>}
                                                        <p>{item.realname},&lt;{item.email}&gt; </p>
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                                <button onClick={this.sendEmail}>发送</button>
                            </div>
                            
                        </div>
                        

                        {/* <div className="member-invite-empty">
                            <Image name="member-email.svg"></Image>
                            <p>在上方输入邮箱</p>
                            <p>若要添加更多成员请继续在<br/>上方输入邮箱或者手机号</p>
                        </div> */}

                        {/* <ul className="member-list invite">
                            <li>
                                <div>
                                    <Image name="invited-tx.svg"></Image>
                                    <div className="member-content">
                                        <p>1037359589@qq.com</p>
                                        <p>通过邮件邀请</p>
                                    </div>
                                    <div className="member-right">
                                        <Image name="invite-m.svg"></Image>
                                    </div>
                                </div>
                            </li>
                        </ul> */}
                    </section>
                </div>
                              
            </div>
        );
    }

    render() {
        const {tabIndex} = this.props;
        let direction = null, marginLeft = 0;

        if (tabIndex != 0) {
            direction = 'top,right';
            marginLeft = 29;
        }

        return (
            <TooltipPannel
                    btnTitle={() => this.renderBtn()}
                    width={330}
                    // height={100}
                    onClick={() => {}}
                    onHide={() =>  this.setMembersManage(false)}
                    renderTemplate={() => this.renderBody()}
                    marginLeft={marginLeft}
                    direction={direction}
            />
        );
    }
}

// 项目设置
export class ProjectSettingPannel extends PureComponent{
    constructor(props) {
        super(props);
    }

    renderBtn() {
        return (
            <div className="project-setting-btn">
                <IconBlock iconName="setting.svg" direction="left" alt="项目设置" />
            </div>
        );
    }

    render() {
        return (
            <TooltipPannel
                    btnTitle={() => this.renderBtn()}
                    width={150}
                    // height={100}
                    onClick={() => this.setState({personOpened: true})}
                    onHide={() => this.setState({personOpened: false})}
                    renderTemplate={() => <div>888</div>}
                    marginLeft={12}
                    direction="top,right"
            />
        );
    }
}

// 项目排序
export class ProjectSortPannel extends PureComponent{
    constructor(props) {
        super(props);
    }

    changeLookType = (lookType) => {
        this.props.dispatch({
            type: 'project/saveLookType',
            payload: lookType
        });
    }

    changeSort = (sortIndex) => {
        this.props.dispatch({
            type: 'project/saveSortIndex',
            payload: sortIndex
        });

        this.props.dispatch({
            type: 'project/sortFile',
            payload: {}
        });
    }

    renderBtn() {
        return (
            <div className="project-setting-btn">
                <IconBlock iconName="sort.svg" direction="left"  tipDirection="topRight" alt="文件排序/展示"/>
            </div>
        );
    }

    renderBody() {
        const {lookType, sortIndex} = this.props;
        return (
            <div className="project-sort-body">
                <ul>
                    {['最近上传', '名称', '类型', '文件大小(升序)', '文件大小(降序)'].map((item, k) => {
                        return (
                            <li key={k} className="active" onClick={() => this.changeSort(k)}>
                                {item}
                                {sortIndex == k ? <Image name="sort-check.svg"/> : null}
                            </li>
                        );
                    })}
                </ul>

                <footer className="project-sort-footer clearfix">
                    <div className={lookType == 'li' ? "ps-show-type active" : "ps-show-type"}  onClick={() => this.changeLookType('li')}>
                        <div><IconBlock iconName={lookType == 'li' ? "v-sort-active.svg" : "v-sort.svg"} /></div>
                    </div>
                    <div className={lookType == 'grid' ? "ps-show-type active" : "ps-show-type"}  onClick={() => this.changeLookType('grid')}>
                        {/* <div><IconBlock iconName="h-sort.svg" /></div> */}
                        <div><IconBlock iconName={lookType == 'grid' ? "h-sort-active.svg" : "h-sort.svg"} /></div>
                    </div>
                </footer>
            </div>
        );
    }

    render() {
        return (
            <TooltipPannel
                    btnTitle={() => this.renderBtn()}
                    width={210}
                    // height={100}
                    onClick={() => this.setState({personOpened: true})}
                    onHide={() => this.setState({personOpened: false})}
                    renderTemplate={() => this.renderBody()}
                    marginLeft={20}
                    direction="top,right"
            />
        );
    }
}

// 用户中心
export class UserPannel extends PureComponent{
    constructor(props) {
        super(props);
    }

    loginOut() {
        localStorage.setItem('LOGIN_ID', '');
        localStorage.setItem('TOKEN', '');
        window.location = '//' + window.location.host;
    }

    showPriceModal = () => {
        this.props.dispatch({
            type: 'price/savePriceModalShow',
            payload: true
        });
        this.props.dispatch({
            type: 'price/fetchPrices',
            payload: {}
        });
        this.props.dispatch({
            type: 'price/saveStep',
            payload: 0
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

    renderBtn() {
        const {userInfo} = this.props;
        return (
            <div className="tooltip-cover-btn">
                 <div className="clearfix">
                    <div className="header-right-tx">
                        {userInfo.avatar != '' ? <img src={userInfo.avatar} alt=""/> : <span style={{background: userInfo.avatar_background_color}}>{userInfo.realname[0]}</span>}
                    </div>
                    <div className="header-right-username">{JSON.stringify(userInfo) == '{}' ? '' : userInfo.realname}</div>
                    {userInfo.product_id == 1 ? null :
                    <div className="h-vip">
                        <Image name="vip.jpg"></Image>
                        <p className="vip-lv">{userInfo.vip_name}</p>
                    </div>}
                    <IconBlock iconName="down.svg"></IconBlock>   
                </div>
            </div>  
           
        );
    }

    renderBody(){
        const {userInfo} = this.props;
        
        return (
            <div className="user-body">
                <header className="user-body-header">
                    {userInfo.avatar == '' ? <span className="ubh-avatar" style={{background: userInfo.avatar_background_color}}>{userInfo.realname[0]}</span> : <img src={userInfo.avatar} alt=""/>}
              
                    <p>{userInfo.realname}
                        {userInfo.product_id == 1 ? null : 
                         <span className="h-vip2">
                            <Image name="vip.jpg"></Image>
                            <p className="vip-lv">{userInfo.vip_name}</p>
                        </span>}
                    </p>
                  
                    <p>{userInfo.email}</p>
                   
                    {userInfo.product_id == 1 ? null :
                    <p>
                        <button className="price-later" onClick={this.payContinue}>立即续费</button>
                    </p> }
                </header>
                <section className="user-body-section">
                    <ul>
                        <li>    
                            <a href='/account/#/member'>
                                <div className="user-li">
                                    <IconBlock iconName="user-mb.svg" direction="left"></IconBlock>
                                    <p>成员管理</p>
                                    <p>添加/管理用户&团队</p>
                                </div>
                            </a>
                        </li>
                        <li>    
                            <a href='/account/#/account-setting'>
                                <div className="user-li">
                                    <IconBlock iconName="user-st.svg" direction="left"></IconBlock>
                                    <p>账户设置</p>
                                    <p>使用、账单、品牌、团队</p>
                                </div>
                            </a>
                        </li>
                        <li>    
                            <a href='/account/#/personal-setting'>
                                <div className="user-li">
                                    <IconBlock iconName="user-tx.svg" direction="left"></IconBlock>
                                    <p>个人设置</p>
                                    <p>电子邮件、个人资料、通知</p>
                                </div>
                            </a>
                        </li>
                        <li>    
                            <a href='javascript:;' onClick={this.showPriceModal}>
                                <div className="user-li">
                                    <IconBlock iconName="user-tx.svg" direction="left"></IconBlock>
                                    <p>账户升级</p>
                                    <p>选择价格方案</p>
                                </div>
                            </a>
                        </li>
                    </ul>
                </section>
                <footer className="user-body-footer" onClick={this.loginOut}>
                    退出
                </footer>
            </div>
        );
    }

    render() {
        return (
            <TooltipPannel
                btnTitle={() => this.renderBtn()}
                width={250}
                // height={100}
                contentClickIsHide={true}
                // onClick={() => this.setState({personOpened: true})}
                // onHide={() => this.setState({personOpened: false})}
                renderTemplate={() => this.renderBody()}
            />
        );
    }
}

// 消息
export class UserNoticePannel extends PureComponent{
    constructor(props) {
        super(props);
    }

    toNotice = (item) => {
        this.props.dispatch({
            type: 'global/toNotice',
            payload: item
        });
    }

    setNoticeTime = () => {
        let nt = new Date().getTime() / 1000;
        localStorage.setItem(NOTICE_TIME, nt);
        this.props.dispatch({
            type: 'global/saveNoreadCount',
            payload: 0
        });
    }

    joinProject = item => {
        this.props.dispatch({
            type: 'project/joinProject',
            payload: item.id
        });
    }

    joinProject2 = (item, allow_status) => {
        this.props.dispatch({
            type: 'invite/auditInvite',
            payload: {
                allow_status, 
                notice_id: item.id
            }
        });
    }

    renderBtn() {
        return (
            <div className="header-right-notice" id="header-notice">
                {this.props.noreadCount == 0 ? null : <span className="noread-noitce">{this.props.noreadCount}</span>}
                <IconBlock iconName="notice.svg" direction="left" alt="消息" tipDirection="bottom" renderClass="hr-icon"/>
            </div>
        );
    }

    renderBody() {
        const {showMore, moreNoticeShow, notices} = this.props;
        return (
            <div className="notice-body">
                <ul style={{maxHeight: moreNoticeShow ? '410px' : ''}}>
                    {notices.map((item, k) => {
                        let avatar = item.avatar != '' ?
                         <img src={item.avatar} alt=""/> : 
                         <span className="notice-body-avatar">{item.realname[0]}</span>;

                        if (item.type == 'system') {
                            avatar = <div className="notice-body-avatar" style={{background: "#0345C7"}}><Image name="laba.svg"/></div>;
                        }

                        return (
                            <li key={k} onClick={() => this.toNotice(item)}>
                                <div>
                                    {avatar}
                                    <div className="notice-li-content">
                                        <p>
                                          {item.content}
                                        </p>
                                        {item.type == 'invite_join' && item.is_agree != 1 ? 
                                        <p className="notice-li-agree">
                                            <a href="javascript:;" onClick={(e) => {e.stopPropagation(); this.joinProject(item);}}>同意</a>
                                        </p> : null}

                                        {item.type == 'link_join' && item.is_agree != 1 ? 
                                        <p className="notice-li-agree">
                                            <a href="javascript:;" onClick={(e) => {e.stopPropagation(); this.joinProject2(item, 1);}}>同意</a> 
                                            &nbsp;&nbsp;&nbsp;
                                            <a href="javascript:;" onClick={(e) => {e.stopPropagation(); this.joinProject2(item, 0);}} style={{color: '#4a4a4a'}}>拒绝</a>
                                        </p> : null}
                                        
                                        <p>{beforeTime(item.created_at)}</p>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
                <footer className="notice-more" onClick={() => showMore()} style={{background: moreNoticeShow ? '#999' : ''}}>
                    {moreNoticeShow ? '收起' : '展开'}
                </footer>

            </div> 
        );
    }

    render() {
        return (
            <TooltipPannel
                    btnTitle={() => this.renderBtn()}
                    width={330}
                    // height={100}
                    onClick={() => this.setNoticeTime()}
                    onHide={() => {}}
                    renderTemplate={() => this.renderBody()}
                    marginLeft={16}
                    direction="top,right"
            />
        );
    }
}

// 项目标记
export class ProjectLabelPannel extends PureComponent{
    constructor(props) {
        super(props);
    }

    deleteProject = () => {
        const {data} = this.props;
		this.props.dispatch({
			type: 'project/saveDeleteProjectModalShow',
			payload: true
        });
        // console.log(data, 'data');
		this.props.dispatch({
			type: 'project/saveDeleteProject',
			payload: data
		});
	}

    deleteOrQuit(e, project_id, type) {
        // e.stopPropagation();
        type == 'admin' ? this.deleteProject() : this.quitProject();
        // this.props.dispatch({
        //     type: 'project/deleteProject',
        //     payload: project_id
        // })
        
        // this.props.dispatch({
        //     type: 'project/quitProject',
        //     payload: project_id
        // });
    }

    quitProject = () => {
        const {data} = this.props;
		this.props.dispatch({
			type: 'project/saveQuitProjectModalShow',
			payload: true
        });
		this.props.dispatch({
			type: 'project/saveQuitProject',
			payload: data
		});
	}

    setColor = (color) => {
        const {dispatch, data} = this.props;
        dispatch({
            type: 'project/changeProjectColor',
            payload: {
                project_id: data.id,
                color
            }
        });
    }

    renderBtn() {
        return (
            <div className="ph-one-notice">
                <IconBlock iconName="more.svg" iconAlt="999" renderClass="tooltip-cover-btn"/>
            </div>
        );
    }

    renderBody = () => {
        const {type, data} = this.props;
        
        return (
            <ul className="ps-do-body">
                <li onClick={e => e.stopPropagation()}>
                    <div className="ps-do-content">
                        <IconBlock iconName="project-label.svg" direction="left"></IconBlock>
                        <p>标记</p>
                    </div>

                    <ul className="ps-do-label-list clearfix">
                        {PRO_COLOR.map((item, k) => {
                            return (
                                <li onClick={e => {e.stopPropagation(); this.setColor(item);}} key={k}>
                                    <span className={data.color == item ? "active" : ''}></span>
                                </li>
                            );
                        })}
                    </ul>
                </li>
                {type == 'admin' ? 
                <li>
                    <div className="ps-do-content" onClick={(e) => {this.deleteOrQuit(e, data.id, 'admin');}}>
                        <IconBlock iconName="project-delete.svg" direction="left"></IconBlock>
                        <p>删除</p>
                    </div>
                </li> :
                <li>
                    <div className="ps-do-content" onClick={(e) => { this.deleteOrQuit(e, data.id, 'member');}} >
                        <IconBlock iconName="project-exit.svg" direction="left"></IconBlock>
                        <p>退出</p>
                    </div>
                </li>}
            </ul>
        );
    }

    render() {
        return (
            <TooltipPannel
                    btnTitle={() => this.renderBtn()}
                    // width={150}
                    height={130}
                    onClick={() => {}}
                    onHide={() => this.props.dispatch({type: 'project/saveOtherClick', payload: false})}
                    onShow={() => this.props.dispatch({type: 'project/saveOtherClick', payload: true})}
                    renderTemplate={this.renderBody}
                    marginLeft={10}
                    // direction="right"
                    horizontal={true}
                    contentClickIsHide={true}
            />
        );
    }
}

//评论排序
export class CommentSortPannel extends PureComponent{
    constructor(props) {
        super(props);
    }

    sortComment = (k) => {
        const {dispatch, commentShowCompleted, commentQuery, fileInfo} = this.props;
        dispatch({
            type: 'comment/saveCommentSort',
            payload: k
        });

        dispatch({
			type: 'comment/saveCallbackBlockShow',
			payload: false	 
		});

        let param = {
            sort: k,
            page: 1,
            show_completed: commentShowCompleted,
            query:  commentQuery,
            pre_page: PRE_PAGE,
            doc_id: fileInfo.id,
            project_id: fileInfo.project_id,
            ...getTokenLocalstorage()
        };

        this.props.dispatch({
            type: 'comment/saveIsCommentPageAll',
            payload: false,
		});

        dispatch({
            type: 'comment/fetchCommentCommon',
            payload: {
                param,
                url: '/comment'
            }
        });
    }

    renderBtn() {
        return (
            <div className="comment-sort tooltip-cover-btn">
                按最新排序
                <IconBlock iconName="down2.svg" alt="项目设置" />
            </div>
        );
    }

    renderBody(){
        const {commentSort} = this.props;
        return (
            <div className="comment-sort-body">
                <ul className="comment-sort-list">
                    {['最早发布', '最新发布', '时间戳', '评论者'].map((item, k) => {
                        return (
                            <li onClick={() => this.sortComment(k)} key={k}>
                                <div>
                                    {item}
                                    {commentSort == k ? <Image name="status-check.svg"></Image> : null}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        );
    }

    render() {
        return (
            <TooltipPannel
                    btnTitle={() => this.renderBtn()}
                    width={165}
                    // height={80}
                    onClick={() => this.setState({personOpened: true})}
                    onHide={() => this.setState({personOpened: false})}
                    renderTemplate={() => this.renderBody()}
                    marginLeft={10}
                    // direction="right"
                    // horizontal={true}
            />
        );
    }
}


// 状态修改
export class FileStatusPannel extends PureComponent{
    status = [
        {
            review: 3,
            text: '待审核',
            color: 'color-1',
            colorText: ''
        },
        {
            review: 2,
            text: '进行中',
            color: 'color-2',
            colorText: ''
        },
        {
            review: 1,
            text: '审核通过',
            color: 'color-3',
            colorText: ''
        },
        {
            review: 4,
            text: '意见搜集完成',
            color: 'color-4',
            colorText: ''
        },
    ];

    constructor(props) {
        super(props);
    }

    changeFileStatus = (review) => {
        this.props.dispatch({
            type: 'file/changeFileStatus',
            payload: review
        });
    }

    renderBtn() {
        let review = this.status.filter(item => item.review == this.props.review);
        if (review.length > 0) {
            let cla = 'file-status-color  ' + review[0].color; 
            return (
                <div className="file-status tooltip-cover-btn" id="file-status">
                    <div className={cla}></div>
                    {review[0].text}
                    <IconBlock iconName="down-white.svg" />
                </div>
            ); 
        } else {
            return (
                <div className="file-status tooltip-cover-btn" id="file-status">
                    <div className='file-status-color color-5'></div>
                    审核
                    <IconBlock iconName="down-white.svg" />
                </div>
            ); 
        }
      
    }

    renderBody() {
        const {fileInfo, review} = this.props;
        return (
            <div className="file-status-body">
                 <ul className="file-status-list">
                    {this.status.map((item, k) => {
                        let cla = item.color;
                        if (review == item.review) {
                            cla += ' active';
                        } 
                        return (
                            <li className={cla} key={k} onClick={() => this.changeFileStatus(item.review)}>
                                <div>
                                    <span></span>
                                    <p>{item.text}</p>
                                    {review == item.review ? <Image name="status-check.svg"></Image> : null}
                                </div>
                            </li>
                        );
                    })}
                    <li onClick={() => this.changeFileStatus(0)}>
                        <div>
                            <div className="status-delete">
                                <Image name="status-delete.svg"></Image>
                            </div>
                            <p>移除标签</p>
                            {/* <Image name="status-check.svg"></Image> */}
                        </div>
                    </li>
                </ul>
            </div>    
        );
    }

    render() {
        return (
            <TooltipPannel
                    btnTitle={() => this.renderBtn()}
                    width={165}
                    // height={80}
                    onClick={() => this.setState({personOpened: true})}
                    onHide={() => this.setState({personOpened: false})}
                    renderTemplate={() => this.renderBody()}
                    // marginLeft={17}
                    direction="top,left"
                    // horizontal={true}
            />
        );
    }
}

// 文件版本
export class FileVersionsPannel extends PureComponent{
    constructor(props) {
        super(props);
    }

    selectUploadFiles = (e) => {
        e.stopPropagation();
        
        const {projectsList, projectActive} = this.props;
        
        let currentProject = projectsList.filter(item => item.id == projectActive)[0];
        if (currentProject.id.indexOf('D') > -1) {
            message.warning('演示项目不可上传，您可以创建新项目进行相关操作');
            return;
        }


        trigger(this.props.uploadInput3, 'click');
    }

    cancelUpload = (uploadNode) => {
        this.props.cancelUpload(uploadNode);
    }

	listenTimeUpdate = () => {
		const {filePlayer, dispatch, progressBody} = this.props;
        dispatch({
            type: 'playerControl/saveProgressWidth',
            payload: 0,
        });
		filePlayer.addEventListener("timeupdate", (e) => {
			dispatch({
				type: 'playerControl/saveProgressTime',
				payload: e.target.currentTime,
			});
			let progress = e.target.currentTime / e.target.duration;
			let width = progress * progressBody.getBoundingClientRect().width;
			dispatch({
				type: 'playerControl/saveProgressWidth',
				payload: width,
			});

			dispatch({
				type: 'playerControl/saveProgress',
				payload: progress,
			});
			
        });

		filePlayer.addEventListener("ended", (e) => {
			dispatch({
				type: 'playerControl/playerPlayOrPause',
				payload: {},
			});
		});
	}

    toFile = (file) => {
        const {dispatch, commentPage, commentSort, commentShowCompleted, commentQuery, projectActive} = this.props;

        this.props.dispatch({
            type: 'playerControl/initControl',
            payload: {}
        });

        let commentProps = {	
            commentPage: 1,
            commentSort: 1,
            commentShowCompleted: 0,
            commentQuery: ''
        };

        this.props.dispatch({
            type: 'comment/saveCommentProp', 
            payload: commentProps
        });

        this.props.dispatch({
            type: 'comment/saveIsCommentPageAll',
            payload: false,
		});

        this.props.dispatch({
            type: 'file/saveContainerShow',
            payload: false,
        });


        if (getQuery('r')) {
            this.props.dispatch({
                type: 'file/fetchShareFileInfo',
                payload: file
            });
        } else {
            this.props.dispatch({
                type: 'file/fetchFileInfo',
                payload: {
                    project_id: projectActive,
                    doc_id: file.id
                }
            });
        }

        let param = {
            ...getTokenLocalstorage(),
            doc_id: file.id,
            project_id: projectActive,
            page: 1,
            sort: 0,
            show_completed: 0,
            query: '',
            pre_page: PRE_PAGE
        }, url = '/comment';

        if (getQuery('r')) {
            param.code = getQuery('r');
            url = '/sharecomment';
        }
        this.props.dispatch({
            type: 'comment/fetchCommentCommon',
            payload: {
                param, 
                url,
            }
        });
    }

    toCompareVersion = (e, file) => {
        e.stopPropagation();
        const {fileInfo} = this.props;
        this.props.dispatch(routerRedux.push({
            pathname: '/file_compare',
            query: { v: file.id, f: fileInfo.id, p: this.props.projectActive },
        }));
    }

    renderBtn() {
        const {fileInfo} = this.props;
        let v = 0;
        if (!fileInfo) return null;
        fileInfo.versions.forEach((item, k) => {
            if (item.id == fileInfo.id) {
                v = k + 1;
            }
        });
        return (
            <div className="file-versions-txt tooltip-cover-btn">
                V{v}
                <IconBlock iconName="down-white.svg" alt="" renderClass="fv-icon"/>
            </div>
        );
    }

    renderBody() {
        const {fileInfo, uploadInput3, uploadFiles, uploadedFiles} = this.props;

        let uploadingFiles = [];
        let transcodeFiles = [];

        if(uploadFiles.length > 0) {
            uploadingFiles = uploadFiles.filter(item => uploadedFiles.indexOf(item.doc_id) == -1 && item.baseId == fileInfo.id);
            transcodeFiles = uploadFiles.filter(item => uploadedFiles.indexOf(item.doc_id) > -1 && item.baseId == fileInfo.id);
        } else {
            if (uploadInput3) {
                    // 由于传相同文件导致不能传第二遍，所以这边处理上传所有之后将input 设为空方便触发onchange事件
                uploadInput3.value = '';
            }
        }


        return (
            <div className="file-versions-body">
                <header className="file-versions-header">
                    版本对比
                </header>
                <section className="file-versions-section">
                    {/* <p className="versions-empty">没有版本</p> */}
                    <ul className="versions-list" id="versions-list">
                        {/* 版本列表 */}
                        {fileInfo.versions.map((item, k) => {
                            if (item.id == fileInfo.id) return null;
                            return (
                                <li key={k} onClick={() => this.toFile(item)}>
                                    <div className="version-content">
                                        <div className="vc-cover-img">
                                            {item.cover_img.length > 0 ? <img src={item.cover_img[0]} alt=""/> : null}
                                            {['zip', '7z', 'rar'].indexOf(item.ext) > -1 ? 
                                            <div className="vc-img-block"><Image name="compress.svg"></Image></div>: null}
                                            {item.file_type == 'audio' ? 
                                            <div className="vc-img-block"><Image name="mp3.svg"></Image></div>: null}
                                            {!['video','audio', 'image'].indexOf(item.file_type) > -1 && ['zip', '7z', 'rar'].indexOf(item.ext) == -1 ? 
                                            <div className="vc-img-block vc-img-bg">{item.ext}</div>: null}
                                        </div>
                                        <p className="version-name">{item.name}</p>
                                        <p className="version-des">版本{k + 1}|{beforeTime(item.created_at)}</p>
                                        {fileInfo.file_type == 'video' && item.file_type == 'video'? 
                                        <button onClick={(e) => this.toCompareVersion(e,item)}>对比</button> : null}
                                    </div>
                                </li>
                            );
                        })}

                        {/* 正在上传 */}
                        {uploadingFiles.map((item, k) => {
                            return (
                                <li key={k}>
                                    <div className="version-content">
                                        <div className="vc-cover-img">
                                            <Icon type="loading" style={{ fontSize: 16, color: '#5B53FF' }} />
                                        </div>
                                        <p className="version-name">
                                            {item.name}
                                        </p>
                                        <div className="version-des">
                                            <Progress percent={parseInt(item.progress)} status="active" />
                                        </div>
                                        <Tooltip placement="top" title='取消上传'>
                                            <p className="version-upload-cancel" onClick={() => this.cancelUpload(item)}>
                                                <Icon type="close-circle-o" style={{color: '#9b9b9b',fontSize: '30px'}}/>
                                            </p>
                                        </Tooltip>
                                    </div>
                                </li>
                            );
                        })}
                       
                        {/* 文件处理 */}
                        {transcodeFiles.map((item, k) => {
                            return (
                                <li key={k}>
                                    <div className="version-content">
                                        <div className="vc-cover-img">
                                            <Icon type="loading" style={{ fontSize: 16, color: '#5B53FF' }} />
                                        </div>
                                        <p className="version-name">{item.name}</p>
                                        <p className="version-des">文件处理中...</p>
                                    </div>
                                </li>
                            );
                        })}

                    </ul>
                </section>
                <footer className="file-versions-footer" onClick={(e) => this.selectUploadFiles(e)}>
                    <div className="versions-add">
                        <Image name="add-versions.svg"></Image>
                    </div>
                    添加版本

                    {isIE() ?
                    <input type='file'
						ref={node => this.props.saveUploadNode(node) }
						multiple
						// accept='video/*,flv-application/*'
						onChange={this.props.onInputChange}
                        className="grid-ie-file-input"
                    /> : null}
                </footer>
            </div>
        );
    }

    render() {
        return (
            <TooltipPannel
                    btnTitle={() => this.renderBtn()}
                    width={375}
                    // height={80}
                    onClick={() => this.setState({personOpened: true})}
                    onHide={() => this.setState({personOpened: false})}
                    renderTemplate={() => this.renderBody()}
                    // marginLeft={17}
                    // direction="top,left"
                    // horizontal={true}
            />
        );
    }
}

// 视屏下评论
export class FilePlayerCommentPannel extends PureComponent{
    constructor(props) {
        super(props);
    }

    changeCommentActive = (item) => {
		this.props.dispatch({
			type: 'playerControl/changeCommentActive',
			payload: item
		});
	}

    renderBtn() {
        const {left, data} = this.props;
        return (
            <div className="comment-body tooltip-cover-btn" style={{left: left + 'px'}} onClick={() => this.changeCommentActive(data)}>
                <span></span>
                <div className="comment-tx">
                    <img src={data.avatar} alt=""/>
                </div>
            </div>
        );
    }

    renderBody() {
        const {data} = this.props;
        return (
            <div className="player-controller-comment">
                <header className="pcc-header">
                    <div className="pcc-header-body">
                        <img src={data.avatar} alt=""/>
                        <p>{data.realname}</p>
                        <span>{timeToMS(data.media_time)}</span>
                    </div>
                </header>
                <section className="pcc-section">
                    <p>{data.content}</p>
                    <p>{data.replies.length}条回复</p>
                </section>
            </div>
        );
    }

    render() {
        return (
            <TooltipPannel
                    btnTitle={() => this.renderBtn()}
                    width={165}
                    height={130}
                    onClick={() => this.setState({personOpened: true})}
                    onHide={() => this.setState({personOpened: false})}
                    renderTemplate={() => this.renderBody()}
                    marginLeft={-17}
                    direction="bottom,left"
                    // trigger="hover"
                    // horizontal={true}
            />
        );
    }
}

// 视屏时间操作
export class PlayerTimePannel extends PureComponent{
    constructor(props) {
        super(props);
    }

    changeTimeMode = (mode) => {
        this.props.dispatch({
            type: 'playerControl/savePlayerTimeMode',
            payload: mode,
        });
    }

    renderBtn () {
        const {filePlayerTime, progressTime, playerTimeMode, fileInfo } = this.props;
        return (
            <div className="other-controller-btn tooltip-cover-btn" style={{paddingRight: '25px',minWidth: '120px'}}>
                    { playerTimeMode == 0 ? timeToMS(progressTime) + ' / '  +  timeToMS(filePlayerTime) : null}
                    { playerTimeMode == 1 ? parseInt(progressTime * fileInfo.fps) + 'fps' : null}
                    { playerTimeMode == 2 ? formatTimecode(progressTime) : null}
                <IconBlock iconName="up-small-white.svg"/>
            </div>
        );
    }

    renderBody () {
        const {playerTimeMode} = this.props;
        return (
            <div className="other-controller-body">
                <ul>

                    {['标准', '帧', '时间码'].map((item, k) => {
                        return (
                            <li className={playerTimeMode == k ? 'active' : ''} key={k} onClick={() => this.changeTimeMode(k)}>{item}</li>
                        );
                    })}
                </ul>
            </div>
        );
    }

    render() {
        return (
            <TooltipPannel
                    btnTitle={() => this.renderBtn()}
                    width={87}
                    height={95}
                    onClick={() => this.setState({personOpened: true})}
                    onHide={() => this.setState({personOpened: false})}
                    renderTemplate={() => this.renderBody()}
                    marginLeft={-5}
                    direction="bottom,center"
                    // horizontal={true}
            />
        );
    }
}

export class PlayerTimePannel2 extends PureComponent{

    constructor(props) {
        super(props);
    }

    renderBtn () {
        const {duration, progressTime, timeMode, fileInfo } = this.props;
        return (
            <div className="other-controller-btn tooltip-cover-btn" style={{paddingRight: '25px',minWidth: '120px'}}>
                    { timeMode == 0 ? timeToMS(progressTime) + ' / '  +  timeToMS(duration) : null}
                    { timeMode == 1 ? parseInt(progressTime * fileInfo.fps) + 'fps': null}
                    { timeMode == 2 ? formatTimecode(progressTime) : null}
                <IconBlock iconName="up-small-white.svg"/>
            </div>
        );
    }

    renderBody () {
        const {timeMode} = this.props;
        return (
            <div className="other-controller-body">
                <ul>

                    {['标准', '帧', '时间码'].map((item, k) => {
                        return (
                            <li className={timeMode == k ? 'active' : ''} key={k} onClick={() => this.props.changeTimeMode(k)}>{item}</li>
                        );
                    })}
                </ul>
            </div>
        );
    }

    render() {
        return (
            <TooltipPannel
                    btnTitle={() => this.renderBtn()}
                    width={87}
                    height={95}
                    onClick={() => this.setState({personOpened: true})}
                    onHide={() => this.setState({personOpened: false})}
                    renderTemplate={() => this.renderBody()}
                    marginLeft={-5}
                    direction="bottom,center"
                    // horizontal={true}
            />
        );
    }
}

//有无水印
export class PlayerSYPannel extends PureComponent{
    constructor(props) {
        super(props);
    }

    changeCurrentSY = (currentSY2) => {
        const {dispatch, fileInfo, filePlayer, paused, currentDefinition, currentSY} = this.props;

        if (currentSY2 == currentSY) return;

        if (currentSY2 && !fileInfo.is_watermark) {
            message.warning('当前没有有水印的视频，请先设置');
            return;
        }
        
        dispatch({
            type: 'playerControl/saveCurrentSY',
            payload: currentSY2
        });

        let resolution = currentSY2 ? fileInfo.water_resolution : fileInfo.resolution ;

        resolution = resolution.filter(it => it.resolution == currentDefinition)[0];
        filePlayer.src = resolution.src;
        filePlayer.currentTime = this.props.progressTime;
        setTimeout(() => {
            if(paused) {
                filePlayer.pause();
            } else {            
                filePlayer.play();
            }
        }, 500);

    }

    renderBtn() {
        const {currentSY, fileInfo} = this.props;

        return (
            <div className="other-controller-btn">
                {currentSY && fileInfo.is_watermark ? '有水印' : '无水印'}
            </div>
        );
    }

    renderBody() {
        const {currentSY} = this.props;
        return (
            <div className="other-controller-body">
                <ul>
                    <li onClick={() => this.changeCurrentSY(true)} className={currentSY ? 'active' : ''} >有水印</li>
                    <li onClick={() => this.changeCurrentSY(false)} className={!currentSY ? 'active' : ''}>无水印</li>
                </ul>
            </div>
        );
    }

    render() {
        return (
            <TooltipPannel
                    btnTitle={() => this.renderBtn()}
                    width={87}
                    height={70}
                    onClick={() => this.setState({personOpened: true})}
                    onHide={() => this.setState({personOpened: false})}
                    renderTemplate={() => this.renderBody()}
                    // marginLeft={-5}
                    direction="bottom,center"
                    // horizontal={true}
            />
        );
    }
}

//清晰度
export class PlayerDefinitionPannel extends PureComponent{
    constructor(props) {
        super(props);
    }

    changeDefinition = (item) => {
        const {dispatch, fileInfo, filePlayer, paused, currentSY} = this.props;
        
        dispatch({
            type: 'playerControl/saveCurrentDefinition',
            payload: item.resolution
        });

        let resolution = currentSY ? fileInfo.water_resolution : fileInfo.resolution ;

        resolution = resolution.filter(it => it.resolution == item.resolution)[0];
        filePlayer.src = resolution.src;
        
        if(paused) {
            setTimeout(() => {
                filePlayer.currentTime = this.props.progressTime;
                filePlayer.pause();
            }, 500);
        } else {
            setTimeout(() => {
                filePlayer.currentTime = this.props.progressTime - 1;
                filePlayer.play();
            }, 500);
        }
    }

    renderBtn() {
        return (
            <div className="other-controller-btn">
                {this.props.currentDefinition}P
            </div>
        );
    }

    renderBody() {
        const {fileInfo, currentDefinition} = this.props;
        return (
            <div className="other-controller-body">
                <ul>
                    {fileInfo.resolution.map((item, k) => {
                        return (
                            <li key={k} 
                            onClick={() => this.changeDefinition(item)} 
                            className={currentDefinition == item.resolution ? 'active' : ''}
                            >{item.resolution}</li>
                        );
                    })}
                </ul>
            </div>
        );
    }

    render() {
        return (
            <TooltipPannel
                    btnTitle={() => this.renderBtn()}
                    width={87}
                    height={95}
                    onClick={() => this.setState({personOpened: true})}
                    onHide={() => this.setState({personOpened: false})}
                    renderTemplate={() => this.renderBody()}
                    // marginLeft={-5}
                    direction="bottom,center"
                    // horizontal={true}
            />
        );
    }
}

//视频比例
export class PlayerRatioPannel extends PureComponent{
    constructor(props) {
        super(props);
    }

    showRatio = (item) => {
        this.props.dispatch({
            type: 'playerControl/saveCurrentRatio',
            payload: item
        });

        this.props.dispatch({
            type: 'playerControl/changeRatio',
            payload: item
        });
    }

    showRatioCover = (e) => {
        e.stopPropagation();
        this.props.dispatch({
            type: 'playerControl/saveShowRatioCover',
            payload: !this.props.showRatioCover
        });

        this.props.dispatch({
            type: 'playerControl/changeRatio',
            payload: this.props.currentRatio
        });
    }

    offRatioCover = () => {
        this.props.dispatch({
            type: 'playerControl/offRatioCover',
            payload: {}
        });

        this.props.dispatch({
            type: 'playerControl/saveShowRatioCover',
            payload: false
        });
    }

    renderBtn() {
        return (
            <div className="fps-controller-btn tooltip-cover-btn">
                <Image name="cover.svg" />
            </div>
        );
    }

    renderBody() {
        const {ratioList, currentRatio, showRatioCover} = this.props;
        return (
            <div className="other-controller-body">
                <ul>
                    <li onClick={this.showRatioCover}>{showRatioCover ? '隐藏遮罩' : '显示遮罩'}</li>
                    {ratioList.map((item,k) => {
                        return (
                            <li key={k} 
                            onClick={(e) => {e.stopPropagation();this.showRatio(item);}} 
                            className={currentRatio.text == item.text ? "active" : ""}
                            >{item.text}</li>
                        );
                    })}
                    <li onClick={this.offRatioCover}>off</li>
                </ul>
            </div>
        );
    }

    render() {
        return (
            <TooltipPannel
                    btnTitle={() => this.renderBtn()}
                    width={87}
                    height={175}
                    onClick={() => this.setState({personOpened: true})}
                    onHide={() => this.setState({personOpened: false})}
                    renderTemplate={() => this.renderBody()}
                    // marginLeft={}
                    direction="bottom,center"
                    // contentClickIsHide={true}
                    // horizontal={true}
            />
        );
    }
}

// 音量
export class PlayerVolumePannel extends PureComponent{
    constructor(props) {
        super(props);
    }

    changeVolume = (value) => {
        const {filePlayer} = this.props;
        filePlayer.volume = value / 100;
        this.props.dispatch({
            type: 'playerControl/saveVolume',
            payload: value,
        });
    }

    toggleVolumeMute = () => {
        const {filePlayer} = this.props;
        let muted = !filePlayer.muted;
        filePlayer.muted = muted;
        this.props.dispatch({
            type: 'playerControl/saveFilePlayerMuted',
            payload: muted
        });
    }

    renderBtn() {
        return (
            <div className="fps-controller-btn tooltip-cover-btn">
                <Image name="volume.svg" />
            </div>
        );
    }

    renderBody() {
        const {volume, filePlayer} = this.props;
        return (
            <div className="other-controller-body">
                <div className="volume-Slider">
                    <Slider vertical defaultValue={volume} onChange={this.changeVolume}/>
                </div>
                <div className="volume-mute" onClick={this.toggleVolumeMute}>
                    {filePlayer.muted ?  <Image name="volume-mute.svg"></Image> : <Image name="volume-nmute.svg"></Image>}                   
                </div> 
            </div>
        );
    }

    render() {
        return (
            <TooltipPannel
                    btnTitle={() => this.renderBtn()}
                    width={30}
                    height={150}
                    onClick={() => this.setState({personOpened: true})}
                    onHide={() => this.setState({personOpened: false})}
                    renderTemplate={() => this.renderBody()}
                    marginLeft={-5}
                    direction="bottom,center"
                    // horizontal={true}
            />
        );
    }
}


export class PlayerVolumePannel2 extends PureComponent{
    constructor(props) {
        super(props);
    }

    changeVolume = (value) => {
        this.props.changeVolume(value);
    }

    renderBtn() {
        return (
            <div className="fmf-controller-btn tooltip-cover-btn">
                <Image name="volume.svg" />
            </div>
        );
    }

    renderBody() {
        const {volume1} = this.props;
        return (
            <div className="other-controller-body">
                <div className="volume-Slider" style={{position: 'relative', height: '100%'}}>
                    <Slider vertical defaultValue={volume1} onChange={(value) => this.changeVolume(value)}/>
                </div>
            </div>
        );
    }

    render() {
        return (
            <TooltipPannel
                    btnTitle={() => this.renderBtn()}
                    width={30}
                    height={150}
                    onClick={() => this.setState({personOpened: true})}
                    onHide={() => this.setState({personOpened: false})}
                    renderTemplate={() => this.renderBody()}
                    marginLeft={-5}
                    direction="bottom,center"
                    // horizontal={true}
            />
        );
    }
}

// 链接操作
export class LinkMorePannel extends PureComponent{
    constructor(props) {
        super(props);
    }


    showProjectShare = e => {
        const {data} = this.props;
        let linkShare = {
            name: '',
            review: 1,
            show_all_version: 1,
            download: 1,
            switch_password: 1,
            deadline: 0,
            water_status: 1
        };

        for (let k in linkShare) {
            if (k == 'switch_password') {
                if (data.password == '') {
                    linkShare['switch_password'] == 0;
                } else {
                    linkShare['switch_password'] == 1;
                }
            } else {
                linkShare[k] = data[k];
            }
        }

        this.props.dispatch({
            type: 'link/saveChangeLink',
            payload: data
        });

        this.props.dispatch({
			type: 'link/saveCreateOrChange',
			payload: 'change' 
		});
        
        this.props.dispatch({
			type: 'link/saveLinkShare',
			payload: linkShare	 
        });
        
		this.props.dispatch({
			type: 'project/saveProjectLinkModalShow',
			payload: true	 
        });
    }

    showCreatedLinkModal = e => {
        this.props.dispatch({
            type: 'link/saveCreatedLinkModalData',
            payload: this.props.data
        });

		this.props.dispatch({
			type: 'link/saveCreatedLinkModalShow',
			payload: true	 
        });
    }

    showDeleteLinkModal = e => {
        this.props.dispatch({
            type: 'link/saveChangeLink',
            payload: this.props.data
        });

		this.props.dispatch({
			type: 'link/saveDeleteLinkModalShow',
			payload: true	 
        });
    }

    saveIsAllowLinkMoreShow = (isAllowLinkMoreShow) => {
        this.props.dispatch({
			type: 'global/saveIsAllowLinkMoreShow',
			payload: isAllowLinkMoreShow	 
        });
    }

    renderBtn() {
        return (
            <div className="pl-link-more tooltip-cover-btn">
                <Image name="link-more.svg"></Image>
            </div>
        );
    }

    renderBody() {
        return (
            <div className="pl-link-more-body">
                <ul>
                    <li onClick={this.showProjectShare}>
                        <Image name="link-set.svg"></Image>
                        <p>设置</p>
                    </li>
                    <li onClick={this.showCreatedLinkModal}>
                        <Image name="fm-link.svg"></Image>
                        <p>查看分享</p>
                    </li>
                    <li onClick={this.showDeleteLinkModal}>
                        <Image name="fm-delete.svg"></Image>
                        <p>删除链接</p>
                    </li>
                </ul>  
            </div>
        );
    }

    render() {
        return (
            <TooltipPannel
                    btnTitle={() => this.renderBtn()}
                    width={210}
                    height={120}
                    onClick={() => {}}
                    onHide={() => this.saveIsAllowLinkMoreShow(true)}
                    onShow={() => this.saveIsAllowLinkMoreShow(false)}
                    renderTemplate={() => this.renderBody()}
                    marginLeft={20}
                    direction="right"
                    horizontal={true}
                    contentClickIsHide={true}
            />
        );
    }
}


// 链接操作
export class LinkLikeMorePannel extends PureComponent{
    constructor(props) {
        super(props);
    }

    showCreatedLinkModal = () => {
        this.props.dispatch({
            type: 'link/saveCreatedLinkModalData',
            payload: this.props.data
        });

		this.props.dispatch({
			type: 'link/saveCreatedLinkModalShow',
			payload: true	 
		});
    }

    deleteLikeLinkShare = () => {
        this.props.dispatch({
			type: 'link/deleteLikeLinkShare',
			payload: {
                share_code: this.props.data.code
            }	 
		});
    }

    saveIsAllowLinkMoreShow = (isAllowLinkMoreShow) => {
        this.props.dispatch({
			type: 'global/saveIsAllowLinkMoreShow',
			payload: isAllowLinkMoreShow	 
        });
    }

    renderBtn() {
        return (
            <div className="pl-link-more tooltip-cover-btn">
                <Image name="link-more.svg"></Image>
            </div>
        );
    }

    renderBody() {
        return (
            <div className="pl-link-more-body">
                <ul>
                    <li onClick={this.showCreatedLinkModal}>
                        <Image name="link-share.svg"></Image>
                        <p>分享链接</p>
                    </li>
                    <li onClick={this.deleteLikeLinkShare}>
                        <Image name="fm-delete.svg"></Image>
                        <p>删除链接</p>
                    </li>
                </ul>  
            </div>
        );
    }

    render() {
        return (
            <TooltipPannel
                    btnTitle={() => this.renderBtn()}
                    width={210}
                    height={85}
                    onClick={() => {}}
                    onHide={() => this.saveIsAllowLinkMoreShow(true)}
                    onShow={() => this.saveIsAllowLinkMoreShow(false)}
                    renderTemplate={() => this.renderBody()}
                    marginLeft={20}
                    direction="right"
                    horizontal={true}
                    contentClickIsHide={true}
            />
        );
    }
}

