import React, { useEffect, useState, useRef } from 'react';
import { invoke, view } from '@forge/bridge';
import { setGlobalTheme } from '@atlaskit/tokens';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import mermaid from 'mermaid';

// Configuração do Mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
});

function App() {
  const [registros, setRegistros] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('light');
  
  // Estados para as abas
  const [produtos, setProdutos] = useState('');
  const [fluxoCode, setFluxoCode] = useState('graph TD\n  A[Origem] --> B[Base]');
  const [customizacoes, setCustomizacoes] = useState('');
  
  const mermaidRef = useRef(null);

  useEffect(() => {
    // Sincronizar tema com o Jira
    view.getContext().then(context => {
      const currentTheme = context.theme?.colorMode || 'light';
      setTheme(currentTheme);
      setGlobalTheme(currentTheme);
    });

    invoke('getClientes').then((data) => {
      setRegistros(data || []);
      setLoading(false);
    });
  }, []);

  // Renderizar Mermaid quando o código mudar ou a aba mudar
  useEffect(() => {
    if (selectedCliente && mermaidRef.current) {
      mermaidRef.current.removeAttribute('data-processed');
      mermaid.contentLoaded();
    }
  }, [fluxoCode, selectedCliente]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!nome.trim()) return;
    const novaLista = await invoke('addCliente', { nome: nome.trim() });
    setRegistros(novaLista);
    setNome('');
  };

  const handleSelectCliente = async (cliente) => {
    setLoading(true);
    setSelectedCliente(cliente);
    // Buscar dados específicos do cliente
    const data = await invoke('getClienteDetails', { id: cliente.id });
    setProdutos(data.produtos || '');
    setFluxoCode(data.fluxo || 'graph TD\n  A[Origem] --> B[Base]');
    setCustomizacoes(data.customizacoes || '');
    setLoading(false);
  };

  const handleSaveDetails = async () => {
    await invoke('saveClienteDetails', { 
      id: selectedCliente.id, 
      details: { produtos, fluxo: fluxoCode, customizacoes } 
    });
    alert('Dados salvos com sucesso!');
  };

  const handleDelete = async (id) => {
    const novaLista = await invoke('deleteCliente', { id });
    setRegistros(novaLista);
    if (selectedCliente?.id === id) setSelectedCliente(null);
  };

  if (loading && !selectedCliente) return <div style={{ padding: '20px' }}>Carregando...</div>;

  // Estilos baseados no tema
  const isDark = theme === 'dark';
  const styles = {
    container: {
      padding: '30px',
      backgroundColor: isDark ? '#1D2125' : '#FFFFFF',
      color: isDark ? '#B3B9C4' : '#172B4D',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    },
    card: {
      backgroundColor: isDark ? '#22272B' : '#F4F5F7',
      border: `1px solid ${isDark ? '#353A44' : '#DFE1E6'}`,
      padding: '20px',
      borderRadius: '8px',
      marginBottom: '20px'
    },
    input: {
      padding: '10px',
      backgroundColor: isDark ? '#22272B' : '#FFFFFF',
      color: isDark ? '#B3B9C4' : '#172B4D',
      border: `2px solid ${isDark ? '#353A44' : '#DFE1E6'}`,
      borderRadius: '4px',
      width: '100%'
    },
    button: {
      padding: '10px 20px',
      backgroundColor: '#0052CC',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontWeight: 'bold'
    },
    secondaryButton: {
      padding: '6px 12px',
      backgroundColor: 'transparent',
      color: '#DE350B',
      border: '1px solid #DE350B',
      borderRadius: '3px',
      cursor: 'pointer'
    }
  };

  if (selectedCliente) {
    return (
      <div style={styles.container}>
        <button onClick={() => setSelectedCliente(null)} style={{ ...styles.button, marginBottom: '20px', backgroundColor: '#6B778C' }}>
          ← Voltar ao Diretório
        </button>
        <h2>{selectedCliente.nome} - Controle Detalhado</h2>
        
        <Tabs>
          <TabList>
            <Tab>Produtos</Tab>
            <Tab>Fluxograma</Tab>
            <Tab>Customizações</Tab>
          </TabList>

          <TabPanel>
            <div style={{ marginTop: '20px' }}>
              <h3>Descrição dos Produtos</h3>
              <textarea 
                style={{ ...styles.input, height: '200px', marginBottom: '10px' }}
                value={produtos}
                onChange={(e) => setProdutos(e.target.value)}
                placeholder="Descreva os produtos que o cliente possui..."
              />
            </div>
          </TabPanel>
          
          <TabPanel>
            <div style={{ marginTop: '20px' }}>
              <h3>Fluxo do Ambiente</h3>
              <p style={{ fontSize: '12px', color: '#6B778C' }}>Use a sintaxe Mermaid (ex: A --> B)</p>
              <div style={{ display: 'flex', gap: '20px' }}>
                <textarea 
                  style={{ ...styles.input, height: '300px', width: '40%' }}
                  value={fluxoCode}
                  onChange={(e) => setFluxoCode(e.target.value)}
                />
                <div style={{ flexGrow: 1, backgroundColor: 'white', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}>
                  <div className="mermaid" ref={mermaidRef}>
                    {fluxoCode}
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>

          <TabPanel>
            <div style={{ marginTop: '20px' }}>
              <h3>Objetos Customizados</h3>
              <textarea 
                style={{ ...styles.input, height: '200px', marginBottom: '10px' }}
                value={customizacoes}
                onChange={(e) => setCustomizacoes(e.target.value)}
                placeholder="Documente aqui as customizações realizadas..."
              />
            </div>
          </TabPanel>
        </Tabs>
        
        <button onClick={handleSaveDetails} style={{ ...styles.button, marginTop: '20px' }}>
          Salvar Todas as Alterações
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={{ color: '#0052CC' }}>🛠️ Controle Técnico</h1>
      
      <div style={styles.card}>
        <h3>Novo Registro</h3>
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            value={nome} 
            onChange={(e) => setNome(e.target.value)} 
            placeholder="Nome do Cliente"
            style={styles.input}
          />
          <button type="submit" style={styles.button}>Cadastrar</button>
        </form>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: `2px solid ${isDark ? '#353A44' : '#EBECF0'}` }}>
            <th style={{ padding: '12px' }}>Cliente</th>
            <th style={{ padding: '12px' }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {registros.map((item) => (
            <tr key={item.id} style={{ borderBottom: `1px solid ${isDark ? '#353A44' : '#EBECF0'}` }}>
              <td style={{ padding: '12px', fontWeight: 'bold', cursor: 'pointer', color: '#0052CC' }} onClick={() => handleSelectCliente(item)}>
                {item.nome}
              </td>
              <td style={{ padding: '12px' }}>
                <button onClick={() => handleDelete(item.id)} style={styles.secondaryButton}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
