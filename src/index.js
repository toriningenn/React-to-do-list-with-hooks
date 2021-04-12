import React from 'react';
import ReactDOM from "react-dom";
import './index.css';
import axios from 'axios';
import { useState } from 'react';
import { useEffect } from 'react';


const tasksKey = 'tasks';
const doneKey = 'done'


function TODOApp() {
    const [tasks, setTasks] = useState([]);
    const [doneTasks, setDoneTasks] = useState([]);

    useEffect(() => {
            axios.get("http://localhost:8080/api/tasks")
                .then(response => {
                    let allTasks = response.data;
                    allTasks.map(task => {
                        if (task.statusString === "TASKTODO" && !tasks.includes(task)) {
                            setTasks(tasks.concat(task));
                        } else {
                            setDoneTasks(doneTasks.concat(task));
                        }
                        return null;
                    });
                });
        }, []
    );

    //useEffect(()=> {
    //    localStorage.setItem(tasksKey, JSON.stringify(tasks));
   //     localStorage.setItem(doneKey, JSON.stringify(doneTasks));
 //   }, [tasks,doneTasks]
 //   );


    function addNewTask(task) {
        if (task) {
            setTasks(tasks.concat(task));
            //по дефолту сделает jsonoм?
            axios.post("http://localhost:8080/api/add", task)
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

    function moveTask(taskIndex, from, to, key) {
        let id;
        let newArr = [...to];
        let task = from[taskIndex];
        newArr.push(task);
        deleteThisTask(taskIndex, from, key);
        if (to === tasks) {
            id = doneTasks[taskIndex].id;
            axios.post(`http://localhost:8080/api/${id}`)
                .catch(function (error) {
                    console.log(error);
                });
            setTasks(newArr);
        } else {
            id = tasks[taskIndex].id;
            axios.post(`http://localhost:8080/api/${id}`)
                .catch(function (error) {
                    console.log(error);
                });
            setDoneTasks(newArr);
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
                                    props.todoList, props.doneList, tasksKey)}
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
                                        props.doneList, props.todoList, doneKey)}
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