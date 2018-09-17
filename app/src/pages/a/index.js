import styles from '../index.scss';
import { connect } from 'dva';
import React, { PureComponent } from 'react';
import withRouter from 'umi/withRouter';
import A from  '@CPC/A';

// function App(props) {
//   console.log(props)
//   props.dispatch({
//     type: 'global/getUser',
//     payload: {}
//   })
//   return (
//     <div className={styles.normal}>
//       <div className={styles.welcome} />
//       <ul className={styles.list}>
//         <li>To get started, edit <code>src/pages/index.js</code> and save to reload.</li>
//         <li><a href="https://umijs.org/guide/getting-started.html">Getting Started,</a></li>
//       </ul>
//     </div>
//   );
// }

const mapState2props = (state) => {
  return {
    pathname: state.routing.location.pathname,
    global: state.globals,
    a: state.a
  };
};

// @withRouter
// @connect(mapState2props)
export default class App extends PureComponent{

  componentWillMount() {
    console.log(333);
  }

  render() {
    return (
      <div className={styles.normal}>
        <div className={styles.welcome} />
        <ul className={styles.list}>
          <li>To get started, edit <code>src/pages/index.js</code> and </li>
          <li><a href="https://umijs.org/guide/getting-started.html">Getting Started,</a></li>
        </ul>
        <A {...this.props}></A> 
      </div>
    );
  }
}

// export default connect(state => {
//   return {
//     pathname: state.routing.location.pathname,
//     global: state.globals
//   };
// })(App);
