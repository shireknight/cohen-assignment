import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaPen, FaPlus, FaTrashAlt } from 'react-icons/fa'
import axios from 'axios'
import cn from 'classnames'
import moment from 'moment'

import TaskForm, { ITaskProps } from '../TaskForm'

import './TaskList.scss'


const TaskList = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    // number version of id
    const listId = Number(id)
    // default due date
    const today = moment().format('yyyy-MM-DD').toString()
    
    const [title, setTitle] = useState('')
    const [tasks, setTasks] = useState([])
    const [showAddForm, setShowAddForm] = useState(false)
    // won't display edit form if set to -1
    const [editingTask, setEditingTask] = useState(-1)

    const newTask: ITaskProps = {
        taskId: null,
        listId,
        description: '',
        dueDate: today,
        priority: 'low',
        isComplete: false,
    }

    const sortByPriority = (_tasks) => {
        const priorityOrder = ['high', 'medium', 'low']
        _tasks.sort((a, b) => {
            const first = priorityOrder.indexOf(a.priority)
            const second = priorityOrder.indexOf(b.priority)
            return first - second
        })
        return _tasks
    }

    const fetchTasks = useCallback(() => {
        axios.get(`todo/${id}`).then((res) => {
            if (res.status === 200) {
                const data = res.data[0]
                setTitle(data.title)
                const sortedTasks = sortByPriority(data.tasks)
                setTasks(sortedTasks)
            }
        })
    }, [id])

    // fetch tasks for todo list on load
    useEffect(() => {
        fetchTasks()
    }, [fetchTasks])

    const addTask = (task: ITaskProps) => {
        axios.post(`task/add/${listId}`, task).then((res) => {
            fetchTasks()
            setShowAddForm(false)
        })
    }

    const editTask = (task: ITaskProps) => {
        axios.post(`task/edit/${task.taskId}`, task).then((res) => {
            setEditingTask(-1)
            fetchTasks()
        })
    }

    const deleteTask = (taskId: number) => {
        axios.get(`task/delete/${taskId}`).then((res) => {
            fetchTasks()
        })
    }

    const cancelTask = () => {
        setEditingTask(-1)
        setShowAddForm(false)
    }

    // if existing task has same name, don't validate
    const isUniqueTaskName = (taskName: string) => {
        const matches = tasks.filter(
            (t: ITaskProps) => t.description === taskName
        )
        return matches.length === 0
    }

    // edited form should validate if name hasn't changed
    const isUniqueEditedTaskName = (taskName: string, taskId: number) => {
        const otherTasks = tasks.filter((t: ITaskProps) => t.taskId !== taskId)
        const matches = otherTasks.filter(
            (t: ITaskProps) => t.description === taskName
        )
        return matches.length === 0
    }

    return (
        <div className="task-list">
            <h1>{title}</h1>
            <header className="task-list__header">
                <span className="task-list__heading task-list__heading--desc">
                    Description
                </span>
                <span className="task-list__heading task-list__heading__due">
                    Due Date
                </span>
                <span className="task-list__heading task-list__heading--priority">
                    Priority
                </span>
                <span className="task-list__heading task-list__heading--edit">
                    Edit
                </span>
                <span className="task-list__heading task-list__heading--delete">
                    Delete
                </span>
            </header>
            <ul className="task-list__list">
                {tasks.length > 0 ? (
                    tasks.map((task: ITaskProps) => (
                        <li
                            key={task.description}
                            className={cn('task-list__list-item', {
                                'task-list__list-item--completed':
                                    task.isComplete,
                            })}
                        >
                            {editingTask !== task.taskId ? (
                                <div className="task-list__row">
                                    <span className="task-list__col task-list__col--desc">
                                        {task.description}
                                    </span>
                                    <span className="task-list__col task-list__col--due">
                                        {moment(task.dueDate).format('M/d/yyyy').toString()}
                                    </span>
                                    <span className="task-list__col task-list__col--priority">
                                        {task.priority}
                                    </span>
                                    <span className="task-list__col task-list__col--edit">
                                        {!task.isComplete ? (
                                            <button
                                                type="button"
                                                className="task-list__btn task-list__btn--edit"
                                                onClick={() =>
                                                    setEditingTask(task.taskId)
                                                }
                                            >
                                                <FaPen />
                                            </button>
                                        ) : (
                                            '\u00A0'
                                        )}
                                    </span>
                                    <span className="task-list__col task-list__col--delete">
                                        <button
                                            type="button"
                                            className="task-list__btn task-list__btn--delete"
                                            onClick={() =>
                                                deleteTask(task.taskId)
                                            }
                                        >
                                            <FaTrashAlt />
                                        </button>
                                    </span>
                                </div>
                            ) : (
                                <TaskForm
                                    task={task}
                                    onCancel={cancelTask}
                                    onValidate={isUniqueEditedTaskName}
                                    onSave={editTask}
                                />
                            )}
                        </li>
                    ))
                ) : (
                    <p className='task-list__msg--no-task'>No tasks added yet.</p>
                )}
            </ul>
            <div className="task-list__controls">
                {!showAddForm ? (
                    <>
                        <button className="task-btn task-btn__back"
                        onClick={() => navigate(-1)}>
                            <FaArrowLeft />
                        </button>
                        <button
                            className="task-btn task-btn__add"
                            onClick={() => setShowAddForm(true)}
                        >
                            <FaPlus />
                        </button>
                    </>
                ) : (
                    <TaskForm
                        task={newTask}
                        onCancel={cancelTask}
                        onValidate={isUniqueTaskName}
                        onSave={addTask}
                    />
                )}
            </div>
        </div>
    )
}
export default TaskList
