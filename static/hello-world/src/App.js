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

  // --- Funções de Diagrama (CORRIGIDAS PARA INDEPENDÊNCIA DE ÁREA) ---
  const addSwimlane = () => {
    const novo = { id: `s-${Date.now()}`, nome: 'Nova Área', cor: isDark ? '#2C333A' : '#F0F2F5' };
    setDiagrama({ ...diagrama, swimlanes: [...(diagrama.swimlanes || []), novo] });
  };

  const addNode = (swimlaneId, shape) => {
    if (!swimlaneId) {
      alert('Por favor, selecione uma Área primeiro.');
      return;
    }
    const novo = { 
      id: `n-${Date.now()}`, 
      swimlaneId,
      shape, 
      label: 'Novo Item', 
      color: shape === 'circle' ? '#36B37E' : shape === 'oval' ? '#0052CC' : '#FFAB00',
      textColor: '#FFFFFF'
    };
    setDiagrama({ ...diagrama, nodes: [...(diagrama.nodes || []), novo] });
  };

  const updateNode = (id, field, value) => {
    setDiagrama({
      ...diagrama,
      nodes: diagrama.nodes.map(n => n.id === id ? { ...n, [field]: value } : n)
    });
  };

  const addEdge = (from, to, label) => {
    if (!from || !to) return;
    const nova = { id: `e-${Date.now()}`, from, to, label: label || '' };
    setDiagrama({ ...diagrama, edges: [...(diagrama.edges || []), nova] });
  };

  const removeNode = (id) => {
    setDiagrama({
      ...diagrama,
      nodes: diagrama.nodes.filter(n => n.id !== id),
      edges: diagrama.edges.filter(e => e.from !== id && e.to !== id)
    });
  };

  const removeSwimlane = (id) => {
    setDiagrama({
      ...diagrama,
      swimlanes: diagrama.swimlanes.filter(s => s.id !== id),
      nodes: diagrama.nodes.filter(n => n.swimlaneId !== id),
      edges: diagrama.edges.filter(e => {
        const fromNode = diagrama.nodes.find(n => n.id === e.from);
        const toNode = diagrama.nodes.find(n => n.id === e.to);
        return fromNode?.swimlaneId !== id && toNode?.swimlaneId !== id;
      })
    });
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
    shape: (n) => ({
      padding: '10px',
      border: '2px solid rgba(0,0,0,0.1)',
      backgroundColor: n.color || '#DEEBFF',
      color: n.textColor || '#172B4D',
      textAlign: 'center',
      minWidth: '100px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      fontSize: '12px',
      borderRadius: n.shape === 'circle' ? '50%' : n.shape === 'oval' ? '40px' : '4px',
      height: n.shape === 'circle' ? '80px' : 'auto',
      width: n.shape === 'circle' ? '80px' : 'auto',
      position: 'relative',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
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
            <Tab>📐 Arquitetura</Tab>
            <Tab>⚙️ Customizações</Tab>
          </TabList>

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

          <TabPanel>
            <div style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <button onClick={addSwimlane} style={{ ...s.btn, backgroundColor: '#FFAB00' }}>+ Área (Swimlane)</button>
              </div>

              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ width: '280px', padding: '15px', backgroundColor: colors.card, borderRadius: '8px', border: `1px solid ${colors.border}`, maxHeight: '600px', overflowY: 'auto' }}>
                  <h4>Conectar Itens</h4>
                  <select id="fromN" style={{ ...s.input, width: '100%', marginBottom: '10px' }}>
                    <option value="">De...</option>
                    {diagrama.nodes.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
                  </select>
                  <select id="toN" style={{ ...s.input, width: '100%', marginBottom: '10px' }}>
                    <option value="">Para...</option>
                    {diagrama.nodes.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
                  </select>
                  <input id="labelE" style={{ ...s.input, width: '100%', marginBottom: '10px' }} placeholder="Texto na seta..." />
                  <button onClick={() => addEdge(document.getElementById('fromN').value, document.getElementById('toN').value, document.getElementById('labelE').value)} style={{ ...s.btn, width: '100%', marginBottom: '20px' }}>Ligar</button>

                  <h4 style={{ borderTop: `1px solid ${colors.border}`, paddingTop: '15px' }}>Itens Criados</h4>
                  {diagrama.nodes.map(n => (
                    <div key={n.id} style={{ marginBottom: '10px', padding: '10px', backgroundColor: colors.bg, borderRadius: '4px', fontSize: '11px' }}>
                      <input style={{ ...s.input, fontSize: '11px', marginBottom: '5px' }} value={n.label} onChange={e => updateNode(n.id, 'label', e.target.value)} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <input type="color" value={n.color} onChange={e => updateNode(n.id, 'color', e.target.value)} />
                        <button onClick={() => removeNode(n.id)} style={{ background: 'none', border: 'none', color: '#DE350B', cursor: 'pointer' }}>Excluir</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ flexGrow: 1, position: 'relative', minHeight: '600px', backgroundColor: isDark ? '#161B22' : '#F9F9F9', border: `1px solid ${colors.border}`, borderRadius: '8px', overflowX: 'auto', display: 'flex' }}>
                  {diagrama.swimlanes.map(sl => (
                    <div key={sl.id} style={{ borderRight: `2px dashed ${colors.border}`, minWidth: '300px', backgroundColor: sl.cor, position: 'relative' }}>
                      <div style={{ padding: '10px', backgroundColor: 'rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <input style={{ background: 'none', border: 'none', fontWeight: 'bold', width: '60%' }} value={sl.nome} onChange={e => setDiagrama({...diagrama, swimlanes: diagrama.swimlanes.map(x => x.id === sl.id ? {...x, nome: e.target.value} : x)})} />
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <input type="color" value={sl.cor} onChange={e => setDiagrama({...diagrama, swimlanes: diagrama.swimlanes.map(x => x.id === sl.id ? {...x, cor: e.target.value} : x)})} />
                          <button onClick={() => removeSwimlane(sl.id)} style={{ background: 'none', border: 'none', color: '#DE350B', cursor: 'pointer', fontSize: '14px' }}>×</button>
                        </div>
                      </div>
                      
                      <div style={{ padding: '10px', display: 'flex', gap: '5px', justifyContent: 'center', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                        <button onClick={() => addNode(sl.id, 'circle')} style={{ ...s.btn, fontSize: '10px', padding: '4px 8px' }}>+ Cir</button>
                        <button onClick={() => addNode(sl.id, 'rect')} style={{ ...s.btn, fontSize: '10px', padding: '4px 8px' }}>+ Ret</button>
                        <button onClick={() => addNode(sl.id, 'oval')} style={{ ...s.btn, fontSize: '10px', padding: '4px 8px' }}>+ Ova</button>
                      </div>

                      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '60px', alignItems: 'center' }}>
                        {diagrama.nodes.filter(n => n.swimlaneId === sl.id).map(n => (
                          <div key={n.id} style={{ position: 'relative' }}>
                            <div style={s.shape(n)}>
                              {n.label}
                            </div>
                            
                            {diagrama.edges.filter(e => e.from === n.id).map(e => {
                              const targetNode = diagrama.nodes.find(tn => tn.id === e.to);
                              return (
                                <div key={e.id} style={{ position: 'absolute', bottom: '-45px', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', width: '200px', zIndex: 1 }}>
                                  <div style={{ fontSize: '10px', color: colors.primary, fontWeight: 'bold', backgroundColor: 'rgba(255,255,255,0.8)', padding: '2px 5px', borderRadius: '4px' }}>
                                    {e.label} <span onClick={() => removeEdge(e.id)} style={{ cursor: 'pointer', color: '#DE350B' }}>×</span>
                                  </div>
                                  <div style={{ color: colors.primary, fontSize: '25px', marginTop: '-5px' }}>↓</div>
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {diagrama.swimlanes.length === 0 && <div style={{ padding: '40px', color: colors.secondary }}>Adicione uma Área (Swimlane) para começar.</div>}
                </div>
              </div>
            </div>
          </TabPanel>

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
                      <input style={{ ...s.input, width: '100%', marginBottom: '10px', marginTop: '10px' }} value={c.nome} onChange={e => setCustomizacoes(customizacoes.map(x => x.id === c.id ? {...x, nome: e.target.value} : x))} />
                      <textarea style={{ ...s.input, width: '100%', height: '150px', fontFamily: 'monospace', fontSize: '12px' }} value={c.codigo} onChange={e => setCustomizacoes(customizacoes.map(x => x.id === c.id ? {...x, codigo: e.target.value} : x))} placeholder="Código..." />
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
          <button type="submit" style={s.btn}>Cadastrar Empresa</button>
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
