// app/todos/_components/Tasks.jsx
'use client';

import React, { useState } from 'react';

const Tasks = ({ tasks, onDelete, onToggle, onEdit }) => {
  const [showDescription, setShowDescription] = useState(false);

  const handleTaskClick = () => {
    // Alterna a visibilidade da descrição apenas se houver uma descrição
    if (tasks.description) {
      setShowDescription(!showDescription);
    }
  };

  return (
    <div className='list-group-item d-flex align-items-center mb-2 p-3 border-bottom task-item hover-effect'>
      <input
        type="checkbox"
        className='form-check-input me-3'
        checked={tasks.completed}
        onChange={() => onToggle(tasks.id)}
      />

      <div
        className={`flex-grow-1 text-center ${tasks.completed ? 'completed-task-text' : ''}`}
        onClick={handleTaskClick} // O clique no div da tarefa ativa a descrição
        style={{ cursor: 'pointer' }}
      >
        <p className='mb-1 fw-bold'>{tasks.text}</p>
        <p className='badge rounded-pill text-bg-secondary mb-0'>{tasks.category}</p>
        {/* Adiciona o sinalizador "ver mais" e "ver menos" */}
        {tasks.description && (
          <p className="ms-2 text-primary small mb-0 mt-1">
            {showDescription ? 'ver menos' : 'ver mais'}
          </p>
        )}
      </div>

      <div className="d-flex ms-2">
        <button className="btn btn-sm btn-secondary me-2" onClick={() => onEdit(tasks)}>
          <i className="bi bi-pencil-square"></i>
        </button>
        <button className="btn btn-sm btn-danger" onClick={() => onDelete(tasks.id)}>
          <i className="bi bi-trash"></i>
        </button>
      </div>

      {showDescription && tasks.description && (
        <div className="description-text mt-2">
          <p className="mb-0">{tasks.description}</p>
        </div>
      )}
    </div>
  );
};

export default Tasks;