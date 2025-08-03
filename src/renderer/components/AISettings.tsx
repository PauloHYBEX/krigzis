import React, { useState } from 'react';
import { useAIConfig } from '../hooks/useAIConfig';
import { useTheme } from '../hooks/useTheme';
import { Brain, Key, Server, TestTube, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface AISettingsProps {
  onBack?: () => void;
}

export const AISettings: React.FC<AISettingsProps> = ({ onBack }) => {
  const { aiConfig, updateConfig, validateApiConfig, isAIReady } = useAIConfig();
  const { theme } = useTheme();
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);

  const isDark = theme.mode === 'dark';

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setTestResult(null);
    
    try {
      const result = await validateApiConfig(aiConfig.selectedProvider, aiConfig.apiKey, aiConfig.apiUrl);
      setTestResult({
        success: result,
        message: result ? 'Conexão estabelecida com sucesso!' : 'Falha na conexão. Verifique suas credenciais.'
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Erro ao testar conexão. Verifique sua configuração.'
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const providers = [
    {
      id: 'local',
      name: 'IA Local',
      description: 'Processamento local, máxima privacidade',
    },
    {
      id: 'openai',
      name: 'OpenAI',
      description: 'GPT-3.5, GPT-4, etc.',
    },
    {
      id: 'gemini',
      name: 'Google Gemini',
      description: 'Gemini Pro models',
    },
    {
      id: 'custom',
      name: 'API Personalizada',
      description: 'Endpoint customizado',
    }
  ];

  const selectedProvider = providers.find(p => p.id === aiConfig.selectedProvider);

  return (
    <div style={{
      padding: '24px',
      backgroundColor: isDark ? '#0A0A0A' : '#FFFFFF',
      minHeight: '100vh',
      color: isDark ? '#FFFFFF' : '#1F2937',
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '16px',
        marginBottom: '32px',
        paddingBottom: '16px',
        borderBottom: `1px solid ${isDark ? '#2A2A2A' : '#E5E7EB'}`,
      }}>
        <div style={{
          padding: '12px',
          backgroundColor: isDark ? '#1A1A1A' : '#F3F4F6',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Brain size={24} color="var(--color-primary-teal)" />
          </div>
        <div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 600,
            margin: 0,
            marginBottom: '4px',
          }}>
            Inteligência Artificial
          </h1>
          <p style={{
            fontSize: '14px',
            color: isDark ? '#A0A0A0' : '#6B7280',
            margin: 0,
          }}>
            Configure sua assistente IA personalizada
          </p>
        </div>
      </div>

      {/* Status */}
      <div style={{
        padding: '16px',
        backgroundColor: isAIReady() 
          ? isDark ? '#0F2A1A' : '#ECFDF5'
          : isDark ? '#2A1A0F' : '#FEF3C7',
        border: `1px solid ${isAIReady() 
          ? isDark ? '#10B981' : '#10B981'
          : isDark ? '#F59E0B' : '#F59E0B'}`,
        borderRadius: '12px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        {isAIReady() ? (
          <CheckCircle size={20} color="#10B981" />
        ) : (
          <AlertCircle size={20} color="#F59E0B" />
        )}
        <div>
          <div style={{
            fontSize: '14px',
            fontWeight: 500,
            color: isAIReady() ? '#10B981' : '#F59E0B',
            marginBottom: '2px',
          }}>
            {isAIReady() ? 'IA Configurada' : 'IA Não Configurada'}
      </div>
          <div style={{
            fontSize: '12px',
            color: isDark ? '#A0A0A0' : '#6B7280',
          }}>
            {isAIReady() 
              ? 'Sua assistente IA está pronta para uso'
              : 'Configure sua API key para ativar a assistente IA'
            }
          </div>
                </div>
              </div>

      {/* Provider Selection */}
              <div style={{ marginBottom: '24px' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: 500,
          marginBottom: '12px',
        }}>
                  Provedor de IA
        </label>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
        }}>
          {providers.map((provider) => (
                    <div
                      key={provider.id}
              onClick={() => updateConfig({ selectedProvider: provider.id })}
                      style={{
                        padding: '16px',
                backgroundColor: aiConfig.selectedProvider === provider.id
                  ? isDark ? '#0F1419' : '#F0F9FF'
                  : isDark ? '#141414' : '#F9FAFB',
                border: `2px solid ${aiConfig.selectedProvider === provider.id
                  ? 'var(--color-primary-teal)'
                  : isDark ? '#2A2A2A' : '#E5E7EB'}`,
                borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                          <div style={{ 
                fontSize: '14px',
                fontWeight: 500,
                            marginBottom: '4px',
                color: aiConfig.selectedProvider === provider.id
                  ? 'var(--color-primary-teal)'
                  : isDark ? '#FFFFFF' : '#1F2937',
                          }}>
                            {provider.name}
                          </div>
              <div style={{
                fontSize: '12px',
                color: isDark ? '#A0A0A0' : '#6B7280',
              }}>
                            {provider.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

      {/* API Configuration */}
      {selectedProvider && selectedProvider.id !== 'local' && (
                <div style={{ marginBottom: '24px' }}>
                    <label style={{ 
                      display: 'block', 
            fontSize: '14px',
            fontWeight: 500,
                      marginBottom: '8px', 
                    }}>
                      API Key
                    </label>
          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
          }}>
            <div style={{ flex: 1, position: 'relative' }}>
                      <input
                        type={showApiKey ? 'text' : 'password'}
                value={aiConfig.apiKey || ''}
                onChange={(e) => updateConfig({ apiKey: e.target.value })}
                placeholder="Insira sua API key..."
                        style={{
                          width: '100%',
                  padding: '12px 16px',
                  paddingRight: '48px',
                  backgroundColor: isDark ? '#0A0A0A' : '#FFFFFF',
                  border: `1px solid ${isDark ? '#2A2A2A' : '#E5E7EB'}`,
                  borderRadius: '8px',
                  color: isDark ? '#FFFFFF' : '#1F2937',
                          fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                        }}
                      />
                      <button
                        onClick={() => setShowApiKey(!showApiKey)}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                  background: 'none',
                          border: 'none',
                  color: isDark ? '#A0A0A0' : '#6B7280',
                          cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                        }}
                      >
                {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
          <p style={{
            fontSize: '12px',
            color: isDark ? '#A0A0A0' : '#6B7280',
            marginTop: '6px',
            margin: '6px 0 0 0',
          }}>
            Sua API key é armazenada localmente e nunca compartilhada.
          </p>
        </div>
      )}

      {/* Custom Endpoint */}
                  {aiConfig.selectedProvider === 'custom' && (
        <div style={{ marginBottom: '24px' }}>
                      <label style={{ 
                        display: 'block', 
            fontSize: '14px',
            fontWeight: 500,
                        marginBottom: '8px', 
                      }}>
            Endpoint da API
                      </label>
                      <input
            type="text"
            value={aiConfig.apiUrl || ''}
            onChange={(e) => updateConfig({ apiUrl: e.target.value })}
            placeholder="https://api.exemplo.com/v1/chat/completions"
                        style={{
                          width: '100%',
                          padding: '12px 16px',
              backgroundColor: isDark ? '#0A0A0A' : '#FFFFFF',
              border: `1px solid ${isDark ? '#2A2A2A' : '#E5E7EB'}`,
              borderRadius: '8px',
              color: isDark ? '#FFFFFF' : '#1F2937',
                          fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  )}

      {/* Test Connection */}
      <div style={{ marginBottom: '24px' }}>
                  <button
          onClick={handleTestConnection}
          disabled={isTestingConnection || (!aiConfig.apiKey && aiConfig.selectedProvider !== 'local')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
            padding: '12px 20px',
            backgroundColor: isTestingConnection || (!aiConfig.apiKey && aiConfig.selectedProvider !== 'local')
              ? isDark ? '#2A2A2A' : '#E5E7EB'
              : 'var(--color-primary-teal)',
            border: 'none',
            borderRadius: '8px',
            color: isTestingConnection || (!aiConfig.apiKey && aiConfig.selectedProvider !== 'local')
              ? isDark ? '#666666' : '#9CA3AF'
              : '#FFFFFF',
                      fontSize: '14px',
                      fontWeight: 500,
            cursor: isTestingConnection || (!aiConfig.apiKey && aiConfig.selectedProvider !== 'local') ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <TestTube size={16} />
          {isTestingConnection ? 'Testando...' : 'Testar Conexão'}
                  </button>

        {testResult && (
          <div style={{
            marginTop: '12px',
            padding: '12px',
            backgroundColor: testResult.success
              ? isDark ? '#0F2A1A' : '#ECFDF5'
              : isDark ? '#2A1A0F' : '#FEF2F2',
            border: `1px solid ${testResult.success
              ? '#10B981'
              : '#EF4444'}`,
            borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
            gap: '8px',
          }}>
            {testResult.success ? (
              <CheckCircle size={16} color="#10B981" />
            ) : (
              <AlertCircle size={16} color="#EF4444" />
            )}
                        <span style={{
              fontSize: '13px',
              color: testResult.success ? '#10B981' : '#EF4444',
                        }}>
              {testResult.message}
                        </span>
            </div>
          )}
                </div>

      {/* Information */}
                <div style={{
                  padding: '16px',
        backgroundColor: isDark ? '#1A1A1A' : '#F3F4F6',
        borderRadius: '12px',
        border: `1px solid ${isDark ? '#2A2A2A' : '#E5E7EB'}`,
      }}>
        <h4 style={{
          fontSize: '14px',
          fontWeight: 500,
          marginBottom: '8px',
          margin: '0 0 8px 0',
                    }}>
          ℹ️ Sobre a Assistente IA
              </h4>
        <ul style={{
          fontSize: '13px',
          color: isDark ? '#A0A0A0' : '#6B7280',
          lineHeight: '1.5',
          margin: 0,
          paddingLeft: '16px',
        }}>
          <li>A IA é especializada no sistema Krigzis</li>
          <li>Pode criar, editar e analisar suas tarefas e notas</li>
          <li>Oferece sugestões de produtividade personalizadas</li>
          <li>Conversas são temporárias e não são armazenadas</li>
          <li>Sua API key é criptografada e armazenada localmente</li>
        </ul>
            </div>
    </div>
  );
};
