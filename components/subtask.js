import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/appContext';
import { supabase } from '../utils/supabaseClient';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';
import SubTaskForm from './NewSubTaskForm';

const SubTask = () => {
  const { currentTask, subtasks, setSubtasks } = useAppContext();
  const [openSubtaskForm, setOpenSubtaskForm] = useState(false); // State to control the dialog visibility

  useEffect(() => {
    if (!currentTask) return;

    const fetchSubtasks = async () => {
      const { data, error } = await supabase
        .rpc('get_all_subtasks_for_task', { main_task_id: currentTask.task_id });

      if (error) {
        console.error('Error fetching subtasks:', error.message);
      } else {
        console.log('subtask', data)
        setSubtasks(data);
      }
    };

    fetchSubtasks();
  }, [currentTask, setSubtasks]);

  useEffect(() => {
    console.log('subtasks', subtasks)
  }, [subtasks])

  const getBorderColor = (status) => {
    return status === 'Completed' ? 'green' : 'grey ';
  };

  return (
    <div style={{border: '1px solid grey', padding: '10px'}}>
       <div style={{marginBottom: '20px', fontSize: '30px'}} >Task Details</div>
             <div style={{ maxHeight: '90vh', width: '250px', overflowY: 'scroll' }}>

      <Button variant="contained" onClick={() => setOpenSubtaskForm(true)}>
        Create Subtask
      </Button>

      {subtasks.map((subtask, index) => (
        <div key={subtask.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Subtask card */}
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
    {/* Tooltip with point form details */}
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
    {subtask.completion_date && (
      <Typography variant="body2" color="text.secondary">
        Completion Date: {new Date(subtask.completion_date).toLocaleDateString()}
      </Typography>
    )}
    {/* Add other details you want to show here */}
  </CardContent>
  <CardActions>
    <Button size="small">Edit</Button>
    <Button size="small">Delete</Button>
  </CardActions>
</Card>
       
          {/* Vertical line connector logic */}
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

    {currentTask && (
  <SubTaskForm
    open={openSubtaskForm}
    onClose={() => setOpenSubtaskForm(false)}
    currentTask={currentTask}
  />
)}
    </div>
  );
};

export default SubTask;
