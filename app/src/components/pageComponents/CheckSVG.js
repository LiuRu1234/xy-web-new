import React, { PureComponent } from 'react';

export default class CheckSVG extends PureComponent{
	render () {
		return (
            <div className="file-select">
                <svg viewBox="0 0 55 50" version="1.1" xmlns="http://www.w3.org/2000/svg"  width="32" height="32">
                    <path d="M10 23 L20 33 L40 13" className="file-select-check"
                    style={{fill:'none',stroke:'#fff',strokeWidth:4}} strokeLinecap="round" strokeMiterlimit="round"/>
                </svg>
            </div>
			
		);
	}
}