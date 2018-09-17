import React, { PureComponent } from 'react';
import HelperDes from './HelperDes';
import {HELP_ONE, HELP_TWO} from '@config/constants';
import { routerRedux, History } from 'dva/router';
import './index.scss';

class HelperView extends PureComponent {
    
	constructor(props) {
        super(props);
        this.state = {
            activeHelp: 0,
            helpIds: window.location.hash.indexOf('#/project?') > -1 ?  HELP_ONE : HELP_TWO
        };
    }

    setPosition = () => {
        let helpIds = JSON.parse(JSON.stringify(this.state.helpIds));
        if(window.location.hash.indexOf('#/project?') > -1) {
            helpIds.map((item, k) => {
                let node = document.getElementById(item.id);
                if (!node) return item;
                let nodeProp = node.getBoundingClientRect();
                item.left = nodeProp.left + nodeProp.width / 2;
                item.top =  nodeProp.top + nodeProp.height;
                if (item.left + 150 >  document.body.clientWidth) {
                    item.left = item.left - 128;
                    item.arrowDirection = 'right';
                }
                return item;
            });
        }  else {
            helpIds.map((item, k) => {
                let node = document.getElementById(item.id);
                if (!node) return item;
                let nodeProp = node.getBoundingClientRect();
                item.left = nodeProp.left + nodeProp.width / 2;
                item.top =  nodeProp.top + nodeProp.height;
                if (item.left - 150 < 0 ) {
                    item.left = item.left + (150 - nodeProp.width / 2);
                    item.arrowDirection = 'left';
                }

                if (item.key == 1) {
                    item.top =  item.top - 200;
                }

                if (item.key == 2) {
                    item.top =  item.top - nodeProp.height / 2;
                }

                if (item.key == 5) {
                    item.top =  item.top - 210 - nodeProp.height;
                }
                return item;
            });
        }
      
        this.setState({
            helpIds
        });
    }

    componentDidMount() {
        this.setPosition();
    }

    cancel = () => {
        this.props.dispatch({
            type: 'global/saveHelpShow',
            payload: false
        });
    }

    sure = () => {
        let activeHelp = this.state.activeHelp;
        if (activeHelp == this.state.helpIds.length - 1) {
            this.props.dispatch({
                type: 'global/saveHelpShow',
                payload: false
            });
            this.setState({
                activeHelp: 0
            });
        } else {
            this.setState({
                activeHelp: ++activeHelp
            });
        }
      
    }

    render() {
        let activeHelp = this.state.helpIds.filter((item, k) => item.key == this.state.activeHelp)[0];

        return (
            <div className="help-container">
                <HelperDes 
                content={activeHelp.content}
                cancel={() => this.cancel()}
                sure={() => this.sure(activeHelp)}
                title={activeHelp.title}
                left={activeHelp.left}
                top={activeHelp.top}
                sureText={activeHelp.sureText}
                cancelText="取消"
                arrowDirection={activeHelp.arrowDirection}
                direction={activeHelp.direction}
                />
            </div>
        );
    }

}

export default HelperView;