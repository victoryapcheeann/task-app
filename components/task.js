import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/appContext';
import { supabase } from '../utils/supabaseClient';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

const Task = () => {
  const { currentUser, tasks, setTasks, currentTask, setCurrentTask } = useAppContext();
  const [currentFilter, setCurrentFilter] = useState('assigned_to_you'); // Local state for current filter

  useEffect(() => {
    if (!currentUser) return;

    // Define a mapping from filter to RPC function name
    const filterToRpc = {
      assigned_to_you: 'get_tasks_assigned_to',
      assigned_by_you: 'get_tasks_assigned_by',
      created_by_you: 'get_tasks_created_by',
    };

    const rpcFunctionName = filterToRpc[currentFilter];
    
    const fetchTasks = async () => {
      let { data, error } = await supabase
        .rpc(rpcFunctionName, { person_id: currentUser.id });
      
      if (error) {
        console.error('Error fetching tasks:', error.message);
      } else {
        setTasks(data);
      }

      if (data && data.length > 0) {
        setCurrentTask(data[0]); // Set the first task as the current task
      }
    };

    fetchTasks();
    }, [currentFilter, currentUser, setTasks, setCurrentTask]); // Include setCurrentTask in dependency array
  

  const handleFilterChange = (event) => {
    setCurrentFilter(event.target.value);
  };

  const handleCardClick = (task) => {
    setCurrentTask(task);
  };

  return (
    <div style={{border: '1px solid grey', padding: '10px'}}>
       <div style={{marginBottom: '20px', fontSize: '30px'}} >Task</div>
      <FormControl fullWidth>
        <InputLabel id="task-filter-select-label">Filter Tasks</InputLabel>
        <Select
          labelId="task-filter-select-label"
          id="task-filter-select"
          value={currentFilter}
          label="Filter Tasks"
          onChange={handleFilterChange}
        >
          <MenuItem value="assigned_to_you">Assigned to You</MenuItem>
          <MenuItem value="assigned_by_you">Assigned by You</MenuItem>
          <MenuItem value="created_by_you">Created by You</MenuItem>
        </Select>
      </FormControl>
      <div style={{ maxHeight: '80vh', width: '250px', overflowY: 'scroll' }}>
      {tasks.map((task) => (
            <Card 
                onClick={() => handleCardClick(task)}
                key={task.id} 
                style={{
                    width: 200,
                    marginTop: '10px',
                    marginBottom: '10px',
                    cursor: 'pointer',
                    border: currentTask && task.task_id === currentTask.task_id ? '2px solid blue' : 'none'
                }}>
            <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                {task.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                {task.description}
                </Typography>
                <Typography variant="body1" component="p">
                Deadline: {new Date(task.deadline).toLocaleDateString()}
                </Typography>
                <Typography variant="body1" component="p">
                Status: {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                </Typography>
                {/* Show assigned by unless the current tab is assigned_by */}
                {currentFilter !== 'assigned_by_you' && (
                <Typography variant="body1" component="p">
                    Assigned By: {task.assigned_by_name}
                </Typography>
                )}
                {/* Show assigned to unless the current tab is assigned_to */}
                {currentFilter !== 'assigned_to_you' && (
                <Typography variant="body1" component="p">
                    Assigned To: {task.assigned_to_name}
                </Typography>
                )}
                {/* Show creator unless the current tab is created_by */}
                {currentFilter !== 'created_by_you' && (
                <Typography variant="body1" component="p">
                    Creator: {task.creator_name}
                </Typography>
                )}
            </CardContent>
            <CardActions>
                <Button size="small">Edit</Button>
                <Button size="small">Delete</Button>
            </CardActions>
            </Card>
        ))}
      </div>
    </div>
  );
};

export default Task;
