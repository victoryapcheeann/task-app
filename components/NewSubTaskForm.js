import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, TextField, Button, DialogActions, Select, MenuItem, InputLabel, FormControl, Snackbar, Alert } from '@mui/material';
import { supabase } from '../utils/supabaseClient';

const SubTaskForm = ({ open, onSave, onClose, currentTask, editMode, subtaskToEdit }) => {
    // Initial empty state for the subtask form
    const [subtask, setSubtask] = useState({
      title: '',
      details: [''],
      status: '',
      completionDate: '',
      task_id: currentTask ? currentTask.id : null,
    });
  
    // This useEffect will run when editMode or subtaskToEdit changes
    useEffect(() => {
      if (editMode && subtaskToEdit) {
        // Load the existing subtask details into the form
        setSubtask({
          title: subtaskToEdit.title,
          details: subtaskToEdit.details,
          status: subtaskToEdit.status,
          completionDate: subtaskToEdit.completion_date ? subtaskToEdit.completion_date.split('T')[0] : '', // Assuming completion_date is a datetime string
          task_id: subtaskToEdit.task_id,
        });
      } else {
        // Reset to empty form if not in edit mode
        setSubtask({
          title: '',
          details: [''],
          status: '',
          completionDate: '',
          task_id: currentTask ? currentTask.id : null,
        });
      }
    }, [editMode, subtaskToEdit, currentTask]);
  
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const closeSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const isFormValid = () => {
    return subtask.title.trim() &&
           subtask.status &&
           (subtask.status !== 'Completed' || subtask.completionDate);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSubtask({ ...subtask, [name]: value });
  };

  const handleDetailsChange = (detail, index) => {
    const newDetails = [...subtask.details];
    newDetails[index] = detail;
    setSubtask({ ...subtask, details: newDetails });
  };

  // Modify handleSubmit for create and edit
  const handleSubmit = async () => {
    // Validation logic here
    if (!isFormValid()) {
      // Show error message
      return;
    }
        
    try {
      const { data, error } = editMode 
        ? await supabase.rpc('edit_subtask_full', {
            // parameters for editing a subtask
            subtask_id: subtaskToEdit.subtask_id,
            new_title: subtask.title,
            new_details: subtask.details,
            new_status: subtask.status,
            new_completion_date: subtask.completionDate,
            new_task_id: currentTask.task_id
          })
        : await supabase.rpc('create_subtask', {
            // parameters for creating a subtask
            new_title: subtask.title,
            new_details: subtask.details,
            new_status: subtask.status,
            new_completion_date: subtask.status === 'Completed' ? new Date(subtask.completionDate).toISOString() : null,
            new_task_id: currentTask.task_id
          });
  
      if (error) {
        throw error;
      }
  
      // Show a success message
      if (!editMode) { showSnackbar('Subtask created successfully!', 'success');}
      if (editMode) { showSnackbar('Subtask updated successfully!', 'success');}

      onClose(); // Close the dialog
      fetchSubtasks()
    } catch (error) {
      // Show an error message
      showSnackbar('Failed to create subtask: ' + error.message, 'error');
    }
  };
  

  return (
    <>
      <Dialog open={open} onClose={onClose} aria-labelledby="subtask-form-dialog-title">
      <DialogTitle id="form-dialog-title">{editMode ? 'Edit Sub Task' : 'Create New Sub Task'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="title"
            label="Title"
            type="text"
            fullWidth
            value={subtask.title}
            onChange={handleInputChange}
            required
          />
          {/* Details text fields */}
          {subtask.details.map((detail, index) => (
            <TextField
              key={index}
              margin="dense"
              label={`Detail ${index + 1}`}
              type="text"
              fullWidth
              value={detail}
              onChange={(e) => handleDetailsChange(e.target.value, index)}
              required
            />
          ))}
          <Button onClick={() => setSubtask({ ...subtask, details: [...subtask.details, ''] })}>
            Add Detail
          </Button>
          <FormControl fullWidth margin="dense">
            <InputLabel id="status-select-label">Status</InputLabel>
            <Select
              labelId="status-select-label"
              name="status"
              value={subtask.status}
              onChange={handleInputChange}
              required
            >
              <MenuItem value="New">New</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
            </Select>
          </FormControl>
          {subtask.status === 'Completed' && (
            <TextField
              margin="dense"
              name="completionDate"
              label="Completion Date"
              type="datetime-local"
              fullWidth
              value={subtask.completionDate}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
              required
            />
          )}
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

export default SubTaskForm;
