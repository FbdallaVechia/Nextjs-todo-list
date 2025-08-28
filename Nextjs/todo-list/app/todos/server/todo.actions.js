'use server'; // o código contido aqui deve ser executado apenas no servidor 

import { createClient } from '@supabase/supabase-js'; // da biblioteca do Supabase

// Inicialização do Cliente Supabase
// Usando variáveis de ambiente para segurança.
// As chaves são acessíveis no servidor, onde esta Server Action é executada.
const supabaseUrl = process.env.SUPABASE_URL; //process.env é um objeto especial do Node.js que contém todas as variáveis de ambiente disponíveis para o processo

const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; //Esta chave tem privilégios elevados no Supabase e nunca deve ser usada diretamente no lado do cliente

// Verifica se as variáveis de ambiente estão definidas
// Se supabaseUrl for uma string vazia (''), null, undefined (que é o caso se a variável de ambiente não foi carregada), ou 0, esses valores são considerados "falsy" em JavaScript 
// Aplicar ! a um valor "falsy" resulta em true
if (!supabaseUrl || !supabaseKey) {
  throw new Error('As variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devem estar definidas.');
}

// Cria o cliente Supabase. Esta instância é reutilizada para todas as ações.
// será usada para todas as operações subsequentes de banco de dados (buscar, adicionar, etc.)
const supabase = createClient(supabaseUrl, supabaseKey);

// =========================================================================
// Server Actions para Gerenciamento de Tarefas com Supabase
// =========================================================================

/**
 * Busca todas as tarefas do banco de dados Supabase.
 * @returns {Promise<Array<Object>>} Uma promessa que resolve para um array de tarefas.
 * async: Indica que a função é assíncrona e retornará uma Promise. Isso é necessário porque a comunicação com o banco de dados (Supabase) leva tempo e não deve bloquear a execução do código.
 */
export async function getTodos() {
  console.log('Server Action: Buscando todas as tarefas do Supabase...'); //Linha para depuração. Você verá esta mensagem no terminal onde seu servidor Next.js está rodando, indicando que a ação está sendo executada no servidor
  const { data, error } = await supabase // desestruturação de objeto (Object Destructuring) em JavaScript
  // O SDK do Supabase retorna consistentemente objetos com as propriedades data e error
    .from('todos') // 'todos' é o nome da sua tabela no Supabase
    .select('*')    // Seleciona todas as colunas
    .order('created_at', { ascending: false }); // Ordena pelas mais recentes primeiro

  if (error) {
    console.error('Erro ao buscar tarefas do Supabase:', error);
    // Este erro pode ser capturado por um bloco try...catch no lado do cliente 
    throw new Error('Falha ao buscar tarefas. Por favor, tente novamente.');
  }

  return data; //data conterá um array de objetos de tarefa, que será retornado para o page.jsx para ser exibid
}

/**
 * Adiciona uma nova tarefa ao banco de dados Supabase.
 * Recebe um FormData, o formato comum para dados de formulários com Server Actions.
 * @param {FormData} formData - Os dados do formulário contendo 'text' e 'category' e 'description'.
 * @returns {Promise<Object>} Uma promessa que resolve para o objeto da nova tarefa inserida.
 */
export async function addTodo(formData) {
  const text = formData.get('text'); //Quando você chama uma Server Action a partir de um formulário HTML padrão o Next.js automaticamente coleta os dados do formulário em um objeto FormData e o passa para a Server Action
  const category = formData.get('category') || 'Lazer'; //define 'Lazer' como padrão se não for fornecido
  const description = formData.get('description') || '';

  // Validação básica
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    console.error('Server Action Error: Texto da tarefa inválido.');
    throw new Error('O texto da tarefa não pode estar vazio.');
  }

  // Insere a nova tarefa na tabela 'todos'
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
    .select(); // '.select()' é importante para obter os dados da linha inserida (incluindo o ID gerado pelo DB)

  if (error) {
    console.error('Erro ao adicionar tarefa no Supabase:', error);
    throw new Error('Falha ao adicionar tarefa. Por favor, tente novamente.');
  }

  console.log('Server Action: Tarefa adicionada no Supabase:', data[0]);
  return data[0]; // Retorna o primeiro (e único) item inserido
}

