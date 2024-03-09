// context/appContext.js
import { createContext, useState, useContext } from 'react';

const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [allUsers, setAllUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [currentTask, setCurrentTask] = useState(null);
  const [subtasks, setSubtasks] = useState([]);

  return (
    <AppContext.Provider value={{ allUsers, setAllUsers, currentUser, setCurrentUser, tasks, setTasks, currentTask, setCurrentTask, subtasks, setSubtasks}}>
      {children}
    </AppContext.Provider>
  );
};

const useAppContext = () => useContext(AppContext);

export { AppProvider, useAppContext };
