import React, { useEffect, useState } from 'react';
import { invoke, view } from '@forge/bridge';
import { setGlobalTheme } from '@atlaskit/tokens';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

function App() {
  const [registros, setRegistros] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [nomeCliente, setNomeCliente] = useState('');
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('light');
  
  // Estados dos Detalhes
  const [produtos, setProdutos] = useState([]);
  const [fluxoVisual, setFluxoVisual] = useState({ nodes: [], edges: [] });
  const [customizacoes, setCustomizacoes] = useState([]);
  const [expandedCustom, setExpandedCustom] = useState(null);

  useEffect(() => {
    view.getContext().then(context => {
      const currentTheme = context.theme?.colorMode || 'light';
      setTheme(currentTheme);
      setGlobalTheme(currentTheme);
    });
    loadClientes();
  }, []);

  const loadClientes = async () => {
    const data = await invoke('getClientes');
    setRegistros(data || []);
    setLoading(false);
  };

  const handleSelectCliente = async (cliente) => {
    setLoading(true);
    setSelectedCliente(cliente);
    const data = await invoke('getClienteDetails', { id: cliente.id });
    setProdutos(data.produtos || []);
    setFluxoVisual(data.fluxoVisual || { nodes: [], edges: [] });
    setCustomizacoes(data.customizacoes || []);
    setLoading(false);
  };

  const handleSave = async () => {
    await invoke('saveClienteDetails', { 
      id: selectedCliente.id, 
      userName: 'Usuário Jira',
      details: { produtos, fluxoVisual, customizacoes } 
    });
    alert('Controle Técnico salvo com sucesso!');
  };

  // --- Funções de Produto ---
  const addProduto = () => {
    const novo = { id: Date.now().toString(), nome: 'Novo Produto', cor: '#0052CC', tipo: 'Cloud', modulos: [] };
    setProdutos([...produtos, novo]);
  };

  const addModulo = (prodId) => {
    setProdutos(produtos.map(p => p.id === prodId ? { ...p, modulos: [...p.modulos, { id: Date.now().toString(), nome: 'Novo Módulo' }] } : p));
  };

  // --- Funções de Fluxo Visual (Simplificado) ---
  const addNode = (type) => {
    const newNode = { id: `n-${Date.now()}`, type, label: type.toUpperCase() };
    setFluxoVisual({ ...fluxoVisual, nodes: [...fluxoVisual.nodes, newNode] });
  };

  const addEdge = (fromId, toId) => {
    if (!fromId || !toId || fromId === toId) return;
    const newEdge = { id: `e-${Date.now()}`, from: fromId, to: toId };
    setFluxoVisual({ ...fluxoVisual, edges: [...fluxoVisual.edges, newEdge] });
  };

  // --- Funções de Customização ---
  const addCustom = () => {
    const novo = { 
      id: Date.now().toString(), 
      nome: 'Nova Customização', 
      cor: '#FFAB00', 
      codigo: '', 
      objetivo: '', 
      criador: 'Desenvolvedor', 
      requisitante: 'Cliente',
      history: []
    };
    setCustomizacoes([...customizacoes, novo]);
    setExpandedCustom(novo.id);
  };

  const isDark = theme === 'dark';
  const colors = {
    bg: isDark ? '#1D2125' : '#FFFFFF',
    text: isDark ? '#B3B9C4' : '#172B4D',
    card: isDark ? '#22272B' : '#F4F5F7',
    border: isDark ? '#353A44' : '#DFE1E6',
    primary: '#0052CC',
    secondary: '#6B778C'
  };

  const s = {
    container: { padding: '30px', backgroundColor: colors.bg, color: colors.text, minHeight: '100vh', fontFamily: 'sans-serif' },
    card: { backgroundColor: colors.card, border: `1px solid ${colors.border}`, padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
    input: { padding: '10px', backgroundColor: isDark ? '#1D2125' : '#FFFFFF', color: colors.text, border: `1px solid ${colors.border}`, borderRadius: '6px', width: '100%' },
    btn: { padding: '10px 20px', backgroundColor: colors.primary, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' }
  };

  if (selectedCliente) {
    return (
      <div style={s.container}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <button onClick={() => setSelectedCliente(null)} style={{ ...s.btn, backgroundColor: colors.secondary }}>← Voltar ao Diretório</button>
          <h2 style={{ margin: 0, color: colors.primary }}>{selectedCliente.nome}</h2>
          <button onClick={handleSave} style={s.btn}>Salvar Alterações</button>
        </div>

        <Tabs>
          <TabList style={{ borderBottom: `2px solid ${colors.border}` }}>
            <Tab style={{ padding: '12px 24px', cursor: 'pointer' }}>📦 Produtos & Módulos</Tab>
            <Tab style={{ padding: '12px 24px', cursor: 'pointer' }}>📊 Arquitetura Visual</Tab>
            <Tab style={{ padding: '12px 24px', cursor: 'pointer' }}>⚙️ Customizações & Código</Tab>
          </TabList>

          {/* ABA PRODUTOS */}
          <TabPanel>
            <div style={{ marginTop: '25px' }}>
              <button onClick={addProduto} style={{ ...s.btn, marginBottom: '20px' }}>+ Adicionar Produto</button>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                {produtos.map(p => (
                  <div key={p.id} style={{ ...s.card, borderTop: `8px solid ${p.cor}`, position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                      <input style={{ ...s.input, width: '60%', fontWeight: 'bold' }} value={p.nome} onChange={e => setProdutos(produtos.map(x => x.id === p.id ? {...x, nome: e.target.value} : x))} />
                      <select style={{ ...s.input, width: '35%' }} value={p.tipo} onChange={e => setProdutos(produtos.map(x => x.id === p.id ? {...x, tipo: e.target.value} : x))}>
                        <option>Cloud</option>
                        <option>Local</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                      <label style={{ fontSize: '12px' }}>Cor do Card:</label>
                      <input type="color" value={p.cor} onChange={e => setProdutos(produtos.map(x => x.id === p.id ? {...x, cor: e.target.value} : x))} />
                    </div>
                    <div style={{ backgroundColor: isDark ? '#1D2125' : '#FFFFFF', padding: '10px', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 'bold' }}>MÓDULOS</span>
                        <button onClick={() => addModulo(p.id)} style={{ fontSize: '10px', background: 'none', border: 'none', color: colors.primary, cursor: 'pointer' }}>+ ADD</button>
                      </div>
                      {p.modulos.map(m => (
                        <input key={m.id} style={{ ...s.input, marginBottom: '5px', fontSize: '13px' }} value={m.nome} onChange={e => {
                          const newMods = p.modulos.map(mod => mod.id === m.id ? { ...mod, nome: e.target.value } : mod);
                          setProdutos(produtos.map(x => x.id === p.id ? {...x, modulos: newMods} : x));
                        }} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabPanel>

          {/* ABA FLUXO VISUAL */}
          <TabPanel>
            <div style={{ marginTop: '25px' }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button onClick={() => addNode('Servidor')} style={{ ...s.btn, backgroundColor: '#4C9AFF' }}>+ Servidor</button>
                <button onClick={() => addNode('DB')} style={{ ...s.btn, backgroundColor: '#36B37E' }}>+ Banco de Dados</button>
                <button onClick={() => addNode('Origem')} style={{ ...s.btn, backgroundColor: '#FF5630' }}>+ Origem</button>
              </div>
              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ width: '250px', ...s.card }}>
                  <h4>Conectar Nós</h4>
                  <p style={{ fontSize: '11px' }}>Selecione os IDs para criar uma ligação:</p>
                  <select id="fromNode" style={{ ...s.input, marginBottom: '10px' }}>
                    <option value="">De...</option>
                    {fluxoVisual.nodes.map(n => <option key={n.id} value={n.id}>{n.label} ({n.id.slice(-4)})</option>)}
                  </select>
                  <select id="toNode" style={{ ...s.input, marginBottom: '10px' }}>
                    <option value="">Para...</option>
                    {fluxoVisual.nodes.map(n => <option key={n.id} value={n.id}>{n.label} ({n.id.slice(-4)})</option>)}
                  </select>
                  <button onClick={() => addEdge(document.getElementById('fromNode').value, document.getElementById('toNode').value)} style={{ ...s.btn, width: '100%' }}>Ligar</button>
                </div>
                <div style={{ flexGrow: 1, ...s.card, minHeight: '400px', display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'center', justifyContent: 'center' }}>
                  {fluxoVisual.nodes.map(n => (
                    <div key={n.id} style={{ padding: '20px', borderRadius: '10px', border: `2px solid ${colors.primary}`, backgroundColor: colors.bg, textAlign: 'center', minWidth: '100px', position: 'relative' }}>
                      <div style={{ fontSize: '10px', color: colors.secondary }}>{n.id.slice(-4)}</div>
                      <div style={{ fontWeight: 'bold' }}>{n.label}</div>
                      {fluxoVisual.edges.filter(e => e.from === n.id).map(e => (
                        <div key={e.id} style={{ position: 'absolute', top: '50%', right: '-40px', color: colors.primary, fontSize: '20px' }}>→</div>
                      ))}
                    </div>
                  ))}
                  {fluxoVisual.nodes.length === 0 && <p>Nenhum componente na arquitetura. Adicione acima.</p>}
                </div>
              </div>
            </div>
          </TabPanel>

          {/* ABA CUSTOMIZAÇÕES */}
          <TabPanel>
            <div style={{ marginTop: '25px' }}>
              <button onClick={addCustom} style={{ ...s.btn, marginBottom: '20px' }}>+ Nova Customização</button>
              {customizacoes.map(c => (
                <div key={c.id} style={{ ...s.card, borderLeft: `8px solid ${c.cor}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setExpandedCustom(expandedCustom === c.id ? null : c.id)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <span style={{ fontSize: '20px' }}>{expandedCustom === c.id ? '▼' : '▶'}</span>
                      <h3 style={{ margin: 0 }}>{c.nome || 'Sem Nome'}</h3>
                    </div>
                    <div style={{ color: colors.secondary, fontSize: '12px' }}>Criado por: {c.criador}</div>
                  </div>

                  {expandedCustom === c.id && (
                    <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: `1px solid ${colors.border}` }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Nome da Custom:</label>
                          <input style={s.input} value={c.nome} onChange={e => setCustomizacoes(customizacoes.map(x => x.id === c.id ? {...x, nome: e.target.value} : x))} />
                        </div>
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Cor Identificadora:</label>
                          <input type="color" value={c.cor} style={{ display: 'block' }} onChange={e => setCustomizacoes(customizacoes.map(x => x.id === c.id ? {...x, cor: e.target.value} : x))} />
                        </div>
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Objetivo:</label>
                          <textarea style={{ ...s.input, height: '60px' }} value={c.objetivo} onChange={e => setCustomizacoes(customizacoes.map(x => x.id === c.id ? {...x, objetivo: e.target.value} : x))} />
                        </div>
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Requisitante / Solicitante:</label>
                          <input style={s.input} value={c.requisitante} onChange={e => setCustomizacoes(customizacoes.map(x => x.id === c.id ? {...x, requisitante: e.target.value} : x))} />
                        </div>
                      </div>

                      <div style={{ marginBottom: '20px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 'bold' }}>REPOSITÓRIO DE CÓDIGO:</label>
                        <textarea style={{ ...s.input, height: '200px', fontFamily: 'monospace', fontSize: '12px', backgroundColor: isDark ? '#161B22' : '#F6F8FA' }} 
                          value={c.codigo} 
                          onChange={e => setCustomizacoes(customizacoes.map(x => x.id === c.id ? {...x, codigo: e.target.value} : x))}
                          placeholder="// Cole aqui o código da customização..."
                        />
                      </div>

                      <div style={{ backgroundColor: isDark ? '#1D2125' : '#EBECF0', padding: '15px', borderRadius: '8px' }}>
                        <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Histórico de Alterações</h4>
                        {c.history && c.history.map((h, i) => (
                          <div key={i} style={{ fontSize: '11px', borderBottom: `1px solid ${colors.border}`, padding: '5px 0' }}>
                            <strong>{new Date(h.date).toLocaleString()}</strong> - {h.user}: {h.details}
                          </div>
                        ))}
                        {(!c.history || c.history.length === 0) && <p style={{ fontSize: '11px' }}>Nenhuma alteração registrada.</p>}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabPanel>
        </Tabs>
      </div>
    );
  }

  return (
    <div style={s.container}>
      <h1 style={{ color: colors.primary, marginBottom: '40px' }}>🛠️ Controle Técnico</h1>
      <div style={s.card}>
        <h3>Gestão de Clientes</h3>
        <form onSubmit={handleAddCliente} style={{ display: 'flex', gap: '15px' }}>
          <input style={{ ...s.input, flexGrow: 1 }} value={nomeCliente} onChange={e => setNomeCliente(e.target.value)} placeholder="Digite o nome da empresa/cliente..." />
          <button type="submit" style={s.btn}>Cadastrar Empresa</button>
        </form>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {registros.map(item => (
          <div key={item.id} style={{ ...s.card, cursor: 'pointer', transition: '0.2s' }} onClick={() => handleSelectCliente(item)} onMouseOver={e => e.currentTarget.style.borderColor = colors.primary} onMouseOut={e => e.currentTarget.style.borderColor = colors.border}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: colors.primary, marginBottom: '10px' }}>{item.nome}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: colors.secondary }}>ID: {item.id.slice(-6)}</span>
              <button onClick={(e) => { e.stopPropagation(); invoke('deleteCliente', { id: item.id }).then(loadClientes); }} style={{ background: 'none', border: 'none', color: '#DE350B', cursor: 'pointer', fontSize: '12px' }}>Excluir</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
