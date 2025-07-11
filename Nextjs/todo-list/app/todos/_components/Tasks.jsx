'use client';

import React from 'react';

const Tasks = ({ tasks, onDelete, onToggle }) => {
  return (
    <div className='list-group-item hover-effect d-flex justify-content-between align-items-center my-2'>
      <input
        type="checkbox"
        className='form-check-input me-3 align-self-center p-3'
        checked={tasks.completed}
        onChange={() => onToggle(tasks.id)}
      />
      <div className={`flex-grow-1 text-center ${tasks.completed ? 'text-decoration-line-through' : ''}`}>
        <p className='mb-1'>{tasks.text}</p>
        <p className='badge bg-secondary'>{tasks.category}</p>
      </div>
      <button
        className='btn btn-outline-danger btn-sm align-self-center'
        onClick={() => onDelete(tasks.id)}
      >
        <i className='bi bi-trash fs-3'></i>
      </button>
    </div>
  );
};

export default Tasks;
