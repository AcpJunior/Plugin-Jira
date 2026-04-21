import Resolver from '@forge/resolver';
import { storage } from '@forge/api';

const resolver = new Resolver();

// Função para obter a lista de clientes
resolver.define('getClientes', async () => {
  return await storage.get('clientes') || [];
});

// Função para adicionar um novo cliente
resolver.define('addCliente', async ({ payload }) => {
  const clientes = await storage.get('clientes') || [];
  const novoCliente = { id: Date.now().toString(), nome: payload.nome };
  const novaLista = [...clientes, novoCliente];
  await storage.set('clientes', novaLista);
  return novaLista;
});

// Função para remover um cliente
resolver.define('deleteCliente', async ({ payload }) => {
  const clientes = await storage.get('clientes') || [];
  const novaLista = clientes.filter(c => c.id !== payload.id);
  await storage.set('clientes', novaLista);
  return novaLista;
});

// Retorna o texto para a UI principal
resolver.define('getText', async (req) => {
    const clientes = await storage.get('clientes') || [];
    return { clientes };
});

export const handler = resolver.getDefinitions();