/**
 * Alterna o status 'completed' de uma tarefa específica no Supabase.
 * @param {string} id - O ID da tarefa a ser alternada (UUID do Supabase).
 * @returns {Promise<Object | null>} Uma promessa que resolve para a tarefa atualizada, ou null se não encontrada.
 */
export async function toggleTodo(id) {
  // O ID do Supabase é um UUID (string), não um número.
  // Não precisamos de parseInt(id) aqui, apenas validamos se é uma string válida de UUID, se necessário.

  // Primeiro, busca o estado atual para inverter (IMPORTANTE para toggle)
  const { data: currentTask, error: fetchError } = await supabase // data: currentTask é uma renomeação de variável durante a desestruturação
    .from('todos')
    .select('completed')
    .eq('id', id)
    .single(); // Espera um único resultado para o ID

  if (fetchError || !currentTask) {
    console.error('Erro ao buscar tarefa para toggle no Supabase:', fetchError || 'Tarefa não encontrada.');
    throw new Error('Tarefa não encontrada para alternar o status.');
  }

  // Atualiza a coluna 'completed' da tarefa
  const { data, error } = await supabase
    .from('todos')
    .update({ completed: !currentTask.completed }) // Inverte o estado
    .eq('id', id) // Condição WHERE: atualiza onde o 'id' é igual ao 'id' fornecido
    .select(); // Retorna os dados da tarefa atualizada

  if (error) {
    console.error('Erro ao alternar status da tarefa no Supabase:', error);
    throw new Error('Falha ao alternar status da tarefa. Por favor, tente novamente.');
  }

  console.log('Server Action: Tarefa alternada no Supabase:', data[0]);
  return data[0];
}

/**
 * Deleta uma tarefa específica do banco de dados Supabase.
 * @param {string} id - O ID da tarefa a ser deletada (UUID do Supabase).
 * @returns {Promise<boolean>} Uma promessa que resolve para true se a tarefa foi deletada, false caso contrário.
 */
export async function deleteTodo(id) {
  // Não precisamos de parseInt(id) aqui, pois o ID do Supabase é um UUID (string).

  const { error } = await supabase
    .from('todos')
    .delete()
    .eq('id', id); // Deleta a linha onde o 'id' é igual ao 'id' fornecido

  if (error) {
    console.error('Erro ao deletar tarefa no Supabase:', error);
    throw new Error('Falha ao deletar tarefa. Por favor, tente novamente.');
  }

  console.log(`Server Action: Tarefa com ID ${id} deletada do Supabase.`);
  return true; // Retorna true para indicar que a operação foi bem-sucedida
}

/**
 * Atualiza os campos 'text' e 'category' de uma tarefa específica no Supabase.
 * @param {FormData} formData - Deve conter 'id', 'text' 'category' e 'description'..
 * @returns {Promise<Object>} Uma promessa que resolve para a tarefa atualizada.
 */
export async function updateTodo(formData) {
  const id = formData.get('id');
  const text = formData.get('text');
  const category = formData.get('category');
  const description = formData.get('description');

  if (!id || typeof id !== 'string') {
    throw new Error('ID da tarefa inválido.');
  }

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    throw new Error('O texto da tarefa não pode estar vazio.');
  }

  const updates = { 
    text: text.trim(),
    description: description.trim() // Adiciona a descrição à atualização
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

  console.log('Server Action: Tarefa atualizada no Supabase:', data[0]);
  return data[0];
}

/**
 * Limpa todas as tarefas do banco de dados Supabase.
 * ATENÇÃO: Em uma aplicação de produção com autenticação, você deletaria apenas as tarefas do usuário logado.
 * @returns {Promise<boolean>} Uma promessa que resolve para true se as tarefas foram limpas com sucesso.
 */
export async function clearAllTodos() {
  // Deleta todas as linhas da tabela 'todos'. Use com cautela!
  // A condição `neq('id', '00000000-0000-0000-0000-000000000000')` é uma maneira de "selecionar todas as linhas"
  // para deletar, assumindo que nenhum ID real será esse.
  const { error } = await supabase
    .from('todos')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (error) {
    console.error('Erro ao limpar todas as tarefas no Supabase:', error);
    throw new Error('Falha ao limpar todas as tarefas. Por favor, tente novamente.');
  }

  console.log('Server Action: Todas as tarefas limpas no Supabase.');
  return true;
}