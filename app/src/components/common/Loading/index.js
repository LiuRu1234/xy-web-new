import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Animate from 'rc-animate';
import Dialog from 'rc-dialog';

import LoadingIcon from './Loading';
import './index.scss';

class Loading extends PureComponent {
	render() {
		return (
			<Dialog visible closable={false}>
				<Animate 
					transitionName="fade"
					transitionAppear
				>
				{this.props.visible ? 
					<div className="loading-container" >
						{/* <div className="loading-animate">
						</div> */}
						<LoadingIcon></LoadingIcon>
					</div>: null}
				</Animate>
			</Dialog>
		);
	}
}

Loading.propTypes = {
    visible: PropTypes.bool 	//是否显示
};

export default Loading;
