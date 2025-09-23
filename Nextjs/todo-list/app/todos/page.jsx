'use client';

import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../App.css';

import { createClient } from '@supabase/supabase-js';
import { addTodo, deleteTodo, toggleTodo, clearAllTodos, getTodos, updateTodo } from '../todos/server/todo.actions';

import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Tasks from '../todos/_components/Tasks';
import ModalForm from '../todos/_components/ModalForm';
import LoginButton from '../todos/_components/LoginButton';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function TodosPage() {
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

// useEffect para checar a sessão do usuário
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          setUser(session.user);
        } else {
          setUser(null);
        }
      }
    );
    return () => {
      if (authListener) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  // useEffect para carregar as tarefas, só quando o usuário muda
  useEffect(() => {
    async function fetchInitialTasks() {
        if (user) {
            const fetchedTasks = await getTodos();
            setTasks(fetchedTasks);
        }
    }
    fetchInitialTasks();
  }, [user]);


  // Nova função para lidar com o logout
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('Erro ao sair:', error);
    }
    setTimeout(() => {
          window.location.reload();
        }, 1000);
  };

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
       setTimeout(() => {
          window.location.reload();
        }, 2000); // Recarrega a página após 2 segundos
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
      <Header onClear={handleClear} user={user} onLogout={handleLogout} />
      <main className="container mt-5 flex-grow-1 p-3">
        <h1 className="text-center fw-bold mb-4">Minhas tarefas:</h1>
        <div className="d-flex justify-content-center mb-3">
          {user ? (
            <button className="btn btn-add-task" onClick={() => {
              setEditingTask(null);
              setShowModal(true);
              setError(null);
            }}>
              Adicionar Tarefa
            </button>
          ) : (
            <LoginButton />
          )}
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