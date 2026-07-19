'use client';

import React, { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { whatsappUrl, WHATSAPP_DISPLAY } from '@/lib/whatsapp';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat',
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: '¡Hola! Soy el asistente virtual de Plastilonas Peruanas. Con más de 15 años de experiencia en soluciones textiles industriales, estoy aquí para ayudarle a encontrar la mejor solución para su proyecto. ¿En qué puedo asistirle hoy?',
      },
    ],
  });

  const toggleChat = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Botón flotante con anillos pulsantes (estilo empresarial) */}
      <div className="fixed bottom-6 right-6 z-[90]">
        {/* Anillos que irradian: solo cuando el chat está cerrado, para
            atraer la atención sin distraer durante la conversación. */}
        {!isOpen && (
          <>
            <span className="pp-ping pp-ping-1" aria-hidden="true" />
            <span className="pp-ping pp-ping-2" aria-hidden="true" />
          </>
        )}

        <button
          onClick={toggleChat}
          className={`relative w-16 h-16 rounded-2xl shadow-xl flex items-center justify-center transition-colors active:scale-95 group ${
            isOpen
              ? 'bg-[#0A2540] hover:bg-[#0A2540]'
              : 'bg-[#0A2540] hover:bg-[#059669] pp-breathe'
          }`}
          aria-label={isOpen ? 'Cerrar chat de asistencia' : 'Abrir chat de asistencia'}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <X className="w-7 h-7 text-white" />
            ) : (
              <div className="relative">
                <MessageCircle className="w-7 h-7 text-white" />
                {/* Punto "en línea" con doble anillo para claridad */}
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-[#0A2540]" />
                </span>
              </div>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Animaciones del botón. Respetan prefers-reduced-motion. */}
      <style>{`
        @keyframes pp-ring {
          0%   { transform: scale(0.85); opacity: 0.55; }
          70%  { opacity: 0; }
          100% { transform: scale(2.1); opacity: 0; }
        }
        @keyframes pp-breathe {
          0%, 100% { box-shadow: 0 10px 25px -5px rgba(5,150,105,0.35), 0 0 0 0 rgba(5,150,105,0.0); }
          50%      { box-shadow: 0 10px 30px -5px rgba(5,150,105,0.55), 0 0 0 6px rgba(5,150,105,0.10); }
        }
        .pp-ping {
          position: absolute;
          inset: 0;
          width: 4rem;
          height: 4rem;
          border-radius: 1rem;
          background: #059669;
          z-index: -1;
          animation: pp-ring 2.6s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .pp-ping-2 { animation-delay: 1.3s; }
        .pp-breathe { animation: pp-breathe 3s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .pp-ping, .pp-breathe { animation: none; }
        }
      `}</style>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed bottom-24 right-6 z-[95] w-[380px] max-w-[calc(100vw-3rem)] chatbot-window">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col h-[min(560px,calc(100dvh-8.5rem))] overflow-hidden">
              {/* Header */}
              <div className="bg-[#0A2540] text-white px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white/10 rounded-2xl flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold tracking-tight">Asistente Plastilonas</div>
                    <div className="text-xs text-white/60 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> En línea • Experto en soluciones industriales
                    </div>
                  </div>
                </div>
                <button onClick={toggleChat} className="text-white/60 hover:text-white p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-gray-50 text-sm">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-7 h-7 bg-[#0A2540] text-white rounded-2xl flex-shrink-0 flex items-center justify-center mt-0.5">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <div
                      className={`max-w-[82%] px-4 py-3 rounded-3xl leading-snug ${
                        message.role === 'user'
                          ? 'bg-[#0A2540] text-white rounded-tr-none'
                          : 'bg-white border border-gray-100 shadow-sm rounded-tl-none'
                      }`}
                    >
                      {message.content}
                    </div>
                    {message.role === 'user' && (
                      <div className="w-7 h-7 bg-gray-200 text-gray-600 rounded-2xl flex-shrink-0 flex items-center justify-center mt-0.5">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-7 h-7 bg-[#0A2540] text-white rounded-2xl flex-shrink-0 flex items-center justify-center">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <div className="bg-white border border-gray-100 px-4 py-3 rounded-3xl rounded-tl-none">
                      <div className="flex gap-1.5">
                        <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="text-center text-xs bg-amber-50 border border-amber-100 text-amber-800 py-3 px-4 rounded-2xl space-y-2">
                    <p>El asistente virtual no está disponible en este momento.</p>
                    <a
                      href={whatsappUrl('Hola, quisiera hacer una consulta sobre sus productos.')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block font-semibold text-[#059669] hover:underline"
                    >
                      Escríbanos por WhatsApp {WHATSAPP_DISPLAY} →
                    </a>
                  </div>
                )}
              </div>

              {/* Input */}
              <form onSubmit={handleSubmit} className="p-4 border-t bg-white flex gap-2">
                <input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Escriba su consulta sobre productos o proyectos..."
                  className="flex-1 bg-gray-100 px-5 py-3 text-sm rounded-2xl focus:outline-none focus:ring-1 focus:ring-[#059669] placeholder:text-gray-400"
                  disabled={isLoading}
                />
                <button 
                  type="submit" 
                  disabled={!input.trim() || isLoading}
                  className="bg-[#0A2540] hover:bg-[#059669] disabled:bg-gray-300 text-white w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 active:scale-95 transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              <div className="px-4 pb-3 text-center">
                <p className="t-micro text-gray-400">Respuestas generadas por IA • Asesoría real disponible por WhatsApp</p>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
