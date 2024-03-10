import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/appContext';
import { supabase } from '../utils/supabaseClient';
import { Card, CardContent, Typography, CardActions, Button, Tooltip, IconButton, Dialog, DialogTitle, DialogActions, Snackbar, Alert } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import SubTaskForm from './NewSubTaskForm';

const SubTask = () => {
  const { currentTask, subtasks, setSubtasks } = useAppContext();
  const [openSubtaskForm, setOpenSubtaskForm] = useState(false); 
  const [editSubtask, setEditSubtask] = useState(null); 
  const [editMode, setEditMode] = useState(false);
  const [subtaskToDelete, setSubtaskToDelete] = useState(null);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const showSnackbar = (message, severity) => setSnackbar({ open: true, message, severity });
  const closeSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const fetchSubtasks = async () => {
    const { data, error } = await supabase
      .rpc('get_all_subtasks_for_task', { main_task_id: currentTask.task_id });

    if (error) {
      console.error('Error fetching subtasks:', error.message);
    } else {
      setSubtasks(data);
    }
  };

  useEffect(() => {
    if (!currentTask) return;

    fetchSubtasks();
  }, [currentTask, setSubtasks]);

  const getBorderColor = (status) => {
    return status === 'Completed' ? 'green' : 'grey ';
  };

    const handleEditClick = () => {
        setOpenSubtaskForm(true); 
    };

    const handleDeleteConfirmation = (subtask) => {
      setSubtaskToDelete(subtask);
      setDeleteConfirmationOpen(true);
    };
  
    const handleDeleteSubtask = async () => {
      try {
        const { error } = await supabase.rpc('delete_subtask', {
          subtask_id: subtaskToDelete.subtask_id,
        });
        if (error) throw error;
  
        setDeleteConfirmationOpen(false);
        showSnackbar('Subtask deleted successfully!', 'success');
        fetchSubtasks(); 
      } catch (error) {
        showSnackbar('Failed to delete subtask: ' + error.message, 'error');
      }
    };

  return (
    <div style={{border: '1px solid grey', padding: '10px'}}>
       <div style={{marginBottom: '20px', fontSize: '30px'}} >Task Details</div>
       <Button variant="contained" onClick={() => {setOpenSubtaskForm(true); setEditSubtask([]); setEditMode(false);}}>
        Create Subtask
      </Button>
      <div style={{ maxHeight: '90vh', width: '250px', overflowY: 'scroll' }}>
      {subtasks.map((subtask, index) => (
        <div key={subtask.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Card style={{
              width: 200,
              margin: '10px',
              border: `3px solid ${getBorderColor(subtask.status)}`
            }}
          >
  <CardContent>
    <Typography gutterBottom variant="h5" component="div">
      {subtask.title}
    </Typography>

    <Tooltip 
      title={
        <React.Fragment>
          {subtask.details.map((detail, index) => (
            <Typography key={index}>• {detail}</Typography>
          ))}
        </React.Fragment>
      }
      placement="top"
    >
      <IconButton>
        <InfoIcon color="action" />
      </IconButton>
    </Tooltip>
    <Typography variant="body2" color="text.secondary">
      Status: {subtask.status}
    </Typography>
    {subtask.completion_date && subtask.status === 'Completed' && (
      <Typography variant="body2" color="text.secondary">
        Completion Date: {new Date(subtask.completion_date).toLocaleDateString()}
      </Typography>
    )}
  </CardContent>
  <CardActions>
        <Button size="small" onClick={() => {handleEditClick(subtask); setEditSubtask(subtask); setEditMode(true);}}>Edit</Button>
        <Button size="small" onClick={() => handleDeleteConfirmation(subtask)}>Delete</Button>
  </CardActions>
</Card>
       
          {index < subtasks.length - 1 && (
            <div
              style={{
                height: '20px',
                width: '2px',
                backgroundColor: 'grey',
              }}
            />
          )}
        </div>
      ))}
    </div>

    <Dialog
        open={deleteConfirmationOpen}
        onClose={() => setDeleteConfirmationOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Are you sure you want to delete this subtask?"}
        </DialogTitle>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmationOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteSubtask} color="primary" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={closeSnackbar}>
        <Alert onClose={closeSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
    </Snackbar>

    {currentTask && editSubtask && (
        <SubTaskForm
          open={openSubtaskForm}
          editMode={editMode} 
          subtaskToEdit={editSubtask} 
          fetchSubtasks={fetchSubtasks}
          onClose={() => {
            setOpenSubtaskForm(false);
          }}
          currentTask={currentTask}
        />
      )}
    </div>
  );
};

export default SubTask;
