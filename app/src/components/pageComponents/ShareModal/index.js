import React, { PureComponent } from 'react';
import Image from '@CC/Image';
import Modal from '@CC/Modal';
import ComfirmModal from '@CC/ComfirmModal';
import {Input, Icon, Tooltip, Switch, DatePicker, message} from 'antd';
import {ts2Ti, getLocalTime} from '@utils/utils';
import moment from 'moment';
import Clipboard from 'clipboard';
import 'moment/locale/zh-cn';
import './index.scss';
moment.locale('zh-cn');

const locale = {
    "lang": {
        "placeholder": "Select date",
        "rangePlaceholder": [
          "Start date",
          "End date"
        ],
        "today": "Today",
        "now": "现在",
        "backToToday": "Back to today",
        "ok": "Ok",
        "clear": "Clear",
        "month": "Month",
        "year": "Year",
        "timeSelect": "时间",
        "dateSelect": "日期",
        "monthSelect": "Choose a month",
        "yearSelect": "Choose a year",
        "decadeSelect": "Choose a decade",
        "yearFormat": "YYYY",
        "dateFormat": "M/D/YYYY",
        "dayFormat": "D",
        "dateTimeFormat": "M/D/YYYY HH:mm:ss",
        "monthFormat": "MMMM",
        "monthBeforeYear": true,
        "previousMonth": "Previous month (PageUp)",
        "nextMonth": "Next month (PageDown)",
        "previousYear": "Last year (Control + left)",
        "nextYear": "Next year (Control + right)",
        "previousDecade": "Last decade",
        "nextDecade": "Next decade",
        "previousCentury": "Last century",
        "nextCentury": "Next century"
      },
      "timePickerLocale": {
        "placeholder": "Select time"
      }
};

function range(start, end) {
    const result = [];
    for (let i = start; i < end; i++) {
      result.push(i);
    }
    return result;
  }

function disabledDate(current) {
    // Can not select days before today and today
    return current && current < moment().startOf('day');
}

function disabledDateTime(current) {
    let now = new Date();
    let Y = now.getFullYear();
    let M = now.getMonth();
    let D = now.getDate();
    let h = now.getHours();
    let m = now.getMinutes();
    let s = now.getSeconds();

    return {
        disabledHours: () => range(0, 24).splice(0, h),
        disabledMinutes: () => range(0, 60).splice(0, m),
        disabledSeconds: () => range(0, 60).splice(0, s),
    };
}

class CreateLi extends PureComponent{
	constructor(props) {
		super(props);
	}

    switchChange = (checked) => {
        const {dispatch, linkShare, field} = this.props;
        let ls = JSON.parse(JSON.stringify(linkShare));

        ls[field] = checked ? 1 : 0;

        if (checked && field == 'deadline') {
            ls[field] = (new Date()).format("yyyy-MM-dd hh:mm:ss");
        }

        dispatch({
            type: 'link/saveLinkShare',
            payload: ls
        });
   

    }

	render() {
        const {labelName, styles, linkShare, field, projectLinkModalShow} = this.props;
        let style = Object.assign({}, {paddingLeft: 0}, styles);
        if (!projectLinkModalShow) return null;

        return (
			<div className="ps-create-group-li clearfix" style={style}>
				<p>{labelName}</p>
                {field == "water_status" ? 
                <Tooltip placement='bottom' title='只对视频且打水印的生效'> 
                    <span className="ps-create-li-help">
                        <Image name="water-help.svg"></Image>
                    </span> 
                </Tooltip>
                : null}

				<div className="ps-create-li-switch">
					<Switch defaultChecked={parseInt(linkShare[field]) != 0 ? true : false} onChange={this.switchChange}/>
				</div>
			</div>
		);
	}
}

export default class ShareModal extends PureComponent{
	constructor(props) {
		super(props);
    }

    toggleProjectShare(projectLinkModalShow) {
        this.props.dispatch({
            type: 'link/saveSelectFiles',
            payload: []
        });
		this.props.dispatch({
			type: 'project/saveProjectLinkModalShow',
			payload: projectLinkModalShow
		});
    }

    hideCreatedLinkModal() {
		this.props.dispatch({
			type: 'link/saveCreatedLinkModalShow',
			payload: false
		});
    }

    changeDeadline = (a,timestr) => {
        const {linkShare, dispatch} = this.props;
        let ls = JSON.parse(JSON.stringify(linkShare));
        ls.deadline = timestr;
        dispatch({
            type: 'link/saveLinkShare',
            payload: ls
        });
    }

    createLinkShare = () => {
       this.props.dispatch({
            type: 'link/createChangeLinkShare',
            payload: {}
        });
    }

    changeLinkName = (e) => {
        const {linkShare, dispatch} = this.props;
        let ls = JSON.parse(JSON.stringify(linkShare));
        ls.name = e.target.value;
        dispatch({
            type: 'link/saveLinkShare',
            payload: ls
        });
    }

    deleteLink = () => {
        const {changeLink} = this.props;
        this.props.dispatch({
            type: 'link/deleteLinkShare',
            payload: {sharelink_id: changeLink.id}
        });
    }

    hideDeleteLink = () => {
        this.props.dispatch({
			type: 'link/saveDeleteLinkModalShow',
			payload: false
		});
    }

