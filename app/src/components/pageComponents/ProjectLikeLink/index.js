import React, { PureComponent } from 'react';
import {LinkLikeMorePannel} from '@CCP/TooltipPannel';
import { Row, Col, Switch } from 'antd';
import Image from '@CC/Image';
import {getLocalTime} from '@utils/utils';
import LinkMoreGlobal from '../LinkMoreGlobal';
import TooltipModal from '@CC/TooltipModal';
import './index.scss';


class ProjectLikeLink extends PureComponent {
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

    loadMoreLike = () => {
        this.props.dispatch({
            type: 'link/fetchLikeLink',
            payload: {}
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

    renderLinkLi() {
        const {likeLinkList} = this.props;

        let linkTemp = likeLinkList.map((item, k) => {
                return (
                    <Row className="pl-link-list" key={k} onClick={(e) => this.setTmPos(e, item)}>
                        <Col span={7}>
                            <div className="pl-link-li" style={{paddingLeft: '10px'}}>
                                {/* <div className="sl-img-like">
                                    <img src={item.files[0].cover_img[0]} alt=""/>
                                </div> */}

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
                        <Col span={9}>
                            <div className="pl-link-li">
                                <p className="pl-name">{item.name}</p>
                                <p className="pl-create">{getLocalTime(item.created_at)}</p>
                            </div>
                        </Col>
                        <Col span={2}>
                            <div className="pl-link-li">
                                <p className="pl-look-count">{item.files.length}</p>
                            </div>
                        </Col>
                    
                        <Col span={6}>
                            <div className="pl-link-li" style={{paddingRight: '10px'}}>
                                <p className="pl-over-time">{item.deadline == 0 ? '永久有效' : getLocalTime(item.deadline)}</p>
                                {/* <LinkMorePannel {...this.props} data={item}/> */}
                                <LinkLikeMorePannel {...this.props} data={item}/>
                            </div>
                        </Col>
                    </Row>
                );
            });
        return linkTemp;
    }

    render() {
        const {likeLinkListAll, likeLinkList, linkMoreShow} = this.props;
        const {tmPos} = this.state;

        return (
            <div className="project-like-container">
                <header className="pl-header">
                    <Row className="pl-type-list">
                        <Col span={7} className="pl-type-li">
                            文件
                        </Col>
                        <Col span={9} className="pl-type-li">
                            链接    
                        </Col>
                        <Col span={2} className="pl-type-li">
                            文件数
                        </Col>
                        <Col span={6} className="pl-type-li">
                            有效期
                        </Col>
                        
                    </Row>
                </header>
                <section className="pl-section">
                    {this.renderLinkLi()}

                    <footer className="pl-footer">
                        {!likeLinkListAll ?
                        <button onClick={this.loadMoreLike}>加载更多</button>:
                        <button>已全部加载</button>}
                    </footer>
                </section>
             

                 <TooltipModal 
                visible={linkMoreShow} 
                left={tmPos.x} 
                top={tmPos.y}
                onClose={() => this.toggleTmShow(false)}
                contentClickIsHide={true}
                >
                    <LinkMoreGlobal {...this.props} toggleTmShow={this.toggleTmShow} type="like"/> 
                    {/* {this.renderDo()} */}
                </TooltipModal>
            </div>
        );
    }
    
}

export default ProjectLikeLink;