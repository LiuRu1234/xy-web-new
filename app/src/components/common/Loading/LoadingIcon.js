import React, { PureComponent } from 'react';

class LoadingIcon extends PureComponent {

	componentDidMount() {
		var path1 = document.getElementById('path1');
		var length1 = path1.getTotalLength();
		var path2 = document.getElementById('path2');
		var length2 = path2.getTotalLength();
		console.log(length1, length2);
	}

	render() {
		return (
			<div>
				<svg t="1539074597835" className="loading-icon" viewBox="0 0 128 128" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2619" width="128" height="128">
					<circle id="path1" cx="64" cy="64" r="55" stroke="black" stroke-width="8" fill="transparent"/>
					<polygon id="path2" points="44,29.4 100,64 44,98.6" stroke="black" stroke-width="8" fill="transparent"/>
				</svg>
			</div>
		);
	}
}


export default LoadingIcon;