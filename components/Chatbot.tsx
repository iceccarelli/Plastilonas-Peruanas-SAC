'use client';

import React, { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
      {/* Floating Button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 z-[90] w-16 h-16 bg-[#0A2540] hover:bg-[#059669] text-white rounded-2xl shadow-xl flex items-center justify-center transition-all active:scale-95 group"
        aria-label="Abrir chat de asistencia"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <X className="w-7 h-7" />
          ) : (
            <div className="relative">
              <MessageCircle className="w-7 h-7" />
              <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-[#0A2540] animate-pulse" />
            </div>
          )}
        </AnimatePresence>
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed bottom-24 right-6 z-[95] w-[380px] max-w-[calc(100vw-3rem)] chatbot-window">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col h-[560px] overflow-hidden">
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
                  <div className="text-center text-xs text-red-500 bg-red-50 py-2 rounded-2xl">
                    Error de conexión. Por favor intente nuevamente o contáctenos por WhatsApp.
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
                <p className="text-[10px] text-gray-400">Respuestas generadas por IA • Asesoría real disponible por WhatsApp</p>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
