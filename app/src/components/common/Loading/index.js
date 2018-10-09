import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import LoadingIcon from './LoadingIcon';
import './index.scss';

class Loading extends PureComponent {

	constructor(props) {
		super(props);
	}

	render() {
		if (!this.props.visible) return null; 
		return (
			<div className="loading-container">
				{/* <div className="loading-animate">
				</div> */}
				<LoadingIcon></LoadingIcon>
			</div>
		);
	}
}

Loading.propTypes = {
    visible: PropTypes.bool 	//是否显示
};

export default Loading;
