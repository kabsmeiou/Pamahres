import { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, Paperclip } from 'react-feather';
import { useChatbot } from '../services/chatbot';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { ChatMessage } from '../types/course';


interface ChatboxProps {
    showForm: boolean;
    messages: ChatMessage[];
    setMessage: (message: string) => void;
    message: string;
    loading?: boolean;
    fetchLoading?: boolean;
    handleSubmit: (e: React.FormEvent) => void;
}

const Chatbox = ({ 
    showForm,
    message,
    setMessage,
    messages,
    loading = false,
    fetchLoading = false,
    handleSubmit,
 }: ChatboxProps) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTo({
                top: messagesContainerRef.current.scrollHeight,
                behavior: 'smooth',
            });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    return (
    <div className="max-w-8xl mx-auto py-3 sm:px-0 sm:py-0 h-[calc(100vh-8rem)] dark:bg-surface-900">
      <div className="bg-white dark:bg-surface-800 rounded-xl shadow-sm border border-surface-200/80 dark:border-surface-700/50 flex flex-col h-full overflow-hidden w-full sm:w-auto">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-surface-100 dark:border-surface-700 bg-white dark:bg-surface-800 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/60 dark:to-primary-800/40 flex items-center justify-center shadow-sm">
                <MessageCircle size={22} className="text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h2 className="text-md sm:text-lg font-semibold text-surface-800 dark:text-surface-100">Course Assistant</h2>
                <p className="text-surface-500 dark:text-surface-400 text-sm">Ask questions about your course materials</p>
              </div>
            </div>
          </div>
        </div>
        {/* Messages Area */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto flex flex-col space-y-6 bg-surface-50/80 dark:bg-surface-900" ref={messagesContainerRef} style={{overflowAnchor: 'none'}}>
          { fetchLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-t-primary-500 border-r-primary-300 border-b-primary-200 border-l-primary-300 dark:border-t-primary-400 dark:border-r-primary-600 dark:border-b-primary-700 dark:border-l-primary-600"></div>
                <p className="text-surface-500 dark:text-surface-400 text-sm animate-pulse">Loading messages...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 my-auto">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/60 dark:to-primary-800/40 text-primary-600 dark:text-primary-400 mb-6 shadow-md">
                <Send size={28} />
              </div>
              <h3 className="md:text-xl text-lg font-semibold text-surface-800 dark:text-surface-100 mb-2">Start a Conversation</h3>
              <p className="text-surface-500 dark:text-surface-400 max-w-md mb-8 md:text-base text-base">Ask questions about your course materials, get explanations, or request summaries.</p>
            </div>
          ) : (
            <div className="space-y-6 py-4">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                > 
                  <div
                    className={`
                      max-w-[85%] rounded-2xl px-5 py-3.5 shadow-sm
                      ${msg.sender === 'user' 
                        ? 'bg-gradient-to-br from-primary-600 to-primary-500 text-white' 
                        : 'bg-white dark:bg-surface-800 text-surface-800 dark:text-surface-100 border border-surface-100 dark:border-surface-700'
                      }
                    `}
                  >
                    <div className="prose prose-sm dark:prose-invert w-fit">
                      <ReactMarkdown>{msg.content.replace(/\\n/g, '\n')}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
          {/* Loading indicator for AI response */}
          {loading && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl px-5 py-3.5 shadow-sm bg-white dark:bg-surface-800 text-surface-800 dark:text-surface-100 border border-surface-100 dark:border-surface-700">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-primary-400 dark:bg-primary-500 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-primary-400 dark:bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-2 h-2 bg-primary-400 dark:bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                  <span className="text-surface-500 dark:text-surface-400 text-sm">Typing...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Message Input */}
        { showForm &&
        <form onSubmit={handleSubmit} className="p-4 border-t border-surface-100 dark:border-surface-700 bg-white dark:bg-surface-800 sticky bottom-0 shadow-md">
          <div className="flex flex-col gap-3">
            <div className="relative flex-col items-end rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50/50 dark:bg-surface-700/20 focus-within:ring-2 focus-within:ring-primary-500/30 dark:focus-within:ring-primary-500/20 transition-all">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onInput={() => {
                  if (textareaRef.current) {
                    textareaRef.current.style.height = 'auto'
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
                placeholder="Ask anything about your course..."
                className="max-h-[80px] sm:max-h-[150px] min-h-[60px] w-full flex-1 bg-transparent placeholder:text-surface-400 dark:placeholder:text-surface-500 resize-none px-4 py-3 pr-20 overflow-y-auto outline-none focus:ring-0 focus:border-transparent border-0"
                rows={1}
              />
              <div className="absolute bottom-2 right-2 flex justify-end gap-2">
                {/* <button
                  type="button"
                  className="p-2 text-surface-400 dark:text-surface-500 hover:text-surface-600 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-full transition-colors"
                >
                  <Paperclip size={18} />
                </button> */}
                <button
                  type="submit"
                  className="bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white p-2.5 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  disabled={!message.trim()}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
            <div className="text-xs text-surface-500 dark:text-surface-400 text-center">
              Press Enter to send, Shift+Enter for a new line
            </div>
          </div>
        </form>
        }
      </div>
    </div>
    )
}

export default Chatbox;