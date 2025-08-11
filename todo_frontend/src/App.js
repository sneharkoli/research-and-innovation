import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TodoList from './components/TodoList';
import TodoForm from './components/TodoForm';
import './App.css';

function App() {
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/api/todos/')
      .then(response => setTodos(response.data))
      .catch(error => console.error('Error fetching todos:', error));
  }, []);

  const handleAddTodo = (newTodo) => {
    setTodos([...todos, newTodo]);
  };

  return (
    <div className="App-header">
      <TodoForm onAdd={handleAddTodo} />
      <TodoList todos={todos} />
    </div>
  );
}

export default App;

