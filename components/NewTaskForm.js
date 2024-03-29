import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, TextField, Button, DialogActions, Select, MenuItem, InputLabel, FormControl, Snackbar, Alert } from '@mui/material';
import { supabase } from '../utils/supabaseClient';

const NewTaskForm = ({ open, onSave, onClose, currentUser, allUsers, taskToEdit, editMode, fetchTasks}) => {
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    deadline: '',
    assignedTo: '',
    assignedBy: '',
    createdBy: '',
  });

  useEffect(() => {
    if (editMode) {
      const assignedToUser = allUsers.find(user => user.name === taskToEdit.assigned_to_name);
      const assignedByUser = allUsers.find(user => user.name === taskToEdit.assigned_by_name);
      const createdByUser = allUsers.find(user => user.name === taskToEdit.creator_name);
    
      setNewTask({
        title: taskToEdit.title,
        description: taskToEdit.description,
        deadline: taskToEdit.deadline.split('T')[0], 
        assignedTo: assignedToUser.id,
        assignedBy: assignedByUser.id,
        createdBy: createdByUser.id,
      });
    } else {
        setNewTask({
            title: '',
            description: '',
            deadline: '',
            assignedTo: '',
            assignedBy: currentUser.id,
            createdBy: currentUser.id,
        });
    }
  }, [editMode, taskToEdit]);

  const showSnackbar = (message, severity) => setSnackbar({ open: true, message, severity });
  const closeSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const isFormValid = () => {
    return newTask.title.trim() &&
           newTask.description.trim() &&
           newTask.deadline &&
           newTask.assignedTo;
  };

  const handleSubmit = async () => {
    if (isFormValid()) {
      try {
        let result = null; 
  
        if (editMode) {
          result = await supabase.rpc('edit_task_full', {
            task_id: taskToEdit.task_id, 
            updated_title: newTask.title,
            updated_description: newTask.description,
            updated_deadline: newTask.deadline,
            updated_assigned_by: newTask.assignedBy, 
            updated_assigned_to: newTask.assignedTo,
            updated_creator: newTask.createdBy, 
          });
        } else {
          result = await supabase.rpc('create_task', {
            new_title: newTask.title,
            new_description: newTask.description,
            new_deadline: newTask.deadline,
            new_assigned_by: newTask.assignedBy,
            new_assigned_to: newTask.assignedTo,
            new_creator: newTask.createdBy,
          });
        }
  
        const { data, error } = result;
  
        if (error) throw error;
        showSnackbar(`Task ${editMode ? 'updated' : 'created'} successfully!`, 'success');
        onSave(data); 
        onClose();
        fetchTasks(); 
      } catch (error) {
        showSnackbar(`Failed to ${editMode ? 'update' : 'create'} task: ${error.message}`, 'error');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask({ ...newTask, [name]: value });
  };

  return (
    <>
    <Dialog open={open} onClose={onClose} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">{editMode ? 'Edit Task' : 'Create New Task'}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          name="title"
          label="Title"
          type="text"
          fullWidth
          value={newTask.title}
          onChange={handleInputChange}
          required
        />
        <TextField
          margin="dense"
          name="description"
          label="Description"
          type="text"
          fullWidth
          multiline
          rows={4}
          value={newTask.description}
          onChange={handleInputChange}
          required
        />
        <TextField
          margin="dense"
          name="deadline"
          label="Deadline"
          type="date"
          fullWidth
          value={newTask.deadline}
          onChange={handleInputChange}
          InputLabelProps={{ shrink: true }}
          required
        />
        <FormControl fullWidth margin="dense">
          <InputLabel id="assigned-to-select-label">Assigned To</InputLabel>
          <Select
            labelId="assigned-to-select-label"
            name="assignedTo"
            value={newTask.assignedTo}
            onChange={handleInputChange}
            required
          >
            {allUsers?.map((user) => (
              <MenuItem key={user.id} value={user.id}>
                {user.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {!editMode && <FormControl fullWidth margin="dense" disabled>
          <InputLabel id="assigned-by-select-label">Assigned By</InputLabel>
          <Select
            labelId="assigned-by-select-label"
            name="assignedBy"
            value={newTask.assignedBy}
            disabled
          >
            <MenuItem key={currentUser.id} value={currentUser.id}>
              {currentUser.name}
            </MenuItem>
          </Select>
        </FormControl>}

        {!editMode && <FormControl fullWidth margin="dense" disabled>
            <InputLabel id="created-by-select-label">Created By</InputLabel>
            <Select
            labelId="created-by-select-label"
            name="createdBy"
            value={newTask.createdBy}
            label="Created By"
            onChange={handleInputChange}
            disabled
            >
            <MenuItem key={currentUser.id} value={currentUser.id}>
                {currentUser.name}
            </MenuItem>
            </Select>
        </FormControl>}
      </DialogContent>
      <DialogActions>
          <Button onClick={onClose} color="primary">Cancel</Button>
          <Button onClick={handleSubmit} color="primary" disabled={!isFormValid()}>
            {editMode ? 'Update' : 'Create'}
          </Button>
     </DialogActions>
    </Dialog>
    <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={closeSnackbar}>
        <Alert onClose={closeSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
    </Snackbar>
  </>
  );
};

export default NewTaskForm;
