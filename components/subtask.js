import React, { useEffect } from 'react';
import { useAppContext } from '../context/appContext';
import { supabase } from '../utils/supabaseClient';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';

const SubTask = () => {
  const { currentTask, subtasks, setSubtasks } = useAppContext();

  useEffect(() => {
    if (!currentTask) return;

    const fetchSubtasks = async () => {
      const { data, error } = await supabase
        .rpc('get_all_subtasks_for_task', { main_task_id: currentTask.task_id });

      if (error) {
        console.error('Error fetching subtasks:', error.message);
      } else {
        console.log(data)
        setSubtasks(data);
      }
    };

    fetchSubtasks();
  }, [currentTask, setSubtasks]);

  useEffect(() => {
    console.log('subtasks', subtasks)
  }, [subtasks])

  return (
    <div style={{border: '1px solid grey', padding: '10px'}}>
       <div style={{marginBottom: '20px', fontSize: '30px'}} >Task Details</div>
      {subtasks.map((subtask) => (
        <Card 
          key={subtask.id} 
          style={{ width: 200, margin: '10px', cursor: 'pointer' }}
        >
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              {subtask.title}
            </Typography>
            {/* <Typography variant="body2" color="text.secondary">
              {subtask.description}
            </Typography> */}
            {/* Include any other subtask details here */}
          </CardContent>
          <CardActions>
            <Button size="small">Edit</Button>
            <Button size="small">Delete</Button>
          </CardActions>
        </Card>
      ))}
    </div>
  );
};

export default SubTask;
