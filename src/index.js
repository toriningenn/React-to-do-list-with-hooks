import React from 'react';
import ReactDOM from "react-dom";
import './index.css';
import axios from 'axios';
import {useState} from 'react';
import {useEffect} from 'react';


const tasksKey = 'tasks';
const doneKey = 'done'


function TODOApp() {
    const [tasks, setTasks] = useState([]);
    const [doneTasks, setDoneTasks] = useState([]);
    const [newTask, setNewTask] = useState([]);
    const [taskToMove, setTaskToMove] = useState({});

    useEffect(() => {
            axios.get("http://localhost:8080/api/tasks")
                .then(response => {
                    let allTasks = response.data;
                    let doneTasksArr = [];
                    let tasksArr = [];
                    console.log(response.data);
                    allTasks.map(task => {
                        if (task.statusString === "TASKTODO") {
                            tasksArr.push(task);
                        } else {
                            doneTasksArr.push(task);
                            setDoneTasks(doneTasks.concat(task));
                        }
                        setTasks(tasks.concat(tasksArr));
                        setDoneTasks(doneTasks.concat(doneTasksArr));
                        return null;
                    });
                });
        }, []
    );

    useEffect(() => {
            setTasks(tasks.concat(newTask));
        }, [newTask]
    );


    function addNewTask(task) {
        if (task) {
            axios.post("http://localhost:8080/api/add", task)
                .then(response => setNewTask(response.data))
                .catch(function (error) {
                    console.log(error);
                });
        }
    }

    function deleteThisTask(taskIndex, arr, key) {
        let id;
        const newArr = [...arr]
        newArr.splice(taskIndex, 1)
        if (key === doneKey) {
            id = doneTasks[taskIndex].id;
            axios.delete(`http://localhost:8080/api/${id}`,)
                .catch(function (error) {
                    console.log(error);
                });
            setDoneTasks(newArr);
        } else {
            id = tasks[taskIndex].id;
            axios.delete(`http://localhost:8080/api/${id}`,)
                .catch(function (error) {
                    console.log(error);
                });
            setTasks(newArr);
        }
    }

    function moveTask(taskIndex, from, to, toKey) {
        let fromArr = [...from];
        let toArr = [...to];
        let task = from[taskIndex];
        let id = task.id;
        axios.post(`http://localhost:8080/api/${id}`)
            .then(response => toArr.push(response.data))
            .catch(function (error) {
                console.log(error);
            });

        if (toKey === doneKey) {
            setDoneTasks(doneTasks.concat(task));
            fromArr.splice(taskIndex, 1);
            setTasks(fromArr);
        } else {
            setTasks(tasks.concat(task));
            fromArr.splice(taskIndex, 1);
            setDoneTasks(fromArr);
        }
    }

    return (
        <div>
            <Tasks todoList={tasks}
                   doneList={doneTasks}
                   deleteFunc={deleteThisTask}
                   moveFunc={moveTask}/>
            <MyForm add={addNewTask}/>
        </div>
    );
}


function MyForm(props) {
    const [newTask, setNewTask] = useState('');

    function changeHandler(event) {
        setNewTask({
            task: event.target.value,
            statusString: "TASKTODO"
        });
    }

    function submitHandler(event) {
        event.preventDefault();
        props.add(newTask);
        setNewTask('');
    }

    return (
        <form onSubmit={submitHandler}>
            <label>Новая задача:</label>
            <input type="text" value={newTask.task} onChange={changeHandler}/>
            <input type="submit"/>
        </form>
    );
}

function Tasks(props) {
    return (
        <div><h1>Tasks:</h1>
            <ol className="TasksList">
                {props.todoList.map(task => (<div>
                    <ul className="taskName">
                        <DoneButton
                            move={() =>
                                props.moveFunc(props.todoList.indexOf(task),
                                    props.todoList, props.doneList, doneKey)}
                            look={'✓'}/>
                        {task.task}
                        <DeleteButton
                            value={() => props.deleteFunc(
                                props.todoList.indexOf(task),
                                props.todoList, tasksKey
                            )}/></ul>
                </div>))}
            </ol>
            <div><h1>Done:</h1>
                <ol className="DoneList">
                    {props.doneList.map(task => (<div>
                        <ul className="taskName">
                            <DoneButton
                                move={() =>
                                    props.moveFunc(props.doneList.indexOf(task),
                                        props.doneList, props.todoList, tasksKey)}
                                look={'X'}/>
                            <s>{task.task}</s>
                            <DeleteButton
                                value={() => props.deleteFunc(
                                    props.doneList.indexOf(task),
                                    props.doneList, doneKey
                                )}/></ul>
                    </div>))}
                </ol>
            </div>
        </div>
    );

}

function DoneButton(props) {
    function clickHandler(event) {
        event.preventDefault();
        props.move();
    }

    return (
        <button className="donebutton" onClick={clickHandler}>{props.look}</button>
    );
}

function DeleteButton(props) {
    return <button className="deletebutton" onClick={props.value}>&#9746;</button>;
}

ReactDOM.render(
    <TODOApp/>,
    document.getElementById('root')
);