import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { Upload, FileCode, CheckCircle, AlertCircle, Info, Code2, Loader2, Settings } from 'lucide-react';

const TRANSLATIONS = {
  'pt-BR': {
    appTitle: 'Oraculum IA',
    appDescription: 'Envie seu código para análise e sugestões de melhoria com  Oraculum IA',
    uploadCodeFile: 'Enviar Arquivo de Código',
    chooseFileOrDrag: 'Escolha um arquivo ou arraste-o aqui',
    codePreview: 'Prévia do Código (primeiras 10 linhas)',
    analyzeCode: 'Analisar Código',
    analyzing: 'Analisando...',
    failedToReadFile: 'Falha ao ler o arquivo. Certifique-se de que é um arquivo de texto.',
    pleaseUploadCodeFirst: 'Por favor, envie um arquivo de código primeiro',
    overallScore: 'Pontuação Geral',
    improvementSuggestions: 'Sugestões de Melhoria',
    suggestion: 'Sugestão:',
    evaluationGuidelines: 'Diretrizes de Avaliação',
    descriptiveNaming: 'Convenções de nomenclatura descritiva',
    appropriateFunctionSize: 'Tamanho apropriado de função (evite extremos)',
    explicitDependencies: 'Dependências explícitas',
    properErrorHandling: 'Tratamento adequado de erros',
    limitedNesting: 'Aninhamento limitado (máx. 2-3 níveis)',
    clearSideEffects: 'Efeitos colaterais claros',
    noMagicNumbers: 'Sem números mágicos',
    analyzingYourCode: 'Analisando Seu Código',
    thisMayTakeAMoment: 'Isso pode levar alguns instantes...',
    high: 'alta',
    medium: 'média',
    low: 'baixa',
    analysisError: 'Falha ao analisar o código. Por favor, tente novamente.',
    aiProvider: 'Provedor de IA',
    claude: 'Claude (API Anthropic)',
    ollama: 'Ollama (Local)',
    openai: 'ChatGPT (OpenAI)',
    openaiBaseUrl: 'Base URL do OpenAI',
    openaiModel: 'Modelo do OpenAI',
    openaiNote: 'Use um proxy no servidor para não expor sua chave em produção.',
    ollamaEndpoint: 'Endpoint do Ollama',
    ollamaModel: 'Modelo do Ollama',
    configuration: 'Configuração',
    connectionError: 'Erro de conexão. Verifique se o Ollama está rodando e o endpoint está correto.'
  }
};

const locale = 'pt-BR';
const _TRANSLATIONS: any = TRANSLATIONS;
const t = (key: string) => _TRANSLATIONS[locale]?.[key] || _TRANSLATIONS['pt-BR']?.[key] || key;

/** ===== Footer component ===== */
function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-gray-800 bg-gray-900/70">
      <div className="max-w-4xl mx-auto px-6 py-6 text-sm text-gray-400 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <img src="/oraculum_logo_icone.png" alt="Oraculum Logo" className="w-5 h-5 opacity-80" />
          <span>© {year} Oraculum IA. Todos os direitos reservados.</span>
        </div>

        <nav className="flex flex-wrap items-center gap-4">
          <a
            href="https://imnascimento.github.io/Portifolio/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-200 transition-colors"
            aria-label="Igor Nascimento (abre em nova aba)"
          >
            Igor Nascimento
          </a>
          <a
            href="https://sophiamind.com.br/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-200 transition-colors"
            aria-label="SophiaMind (abre em nova aba)"
          >
            SophiaMind
          </a>
          <a
            href="https://sophialabs.com.br/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-200 transition-colors"
            aria-label="SophiaLabs (abre em nova aba)"
          >
            SophiaLabs
          </a>
          <a
            href="/privacidade"
            className="hover:text-gray-200 transition-colors"
          >
            Privacidade
          </a>
          <a
            href="/termos"
            className="hover:text-gray-200 transition-colors"
          >
            Termos
          </a>
        </nav>
      </div>
    </footer>
  );
}