    componentDidMount() {
        const _self = this;
        if (!this.clipboard) {
            this.clipboard = new Clipboard('#copy-share-link', {
                text: () => {
                    const { createdLinkModalData } = this.props;
                    let shareLink = '';

                    if(process.env.NODE_ENV === 'production') {
                        if (window.location.host.indexOf(':81') > -1) {
                            shareLink = 'http://' + window.location.host + '/xyapp/#/file?r=' + createdLinkModalData.code;
                        } else {
                            shareLink = 'https://' + window.location.host + '/xyapp/#/file?r=' + createdLinkModalData.code;
                        }
                    } else {
                        shareLink = window.location.host + '/#/file?r=' + createdLinkModalData.code;
                    }
                  
                    if (createdLinkModalData.password != '') {
                        shareLink = '链接：' + shareLink + ' 密码：' + createdLinkModalData.password;
                    }
                    return shareLink;
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

    renderCreateFooter() {
		let createFooter = (
			<div className="ps-create-footer">
				<button className="create" onClick={this.createLinkShare}>{this.props.createOrChange == 'create' ? '创建分享' : '保存分享'}</button>
			</div>
		);

		return createFooter;
	}

    render() {
        const {
            projectLinkModalShow,
            linkShare,
            createdLinkModalShow,
            createdLinkModalData,
            createOrChange,
            deleteLinkModalShow,
            changeLink
        } = this.props;

        let shareLink = window.location.host + '/xyapp/#/file?r=' + createdLinkModalData.code;
        let qrCode = '//www.uxinyue.com/api/getqrcode?code=' + createdLinkModalData.code;

        let deleteContent = (
            <div className="delete-project">
                <div className="del-pro-title">
                    <Image name="pd-warning.svg"></Image>
                    删除
                </div>
                确定删除链接"{changeLink.name}"吗？
            </div>
        );

        return (
            <div>
                <Modal visible={projectLinkModalShow}
                    title="分享设置"
                    onClose={() => this.toggleProjectShare(false)}
                    footer={this.renderCreateFooter()}
                    >
                    <div className="ps-create">
                        {projectLinkModalShow ?
                        <div className="ps-create-name">
                            <input type="text" placeholder="新建链接" defaultValue={linkShare.name} onChange={this.changeLinkName}/>
                        </div> : null}
                        <div className="ps-create-group">
                            <CreateLi labelName="显示所有版本" field="show_all_version" {...this.props}/>
                            <CreateLi labelName="允许下载" field="download" {...this.props}/>
                            <CreateLi labelName="更改状态" field="review" {...this.props}/>
                            {createOrChange == 'create' ? <CreateLi labelName="需要密码" field="switch_password" {...this.props}/> : null}
                            <CreateLi labelName="需要水印版本" field="water_status" {...this.props}/>
                            <CreateLi labelName="有效期" styles={{borderBottom: linkShare.deadline != 0 ? 0 : ''}} field="deadline" {...this.props}/>
                           {linkShare.deadline !== 0  ?
                           <div style={{borderBottom: '1px solid #E6E9EB',padding: '12px 0'}} className="clearfix">
                                <div className="ps-select-date-p">选择日期</div>
                                <div className="ps-select-date">
                                <DatePicker
                                    showTime
                                    format="YYYY-MM-DD HH:mm:ss"
                                    placeholder="有效期"
                                    locale={locale}
                                    onChange={this.changeDeadline}
                                    disabledDate={disabledDate}
                                    // disabledTime={disabledDateTime}
                                    defaultValue={moment(typeof(linkShare.deadline) !== 'string' ? new Date(linkShare.deadline * 1000).format("yyyy-MM-dd hh:mm:ss") : linkShare.deadline , 'YYYY-MM-DD HH:mm:ss')}
                                />
                                </div>
                            </div> : null}
                            {/* <CreateLi labelName="邮件" styles={{borderBottom: 0}}/>
                            <div style={{borderBottom: '1px solid #E6E9EB',paddingBottom: '12px'}}>
                                <div className="ps-create-name">
                                    <input type="text" placeholder="邮箱"/>
                                </div>
                            </div> */}

                        </div>
                    </div>
                </Modal>

                <Modal visible={createdLinkModalShow}
                    title="分享"
                    onClose={() => this.hideCreatedLinkModal()}
                    >
                    <div className="ps-share">
                        <div className="ps-share-part1">
                            <Image name="link-ok.svg"/>
                            <p>已创建的分享链接</p>
                        </div>
                        <div className="ps-share-part2">
                            <div className="ps-share-copy clearfix">
                                <p>{shareLink}</p>
                                <p id='copy-share-link'>复制到剪切板</p>
                            </div>
                            {/* <div className="ps-share-copyed">
                                已复制到剪贴板
                            </div> */}
                        </div>
                        <div className="ps-share-part3">
                            <p>提取密码:</p>
                            <p>{createdLinkModalData.password != '' ? createdLinkModalData.password : '无'}</p>
                        </div>
                        <div className="ps-share-part4">
                            <Image name="link-code.svg"/>
                            <p>扫一扫分享到微信</p>
                        </div>

                        <div className="ps-share-part5">
                            <img src={qrCode} alt=""/>
                        </div>
                    </div>
                </Modal>

                <ComfirmModal
                visible={deleteLinkModalShow}
                content={deleteContent}
                onSure={this.deleteLink}
                onClose={this.hideDeleteLink}
                />
            </div>
        );
    }
}
