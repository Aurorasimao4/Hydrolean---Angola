import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Mic, MicOff, Volume2, VolumeX, Loader2, Bot, User, Trash2 } from "lucide-react";

// ============================================================
// TIPOS
// ============================================================

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatResponse {
  resposta: string;
  historico_atualizado: ChatMessage[];
}

// ============================================================
// CONFIGURAÇÃO — Ajustar URL se necessário
// ============================================================

const API_BASE_URL = "http://localhost:8000";

// ============================================================
// HOOK DE VOZ (Gravação + Text-to-Speech)
// ============================================================

function useSpeech() {
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Gravar áudio do microfone
  const startRecording = useCallback(async (): Promise<void> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm",
      });

      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Erro ao aceder ao microfone:", err);
      alert("Não foi possível aceder ao microfone. Verifique as permissões do browser.");
    }
  }, []);

  // Parar gravação e retornar blob
  const stopRecording = useCallback((): Promise<Blob> => {
    return new Promise((resolve) => {
      const mediaRecorder = mediaRecorderRef.current;
      if (!mediaRecorder) return;

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        // Parar todas as tracks do microfone
        mediaRecorder.stream.getTracks().forEach((t) => t.stop());
        setIsRecording(false);
        resolve(blob);
      };

      mediaRecorder.stop();
    });
  }, []);

  // Ler texto em voz alta (TTS)
  const speak = useCallback(
    (text: string) => {
      if (!ttsEnabled || !window.speechSynthesis) return;

      // Cancelar fala anterior
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "pt-PT"; // Pode trocar para "pt-BR"
      utterance.rate = 0.95;
      utterance.pitch = 1;

      // Tentar encontrar voz portuguesa
      const voices = window.speechSynthesis.getVoices();
      const ptVoice = voices.find(
        (v) => v.lang.startsWith("pt") && v.localService
      ) || voices.find((v) => v.lang.startsWith("pt"));
      if (ptVoice) utterance.voice = ptVoice;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [ttsEnabled]
  );

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return {
    isRecording,
    isSpeaking,
    ttsEnabled,
    setTtsEnabled,
    startRecording,
    stopRecording,
    speak,
    stopSpeaking,
  };
}

