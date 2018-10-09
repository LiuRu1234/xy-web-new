import React, { PureComponent } from 'react';

import Image from '@CC/Image';

class LinkMoreGlobal extends PureComponent {

    showProjectShare = () => {
        const {linkMoreGlobalData} = this.props;
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
                if (linkMoreGlobalData.password == '') {
                    linkShare['switch_password'] == 0;
                } else {
                    linkShare['switch_password'] == 1;
                }
            } else {
                linkShare[k] = linkMoreGlobalData[k];
            }
        }

        this.props.dispatch({
            type: 'link/saveChangeLink',
            payload: linkMoreGlobalData
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
        this.props.toggleTmShow(false);
    }

    showCreatedLinkModal = () => {
        this.props.dispatch({
            type: 'link/saveCreatedLinkModalData',
            payload: this.props.linkMoreGlobalData
        });

		this.props.dispatch({
			type: 'link/saveCreatedLinkModalShow',
			payload: true	 
        });
        this.props.toggleTmShow(false);
    }

    showDeleteLinkModal = () => {
        this.props.dispatch({
            type: 'link/saveChangeLink',
            payload: this.props.linkMoreGlobalData
        });

		this.props.dispatch({
			type: 'link/saveDeleteLinkModalShow',
			payload: true	 
        });
        
        this.props.toggleTmShow(false);
    }

    deleteLikeLinkShare = () => {
        this.props.dispatch({
			type: 'link/deleteLikeLinkShare',
			payload: {
                share_code: this.props.linkMoreGlobalData.code
            }	 
		});
    }

    render() {
        const {type} = this.props;
        return (
            <div className="pl-link-more-body">
                <ul style={{marginBottom: "0"}}>
                    {type == 'link' ? 
                    <li onClick={this.showProjectShare}>
                        <Image name="link-set.svg"></Image>
                        <p>设置</p>
                    </li> : null}
                    <li onClick={this.showCreatedLinkModal}>
                        <Image name="fm-link.svg"></Image>
                        <p>查看分享</p>
                    </li>
                    {type == 'link' ? 
                    <li onClick={this.showDeleteLinkModal}>
                        <Image name="fm-delete.svg"></Image>
                        <p>删除链接</p>
                    </li> : null}

                    {type == 'like' ? 
                    <li onClick={this.deleteLikeLinkShare}>
                        <Image name="fm-delete.svg"></Image>
                        <p>删除链接</p>
                    </li> : null}
                </ul>  
            </div>
        );
    }
}

export default LinkMoreGlobal;