import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/appContext';
import { supabase } from '../utils/supabaseClient';
import { Card, CardContent, Typography, CardActions, Button, FormControl, InputLabel, Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Alert, Snackbar } from '@mui/material';
import NewTaskForm from './NewTaskForm';

const Task = () => {
  const { currentUser, allUsers, tasks, setTasks, currentTask, setCurrentTask } = useAppContext();
  const [currentFilter, setCurrentFilter] = useState('created_by_you');
  const [openNewTaskForm, setOpenNewTaskForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const showSnackbar = (message, severity) => setSnackbar({ open: true, message, severity });
    const filterToRpc = {
    assigned_to_you: 'get_tasks_assigned_to',
    assigned_by_you: 'get_tasks_assigned_by',
    created_by_you: 'get_tasks_created_by',
    };

  const closeSnackbar = () => setSnackbar({ ...snackbar, open: false });

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
        setCurrentTask(data[0]); 
    }
    };

  useEffect(() => {
    if (!currentUser) return;

    fetchTasks();
    }, [currentFilter, currentUser, setTasks, setCurrentTask]); 
  

  const handleFilterChange = (event) => {
    setCurrentFilter(event.target.value);
  };

  const handleCardClick = (task) => {
    setCurrentTask(task);
  };

  const handleOpenNewTaskForm = () => {
    setOpenNewTaskForm(true);
  };

  const handleCloseNewTaskForm = () => {
    setOpenNewTaskForm(false);
  };

  const handleCreateNewTask = () => {
    handleCloseNewTaskForm();
  };

  const handleEditClick = (task) => {
    setEditMode(true)
    setCurrentTask(task);
    handleOpenNewTaskForm();
  };

  const handleDeleteClick = (task) => {
    setTaskToDelete(task);
    setOpenConfirmDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const { error } = await supabase
        .rpc('delete_task', { task_id: taskToDelete.task_id });
  
      if (error) throw error;
      setOpenConfirmDialog(false);
      showSnackbar('Task deleted successfully!', 'success');
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      showSnackbar('Failed to delete task: ' + error.message, 'error');
    }
  };
  
  return (
    <div style={{border: '1px solid grey', padding: '10px'}}>
       <div style={{marginBottom: '20px', fontSize: '30px'}} >Task</div>
      <FormControl>
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
      <br/>
      {currentFilter === 'created_by_you' && (
        <Button
        style={{ marginTop: '20px' }}
        variant="contained"
        color="primary"
        onClick={() => {
            setEditMode(false);
            handleOpenNewTaskForm();
        }}
        >
        Create New Task
    </Button>
      )}
      <br/>
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
                </Typography>
                <Typography variant="body1" component="p">
                    Assigned By: {task.assigned_by_name}
                </Typography>
                <Typography variant="body1" component="p">
                    Assigned To: {task.assigned_to_name}
                </Typography>
                <Typography variant="body1" component="p">
                    Creator: {task.creator_name}
                </Typography>
            </CardContent>
            <CardActions>
                <Button size="small" onClick={() => handleEditClick(task)}>Edit</Button>
                <Button size="small" onClick={() => handleDeleteClick(task)}>Delete</Button>
            </CardActions>
            </Card>
        ))}
      </div>

      <Dialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
        >
        <DialogTitle>{"Confirm Delete"}</DialogTitle>
        <DialogContent>
            <DialogContentText>
            Are you sure you want to delete this task?
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setOpenConfirmDialog(false)} color="primary">
            Cancel
            </Button>
            <Button onClick={handleConfirmDelete} color="primary" autoFocus>
            Confirm
            </Button>
        </DialogActions>
    </Dialog>

      {currentUser && allUsers &&  <NewTaskForm
        open={openNewTaskForm}
        onSave={handleCreateNewTask} 
        onClose={handleCloseNewTaskForm}
        currentUser={currentUser}
        allUsers={allUsers}
        taskToEdit={currentTask} 
        fetchTasks={fetchTasks}
        editMode={editMode}
      />}

    <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={closeSnackbar}>
        <Alert onClose={closeSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
    </Snackbar>
    </div>
  );
};

export default Task;
