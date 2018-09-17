import styles from './index.css';
import withRouter from 'umi/withRouter';

function BasicLayout(props) {
  
  return (
    <div>
      { props.children }
    </div>
  );
}

export default withRouter(BasicLayout);
