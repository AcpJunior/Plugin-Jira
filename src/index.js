import Resolver from '@forge/resolver';
import { storage } from '@forge/api';

const resolver = new Resolver();

// Obter lista de clientes
resolver.define('getClientes', async () => {
  return await storage.get('clientes') || [];
});

// Adicionar cliente
resolver.define('addCliente', async ({ payload }) => {
  const clientes = await storage.get('clientes') || [];
  const novoCliente = { id: Date.now().toString(), nome: payload.nome };
  const novaLista = [...clientes, novoCliente];
  await storage.set('clientes', novaLista);
  return novaLista;
});

// Excluir cliente e seus detalhes
resolver.define('deleteCliente', async ({ payload }) => {
  const clientes = await storage.get('clientes') || [];
  const novaLista = clientes.filter(c => c.id !== payload.id);
  await storage.set('clientes', novaLista);
  await storage.delete(`details-${payload.id}`);
  return novaLista;
});

// Obter detalhes específicos de um cliente
resolver.define('getClienteDetails', async ({ payload }) => {
  return await storage.get(`details-${payload.id}`) || {
    produtos: '',
    fluxo: 'graph TD\n  A[Origem] --> B[Base]',
    customizacoes: ''
  };
});

// Salvar detalhes de um cliente
resolver.define('saveClienteDetails', async ({ payload }) => {
  await storage.set(`details-${payload.id}`, payload.details);
  return { success: true };
});

export const handler = resolver.getDefinitions();
