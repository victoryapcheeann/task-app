import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, TextField, Button, DialogActions, Select, MenuItem, InputLabel, FormControl, Snackbar, Alert } from '@mui/material';
import { supabase } from '../utils/supabaseClient';

const NewTaskForm = ({ open, onSave, onClose, currentUser, allUsers, fetchTasks }) => {
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    deadline: '',
    assignedTo: '',
    assignedBy: currentUser.id, // Set to current user and disabled
    createdBy: currentUser.id,
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // Open the snackbar with a message
  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  // Close the snackbar
  const closeSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Check if the form fields are valid
  const isFormValid = () => {
    return newTask.title.trim() &&
           newTask.description.trim() &&
           newTask.deadline &&
           newTask.assignedTo;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (isFormValid()) {
      try {
        // Replace 'create_task' with your actual function name if different
        const { data, error } = await supabase
          .rpc('create_task', {
            new_title: newTask.title,
            new_description: newTask.description,
            new_deadline: newTask.deadline,
            new_assigned_by: newTask.assignedBy,
            new_assigned_to: newTask.assignedTo,
            new_creator: newTask.createdBy
          });
  
        if (error) throw error;
        
        // Success feedback
        showSnackbar('Task created successfully!', 'success');
        
        // Additional success handling, like closing the dialog
        onSave(data); // Pass the created task data if necessary
        onClose();
        fetchTasks(); // Call the passed fetchTasks function to refresh the task list
      } catch (error) {
        // Error feedback
        showSnackbar('Failed to create task: ' + error.message, 'error');
      }
    }
  };
  

  // Update form state when input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask({ ...newTask, [name]: value });
  };

  return (
    <>
    <Dialog open={open} onClose={onClose} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">Create New Task</DialogTitle>
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
        <FormControl fullWidth margin="dense" disabled>
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
        </FormControl>

        <FormControl fullWidth margin="dense" disabled>
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
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Cancel</Button>
        <Button onClick={handleSubmit} color="primary" disabled={!isFormValid()}>Create</Button>
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
