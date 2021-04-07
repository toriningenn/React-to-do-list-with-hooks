import React from 'react';
import ReactDOM from "react-dom";
import './index.css';
import { useState } from 'react';
import { useEffect } from 'react';


const tasksKey = 'tasks';
const doneKey = 'done'

function TODOApp() {
    const [tasks, setTasks] = useState(['kek', 'puk', 'lol', 'lkgl', 'wtf']);
    const [doneTasks, setDoneTasks] = useState(['done']);

    useEffect(() => {
            setTasks(JSON.parse(localStorage.getItem(tasksKey)));
            setDoneTasks(JSON.parse(localStorage.getItem(doneKey)));
        },
    );


    function addNewTask(task) {
        if (task) {
            setTasks(tasks.concat(task));
            localStorage.setItem(tasksKey, JSON.stringify(tasks));
        }
    }

    function deleteThisTask(taskIndex, arr, key) {
        const newArr = [...arr]
        newArr.splice(taskIndex, 1)
        if (key === doneKey) {
            setDoneTasks(newArr);
            localStorage.setItem(doneKey, JSON.stringify(doneTasks));
        } else {
            setTasks(newArr);
            localStorage.setItem(tasksKey, JSON.stringify(tasks));
        }
    }

    function moveTask(taskIndex, from, to, key) {
        let newArr = [...to];
        let task = from[taskIndex];
        newArr.push(task);
        deleteThisTask(taskIndex, from, key);
        if (to === tasks) {
            setTasks(newArr);
            localStorage.setItem(tasksKey, JSON.stringify(tasks));
        } else {
            setDoneTasks(newArr);
            localStorage.setItem(doneKey, JSON.stringify(doneTasks));
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
        setNewTask(event.target.value);
    }

    function submitHandler(event) {
        event.preventDefault();
        props.add(newTask);
        setNewTask('');
    }

    return (
        <form onSubmit={submitHandler}>
            <label>Новая задача:</label>
            <input type="text" value={newTask} onChange={changeHandler}/>
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
                        {task}
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
                            <s>{task}</s>
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