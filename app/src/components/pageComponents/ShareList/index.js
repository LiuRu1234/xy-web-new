import React, { PureComponent }  from 'react';
import { routerRedux } from 'dva/router';

import Image from '@CC/Image';

import {getLocalTime} from '@utils/utils';
import './index.scss';

class ShareList extends PureComponent {
	constructor(props) {
		super(props);
	}

	fetchFileInfo = (file) => {
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

		this.props.dispatch({
			type: 'file/fetchShareFileInfo',
			payload: file
		});
	}

	componentWillUnmount() {
		this.props.dispatch({
			type: 'file/saveIsFilesShare',
			payload: false
		});
	}

	backHome = () => {
		this.props.dispatch(routerRedux.push({
            pathname: '/project',
            query: {},
        }));
	}

	saveLike = () => {
		this.props.dispatch({
			type: 'file/getLike',
			payload: !this.props.codeIsLike ? 1 : 0
		});
	}

	renderList = () => {
		const {shareFileList, fileInfo} = this.props;

		let listTemp = shareFileList.map((item, k) => {
			return (
				<li key={k} onClick={() => this.fetchFileInfo(item)}>
					<div className="share-li-block" style={{border: fileInfo && fileInfo.id == item.id ? "1px solid #0345C7" : ""}}>
						{ item.cover_img.length > 0 ?
						<div className="share-li-img">
							<img src={item.cover_img[0]} alt=""/>
						</div> : null}
						{ item.file_type == 'video' ? <Image name="share-play.svg"></Image> : null}
						{['zip', 'rar', '7z'].indexOf(item.ext) > -1 ? <div className="share-li-img-block"><Image name="compress_big.svg"></Image> </div>: null}
						{item.file_type == 'audio' ? <div className="share-li-img-block"><Image name="mp3_big.svg"></Image></div> : null}
						{['zip', 'rar', '7z'].indexOf(item.ext) == -1 && ['video', 'audio', 'image'].indexOf(item.file_type) == -1 ? 
						<div className="share-li-img-block bg">{item.ext}</div> : null}
					
					</div>
					<p>{item.name}</p>
				</li>
			);
		});
		return listTemp;
	}

	render() {
		const {shareFileList, codeIsLike, createdLinkModalData} = this.props;
		return (
		<div className="share-list-container">
			<header className="share-list-header">
				<div className="share-icon-p">
					<div className="share-icon-p-li" onClick={() => this.backHome()}>
						<Image name="share-back.svg"></Image>
						<p>返回首页</p>
					</div>

					<div className="share-icon-p-li" onClick={() => this.saveLike()}>
						{codeIsLike ? <Image name="share-like-active.svg"></Image> : <Image name="share-like.svg"></Image>}
						<p>收藏</p>
					</div>
				</div>
				<p className="share-icon-p-des">本次文件包含{shareFileList.length}个文件</p>
				<p className="share-icon-p-des">有效期：{createdLinkModalData.deadline == 0 ? '永久有效' : getLocalTime(createdLinkModalData.deadline)}</p>
				<p className="share-icon-p-des">密码：{createdLinkModalData.password}</p>
			</header>
			<section>
					<ul className="share-list-content">
						{this.renderList()}
					</ul>
			</section>
		</div>
		);
	}
}


export default ShareList;
