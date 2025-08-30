// app/todos/server/todo.actions.js

'use server'; // Indica que este código deve ser executado apenas no lado do servidor.

import { createClient } from '@supabase/supabase-js';

// =========================================================================
// 1. Configuração do Cliente Supabase
// =========================================================================

// As chaves são lidas de .env.local e estão disponíveis apenas no servidor.
// Esta é a forma segura de conectar ao banco de dados.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('As variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devem estar definidas.');
}

// Cria uma única instância do cliente Supabase para ser reutilizada.
const supabase = createClient(supabaseUrl, supabaseKey);

// =========================================================================
// 2. Server Actions para Gerenciamento de Tarefas
// =========================================================================

/**
 * Busca todas as tarefas do banco de dados.
 * @returns {Promise<Array<Object>>} Um array de objetos de tarefa.
 */
export async function getTodos() {
  console.log('Server Action: Buscando todas as tarefas do Supabase...');
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar tarefas do Supabase:', error);
    throw new Error('Falha ao buscar tarefas. Por favor, tente novamente.');
  }

  return data;
}

/**
 * Adiciona uma nova tarefa ao banco de dados Supabase, verificando se o título já existe.
 * @param {FormData} formData - Contém 'text', 'category' e 'description'.
 * @returns {Promise<Object>} O objeto da nova tarefa inserida.
 */
export async function addTodo(formData) {
  console.log('Server Action: Adicionando nova tarefa...');
  const text = formData.get('text');
  const category = formData.get('category') || 'Lazer';
  const description = formData.get('description') || '';

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    throw new Error('O texto da tarefa não pode estar vazio.');
  }

  // PASSO DE VALIDAÇÃO: Verifica se já existe uma tarefa com o mesmo título
  const { data: existingTask, error: existingError } = await supabase
    .from('todos')
    .select('id')
    .eq('text', text.trim());

  if (existingError) {
    console.error('Erro ao verificar tarefa duplicada:', existingError);
    throw new Error('Falha ao verificar tarefa. Por favor, tente novamente.');
  }

  if (existingTask && existingTask.length > 0) {
    throw new Error('Já existe uma tarefa com este título.');
  }

  const { data, error } = await supabase
    .from('todos')
    .insert([
      { 
        text: text.trim(), 
        category: category.trim(), 
        description: description.trim(), 
        completed: false 
      }
    ])
    .select(); // Retorna o registro da nova tarefa, incluindo o ID

  if (error) {
    console.error('Erro ao adicionar tarefa no Supabase:', error);
    throw new Error('Falha ao adicionar tarefa. Por favor, tente novamente.');
  }

  console.log('Server Action: Tarefa adicionada no Supabase:', data[0]);
  return data[0];
}

/**
 * Alterna o status 'completed' de uma tarefa.
 * @param {string} id - O ID da tarefa.
 * @returns {Promise<Object>} A tarefa com o status atualizado.
 */
export async function toggleTodo(id) {
  console.log(`Server Action: Alternando o status da tarefa ${id}...`);
  const { data: currentTask, error: fetchError } = await supabase
    .from('todos')
    .select('completed')
    .eq('id', id)
    .single();

  if (fetchError || !currentTask) {
    throw new Error('Tarefa não encontrada para alternar o status.');
  }

  const { data, error } = await supabase
    .from('todos')
    .update({ completed: !currentTask.completed })
    .eq('id', id)
    .select();

  if (error) {
    console.error('Erro ao alternar status da tarefa no Supabase:', error);
    throw new Error('Falha ao alternar status da tarefa. Por favor, tente novamente.');
  }

  return data[0];
}

/**
 * Deleta uma tarefa específica.
 * @param {string} id - O ID da tarefa.
 * @returns {Promise<boolean>} Retorna `true` se a exclusão for bem-sucedida.
 */
export async function deleteTodo(id) {
  console.log(`Server Action: Deletando tarefa ${id}...`);
  const { error } = await supabase
    .from('todos')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao deletar tarefa no Supabase:', error);
    throw new Error('Falha ao deletar tarefa. Por favor, tente novamente.');
  }

  return true;
}

/**
 * Atualiza os campos 'text', 'category' e 'description' de uma tarefa.
 * @param {FormData} formData - Contém 'id', 'text', 'category' e 'description'.
 * @returns {Promise<Object>} A tarefa com os campos atualizados.
 */
export async function updateTodo(formData) {
  console.log(`Server Action: Atualizando tarefa ${formData.get('id')}...`);
  const id = formData.get('id');
  const text = formData.get('text');
  const category = formData.get('category');
  const description = formData.get('description');

  if (!id || typeof id !== 'string' || !text || typeof text !== 'string' || text.trim().length === 0) {
    throw new Error('ID ou texto da tarefa inválido.');
  }
  
  const updates = { 
    text: text.trim(),
    description: description.trim()
  };
  if (typeof category === 'string' && category.trim().length > 0) {
    updates.category = category.trim();
  }

  const { data, error } = await supabase
    .from('todos')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) {
    console.error('Erro ao atualizar tarefa no Supabase:', error);
    throw new Error('Falha ao atualizar tarefa. Por favor, tente novamente.');
  }

  if (!data || data.length === 0) {
    throw new Error('Tarefa não encontrada para atualização.');
  }

  return data[0];
}

/**
 * Limpa todas as tarefas do banco de dados.
 * @returns {Promise<boolean>} Retorna `true` se a limpeza for bem-sucedida.
 */
export async function clearAllTodos() {
  console.log('Server Action: Limpando todas as tarefas...');
  const { error } = await supabase
    .from('todos')
    .delete()
    .not('id', 'is.null'); // Método confiável para deletar todas as linhas

  if (error) {
    console.error('Erro ao limpar todas as tarefas no Supabase:', error);
    throw new Error('Falha ao limpar todas as tarefas. Por favor, tente novamente.');
  }

  return true;
}