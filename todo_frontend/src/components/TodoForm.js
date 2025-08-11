import React, { useState } from 'react';
import axios from 'axios';

const TodoForm = ({ onAdd }) => {
    const [title, setTitle] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validate that title is not empty after trimming whitespace
        if (title.trim() === '') {
            return;
        }
        
        axios.post('http://localhost:8000/api/todos/', {
            title: title.trim(),
            description: '',
            completed: false
        })
        .then(response => {
            onAdd(response.data);
            setTitle('');
        })
        .catch(error => {
            console.error('There was an error creating the todo!', error);
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
            <button type="submit">Add Todo</button>
        </form>
    );
};

export default TodoForm;



