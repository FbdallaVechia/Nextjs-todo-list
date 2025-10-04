'use server';

// 1. Importa a nova função para criar o cliente do servidor
import { createSupabaseServerClient } from '../../../utils/supabase/server';

// =========================================================================
// 2. Server Actions para Gerenciamento de Tarefas
// =========================================================================

/**
 * Busca as tarefas do usuário logado no banco de dados.
 * @returns {Promise<Array<Object>>} Um array de objetos de tarefa.
 */
export async function getTodos() {
  // Cria uma instância do cliente que age em nome do usuário
  const supabase = createSupabaseServerClient();

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
 * Adiciona uma nova tarefa ao banco de dados Supabase para o usuário logado.
 * @param {FormData} formData - Contém 'text', 'category' e 'description'.
 * @returns {Promise<Object>} O objeto da nova tarefa inserida.
 */
export async function addTodo(formData) {
  const supabase = createSupabaseServerClient();

  console.log('Server Action: Adicionando nova tarefa...');
  const text = formData.get('text');
  const category = formData.get('category') || 'Lazer';
  const description = formData.get('description') || '';

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    throw new Error('O texto da tarefa não pode estar vazio.');
  }

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
    .select();

  if (error) {
    console.error('Erro ao adicionar tarefa no Supabase:', error);
    throw new Error('Falha ao adicionar tarefa. Por favor, tente novamente.');
  }

  console.log('Server Action: Tarefa adicionada no Supabase:', data[0]);
  return data[0];
}

/**
 * Alterna o status 'completed' de uma tarefa do usuário logado.
 * @param {string} id - O ID da tarefa.
 * @returns {Promise<Object>} A tarefa com o status atualizado.
 */
export async function toggleTodo(id) {
  const supabase = createSupabaseServerClient();

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
 * Deleta uma tarefa específica do usuário logado.
 * @param {string} id - O ID da tarefa.
 * @returns {Promise<boolean>} Retorna `true` se a exclusão for bem-sucedida.
 */
export async function deleteTodo(id) {
  const supabase = createSupabaseServerClient();

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
 * Atualiza os campos de uma tarefa do usuário logado.
 * @param {FormData} formData - Contém 'id', 'text', 'category' e 'description'.
 * @returns {Promise<Object>} A tarefa com os campos atualizados.
 */
export async function updateTodo(formData) {
  const supabase = createSupabaseServerClient();

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
 * Limpa todas as tarefas do usuário logado.
 * @returns {Promise<boolean>} Retorna `true` se a limpeza for bem-sucedida.
 */
export async function clearAllTodos() {
  const supabase = createSupabaseServerClient();

  console.log('Server Action: Limpando todas as tarefas...');
  // IMPORTANTE: A política de RLS para DELETE garante que isso só vai
  // deletar as tarefas do usuário logado, mesmo sem um .eq() aqui.
  const { error } = await supabase
    .from('todos')
    .delete()
    .not('id', 'is.null');

  if (error) {
    console.error('Erro ao limpar todas as tarefas no Supabase:', error);
    throw new Error('Falha ao limpar todas as tarefas. Por favor, tente novamente.');
  }

  return true;
}