import Resolver from '@forge/resolver';
import { storage } from '@forge/api';

const resolver = new Resolver();

// --- CLIENTES ---
resolver.define('getClientes', async () => {
  return await storage.get('clientes') || [];
});

resolver.define('addCliente', async ({ payload }) => {
  const clientes = await storage.get('clientes') || [];
  const novoCliente = { id: Date.now().toString(), nome: payload.nome };
  const novaLista = [...clientes, novoCliente];
  await storage.set('clientes', novaLista);
  return novaLista;
});

resolver.define('deleteCliente', async ({ payload }) => {
  const clientes = await storage.get('clientes') || [];
  const novaLista = clientes.filter(c => c.id !== payload.id);
  await storage.set('clientes', novaLista);
  await storage.delete(`details-${payload.id}`);
  return novaLista;
});

// --- DETALHES GERAIS ---
resolver.define('getClienteDetails', async ({ payload }) => {
  const details = await storage.get(`details-${payload.id}`) || {
    produtos: [],
    // Novo formato de fluxo visual (nós e conexões)
    fluxoVisual: { nodes: [], edges: [] },
    customizacoes: []
  };
  return details;
});

resolver.define('saveClienteDetails', async ({ payload }) => {
  const oldData = await storage.get(`details-${payload.id}`) || {};
  
  // Lógica de histórico aprimorada para customizações
  if (payload.details.customizacoes) {
    payload.details.customizacoes = payload.details.customizacoes.map(custom => {
      const oldCustom = (oldData.customizacoes || []).find(oc => oc.id === custom.id);
      
      // Se houve mudança significativa, registra no histórico
      if (oldCustom && (
          oldCustom.codigo !== custom.codigo || 
          oldCustom.objetivo !== custom.objetivo ||
          oldCustom.nome !== custom.nome
      )) {
        const history = oldCustom.history || [];
        const change = {
          date: new Date().toISOString(),
          user: payload.userName || 'Sistema',
          details: 'Atualização de código/objetivo',
          oldState: {
            codigo: oldCustom.codigo,
            objetivo: oldCustom.objetivo
          }
        };
        custom.history = [change, ...history].slice(0, 20); // Mantém as últimas 20 alterações
      } else if (!custom.history) {
        custom.history = [{ 
          date: new Date().toISOString(), 
          user: payload.userName || 'Sistema', 
          details: 'Criação inicial' 
        }];
      }
      return custom;
    });
  }

  await storage.set(`details-${payload.id}`, payload.details);
  return { success: true };
});

export const handler = resolver.getDefinitions();
