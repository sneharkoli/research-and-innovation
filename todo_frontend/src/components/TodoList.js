import React from 'react';

const TodoList = ({ todos }) => {

    return (
        <div>
            <h1>Todo List</h1>
            <ul>
                {todos.map(todo => (
                    <li key={todo.id}>{todo.title}</li>
                ))}
            </ul>
        </div>
    );
};

export default TodoList;

