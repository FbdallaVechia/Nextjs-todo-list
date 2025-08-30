// app/todos/page.jsx
'use client';

import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';


// Importe todas as Server Actions, incluindo a nova 'updateTodo'
import { addTodo, deleteTodo, toggleTodo, clearAllTodos, getTodos, updateTodo } from '../todos/server/todo.actions';

import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Tasks from '../todos/_components/Tasks';
import ModalForm from '../todos/_components/ModalForm';

export default function TodosPage() {
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null); // Novo estado para a tarefa em edição

  // Carregar tarefas do backend (Server Action)
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
  }, []);

  const handleAddTask = async (text, category, description) => {
    try {
      const formData = new FormData();
      formData.append('text', text);
      formData.append('category', category);
      formData.append('description', description);

      const newTask = await addTodo(formData);
      if (newTask) {
        setTasks((prevTasks) => [...prevTasks, newTask]);
        setShowModal(false);
      }
    } catch (error) {
      console.error('Erro ao adicionar tarefa:', error.message);
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

  // Nova função para lidar com a edição
  const handleEditTask = (taskToEdit) => {
    setEditingTask(taskToEdit); // Define a tarefa a ser editada
    setShowModal(true); // Abre o modal
  };

  // Nova função para lidar com a atualização
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
        setShowModal(false); // Fecha o modal
        setEditingTask(null); // Limpa o estado da tarefa em edição
      }
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error.message);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTask(null); // Limpa o estado da tarefa em edição ao fechar
  };
  
  return (
    <>
      <Header onClear={handleClear} />
      <main className="container mt-5 flex-grow-1 p-3">
        <h1 className="text-center fw-bold mb-4">Minhas tarefas:</h1>
        <div className="d-flex justify-content-center mb-3">
          <button className="btn btn-add-task" onClick={() => {
            setEditingTask(null); // Garante que é modo de adição
            setShowModal(true);
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
                onEdit={handleEditTask} // Passa a nova função para o componente Tasks
              />
            ))
          )}
        </div>

        <ModalForm
          show={showModal}
          onClose={handleCloseModal}
          addTask={handleAddTask}
          updateTask={handleUpdateTask}
          mode={editingTask ? 'edit' : 'add'} // Define o modo do modal
          initialText={editingTask ? editingTask.text : ''} // Passa o texto inicial para edição
          initialCategory={editingTask ? editingTask.category : 'Lazer'} // Passa a categoria inicial
          initialDescription={editingTask ? (editingTask.description || '') : ''} 
          editingId={editingTask ? editingTask.id : null} // Passa o ID da tarefa em edição
        />
      </main>
      <Footer />
    </>
  );
}