import React, { PureComponent } from 'react';

class A extends PureComponent {
    render () {
        console.log(this.props, 'iiii');
        return (
            <div>8888</div>
        );
    }
}

export default A;