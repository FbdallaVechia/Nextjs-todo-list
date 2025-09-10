// app/todos/page.jsx
'use client';

import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../App.css';

// Importe a biblioteca do Supabase para o lado do cliente
import { createClient } from '@supabase/supabase-js';

// Importe todas as Server Actions
import { addTodo, deleteTodo, toggleTodo, clearAllTodos, getTodos, updateTodo } from '../todos/server/todo.actions';

import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Tasks from '../todos/_components/Tasks';
import ModalForm from '../todos/_components/ModalForm';
import { Spinner } from 'react-bootstrap';

// =========================================================================
// Cliente Supabase para o lado do cliente (Realtime)
// =========================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('As variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY devem estar definidas.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function TodosPage() {
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null); // Novo estado para a tarefa em edição
  const [error, setError] = useState(null); // Novo estado para exibir erros

  // Carregar tarefas iniciais e configurar a escuta em tempo real
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
    
    // =====================================================================
    // Lógica de Realtime para ouvir por atualizações
    // =====================================================================
    
    const channel = supabase
      .channel('todos-updates')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'todos' }, (payload) => {
        // Quando uma atualização acontece, atualiza o estado da tarefa
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === payload.new.id ? payload.new : task
            )
        );
      })
      .subscribe();

    // Limpeza da subscrição ao sair do componente
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAddTask = async (text, category, description) => {
    try {
      const formData = new FormData();
      formData.append('text', text);
      formData.append('category', category);
      formData.append('description', description);

      const newTask = await addTodo(formData);
      if (newTask) {
        // Adiciona a tarefa ao estado imediatamente com um placeholder de carregamento
        const tempTask = {
            ...newTask,
            description: 'generating...'
        };
        setTasks((prevTasks) => [tempTask, ...prevTasks]);
        handleCloseModal();
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