export default function CodingCoach() {
  const [file, setFile] = useState<File | null>(null);
  const [code, setCode] = useState<string>('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [showConfig, setShowConfig] = useState<boolean>(false);

  // Configurações de IA
  const [aiProvider, setAiProvider] = useState<string>('claude');
  const [ollamaEndpoint, setOllamaEndpoint] = useState<string>('http://localhost:11434');
  const [ollamaModel, setOllamaModel] = useState<string>('gpt-oss:20b');

  const [openaiBaseUrl, setOpenaiBaseUrl] = useState<string>('https://api.openai.com');
  const [openaiModel, setOpenaiModel] = useState<string>('gpt-4.1-mini');

  const getLanguageFromExtension = (filename: string): string => {
    const ext = String(filename).split('.').pop()?.toLowerCase() || '';
    const languageMap: Record<string, string> = {
      py: 'Python', js: 'JavaScript', jsx: 'React/JavaScript',
      ts: 'TypeScript', tsx: 'React/TypeScript', java: 'Java',
      c: 'C', cpp: 'C++', cc: 'C++', cxx: 'C++', cs: 'C#',
      rb: 'Ruby', go: 'Go', php: 'PHP', swift: 'Swift',
      kt: 'Kotlin', rs: 'Rust', r: 'R', scala: 'Scala',
      sh: 'Shell/Bash', bash: 'Bash', ps1: 'PowerShell',
      lua: 'Lua', dart: 'Dart'
    };
    return languageMap[ext] || '';
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0] ?? null;
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setError('');

    try {
      const text = await uploadedFile.text();
      setCode(text);
    } catch (err) {
      setError(t('failedToReadFile'));
    }
  };

  const analyzeWithClaude = async (prompt: string) => {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // IMPORTANTE: adicionar headers oficiais (x-api-key e anthropic-version) via proxy/ENV em produção
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    let responseText = data.content?.[0]?.text || '';
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    try {
      return JSON.parse(responseText);
    } catch {
      return responseText;
    }
  };

  const analyzeWithOllama = async (prompt: string) => {
    // First attempt with format=json (preferred) to get structured output
    const doRequest = async (opts: { useJsonFormat: boolean }) => {
      const body: any = {
        model: ollamaModel,
        prompt,
        stream: false,
      };
      if (opts.useJsonFormat) body.format = 'json';

      const resp = await fetch(`${ollamaEndpoint}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!resp.ok) throw new Error(`Ollama request failed: ${resp.status}`);
      return resp.json();
    };

    let data: any = await doRequest({ useJsonFormat: true });
    console.debug('[Ollama] raw response (json format):', data);

    const extractText = (d: any) => {
      if (!d) return '';
      if (typeof d === 'string') return d;
      if (typeof d.response === 'string' && d.response.trim()) return d.response;
      if (Array.isArray(d.output) && d.output.length) {
        for (const out of d.output) {
          if (!out) continue;
          if (typeof out === 'string' && out.trim()) return out;
          if (out.content) {
            if (typeof out.content === 'string' && out.content.trim()) return out.content;
            if (Array.isArray(out.content)) {
              const found = out.content.find((c: any) => typeof c === 'string' && c.trim());
              if (found) return found;
              const objFound = out.content.find((c: any) => c && typeof c.text === 'string' && c.text.trim());
              if (objFound) return objFound.text;
            }
          }
        }
      }
      if (Array.isArray(d.choices) && d.choices.length) return d.choices.map((c: any) => c.message?.content || c.text || '').join('');
      return '';
    };

    let responseText: string = extractText(data) || '';

    // If the model returned no textual response (empty `response` and no useful output),
    // retry once asking for plain text (no format)
    if (!responseText) {
      try {
        data = await doRequest({ useJsonFormat: false });
        console.debug('[Ollama] raw response (fallback text format):', data);
        responseText = extractText(data) || '';
      } catch (e) {
        console.warn('[Ollama] fallback request failed:', e);
      }
    }

    if (!responseText) {
      console.warn('[Ollama] no textual response found, returning raw payload for inspection');
      return data;
    }

    responseText = String(responseText).replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();

    try {
      return JSON.parse(responseText);
    } catch (err) {
      const jsonMatch = responseText.match(/({[\s\S]*})/m);
      if (jsonMatch) {
        try { return JSON.parse(jsonMatch[1]); } catch (e) { /* ignore */ }
      }
      return responseText;
    }
  };

  const analyzeWithOpenAI = async (prompt: string) => {
    // Em DEV você pode usar VITE_OPENAI_API_KEY; em produção use um proxy no servidor
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY; // DEV ONLY
    if (!apiKey) {
      throw new Error('OPENAI API KEY ausente (defina VITE_OPENAI_API_KEY no .env para testes locais)');
    }

    const url = `${openaiBaseUrl.replace(/\/$/, '')}/v1/chat/completions`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: openaiModel, // ex.: "gpt-4.1-mini"
        temperature: 0,
        response_format: { type: 'json_object' }, // força JSON válido
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!resp.ok) throw new Error(`OpenAI request failed: ${resp.status}`);
    const data = await resp.json();
    let responseText = data?.choices?.[0]?.message?.content || '';
    responseText = String(responseText).replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();

    try {
      return JSON.parse(responseText);
    } catch {
      const m = responseText.match(/({[\s\S]*})/m);
      if (m) { try { return JSON.parse(m[1]); } catch { /* ignore */ } }
      return responseText;
    }
  };

  const analyzeCode = async () => {
    if (!code) {
      setError(t('pleaseUploadCodeFirst'));
      return;
    }

    setLoading(true);
    setError('');

    const language = file ? getLanguageFromExtension(file.name ?? '') : '';
    const languageContext = language ? `\nIMPORTANTE: Não sinalize problemas que são padrões amplamente usados e aceitos em ${language}, mesmo que tecnicamente violem os critérios gerais. Considere idiomas e melhores práticas específicas de ${language}.` : '';

    const prompt = `Você é um especialista em revisão de código${language ? ` ${language}` : ''}. IMPORTANTE: Responda SEMPRE em português brasileiro, independentemente do idioma do código. Analise o seguinte código e forneça:
1. Uma pontuação geral de 0 a 100
2. Feedback específico sobre estes critérios:
   - Nomes descritivos (classes, funções, variáveis)
   - Tamanho das funções (evite funções com mais de 200 linhas, mas também evite funções com menos de 5 linhas se forem chamadas apenas uma vez)
   - Dependências explícitas (evite estado global/dependências ocultas)
   - Tratamento de erros (evite blocos try/catch vazios)
   - Níveis de aninhamento (máximo 2-3 para melhor legibilidade)
   - Clareza dos efeitos colaterais
   - Uso de números mágicos
${languageContext}

Responda APENAS com um objeto JSON válido neste formato exato, SEM nenhum texto adicional fora do JSON:
{
  "score": número,
  "summary": "avaliação geral breve em português",
  "improvements": [
    {
      "category": "nome da categoria em português",
      "issue": "descrição específica do problema em português",
      "suggestion": "como corrigir em português",
      "severity": "high|medium|low",
      "lineNumber": número ou null,
      "codeSnippet": "linha/trecho de código problemático" ou null
    }
  ]
}

Inclua lineNumber e codeSnippet quando conseguir identificar a localização específica de um problema.

Código para analisar:
\`\`\`
${code}
\`\`\`

NÃO inclua nenhum texto fora do objeto JSON. Responda TUDO em português brasileiro.`;

    try {
      let result;
      if (aiProvider === 'claude') {
        result = await analyzeWithClaude(prompt);
      } else if (aiProvider === 'ollama') {
        result = await analyzeWithOllama(prompt);
      } else if (aiProvider === 'openai') {
        result = await analyzeWithOpenAI(prompt);
      }
      setAnalysis(result);
    } catch (err) {
      console.error('Analysis error:', err);
      const e: any = err;
      if (aiProvider === 'ollama' && e?.message?.includes?.('Failed to fetch')) {
        setError(t('connectionError'));
      } else {
        setError(t('analysisError'));
      }
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'medium':
        return <Info className="w-4 h-4 text-yellow-400" />;
      case 'low':
        return <CheckCircle className="w-4 h-4 text-blue-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img
              src="/oraculum_logo_icone.png"
              alt="Oraculum Logo"
              className="w-10 h-10"
            />
            <h1 className="text-4xl font-bold">{t('appTitle')}</h1>
            <img
              src="/nascimento.png"
              alt="Oraculum Logo"
              className="w-12 h-12"
            />
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="ml-4 p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title={t('configuration')}
            >
              <Settings className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <p className="text-gray-400">{t('appDescription')}</p>
        </div>

        {/* Configuração */}
        {showConfig && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              {t('configuration')}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('aiProvider')}
                </label>
                <select
                  value={aiProvider}
                  onChange={(e) => setAiProvider(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="claude">{t('claude')}</option>
                  <option value="ollama">{t('ollama')}</option>
                  <option value="openai">{t('openai')}</option> 
                </select>
              </div>

              {aiProvider === 'ollama' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t('ollamaEndpoint')}
                    </label>
                    <input
                      type="text"
                      value={ollamaEndpoint}
                      onChange={(e) => setOllamaEndpoint(e.target.value)}
                      placeholder="http://localhost:11434"
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t('ollamaModel')}
                    </label>
                    <input
                      type="text"
                      value={ollamaModel}
                      onChange={(e) => setOllamaModel(e.target.value)}
                      placeholder="mistral, codellama, deepseek-coder, etc."
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Exemplos: mistral, codellama, deepseek-coder, llama2, phi
                    </p>
                  </div>
                </>
              )}

              {aiProvider === 'openai' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t('openaiBaseUrl')}
                    </label>
                    <input
                      type="text"
                      value={openaiBaseUrl}
                      onChange={(e) => setOpenaiBaseUrl(e.target.value)}
                      placeholder="https://api.openai.com"
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t('openaiModel')}
                    </label>
                    <input
                      type="text"
                      value={openaiModel}
                      onChange={(e) => setOpenaiModel(e.target.value)}
                      placeholder="gpt-4.1, gpt-4.1-mini, o4-mini..."
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {t('openaiNote')}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* File Upload Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
          <label className="block mb-4">
            <span className="text-sm font-medium text-gray-300 mb-2 block">{t('uploadCodeFile')}</span>
            <div className="relative">
              <input
                type="file"
                onChange={handleFileUpload}
                accept=".js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.cs,.rb,.go,.php,.swift,.kt"
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
              >
                <Upload className="w-5 h-5" />
                <span>{file ? file.name : t('chooseFileOrDrag')}</span>
              </label>
            </div>
          </label>

          {code && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <FileCode className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-400">{t('codePreview')}</span>
              </div>
              <pre className="bg-gray-900 p-3 rounded text-xs overflow-x-auto max-h-40 text-gray-300">
                {code.split('\n').slice(0, 10).join('\n')}
                {code.split('\n').length > 10 && '\n...'}
              </pre>
            </div>
          )}

          <button
            onClick={analyzeCode}
            disabled={!code || loading}
            className="mt-4 w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? t('analyzing') : t('analyzeCode')}
          </button>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-800 text-red-400 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-6">
            {/* Score Card */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">{t('overallScore')}</h2>
                <div className={`text-6xl font-bold ${getScoreColor(analysis?.score ?? 0)}`}>
                  {String(analysis?.score ?? '—')}/100
                </div>
                <p className="text-gray-400 mt-3">{analysis.summary}</p>
              </div>
            </div>

            {/* Improvement Suggestions */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-bold mb-4">{t('improvementSuggestions')}</h3>
              <div className="space-y-4">
                {Array.isArray(analysis.improvements) ? (
                  analysis.improvements.map((item: any, index: number) => (
                    <div key={index} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-start gap-3">
                        {getSeverityIcon(item.severity)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-blue-400">{item.category}</span>
                            <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300">
                              {t(item.severity)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300 mb-2">{item.issue}</p>
                          
                          {item.codeSnippet && (
                            <div className="mb-2">
                              <pre className="bg-gray-950 p-2 rounded text-xs overflow-x-auto text-gray-400 border border-gray-800">
                                <code>{item.codeSnippet}</code>
                              </pre>
                            </div>
                          )}
                          
                          <p className="text-sm text-green-400">
                            <span className="font-medium">{t('suggestion')}</span> {item.suggestion}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <p className="text-sm text-gray-300 mb-2">Resposta inesperada do analisador — exibindo JSON bruto:</p>
                    <pre className="bg-gray-950 p-2 rounded text-xs overflow-x-auto text-gray-400 border border-gray-800">
                      <code>{JSON.stringify(analysis, null, 2)}</code>
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {/* Guidelines Reference */}
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <h4 className="text-sm font-medium text-gray-400 mb-2">{t('evaluationGuidelines')}</h4>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• {t('descriptiveNaming')}</li>
                <li>• {t('appropriateFunctionSize')}</li>
                <li>• {t('explicitDependencies')}</li>
                <li>• {t('properErrorHandling')}</li>
                <li>• {t('limitedNesting')}</li>
                <li>• {t('clearSideEffects')}</li>
                <li>• {t('noMagicNumbers')}</li>
              </ul>
            </div>
          </div>
        )}
        {/* FOOTER */}
        <Footer />
        
        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 text-center">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">{t('analyzingYourCode')}</h3>
              <p className="text-sm text-gray-400">{t('thisMayTakeAMoment')}</p>
              <p className="text-xs text-gray-500 mt-2">
                {/* inclui OpenAI no label */}
                Usando: {aiProvider === 'claude'
                  ? 'Claude API'
                  : aiProvider === 'ollama'
                    ? `Ollama (${ollamaModel})`
                    : `OpenAI (${openaiModel})`}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
