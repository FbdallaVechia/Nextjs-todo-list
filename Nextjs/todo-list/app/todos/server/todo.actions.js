'use server';

import { createSupabaseServerClient } from '../../../utils/supabase/server';

// =========================================================================
// Server Actions para Gerenciamento de Tarefas
// =========================================================================

/**
 * Busca as tarefas do usuário logado no banco de dados.
 * @returns {Promise<Array<Object>>} Um array de objetos de tarefa.
 */
export async function getTodos() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from('todos').select('*').order('created_at', { ascending: false });
  if (error) { 
    console.error('Erro ao buscar tarefas:', error);
    throw new Error('Falha ao buscar tarefas.'); 
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

  // 1. Pega os dados da sessão de forma segura, renomeando 'data' para 'sessionData'
  const { data: sessionData, error: authError } = await supabase.auth.getUser();

  // 2. Verifica se houve erro ou se o usuário não foi encontrado
  if (authError || !sessionData?.user) {
    console.error('Erro de autenticação na Server Action:', authError);
    throw new Error('Acesso negado: não foi possível verificar o usuário.');
  }
  
  // 3. Agora podemos usar o usuário com segurança a partir de 'sessionData'
  const user = sessionData.user;

  const text = formData.get('text');
  const category = formData.get('category') || 'Lazer';
  const description = formData.get('description') || '';

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    throw new Error('O texto da tarefa não pode estar vazio.');
  }

  const { data: existingTask, error: existingError } = await supabase
    .from('todos')
    .select('id')
    .eq('text', text.trim())
    .eq('user_id', user.id); 

  if (existingError) {
    console.error('Erro ao verificar tarefa duplicada:', existingError);
    throw new Error('Falha ao verificar tarefa. Por favor, tente novamente.');
  }

  if (existingTask && existingTask.length > 0) {
    throw new Error('Você já possui uma tarefa com este título.');
  }

  // Renomeia o segundo 'data' para 'newTaskData' para evitar conflito
  const { data: newTaskData, error } = await supabase
    .from('todos')
    .insert([
      { 
        text: text.trim(), 
        category: category.trim(), 
        description: description.trim(), 
        completed: false,
        user_id: user.id 
      }
    ])
    .select();

  if (error) {
    console.error('Erro ao adicionar tarefa no Supabase:', error);
    throw new Error('Falha ao adicionar tarefa. Por favor, tente novamente.');
  }

  // Retorna o resultado a partir da nova variável 'newTaskData'
  return newTaskData[0];
}


/**
 * Alterna o status 'completed' de uma tarefa do usuário logado.
 * @param {string} id - O ID da tarefa.
 * @returns {Promise<Object>} A tarefa com o status atualizado.
 */
export async function toggleTodo(id) {
  const supabase = createSupabaseServerClient();
  const { data: currentTask, error: fetchError } = await supabase.from('todos').select('completed').eq('id', id).single();
  if (fetchError) { 
    console.error('Erro ao buscar tarefa para alternar status:', fetchError);
    throw new Error('Tarefa não encontrada.'); 
  }
  const { data, error } = await supabase.from('todos').update({ completed: !currentTask.completed }).eq('id', id).select();
  if (error) { 
    console.error('Erro ao alternar status da tarefa:', error);
    throw new Error('Falha ao alternar status da tarefa.'); 
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
  const { error } = await supabase.from('todos').delete().eq('id', id);
  if (error) { 
    console.error('Erro ao deletar tarefa:', error);
    throw new Error('Falha ao deletar tarefa.'); 
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
  const id = formData.get('id');
  const text = formData.get('text');
  const category = formData.get('category');
  const description = formData.get('description');
  if (!id || !text) { throw new Error('ID ou texto da tarefa inválido.'); }
  
  const updates = { 
    text: text.trim(),
    description: description ? description.trim() : ''
  };
  if (category) { 
    updates.category = category.trim(); 
  }
  
  const { data, error } = await supabase.from('todos').update(updates).eq('id', id).select();
  if (error || !data || !data.length === 0) { 
    console.error('Erro ao atualizar tarefa:', error);
    throw new Error('Falha ao atualizar tarefa.'); 
  }
  return data[0];
}

/**
 * Limpa todas as tarefas do usuário logado.
 * @returns {Promise<boolean>} Retorna `true` se a limpeza for bem-sucedida.
 */
export async function clearAllTodos() {
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from('todos').delete().not('id', 'is.null');
  if (error) { 
    console.error('Erro ao limpar todas as tarefas:', error);
    throw new Error('Falha ao limpar todas as tarefas.'); 
  }
  return true;
}