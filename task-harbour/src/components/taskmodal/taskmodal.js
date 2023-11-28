import './taskmodal.css';
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import UserSearchDropdown from '../UserSearchDropdown/user-search';

function TaskModal({ createOrUpdate }) {
  const [taskProperties, setTaskProperties] = useState(null);
  const [projectID, setProjectID] = useState('');
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [status, setStatus] = useState('');
  const [taskTags, setTaskTags] = useState([]);
  const [assigneeUserID, setAssigneeUserID] = useState(null);
  const [priority, setPriority] = useState('low');
  const [storyPoints, setStoryPoints] = useState(0);
  const [creatorUserID, setCreatorUserID] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [endDate, setEndDate] = useState();
  // const [date, setDate] = useState(new Date());
  // const [startDate, setStartDate] = useState();
  // Get current date
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0); // Set time to the start of the day

  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    // Extract the projectId from the URL query parameters
    const queryParams = new URLSearchParams(location.search);
    const projectIdFromUrl = queryParams.get('projectId');
    const taskProps = location.state?.taskProperties;

    if (projectIdFromUrl) {
      setProjectID(projectIdFromUrl);
    }

    if (taskProps) {
      console.log({ taskProps })
      setTaskProperties(taskProps);
      setTaskName(taskProps.taskName);
      setTaskDescription(taskProps.taskDescription);
      setStatus(taskProps.status);
      setTaskTags(JSON.parse(taskProps.DictionaryTaskTags));
      setAssigneeUserID({ value: taskProps.assigneeUserID, label: taskProps.assigneeUserID });
      setPriority(taskProps.priority);
      setStoryPoints(taskProps.storyPoints);
      setEndDate(new Date(taskProps.taskDueDate));
      setCreatorUserID(taskProps.creatorUserID);
    }

    setTaskProperties(taskProps);
  }, [location]);

  const handleAssigneeChange = selectedOption => {
    setAssigneeUserID(selectedOption);
  };

  const goToProject = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  const resetForm = () => {
    setTaskName('');
    setTaskDescription('');
    setStatus('');
    setTaskTags([]);
    setAssigneeUserID(null);
    setPriority('low');
    setStoryPoints(0);
    setEndDate(null); // or set it to a default date if required
    setIsSubmitted(false);

  };

  const handleSubmit = (e) => {
    e.preventDefault(); //

    const newTask = {
      taskID: taskProperties?.TaskID,
      projectID: projectID,
      taskName: taskName,
      taskDescription: taskDescription,
      taskDueDate: endDate,
      status: status,
      taskTags: taskTags,
      creatorUserID: creatorUserID || JSON.parse(localStorage.getItem("authData")).username,
      assigneeUserID: assigneeUserID.value,
      priority: priority,
      storyPoints: storyPoints,
    }

    const url = createOrUpdate === 'create' ?
      'https://5k36hyuwslzt52zrpha5wcvfbe0grnmw.lambda-url.us-east-1.on.aws/' : `https://vllkg6hyedglzx7tg4ldf2nkoy0rvadi.lambda-url.us-east-1.on.aws/`;
    const method = createOrUpdate === 'create' ? 'POST' : 'PUT';

    console.log({ newTask })
    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newTask),
    })

      .then(response => response.json())
      .then(data => {
        console.log('Task Created ' + JSON.stringify(data));
        setIsSubmitted(true);
        //window.location.href = '' <-- page redirection? I need to add the link
      })
      .catch((error) => {
        console.log(error.message)
        console.log('Error creating new task ' + JSON.stringify(error));
        console.log(newTask);
      });
  }
  function deleteTaskClick() {
    const del = {
      taskID: taskProperties?.TaskID,
      projectID: projectID
    }
    const userConfirmed = window.confirm(`Are you sure you want to delete task: ${taskProperties.taskName} ?`);
    // TODO: apply Delete function URL in fetch below
    // TODO: apply projectID and taskID to the body
    // TODO: redirect to taskList after delete

    if (userConfirmed) {
      try {
        fetch('https://pnyyqkztdopu4lohnhqytbknii0smvlv.lambda-url.us-east-1.on.aws/',
            {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(del),
            }
        ).then(response => {

          return response.json()
        })
      } catch (error) {
        console.error("error getting DELETING task" + error);
      }
      goToProject(projectID)
      console.log("Task deleted");
    }
  }

  return (
    <div className="TaskCreation">
      {isSubmitted ? (
        <>
          <h1 style={{ marginBottom: "4rem" }}>{createOrUpdate === "create" ? "Task Created" : "Task Updated"}</h1>
          <div style={{ display: 'flex', justifyContent: "space-between", alignItems: 'center', width: "50%" }}>
            <Link to={"/projects/" + projectID}>
              Back to Project
            </Link>
            {
              createOrUpdate === "create" && (
                <button onClick={resetForm} className="create-task-btn">
                  Create another Task
                </button>
              )
            }

          </div>
        </>
      ) : (
        <>
          <h1>{createOrUpdate === "create" ? "New" : "Edit" + " Task"}</h1>
          <form onSubmit={handleSubmit}>
            <div className='row'>
              <input
                type="text"
                placeholder="Project ID"
                required={true}
                disabled
                value={"Project ID: " + projectID}
                onChange={(e) => setTaskName(e.target.value)}
              />
            </div>
            <div className='row'>
              <input
                type="text"
                placeholder="Task Name"
                required={true}
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
              />
            </div>
            <div className='row'>
              <textarea
                placeholder="Description"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
              />
            </div>
            <div className='row'>
              <label>Assignee: </label>
              <UserSearchDropdown
                initialValue={assigneeUserID}
                onUserSelect={handleAssigneeChange}
              />
            </div>
            <div className='row'>
              <div>
                <DatePicker
                  placeholderText='Deadline'
                  required={true}
                  selectsEnd
                  selected={endDate}
                  onChange={date => setEndDate(date)}
                  endDate={endDate}
                  minDate={currentDate} // Disable past dates
                />
              </div>
            </div>
            <div className='row'>
              <input
                type="text"
                placeholder="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Tags (comma-separated)"
                value={taskTags.join(',')}
                onChange={(e) => setTaskTags(e.target.value.split(','))}
              />
            </div>
            <div className='row'>
              <label>Priority:</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="low">Low</option>
                <option value="mid">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label>Story Points:</label>
              <input
                type="number"
                value={storyPoints}
                onChange={(e) => setStoryPoints(Number(e.target.value))}
              />
            </div>
            <button type="submit" className='createTaskButton'>{createOrUpdate === "create" ? "Create Task" : "Update Task"}</button>
            <button type="button" className='deleteTaskButton' onClick={deleteTaskClick}>Delete</button>
          </form></>
      )}
    </div>
  );
}

export default TaskModal;
