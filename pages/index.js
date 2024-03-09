// pages/index.js
import User from '../components/user';
import Task from '../components/task';
import SubTask from '../components/subtask';
import styles from '../styles/Home.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <User />
      <div style={{marginTop: "20px", display: 'flex', flexDirection: 'row'}}>
        <Task />
        <div style={{marginRight: "20px"}}></div>
        <SubTask />
      </div>
      {/* <Task /> and <SubTask /> will be used here when they're ready */}
    </div>
  );
}
