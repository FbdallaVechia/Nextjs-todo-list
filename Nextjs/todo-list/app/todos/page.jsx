// app/todos/page.jsx
'use client';

import { useState, useEffect } from 'react';

// Importe as Server Actions do seu novo arquivo
import { addTodo, deleteTodo, toggleTodo, clearAllTodos, getTodos } from '../todos/server/todo.actions';

// Importe seus componentes (ajuste os caminhos se tiver movido)
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Tasks from '../todos/_components/Tasks'; // Seu Tasks.jsx
import ModalForm from '../todos/_components/ModalForm'; // Seu ModalForm.jsx

export default function TodosPage() {
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Carregar tarefas do backend (Server Action)
  useEffect(() => {
    async function fetchInitialTasks() {
      try {
        const fetchedTasks = await getTodos(); // Chama a Server Action
        setTasks(fetchedTasks);
      } catch (error) {
        console.error('Erro ao carregar tarefas iniciais:', error.message);
        // Exibir uma mensagem de erro para o usuário se preferir
      }
    }
    fetchInitialTasks();
  }, []); // O array vazio assegura que isso roda apenas uma vez no carregamento

  const handleAddTask = async (text, category) => {
    try {
      // Como a Server Action addTodo espera FormData, precisamos criar um.
      // Ou você pode ajustar a Server Action para receber text e category diretamente.
      const formData = new FormData();
      formData.append('text', text);
      formData.append('category', category);

      const newTask = await addTodo(formData); // Chama a Server Action
      if (newTask) {
        setTasks((prevTasks) => [...prevTasks, newTask]);
        setShowModal(false); // Fechar o modal após adicionar
      }
    } catch (error) {
      console.error('Erro ao adicionar tarefa:', error.message);
      // Aqui você pode adicionar lógica para exibir uma notificação de erro para o usuário
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      const wasDeleted = await deleteTodo(id); // Chama a Server Action
      if (wasDeleted) {
        setTasks((prevTasks) => prevTasks.filter(task => task.id !== id));
      }
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error.message);
    }
  };

  const handleToggleTask = async (id) => {
    try {
      const updatedTask = await toggleTodo(id); // Chama a Server Action
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
      const wasCleared = await clearAllTodos(); // Chama a Server Action
      if (wasCleared) {
        setTasks([]);
      }
    } catch (error) {
      console.error('Erro ao limpar tarefas:', error.message);
    }
  };

  return (
    <>
      <Header onClear={handleClear} />
      <main className="container mt-5 flex-grow-1 p-3">
        <h1 className="text-center fw-bold mb-4">Minhas tarefas:</h1>
        <div className="d-flex justify-content-center mb-3">
          <button className="btn btn-add-task" onClick={() => setShowModal(true)}>
            Adicionar Tarefa
          </button>
        </div>

        <div className="list-group w-100">
          {tasks.length === 0 ? (
            <p className="text-center fw-bold mb-4">Nada pra fazer!</p>
          ) : (
            tasks.map((task) => (
              <Tasks
                key={task.id} // O id agora será um UUID string
                tasks={task}
                onDelete={handleDeleteTask}
                onToggle={handleToggleTask}
              />
            ))
          )}
        </div>

        <ModalForm
          show={showModal}
          onClose={() => setShowModal(false)}
          addTask={handleAddTask}
        />
      </main>
      <Footer />
    </>
  );
}