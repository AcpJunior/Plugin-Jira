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

  // --- Funções de Diagrama ---
  const addSwimlane = () => {
    const novo = { id: `s-${Date.now()}`, nome: 'Nova Área', cor: '#E6FCFF', nodes: [] };
    setDiagrama({ ...diagrama, swimlanes: [...(diagrama.swimlanes || []), novo] });
  };

  const addNodeToSwimlane = (swimlaneId, shape) => {
    const newNode = { id: `n-${Date.now()}`, shape, label: 'Novo Item', color: '#DEEBFF' };
    setDiagrama({
      ...diagrama,
      swimlanes: diagrama.swimlanes.map(sl => 
        sl.id === swimlaneId ? { ...sl, nodes: [...(sl.nodes || []), newNode] } : sl
      )
    });
  };

  const updateNode = (swimlaneId, nodeId, field, value) => {
    setDiagrama({
      ...diagrama,
      swimlanes: diagrama.swimlanes.map(sl => 
        sl.id === swimlaneId ? { 
          ...sl, 
          nodes: sl.nodes.map(n => n.id === nodeId ? { ...n, [field]: value } : n) 
        } : sl
      )
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
    shape: (shape, color) => ({
      padding: '10px',
      border: '2px solid #0052CC',
      backgroundColor: color || '#DEEBFF',
      color: '#172B4D',
      textAlign: 'center',
      minWidth: '80px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      fontSize: '11px',
      borderRadius: shape === 'circle' ? '50%' : shape === 'oval' ? '40px' : '4px',
      height: shape === 'circle' ? '70px' : 'auto',
      width: shape === 'circle' ? '70px' : 'auto',
      marginBottom: '10px'
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

          {/* ABA 1: PRODUTOS */}
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

          {/* ABA 2: ARQUITETURA */}
          <TabPanel>
            <div style={{ marginTop: '20px' }}>
              <button onClick={addSwimlane} style={{ ...s.btn, backgroundColor: '#FFAB00', marginBottom: '20px' }}>+ Adicionar Área (Swimlane)</button>
              
              <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '20px' }}>
                {diagrama.swimlanes.map(sl => (
                  <div key={sl.id} style={{ border: `2px dashed ${colors.border}`, minWidth: '300px', padding: '15px', backgroundColor: isDark ? '#1D2125' : sl.cor, borderRadius: '8px' }}>
                    <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
                      <input style={{ background: 'none', border: 'none', fontWeight: 'bold', flexGrow: 1 }} value={sl.nome} onChange={e => setDiagrama({...diagrama, swimlanes: diagrama.swimlanes.map(x => x.id === sl.id ? {...x, nome: e.target.value} : x)})} />
                      <input type="color" value={sl.cor} onChange={e => setDiagrama({...diagrama, swimlanes: diagrama.swimlanes.map(x => x.id === sl.id ? {...x, cor: e.target.value} : x)})} style={{ width: '25px', height: '25px' }} />
                    </div>
                    
                    <div style={{ display: 'flex', gap: '5px', marginBottom: '20px' }}>
                      <button onClick={() => addNodeToSwimlane(sl.id, 'circle')} style={{ ...s.btn, fontSize: '10px', padding: '4px' }}>+ Cir</button>
                      <button onClick={() => addNodeToSwimlane(sl.id, 'rect')} style={{ ...s.btn, fontSize: '10px', padding: '4px' }}>+ Ret</button>
                      <button onClick={() => addNodeToSwimlane(sl.id, 'oval')} style={{ ...s.btn, fontSize: '10px', padding: '4px' }}>+ Ova</button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
                      {(sl.nodes || []).map(n => (
                        <div key={n.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                          <div style={s.shape(n.shape, n.color)}>
                            <input 
                              style={{ background: 'none', border: 'none', textAlign: 'center', width: '100%', fontSize: '10px', fontWeight: 'bold' }} 
                              value={n.label} 
                              onChange={e => updateNode(sl.id, n.id, 'label', e.target.value)} 
                            />
                            <input 
                              type="color" 
                              value={n.color} 
                              onChange={e => updateNode(sl.id, n.id, 'color', e.target.value)} 
                              style={{ width: '15px', height: '15px', border: 'none', marginTop: '5px' }} 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '11px', color: colors.secondary, marginTop: '10px' }}>* Clique nos textos e cores para personalizar cada item individualmente.</p>
            </div>
          </TabPanel>

          {/* ABA 3: CUSTOMIZAÇÕES */}
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
                      <input style={{ ...s.input, width: '100%', marginBottom: '10px', marginTop: '10px' }} value={c.nome} onChange={e => setCustomizacoes(customizacoes.map(x => x.id === c.id ? {...x, nome: e.target.value} : x))} placeholder="Nome" />
                      <textarea style={{ ...s.input, width: '100%', height: '50px', marginBottom: '10px' }} value={c.objetivo} onChange={e => setCustomizacoes(customizacoes.map(x => x.id === c.id ? {...x, objetivo: e.target.value} : x))} placeholder="Objetivo" />
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
