// app/todos/_components/Tasks.jsx
'use client';

import React, { useState } from 'react';

const Tasks = ({ tasks, onDelete, onToggle, onEdit }) => {
  const [showDescription, setShowDescription] = useState(false);

  const handleTaskClick = () => {
    // Alterna a visibilidade da descrição
    setShowDescription(!showDescription);
  };

  return (
    <div
      className='list-group-item hover-effect d-flex justify-content-between align-items-center my-2'
    >
      <input
        type="checkbox"
        className='form-check-input me-3 align-self-center p-3'
        checked={tasks.completed}
        onChange={() => onToggle(tasks.id)}
      />

      <div
        className={`flex-grow-1 ${tasks.completed ? 'text-decoration-line-through' : ''}`}
        onClick={handleTaskClick} // Adiciona o evento de clique aqui
      >
        <div className="d-flex align-items-center justify-content-between">
          <p className='mb-1'>{tasks.text}</p>
          {/* Mostra um ícone de olho ou informações se a descrição existir */}
          {tasks.description && (
            <i className="bi bi-eye-fill ms-2 text-primary" style={{ cursor: 'pointer' }}></i>
          )}
        </div>
        <p className='badge bg-secondary'>{tasks.category}</p>
        
        {/* Renderiza a descrição somente se showDescription for true e a descrição existir */}
        {showDescription && tasks.description && (
          <p className="mt-2 mb-0 text-muted small">{tasks.description}</p>
        )}
      </div>

      <button
        className='btn btn-outline-danger btn-sm align-self-center'
        onClick={() => onDelete(tasks.id)}
      >
        <i className='bi bi-trash fs-3'></i>
      </button>
      <button
        className='btn btn-outline-primary btn-sm align-self-center ms-2'
        onClick={() => onEdit(tasks)}
      >
        <i className='bi bi-pencil fs-3'></i>
      </button>
    </div>
  );
};

export default Tasks;