'use client';

import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../App.css';

// Importe todas as Server Actions
import { addTodo, deleteTodo, toggleTodo, clearAllTodos, getTodos, updateTodo } from '../todos/server/todo.actions';

import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Tasks from '../todos/_components/Tasks';
import ModalForm from '../todos/_components/ModalForm';
import { Spinner } from 'react-bootstrap';

export default function TodosPage() {
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null); // Novo estado para a tarefa em edição
  const [error, setError] = useState(null); // Novo estado para exibir erros

  // Carrega as tarefas do banco de dados quando o componente é montado
  useEffect(() => {
    async function fetchInitialTasks() {
      try {
        const fetchedTasks = await getTodos();
        setTasks(fetchedTasks);
      } catch (error) {
        console.error('Erro ao carregar tarefas iniciais:', error.message);
      }
    }
    fetchInitialTasks();
  }, []); // O array vazio garante que o fetch seja feito apenas uma vez

  const handleAddTask = async (text, category, description) => {
    try {
      const formData = new FormData();
      formData.append('text', text);
      formData.append('category', category);
      formData.append('description', description);

      const newTask = await addTodo(formData);
      if (newTask) {
        const tempTask = {
            ...newTask,
            description: 'Gerando descrição...'
        };
        setTasks((prevTasks) => [tempTask, ...prevTasks]);
        handleCloseModal();

        // Adiciona o setTimeout para dar um refresh na página
        setTimeout(() => {
          window.location.reload();
        }, 5000); // Recarrega a página após 5 segundos
      }
    } catch (error) {
      console.error('Erro ao adicionar tarefa:', error.message);
      setError(error.message);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      const wasDeleted = await deleteTodo(id);
      if (wasDeleted) {
        setTasks((prevTasks) => prevTasks.filter(task => task.id !== id));
      }
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error.message);
    }
  };

  const handleToggleTask = async (id) => {
    try {
      const updatedTask = await toggleTodo(id);
      if (updatedTask) {
        setTasks((prevTasks) =>
          prevTasks.map(task =>
            task.id === updatedTask.id ? { ...task, completed: updatedTask.completed } : task
          )
        );
      }
    } catch (error) {
      console.error('Erro ao alternar status da tarefa:', error.message);
    }
  };

  const handleClear = async () => {
    try {
      const wasCleared = await clearAllTodos();
      if (wasCleared) {
        setTasks([]);
      }
    } catch (error) {
      console.error('Erro ao limpar tarefas:', error.message);
    }
  };

  const handleEditTask = (taskToEdit) => {
    setEditingTask(taskToEdit);
    setShowModal(true);
    setError(null);
  };

  const handleUpdateTask = async (id, newText, newCategory, newDescription) => {
    try {
      const formData = new FormData();
      formData.append('id', id);
      formData.append('text', newText);
      formData.append('category', newCategory);
      formData.append('description', newDescription);

      const updatedTask = await updateTodo(formData);
      if (updatedTask) {
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task.id === updatedTask.id ? updatedTask : task
          )
        );
        handleCloseModal();
      }
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error.message);
      setError(error.message);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTask(null);
    setError(null);
  };
  
  return (
    <>
      <Header onClear={handleClear} />
      <main className="container mt-5 flex-grow-1 p-3">
        <h1 className="text-center fw-bold mb-4">Minhas tarefas:</h1>
        <div className="d-flex justify-content-center mb-3">
          <button className="btn btn-add-task" onClick={() => {
            setEditingTask(null);
            setShowModal(true);
            setError(null);
          }}>
            Adicionar Tarefa
          </button>
        </div>

        <div className="list-group w-100">
          {tasks.length === 0 ? (
            <p className="text-center fw-bold mb-4">Nada pra fazer!</p>
          ) : (
            tasks.map((task) => (
              <Tasks
                key={task.id}
                tasks={task}
                onDelete={handleDeleteTask}
                onToggle={handleToggleTask}
                onEdit={handleEditTask}
              />
            ))
          )}
        </div>

        <ModalForm
          show={showModal}
          onClose={handleCloseModal}
          addTask={handleAddTask}
          updateTask={handleUpdateTask}
          mode={editingTask ? 'edit' : 'add'}
          initialText={editingTask ? editingTask.text : ''}
          initialCategory={editingTask ? editingTask.category : 'Lazer'}
          initialDescription={editingTask ? (editingTask.description || '') : ''}
          editingId={editingTask ? editingTask.id : null}
          error={error}
        />
      </main>
      <Footer />
    </>
  );
}