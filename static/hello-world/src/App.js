import React, { useEffect, useState } from 'react';
import { invoke } from '@forge/bridge';

function App() {
  const [registros, setRegistros] = useState([]);
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    invoke('getClientes').then((data) => {
      setRegistros(data || []);
      setLoading(false);
    });
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!nome.trim()) return;
    const novaLista = await invoke('addCliente', { nome: nome.trim() });
    setRegistros(novaLista);
    setNome('');
  };

  const handleDelete = async (id) => {
    const novaLista = await invoke('deleteCliente', { id });
    setRegistros(novaLista);
  };

  if (loading) return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' 
    }}>
      <div style={{ color: '#6B778C' }}>Carregando Controle Técnico...</div>
    </div>
  );

  return (
    <div style={{ 
      padding: '40px', 
      backgroundColor: '#FFFFFF', 
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      color: '#172B4D'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '32px',
        borderBottom: '2px solid #EBECF0',
        paddingBottom: '16px'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: '#0747A6' }}>
            🛠️ Controle Técnico
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#6B778C', fontSize: '14px' }}>
            Gerencie o diretório de registros técnicos e clientes
          </p>
        </div>
        <div style={{ fontSize: '12px', backgroundColor: '#E3F2FD', color: '#0D47A1', padding: '4px 12px', borderRadius: '20px', fontWeight: 'bold' }}>
          {registros.length} Registro(s)
        </div>
      </div>

      {/* Form Card */}
      <div style={{ 
        backgroundColor: '#F4F5F7', 
        padding: '24px', 
        borderRadius: '8px',
        marginBottom: '32px',
        border: '1px solid #DFE1E6'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>Adicionar Novo Registro</h3>
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '12px' }}>
          <input 
            type="text" 
            value={nome} 
            onChange={(e) => setNome(e.target.value)} 
            placeholder="Nome do cliente ou identificação técnica"
            style={{ 
              padding: '10px 16px', 
              flexGrow: 1,
              border: '2px solid #DFE1E6',
              borderRadius: '4px',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#4C9AFF'}
            onBlur={(e) => e.target.style.borderColor = '#DFE1E6'}
          />
          <button 
            type="submit"
            style={{ 
              padding: '10px 24px', 
              backgroundColor: '#0052CC', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              boxShadow: '0 2px 4px rgba(0,82,204,0.2)',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#0065FF'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#0052CC'}
          >
            Cadastrar
          </button>
        </form>
      </div>

      {/* Table Container */}
      <div style={{ 
        backgroundColor: '#FFFFFF', 
        borderRadius: '8px', 
        border: '1px solid #DFE1E6',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: '#FAFBFC', borderBottom: '2px solid #EBECF0' }}>
              <th style={{ padding: '16px', textAlign: 'left', color: '#6B778C', fontWeight: '600', width: '20%' }}>ID</th>
              <th style={{ padding: '16px', textAlign: 'left', color: '#6B778C', fontWeight: '600' }}>Identificação</th>
              <th style={{ padding: '16px', textAlign: 'center', color: '#6B778C', fontWeight: '600', width: '15%' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {registros.map((item, index) => (
              <tr key={item.id} style={{ 
                borderBottom: '1px solid #EBECF0',
                backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#FAFBFC'
              }}>
                <td style={{ padding: '16px', color: '#6B778C', fontFamily: 'monospace' }}>#{item.id.slice(-6)}</td>
                <td style={{ padding: '16px', fontWeight: '500', color: '#172B4D' }}>{item.nome}</td>
                <td style={{ padding: '16px', textAlign: 'center' }}>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    style={{ 
                      padding: '6px 12px', 
                      backgroundColor: 'transparent', 
                      color: '#DE350B', 
                      border: '1px solid #DE350B', 
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = '#DE350B';
                      e.target.style.color = 'white';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.color = '#DE350B';
                    }}
                  >
                    Remover
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {registros.length === 0 && (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📂</div>
            <div style={{ color: '#6B778C', fontSize: '16px' }}>Nenhum registro técnico encontrado.</div>
            <div style={{ color: '#A5ADBA', fontSize: '14px', marginTop: '8px' }}>Use o formulário acima para adicionar o primeiro item.</div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div style={{ marginTop: '32px', textAlign: 'center', color: '#A5ADBA', fontSize: '12px' }}>
        App de Controle Técnico • Desenvolvido via Forge Atlassian
      </div>
    </div>
  );
}

export default App;
