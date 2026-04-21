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
  const [diagrama, setDiagrama] = useState({ swimlanes: [], nodes: [], edges: [] });
  const [customizacoes, setCustomizacoes] = useState([]);
  const [expandedCustom, setExpandedCustom] = useState(null);

  useEffect(() => {
    view.getContext().then(context => {
      if (context && context.theme) {
        const currentTheme = context.theme.colorMode || 'light';
        setTheme(currentTheme);
        setGlobalTheme(currentTheme);
      }
    }).catch(e => console.error(e));
    loadClientes();
  }, []);

  const loadClientes = async () => {
    try {
      const data = await invoke('getClientes');
      setRegistros(Array.isArray(data) ? data : []);
    } catch (e) { setRegistros([]); }
    finally { setLoading(false); }
  };

  const handleSelectCliente = async (cliente) => {
    setLoading(true);
    setSelectedCliente(cliente);
    try {
      const data = await invoke('getClienteDetails', { id: cliente.id });
      setProdutos(data.produtos || []);
      setDiagrama(data.diagrama || { swimlanes: [], nodes: [], edges: [] });
      setCustomizacoes(data.customizacoes || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    await invoke('saveClienteDetails', { 
      id: selectedCliente.id, 
      userName: 'Usuário Jira',
      details: { produtos, diagrama, customizacoes } 
    });
    alert('Controle Técnico salvo!');
  };

  // --- Funções de Diagrama Avançado ---
  const addSwimlane = () => {
    const novo = { id: `s-${Date.now()}`, nome: 'Nova Área', cor: '#E6FCFF' };
    setDiagrama({ ...diagrama, swimlanes: [...(diagrama.swimlanes || []), novo] });
  };

  const addNode = (shape) => {
    const novo = { id: `n-${Date.now()}`, shape, label: 'Novo Item', x: 0, y: 0, color: '#DEEBFF' };
    setDiagrama({ ...diagrama, nodes: [...(diagrama.nodes || []), novo] });
  };

  const addEdge = (from, to, label) => {
    if (!from || !to) return;
    const nova = { id: `e-${Date.now()}`, from, to, label: label || '' };
    setDiagrama({ ...diagrama, edges: [...(diagrama.edges || []), nova] });
  };

  const isDark = theme === 'dark';
  const colors = {
    bg: isDark ? '#1D2125' : '#FFFFFF',
    text: isDark ? '#B3B9C4' : '#172B4D',
    card: isDark ? '#22272B' : '#F4F5F7',
    border: isDark ? '#353A44' : '#DFE1E6',
    primary: '#0052CC'
  };

  const s = {
    container: { padding: '20px', backgroundColor: colors.bg, color: colors.text, minHeight: '100vh', fontFamily: 'sans-serif' },
    btn: { padding: '8px 15px', backgroundColor: colors.primary, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
    input: { padding: '8px', border: `1px solid ${colors.border}`, borderRadius: '4px', backgroundColor: isDark ? '#1D2125' : '#FFF', color: colors.text },
    shape: (shape, color) => ({
      padding: '10px',
      border: '2px solid #0052CC',
      backgroundColor: color || '#DEEBFF',
      color: '#172B4D',
      textAlign: 'center',
      minWidth: '80px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      fontSize: '12px',
      borderRadius: shape === 'circle' ? '50%' : shape === 'oval' ? '40px' : '4px',
      height: shape === 'circle' ? '60px' : 'auto',
      width: shape === 'circle' ? '60px' : 'auto',
    })
  };

  if (selectedCliente) {
    return (
      <div style={s.container}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <button onClick={() => setSelectedCliente(null)} style={{ ...s.btn, backgroundColor: '#6B778C' }}>← Voltar</button>
          <h2>{selectedCliente.nome}</h2>
          <button onClick={handleSave} style={s.btn}>Salvar Tudo</button>
        </div>

        <Tabs>
          <TabList>
            <Tab>📦 Produtos</Tab>
            <Tab>📐 Arquitetura Avançada</Tab>
            <Tab>⚙️ Customizações</Tab>
          </TabList>

          {/* ABA ARQUITETURA AVANÇADA */}
          <TabPanel>
            <div style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <button onClick={addSwimlane} style={{ ...s.btn, backgroundColor: '#FFAB00' }}>+ Swimlane (Área)</button>
                <button onClick={() => addNode('circle')} style={s.btn}>+ Círculo (Início/Fim)</button>
                <button onClick={() => addNode('rect')} style={s.btn}>+ Retângulo (Processo)</button>
                <button onClick={() => addNode('oval')} style={s.btn}>+ Oval (DB/App)</button>
              </div>

              <div style={{ display: 'flex', gap: '20px' }}>
                {/* Ferramentas de Conexão */}
                <div style={{ width: '250px', padding: '15px', backgroundColor: colors.card, borderRadius: '8px', border: `1px solid ${colors.border}` }}>
                  <h4>Criar Conexão</h4>
                  <select id="fromN" style={{ ...s.input, width: '100%', marginBottom: '10px' }}>
                    <option value="">De...</option>
                    {diagrama.nodes.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
                  </select>
                  <select id="toN" style={{ ...s.input, width: '100%', marginBottom: '10px' }}>
                    <option value="">Para...</option>
                    {diagrama.nodes.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
                  </select>
                  <input id="labelE" style={{ ...s.input, width: '100%', marginBottom: '10px' }} placeholder="Texto na seta..." />
                  <button onClick={() => addEdge(document.getElementById('fromN').value, document.getElementById('toN').value, document.getElementById('labelE').value)} style={{ ...s.btn, width: '100%' }}>Conectar</button>
                </div>

                {/* Área do Diagrama */}
                <div style={{ flexGrow: 1, position: 'relative', minHeight: '600px', backgroundColor: isDark ? '#161B22' : '#F9F9F9', border: `1px solid ${colors.border}`, borderRadius: '8px', overflow: 'auto', padding: '20px' }}>
                  {/* Swimlanes */}
                  <div style={{ display: 'flex', gap: '5px', height: '100%' }}>
                    {diagrama.swimlanes.map(sl => (
                      <div key={sl.id} style={{ border: `2px dashed ${colors.border}`, minWidth: '250px', padding: '10px', backgroundColor: isDark ? '#1D2125' : sl.cor }}>
                        <input style={{ background: 'none', border: 'none', fontWeight: 'bold', width: '100%' }} value={sl.nome} onChange={e => setDiagrama({...diagrama, swimlanes: diagrama.swimlanes.map(x => x.id === sl.id ? {...x, nome: e.target.value} : x)})} />
                        
                        {/* Itens dentro da Swimlane (Simulado por proximidade) */}
                        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '40px', alignItems: 'center' }}>
                          {diagrama.nodes.map(n => (
                            <div key={n.id} style={{ position: 'relative' }}>
                              <div style={s.shape(n.shape, n.color)}>
                                <input style={{ background: 'none', border: 'none', textAlign: 'center', width: '100%', fontSize: '11px' }} value={n.label} onChange={e => setDiagrama({...diagrama, nodes: diagrama.nodes.map(x => x.id === n.id ? {...x, label: e.target.value} : x)})} />
                              </div>
                              {/* Setas de Saída */}
                              {diagrama.edges.filter(e => e.from === n.id).map(e => (
                                <div key={e.id} style={{ position: 'absolute', bottom: '-35px', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', width: '150px' }}>
                                  <div style={{ fontSize: '10px', color: colors.primary, fontWeight: 'bold' }}>{e.label}</div>
                                  <div style={{ color: colors.primary, fontSize: '20px' }}>↓</div>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    {diagrama.swimlanes.length === 0 && <div style={{ padding: '40px', color: colors.secondary }}>Adicione uma Swimlane para começar a organizar sua arquitetura.</div>}
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>

          {/* ABA PRODUTOS (Layout Melhorado) */}
          <TabPanel>
            <div style={{ marginTop: '20px' }}>
              <button onClick={() => setProdutos([...produtos, { id: Date.now().toString(), nome: 'Novo Produto', cor: '#0052CC', tipo: 'Cloud', modulos: [] }])} style={s.btn}>+ Novo Produto</button>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
                {produtos.map(p => (
                  <div key={p.id} style={{ backgroundColor: colors.card, borderRadius: '12px', borderTop: `10px solid ${p.cor}`, padding: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <input style={{ ...s.input, width: '60%', fontWeight: 'bold' }} value={p.nome} onChange={e => setProdutos(produtos.map(x => x.id === p.id ? {...x, nome: e.target.value} : x))} />
                      <span style={{ fontSize: '10px', backgroundColor: p.tipo === 'Cloud' ? '#E3FCEF' : '#FFF0B3', padding: '4px 8px', borderRadius: '10px', color: '#172B4D' }}>{p.tipo}</span>
                    </div>
                    <div style={{ fontSize: '12px', marginBottom: '10px' }}>
                      <strong>Módulos:</strong>
                      {p.modulos.map(m => <div key={m.id} style={{ padding: '4px', borderBottom: `1px solid ${colors.border}` }}>• {m.nome}</div>)}
                      <button onClick={() => setProdutos(produtos.map(x => x.id === p.id ? {...x, modulos: [...x.modulos, {id: Date.now().toString(), nome: 'Novo'}]} : x))} style={{ border: 'none', background: 'none', color: colors.primary, cursor: 'pointer', fontSize: '11px' }}>+ Add</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabPanel>

          {/* ABA CUSTOMIZAÇÕES (Histórico Expansível) */}
          <TabPanel>
            <div style={{ marginTop: '20px' }}>
              <button onClick={() => setCustomizacoes([...customizacoes, { id: Date.now().toString(), nome: 'Nova Custom', cor: '#FFAB00', objetivo: '', codigo: '', history: [] }])} style={s.btn}>+ Nova Customização</button>
              {customizacoes.map(c => (
                <div key={c.id} style={{ backgroundColor: colors.card, marginBottom: '10px', borderRadius: '8px', borderLeft: `6px solid ${c.cor}` }}>
                  <div style={{ padding: '15px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }} onClick={() => setExpandedCustom(expandedCustom === c.id ? null : c.id)}>
                    <strong>{c.nome}</strong>
                    <span>{expandedCustom === c.id ? '▲' : '▼'}</span>
                  </div>
                  {expandedCustom === c.id && (
                    <div style={{ padding: '0 15px 15px 15px', borderTop: `1px solid ${colors.border}` }}>
                      <label style={{ fontSize: '11px' }}>Objetivo:</label>
                      <textarea style={{ ...s.input, width: '100%', height: '50px', marginBottom: '10px' }} value={c.objetivo} onChange={e => setCustomizacoes(customizacoes.map(x => x.id === c.id ? {...x, objetivo: e.target.value} : x))} />
                      <label style={{ fontSize: '11px' }}>Código da Customização:</label>
                      <textarea style={{ ...s.input, width: '100%', height: '150px', fontFamily: 'monospace', fontSize: '12px' }} value={c.codigo} onChange={e => setCustomizacoes(customizacoes.map(x => x.id === c.id ? {...x, codigo: e.target.value} : x))} />
                      <div style={{ marginTop: '10px', fontSize: '10px', color: colors.secondary }}>
                        <strong>Histórico:</strong>
                        {c.history.map((h, i) => <div key={i}>{new Date(h.date).toLocaleString()} - {h.user}: {h.details}</div>)}
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
      <h1 style={{ color: colors.primary }}>🛠️ Controle Técnico</h1>
      <div style={{ backgroundColor: colors.card, padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <form onSubmit={(e) => { e.preventDefault(); if(nomeCliente) invoke('addCliente', { nome: nomeCliente }).then(loadClientes); setNomeCliente(''); }}>
          <input style={{ ...s.input, width: '300px', marginRight: '10px' }} value={nomeCliente} onChange={e => setNomeCliente(e.target.value)} placeholder="Nome do Cliente..." />
          <button type="submit" style={s.btn}>Cadastrar</button>
        </form>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
        {registros.map(item => (
          <div key={item.id} style={{ backgroundColor: colors.card, padding: '20px', borderRadius: '8px', cursor: 'pointer', border: `1px solid ${colors.border}` }} onClick={() => handleSelectCliente(item)}>
            <h3 style={{ margin: 0, color: colors.primary }}>{item.nome}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
