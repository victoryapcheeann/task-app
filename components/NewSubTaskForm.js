import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, TextField, Button, DialogActions, Select, MenuItem, InputLabel, FormControl, Snackbar, Alert } from '@mui/material';
import { supabase } from '../utils/supabaseClient';

const SubTaskForm = ({ open, onSave, onClose, currentTask }) => {
    console.log('currentTask', currentTask)
  const [subtask, setSubtask] = useState({
    title: '',
    details: [],
    status: '',
    completionDate: '',
    new_task_id: currentTask.task_id,
  });

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

 // Within your SubTaskForm component
const handleSubmit = async () => {
    if (!isFormValid()) {
      showSnackbar('Please fill in all required fields.', 'warning');
      return;
    }
  
    console.log('subtask', subtask)

    try {
      const { data, error } = await supabase
        .rpc('create_subtask', { // Replace 'create_subtask' with the correct RPC method name
          new_title: subtask.title,
          new_details: subtask.details,
          new_status: subtask.status,
          new_completion_date: subtask.status === 'Completed' ? new Date().toISOString() : null,
          new_task_id: currentTask.task_id, // Assuming currentTask is available in your component
        });
  
      if (error) {
        throw error;
      }
  
      // Show a success message
      showSnackbar('Subtask created successfully!', 'success');
      onClose(); // Close the dialog
    } catch (error) {
      // Show an error message
      showSnackbar('Failed to create subtask: ' + error.message, 'error');
    }
  };
  

  return (
    <>
      <Dialog open={open} onClose={onClose} aria-labelledby="subtask-form-dialog-title">
        <DialogTitle id="subtask-form-dialog-title">Create Sub Task</DialogTitle>
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

export default SubTaskForm;
