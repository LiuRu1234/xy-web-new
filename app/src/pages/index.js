import styles from './index.scss';
import { connect } from 'dva';
import router from 'umi/router';
import React, { PureComponent } from 'react';

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

class App extends PureComponent{

  componentWillMount() {
    this.props.dispatch({
      type: 'global/getUser',
      payload: {}
    });
    router.push('/project');
  }

  render() {
    return (
      <div className={styles.normal}>
        <div className={styles.welcome} />
        <ul className={styles.list}>
          <li>To get started, edit <code>src/pages/index.js</code> and save to reload.</li>
          <li><a href="https://umijs.org/guide/getting-started.html">Getting Started,</a></li>
        </ul>
      </div>
    );
  }
}

export default connect(state => {
  return {
    pathname: state.routing.location.pathname,
    global: state.global
  };
})(App);
