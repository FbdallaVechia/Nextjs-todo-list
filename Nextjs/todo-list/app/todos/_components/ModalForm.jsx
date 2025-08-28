'use client';

import React, { useState } from 'react';

const ModalForm = ({ show, onClose, addTask, updateTask, mode = 'add', initialText = '', initialCategory = 'Lazer', initialDescription = '', editingId = null }) => {
  const [text, setText] = useState(initialText);
  const [category, setCategory] = useState(initialCategory);
  const [description, setDescription] = useState(initialDescription); // Novo estado para a descrição


  // sincroniza quando abrir para editar ou limpar ao fechar
  React.useEffect(() => {
    if (show) {
      setText(initialText);
      setCategory(initialCategory);
      setDescription(initialDescription);

    }
  }, [show, initialText, initialCategory, initialDescription]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    if (mode === 'edit' && editingId) {
      updateTask(editingId, text, category, description);
    } else {
      addTask(text, category, description);
    }
  };

  return (
    <div className={`modal fade ${show ? 'show d-block' : ''}`} tabIndex='-1'>
      <div className='modal-dialog'>
        <div className='modal-content'>
          <div className='modal-header'>
            <h5 className='modal-title'>{mode === 'edit' ? 'Editar tarefa' : 'Adicionar nova tarefa'}</h5>
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

              <input // Novo campo para a descrição
                type="text"
                placeholder='Adicionar descrição (opcional)'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className='form-control mb-2'
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
                {mode === 'edit' ? 'Salvar alterações' : 'Adicionar Tarefa'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModalForm;
