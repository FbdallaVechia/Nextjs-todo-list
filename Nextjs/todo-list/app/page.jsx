'use client';

import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css'; // Importando o CSS do bootstrap-icons
import './App.css';

import Header from '../components/Header';
import Footer from '../components/Footer';
import Tasks from '../components/Tasks';
import ModalForm from '../components/ModalForm';

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Carregar tarefas do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('tasks');
    if (saved) {
      setTasks(JSON.parse(saved));
    }
  }, []);

  // Salvar tarefas no localStorage
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (text, category = 'GERAL') => {
    const newTask = {
      id: Date.now(),
      text,
      category,
      completed: false
    };
    setTasks([...tasks, newTask]);
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  return (
    <>
      <Header onClear={() => setTasks([])} />
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
                key={task.id}
                tasks={task}
                onDelete={deleteTask}
                onToggle={toggleTask}
              />
            ))
          )}
        </div>

        <ModalForm
          show={showModal}
          onClose={() => setShowModal(false)}
          addTask={addTask}
        />
      </main>
      <Footer />
    </>
  );
}
