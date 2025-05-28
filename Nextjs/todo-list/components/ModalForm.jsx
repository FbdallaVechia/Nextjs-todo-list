'use client';

import React, { useState } from 'react';

const ModalForm = ({ show, onClose, addTask }) => {
  const [text, setText] = useState('');
  const [category, setCategory] = useState('Lazer');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      addTask(text, category);
      setText('');
      setCategory('Lazer');
      onClose();
    }
  };

  return (
    <div className={`modal fade ${show ? 'show d-block' : ''}`} tabIndex='-1'>
      <div className='modal-dialog'>
        <div className='modal-content'>
          <div className='modal-header'>
            <h5 className='modal-title'>Adicionar nova tarefa</h5>
            <button type='button' className='btn-close' onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className='modal-body'>
              <input
                type="text"
                placeholder='Digite a tarefa'
                value={text}
                onChange={(e) => setText(e.target.value)}
                className='form-control mb-2'
                required
              />

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className='form-select'
              >
                <option value="Lazer">Lazer</option>
                <option value="Trabalho">Trabalho</option>
                <option value="Estudos">Estudos</option>
              </select>
            </div>
            <div className='modal-footer'>
              <button type='button' className='btn btn-secondary' onClick={onClose}>
                Cancelar
              </button>
              <button type='submit' className='btn btn-add-task'>
                Adicionar Tarefa
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModalForm;
