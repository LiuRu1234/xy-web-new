import React, { PureComponent } from 'react';
import { Row, Col, Switch } from 'antd';
import Image from '@CC/Image';
import {LinkMorePannel} from '@CCP/TooltipPannel';
import {getLocalTime} from '@utils/utils';
import TooltipModal from '@CC/TooltipModal';
import LinkMoreGlobal from '../LinkMoreGlobal';
import './index.scss';


class ProjectLink extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
            fileBodyClient: null,
            tmPos: {
                x: 0,
                y: 0
            }
		};
    }

    changeLinkStatus = (link, checked) => {
        this.props.dispatch({
            type: 'link/changeLinkStatus',
            payload: {link, checked}
        });
    }

    setTmPos = (e, item) => {
        if (!this.props.isAllowLinkMoreShow) return; 

        this.toggleTmShow(true);
        this.setState({
            tmPos: {
                x: e.clientX,
                y: e.clientY
            }
        });

        this.props.dispatch({
            type: 'global/saveLinkMoreGlobalData',
            payload: item
        });
    }

    toggleTmShow = (linkMoreShow) => {
        this.props.dispatch({
            type: 'global/saveLinkMoreShow',
            payload: linkMoreShow
        });
    }


    // renderDo() {
    //     return (
    //         <div className="pl-link-more-body">
    //             <ul style={{marginBottom: "0"}}>
    //                 <li onClick={this.showProjectShare}>
    //                     <Image name="link-set.svg"></Image>
    //                     <p>设置</p>
    //                 </li>
    //                 <li onClick={this.showCreatedLinkModal}>
    //                     <Image name="fm-link.svg"></Image>
    //                     <p>查看分享</p>
    //                 </li>
    //                 <li onClick={this.showDeleteLinkModal}>
    //                     <Image name="fm-delete.svg"></Image>
    //                     <p>删除链接</p>
    //                 </li>
    //             </ul>  
    //         </div>
    //     );
    // }

    renderLinkLi() {
        const {shareLinkList} = this.props;

        let linkTemp = shareLinkList.map((item, k) => {
                return (
                    <Row className="pl-link-list" key={k} onClick={(e) => this.setTmPos(e, item)}>
                        <Col span={7}>
                            <div className="pl-link-li" style={{paddingLeft: '10px'}}>
                                <ul>
                                    {item.files.map((it, k) => {
                                        if(k > 4) return null;
                                        return (
                                            <li key={k}>
                                                <div className="sl-img-block">
                                                    {it.cover_img.length > 0 ? <img src={it.cover_img[0]} alt="" className="cover-img"/> : null}
                                                    {['zip', 'rar', '7z'].indexOf(it.ext) > -1 ? 
                                                    <div className="sl-img-div"><Image name="compress.svg"/></div> : null}
                                                    {it.file_type == 'audio' ? 
                                                    <div className="sl-img-div"><Image name="mp3.svg"/></div> : null}
                                                    {['audio', 'video', 'image'].indexOf(it.file_type) == -1 && ['zip', 'rar', '7z'].indexOf(it.ext) == -1 ? 
                                                    <div className="sl-img-div sl-img-bg"><span>{it.ext}</span></div> : null}
                                                </div>
                                            </li>
                                        );
                                    })}
                                    {item.files.length > 5 ? <li className="sl-img-block">+{item.files.length - 5}</li> : null}
                                </ul>
                            </div>
                        </Col>
                        <Col span={5}>
                            <div className="pl-link-li">
                                <p className="pl-name">{item.name}</p>
                                <p className="pl-create">{getLocalTime(item.created_at)}</p>
                            </div>
                        </Col>
                        <Col span={4}>
                            <div className="pl-link-li">
                                <p className="pl-look-count">{item.view_count}</p>
                            </div>
                        </Col>
                        <Col span={4}>
                            <div className="pl-link-li">
                                <div className="pl-is-use">
                                    <div style={{width: "42px"}} onClick={e => e.stopPropagation()}>
                                        <Switch 
                                        defaultChecked={item.status == 0 ? false : true} 
                                        onChange={(checked) => this.changeLinkStatus(item, checked)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Col>
                        <Col span={4}>
                            <div className="pl-link-li" style={{paddingRight: '10px'}}>
                                <p className="pl-over-time">{item.deadline == 0 ? '永久有效' : getLocalTime(item.deadline)}</p>
                                <LinkMorePannel {...this.props} data={item}/>
                            </div>
                        </Col>
                    </Row>
                );
            });
        return linkTemp;
    }

    render() {
        const {tmPos} = this.state;

        const {linkMoreShow} = this.props;

        return (
            <div className="project-link-container">
                <header className="pl-header">
                    <Row className="pl-type-list">
                        <Col span={7} className="pl-type-li">
                            文件
                        </Col>
                        <Col span={5} className="pl-type-li">
                            链接    
                        </Col>
                        <Col span={4} className="pl-type-li">
                            查看数
                        </Col>
                        <Col  span={4} className="pl-type-li">
                            启用
                        </Col>
                        <Col span={4} className="pl-type-li">
                            有效期
                        </Col>
                    </Row>
                </header>
                <section className="pl-section">
                    {this.renderLinkLi()}
                </section>

                <TooltipModal 
                visible={linkMoreShow} 
                left={tmPos.x} 
                top={tmPos.y}
                onClose={() => this.toggleTmShow(false)}
                contentClickIsHide={true}
                >
                    <LinkMoreGlobal {...this.props} toggleTmShow={this.toggleTmShow} type="link"/> 
                    {/* {this.renderDo()} */}
                </TooltipModal>
            </div>
        );
    }
    
}

export default ProjectLink;