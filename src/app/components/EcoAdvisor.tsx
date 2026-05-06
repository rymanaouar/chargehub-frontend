import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Bot, Send, X, Minimize2, Maximize2, Zap, Battery, MapPin } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}
const SYSTEM_PROMPT = `Tu es Eco-Advisor assistant Tesla. Règles: 1) MAX 3 phrases 2) Toujours 1 chiffre 3) Format émoji + info 4) Pas de répétition.

Données: Batterie 42%, Model 3 à Sousse. Station Sousse 2.1km à 0.48€/kWh. Station Sfax 130km à 0.42€/kWh. Heures creuses 22h-06h: 0.34€/kWh (-30%). Batterie 75kWh.

CO2: 1kWh = 0.4kg CO2 économisé = 0.06 arbre.

Exemple: "🔋 Batterie 42%. Rechargez à 23h à Sousse pour 0.34€/kWh. Économie: 4.20€."`;
export function EcoAdvisor() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '👋 Bonjour ! Je suis **Eco-Advisor**, votre assistant intelligent de recharge.\n\n🔋 Votre batterie est à **42%**. Je surveille les prix en temps réel pour vous faire économiser.\n\nComment puis-je vous aider ?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemma2:2b',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages,
            { role: 'user', content: userMessage }
          ],
          stream: false,
        }),
      });

      const data = await response.json();
      const reply = data.message?.content || 'Désolé, je ne peux pas répondre pour le moment.';

      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ Ollama n\'est pas démarré. Lancez `ollama run tinyllama` dans votre terminal.'
      }]);
    }

    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    '🔋 Quand recharger ?',
    '💰 Station la moins chère ?',
    '⚡ Réserver maintenant',
  ];

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#171a20] hover:bg-slate-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110"
        >
          <Bot className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col transition-all ${
          isMinimized ? 'h-14' : 'h-[500px]'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#171a20] rounded-t-2xl">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">Eco-Advisor</p>
                <p className="text-green-400 text-xs">● En ligne</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsMinimized(v => !v)} className="text-white/60 hover:text-white">
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* CO2 Calculator */}
<div className="flex items-center gap-3 px-4 py-2 bg-green-50 border-b border-green-100">
  <span className="text-lg">🌱</span>
  <div className="flex-1">
    <p className="text-xs text-green-700 font-medium">Impact écologique de vos recharges</p>
    <p className="text-xs text-green-600">
      162.3 kWh chargés → <strong>64.9 kg CO2 économisés</strong> → <strong>🌳 3.2 arbres plantés</strong>
    </p>
  </div>
</div>

          {!isMinimized && (
            <>
              {/* Battery status bar */}
              <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 border-b border-slate-100">
                <Battery className="w-4 h-4 text-orange-500" />
                <div className="flex-1">
                  <div className="h-1.5 bg-slate-200 rounded-full">
                    <div className="h-1.5 bg-orange-500 rounded-full" style={{ width: '42%' }} />
                  </div>
                </div>
                <span className="text-xs font-medium text-slate-600">42%</span>
                <MapPin className="w-3 h-3 text-slate-400" />
                <span className="text-xs text-slate-400">Sousse</span>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'assistant' && (
                      <div className="w-6 h-6 rounded-full bg-[#171a20] flex items-center justify-center mr-2 shrink-0 mt-1">
                        <Bot className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-[#171a20] text-white rounded-tr-sm'
                        : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="w-6 h-6 rounded-full bg-[#171a20] flex items-center justify-center mr-2 shrink-0">
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                    <div className="bg-slate-100 px-4 py-3 rounded-2xl rounded-tl-sm">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick questions */}
              <div className="px-3 pb-2 flex gap-1 flex-wrap">
                {quickQuestions.map(q => (
                  <button
                    key={q}
                    onClick={() => { setInput(q); }}
                    className="text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="p-3 border-t border-slate-100 flex gap-2">
                <Input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Posez votre question..."
                  className="flex-1 text-sm rounded-xl border-slate-200"
                  disabled={loading}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  className="w-9 h-9 bg-[#171a20] hover:bg-slate-700 text-white rounded-xl flex items-center justify-center disabled:opacity-50 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

