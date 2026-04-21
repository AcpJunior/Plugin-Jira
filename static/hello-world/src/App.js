import React, { useEffect, useState, useRef } from 'react';
import { invoke, view } from '@forge/bridge';
import { setGlobalTheme, token } from '@atlaskit/tokens';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import mermaid from 'mermaid';

mermaid.initialize({ startOnLoad: false, theme: 'default', securityLevel: 'loose' });

function App() {
  const [registros, setRegistros] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [nomeCliente, setNomeCliente] = useState('');
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('light');
  const [userName, setUserName] = useState('');

  // Estados dos Detalhes
  const [produtos, setProdutos] = useState([]);
  const [fluxoCode, setFluxoCode] = useState('');
  const [customizacoes, setCustomizacoes] = useState([]);

  const mermaidRef = useRef(null);

  useEffect(() => {
    view.getContext().then(context => {
      const currentTheme = context.theme?.colorMode || 'light';
      setTheme(currentTheme);
      setGlobalTheme(currentTheme);
      // Em um app real, buscaríamos o nome do usuário do contexto
      setUserName('Usuário Jira');
    });

    loadClientes();
  }, []);

  useEffect(() => {
    if (selectedCliente && mermaidRef.current) {
      mermaidRef.current.removeAttribute('data-processed');
      try {
        mermaid.contentLoaded();
      } catch (e) {
        console.error("Erro Mermaid:", e);
      }
    }
  }, [fluxoCode, selectedCliente]);

  const loadClientes = async () => {
    const data = await invoke('getClientes');
    setRegistros(data || []);
    setLoading(false);
  };

  const handleAddCliente = async (e) => {
    e.preventDefault();
    if (!nomeCliente.trim()) return;
    const novaLista = await invoke('addCliente', { nome: nomeCliente.trim() });
    setRegistros(novaLista);
    setNomeCliente('');
  };

  const handleSelectCliente = async (cliente) => {
    setLoading(true);
    setSelectedCliente(cliente);
    const data = await invoke('getClienteDetails', { id: cliente.id });
    setProdutos(data.produtos || []);
    setFluxoCode(data.fluxo || 'graph LR\n  S1[Servidor Origem] --> S2[Servidor Destino]');
    setCustomizacoes(data.customizacoes || []);
    setLoading(false);
  };

  const handleSave = async () => {
    await invoke('saveClienteDetails', { 
      id: selectedCliente.id, 
      userName,
      details: { produtos, fluxo: fluxoCode, customizacoes } 
    });
    alert('Controle Técnico atualizado com sucesso!');
  };

  // --- Funções de Produto ---
  const addProduto = () => {
    const novo = { id: Date.now().toString(), nome: '', cor: '#0052CC', tipo: 'Cloud', modulos: [] };
    setProdutos([...produtos, novo]);
  };

  const updateProduto = (id, field, value) => {
    setProdutos(produtos.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const addModulo = (prodId) => {
    setProdutos(produtos.map(p => p.id === prodId ? { ...p, modulos: [...p.modulos, { id: Date.now().toString(), nome: '' }] } : p));
  };

  // --- Funções de Customização ---
  const addCustom = () => {
    const novo = { 
      id: Date.now().toString(), 
      nome: '', 
      cor: '#FFAB00', 
      objetos: '', 
      objetivo: '', 
      criador: userName, 
      requisitante: '',
      history: []
    };
    setCustomizacoes([...customizacoes, novo]);
  };

  const updateCustom = (id, field, value) => {
    setCustomizacoes(customizacoes.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const isDark = theme === 'dark';
  const s = {
    container: { padding: '30px', backgroundColor: isDark ? '#1D2125' : '#FFFFFF', color: isDark ? '#B3B9C4' : '#172B4D', minHeight: '100vh' },
    card: { backgroundColor: isDark ? '#22272B' : '#F4F5F7', border: `1px solid ${isDark ? '#353A44' : '#DFE1E6'}`, padding: '20px', borderRadius: '8px', marginBottom: '20px' },
    input: { padding: '8px', backgroundColor: isDark ? '#22272B' : '#FFFFFF', color: isDark ? '#B3B9C4' : '#172B4D', border: `1px solid ${isDark ? '#353A44' : '#DFE1E6'}`, borderRadius: '4px' },
    btn: { padding: '8px 16px', backgroundColor: '#0052CC', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }
  };

  if (selectedCliente) {
    return (
      <div style={s.container}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <button onClick={() => setSelectedCliente(null)} style={{ ...s.btn, backgroundColor: '#6B778C' }}>← Voltar</button>
          <h2 style={{ margin: 0 }}>{selectedCliente.nome}</h2>
          <button onClick={handleSave} style={s.btn}>Salvar Tudo</button>
        </div>

        <Tabs>
          <TabList>
            <Tab>📦 Produtos</Tab>
            <Tab>📊 Fluxograma</Tab>
            <Tab>⚙️ Customizações</Tab>
          </TabList>

          <TabPanel>
            <div style={{ marginTop: '20px' }}>
              <button onClick={addProduto} style={{ ...s.btn, marginBottom: '20px' }}>+ Novo Produto</button>
              {produtos.map(p => (
                <div key={p.id} style={{ ...s.card, borderLeft: `6px solid ${p.cor}` }}>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <input style={{ ...s.input, flexGrow: 1 }} value={p.nome} onChange={e => updateProduto(p.id, 'nome', e.target.value)} placeholder="Nome do Produto" />
                    <input type="color" value={p.cor} onChange={e => updateProduto(p.id, 'cor', e.target.value)} style={{ width: '40px' }} />
                    <select style={s.input} value={p.tipo} onChange={e => updateProduto(p.id, 'tipo', e.target.value)}>
                      <option>Cloud</option>
                      <option>Local</option>
                    </select>
                  </div>
                  <div style={{ marginLeft: '20px' }}>
                    <h5 style={{ margin: '10px 0' }}>Módulos:</h5>
                    {p.modulos.map(m => (
                      <input key={m.id} style={{ ...s.input, width: '200px', marginRight: '10px', marginBottom: '5px' }} value={m.nome} 
                        onChange={e => {
                          const newMods = p.modulos.map(mod => mod.id === m.id ? { ...mod, nome: e.target.value } : mod);
                          updateProduto(p.id, 'modulos', newMods);
                        }} placeholder="Nome do Módulo" />
                    ))}
                    <button onClick={() => addModulo(p.id)} style={{ ...s.btn, padding: '4px 8px', fontSize: '12px' }}>+ Add Módulo</button>
                  </div>
                </div>
              ))}
            </div>
          </TabPanel>

          <TabPanel>
            <div style={{ marginTop: '20px' }}>
              <p style={{ fontSize: '12px', color: '#6B778C' }}>Edite o código Mermaid para alterar o fluxo de arquitetura:</p>
              <div style={{ display: 'flex', gap: '20px' }}>
                <textarea style={{ ...s.input, height: '400px', width: '40%', fontFamily: 'monospace' }} value={fluxoCode} onChange={e => setFluxoCode(e.target.value)} />
                <div style={{ flexGrow: 1, backgroundColor: 'white', padding: '20px', borderRadius: '4px', border: '1px solid #ddd', minHeight: '400px' }}>
                  <div className="mermaid" ref={mermaidRef}>{fluxoCode}</div>
                </div>
              </div>
            </div>
          </TabPanel>

          <TabPanel>
            <div style={{ marginTop: '20px' }}>
              <button onClick={addCustom} style={{ ...s.btn, marginBottom: '20px' }}>+ Nova Customização</button>
              {customizacoes.map(c => (
                <div key={c.id} style={{ ...s.card, borderLeft: `6px solid ${c.cor}` }}>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                    <input style={{ ...s.input, flexGrow: 1 }} value={c.nome} onChange={e => updateCustom(c.id, 'nome', e.target.value)} placeholder="Nome da Customização" />
                    <input type="color" value={c.cor} onChange={e => updateCustom(c.id, 'cor', e.target.value)} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <textarea style={{ ...s.input, height: '80px' }} value={c.objetos} onChange={e => updateCustom(c.id, 'objetos', e.target.value)} placeholder="Objetos Envolvidos" />
                    <textarea style={{ ...s.input, height: '80px' }} value={c.objetivo} onChange={e => updateCustom(c.id, 'objetivo', e.target.value)} placeholder="Objetivo da Custom" />
                    <input style={s.input} value={c.requisitante} onChange={e => updateCustom(c.id, 'requisitante', e.target.value)} placeholder="Requisitante" />
                    <div style={{ fontSize: '12px', color: '#6B778C' }}>Criado por: {c.criador}</div>
                  </div>
                  {c.history && c.history.length > 0 && (
                    <div style={{ marginTop: '15px', padding: '10px', backgroundColor: isDark ? '#1D2125' : '#EBECF0', borderRadius: '4px' }}>
                      <h6 style={{ margin: '0 0 5px 0' }}>Histórico de Alterações:</h6>
                      {c.history.map((h, i) => <div key={i} style={{ fontSize: '10px' }}>{new Date(h.date).toLocaleString()} - {h.user}: {h.diff}</div>)}
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
      <h1 style={{ color: '#0052CC' }}>🛠️ Controle Técnico</h1>
      <div style={s.card}>
        <h3>Diretório de Clientes</h3>
        <form onSubmit={handleAddCliente} style={{ display: 'flex', gap: '10px' }}>
          <input style={{ ...s.input, flexGrow: 1 }} value={nomeCliente} onChange={e => setNomeCliente(e.target.value)} placeholder="Novo Cliente..." />
          <button type="submit" style={s.btn}>Cadastrar</button>
        </form>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          {registros.map(item => (
            <tr key={item.id} style={{ borderBottom: `1px solid ${isDark ? '#353A44' : '#EBECF0'}` }}>
              <td style={{ padding: '15px', fontWeight: 'bold', cursor: 'pointer', color: '#0052CC' }} onClick={() => handleSelectCliente(item)}>{item.nome}</td>
              <td style={{ padding: '15px', textAlign: 'right' }}>
                <button onClick={() => invoke('deleteCliente', { id: item.id }).then(loadClientes)} style={{ ...s.btn, backgroundColor: '#DE350B' }}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