// ============================================================
// COMPONENTE PRINCIPAL — ChatBot
// ============================================================

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceLoading, setIsVoiceLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const speech = useSpeech();

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus no input ao abrir
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // ---- ENVIAR MENSAGEM DE TEXTO ----
  const sendMessage = async (text?: string) => {
    const mensagem = text || input.trim();
    if (!mensagem || isLoading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: mensagem }]);
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mensagem,
          historico: messages,
          // Se tiver geolocalização, enviar
          ...(navigator.geolocation
            ? await getLocation().catch(() => ({}))
            : {}),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Erro desconhecido" }));
        throw new Error(err.detail || `Erro ${res.status}`);
      }

      const data: ChatResponse = await res.json();

      setMessages(data.historico_atualizado);

      // Ler resposta em voz
      if (speech.ttsEnabled) {
        speech.speak(data.resposta);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Erro de ligação";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Desculpe, ocorreu um erro: ${errorMsg}. Verifique se o servidor está a correr.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // ---- ENVIAR MENSAGEM DE VOZ ----
  const handleVoice = async () => {
    if (speech.isRecording) {
      setIsVoiceLoading(true);
      const audioBlob = await speech.stopRecording();

      try {
        const formData = new FormData();
        formData.append("audio", audioBlob, "gravacao.webm");

        // Tentar obter localização
        try {
          const loc = await getLocation();
          if (loc.latitude) formData.append("latitude", String(loc.latitude));
          if (loc.longitude) formData.append("longitude", String(loc.longitude));
        } catch {
          // Sem localização, usa defaults
        }

        const res = await fetch(`${API_BASE_URL}/voz`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ detail: "Erro" }));
          throw new Error(err.detail || `Erro ${res.status}`);
        }

        const data = await res.json();

        // Adicionar ao histórico
        setMessages((prev) => [
          ...prev,
          { role: "user", content: `🎤 ${data.transcricao}` },
          { role: "assistant", content: data.resposta_texto },
        ]);

        // Ler resposta em voz
        if (speech.ttsEnabled) {
          speech.speak(data.resposta_texto);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Erro";
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Erro ao processar voz: ${errorMsg}`,
          },
        ]);
      } finally {
        setIsVoiceLoading(false);
      }
    } else {
      speech.startRecording();
    }
  };

  // ---- LIMPAR CONVERSA ----
  const clearChat = () => {
    setMessages([]);
    speech.stopSpeaking();
  };

  // ---- TECLA ENTER ----
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* ==================== BOTÃO FLUTUANTE ==================== */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          fixed bottom-6 right-6 z-50 
          w-14 h-14 rounded-full 
          flex items-center justify-center 
          shadow-lg hover:shadow-xl 
          transition-all duration-300 
          ${isOpen
            ? "bg-brand-black text-white rotate-0"
            : "bg-brand-primary text-white hover:bg-brand-secondary hover:scale-110"
          }
        `}
        title={isOpen ? "Fechar chat" : "Falar com AgroIntel"}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* ==================== JANELA DO CHAT ==================== */}
      <div
        className={`
          fixed bottom-24 right-6 z-50
          w-[380px] max-h-[600px]
          bg-white rounded-2xl 
          shadow-2xl border border-gray-200
          flex flex-col overflow-hidden
          transition-all duration-300 origin-bottom-right
          ${isOpen
            ? "scale-100 opacity-100 pointer-events-auto"
            : "scale-0 opacity-0 pointer-events-none"
          }
        `}
      >
        {/* ---- HEADER ---- */}
        <div className="bg-brand-primary px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">AgroIntel</h3>
              <p className="text-white/70 text-xs">Assistente agrícola</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Botão TTS */}
            <button
              onClick={() => {
                if (speech.isSpeaking) speech.stopSpeaking();
                speech.setTtsEnabled(!speech.ttsEnabled);
              }}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title={speech.ttsEnabled ? "Desativar voz" : "Ativar voz"}
            >
              {speech.ttsEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            {/* Botão Limpar */}
            <button
              onClick={clearChat}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Limpar conversa"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* ---- MENSAGENS ---- */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50 min-h-0">
          {/* Mensagem de boas-vindas */}
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Bot size={32} className="text-brand-primary" />
              </div>
              <h4 className="font-semibold text-brand-dark text-sm">
                Olá! Sou o AgroIntel 🌱
              </h4>
              <p className="text-gray-500 text-xs mt-1 max-w-[250px] mx-auto leading-relaxed">
                Posso ajudar com culturas, irrigação e cuidados do solo. Escreva ou use o microfone para falar!
              </p>

              {/* Sugestões rápidas */}
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {[
                  "Que cultura plantar no meu solo?",
                  "Devo irrigar hoje?",
                  "Como melhorar o pH do solo?",
                ].map((sugestao) => (
                  <button
                    key={sugestao}
                    onClick={() => sendMessage(sugestao)}
                    className="text-xs bg-white border border-brand-accent/30 text-brand-secondary 
                               px-3 py-1.5 rounded-full hover:bg-brand-accent/10 transition-colors"
                  >
                    {sugestao}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Lista de mensagens */}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-end gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {/* Ícone assistente */}
              {msg.role === "assistant" && (
                <div className="w-7 h-7 bg-brand-primary rounded-full flex items-center justify-center shrink-0">
                  <Bot size={14} className="text-white" />
                </div>
              )}

              {/* Balão da mensagem */}
              <div
                className={`
                  max-w-[75%] px-3 py-2 text-sm leading-relaxed
                  ${msg.role === "user"
                    ? "bg-brand-primary text-white rounded-2xl rounded-br-md"
                    : "bg-white text-gray-800 rounded-2xl rounded-bl-md shadow-sm border border-gray-100"
                  }
                `}
              >
                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
              </div>

              {/* Ícone user */}
              {msg.role === "user" && (
                <div className="w-7 h-7 bg-brand-dark rounded-full flex items-center justify-center shrink-0">
                  <User size={14} className="text-white" />
                </div>
              )}
            </div>
          ))}

          {/* Indicador de loading */}
          {(isLoading || isVoiceLoading) && (
            <div className="flex items-end gap-2">
              <div className="w-7 h-7 bg-brand-primary rounded-full flex items-center justify-center shrink-0">
                <Bot size={14} className="text-white" />
              </div>
              <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md shadow-sm border border-gray-100">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-brand-accent rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-brand-accent rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-brand-accent rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ---- INDICADOR DE GRAVAÇÃO ---- */}
        {speech.isRecording && (
          <div className="px-4 py-2 bg-red-50 border-t border-red-100 flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-600 text-xs font-medium">
              A gravar... Clique no microfone para parar
            </span>
          </div>
        )}

        {/* ---- INPUT ---- */}
        <div className="px-3 py-3 bg-white border-t border-gray-200 shrink-0">
          <div className="flex items-center gap-2">
            {/* Botão Microfone */}
            <button
              onClick={handleVoice}
              disabled={isLoading || isVoiceLoading}
              className={`
                p-2.5 rounded-xl transition-all duration-200 shrink-0
                ${speech.isRecording
                  ? "bg-red-500 text-white animate-pulse hover:bg-red-600"
                  : isVoiceLoading
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-brand-accent/10 text-brand-accent hover:bg-brand-accent/20"
                }
              `}
              title={speech.isRecording ? "Parar gravação" : "Gravar mensagem de voz"}
            >
              {isVoiceLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : speech.isRecording ? (
                <MicOff size={18} />
              ) : (
                <Mic size={18} />
              )}
            </button>

            {/* Campo de texto */}
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escreva a sua pergunta..."
              disabled={isLoading || speech.isRecording}
              className="flex-1 px-3 py-2.5 bg-gray-100 rounded-xl text-sm 
                         placeholder:text-gray-400 text-gray-800
                         focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:bg-white
                         disabled:opacity-50 transition-all"
            />

            {/* Botão Enviar */}
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              className={`
                p-2.5 rounded-xl transition-all duration-200 shrink-0
                ${input.trim() && !isLoading
                  ? "bg-brand-primary text-white hover:bg-brand-secondary"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }
              `}
              title="Enviar mensagem"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ============================================================
// HELPER — Obter localização do browser
// ============================================================

function getLocation(): Promise<{ latitude?: number; longitude?: number }> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({});
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }),
      () => resolve({}),
      { timeout: 5000, enableHighAccuracy: false }
    );
  });
}
