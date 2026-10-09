import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { matchPartnersWithAI, AIMatchResult } from '../../utils/aiPartnerMatcher';
import { Bot, Send, Sparkles, X, CheckCircle2, MapPin, Star, ShieldCheck } from 'lucide-react';

interface AIMatchingAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPartner?: (partnerId: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  matches?: AIMatchResult[];
}

export const AIMatchingAssistant: React.FC<AIMatchingAssistantProps> = ({ isOpen, onClose, onSelectPartner }) => {
  const { users, serviceListings, currentUser, setActiveView, directRehirePartner } = useApp();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Hello! I am LokWorks AI Matching Assistant. Ask me to find verified technicians or gig workers near your area. For example:\n• \"Find me the best electrician near Koramangala\"\n• \"Need experienced plumber for bathroom leakage\"\n• \"Find 5 punctual event helpers for weekend expo\"",
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      text: query,
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const { replyText, matches } = matchPartnersWithAI(
        query,
        users,
        serviceListings,
        currentUser?.role || 'client'
      );
      const aiMsg: ChatMessage = {
        id: `msg_ai_${Date.now()}`,
        sender: 'ai',
        text: replyText,
        matches,
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[600px] animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold flex items-center gap-2">
                <span>AI Partner Matcher</span>
                <span className="text-[10px] bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded font-mono">
                  BENGALURU LOCAL
                </span>
              </div>
              <p className="text-xs text-slate-400">Semantic skill & reliability matching</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-md text-lg font-bold">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed whitespace-pre-line ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-xs'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs shadow-xs'
                }`}
              >
                {msg.text}
              </div>

              {/* Ranked Matches Cards */}
              {msg.matches && msg.matches.length > 0 && (
                <div className="w-full mt-3 space-y-2">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Ranked Matches by Reputation & Proximity:
                  </div>
                  {msg.matches.map((item) => (
                    <div
                      key={item.partner.id}
                      className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs hover:border-indigo-300 transition-all flex items-start justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <img
                            src={item.partner.avatar}
                            alt={item.partner.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-bold font-mono flex items-center justify-center">
                            #{item.rank}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-slate-900">{item.partner.name}</span>
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-600">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              {item.partner.rating}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ({item.partner.reviewCount} reviews)
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-600 mt-0.5">
                            {item.highlight}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>{item.reason}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action */}
                      <button
                        onClick={() => {
                          onClose();
                          if (item.service) {
                            setActiveView('services_browse');
                          } else {
                            setActiveView('rehire_partners');
                          }
                        }}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg transition-colors shrink-0"
                      >
                        {item.service ? 'Book Service' : 'Direct Rehire'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-200 px-3 py-2 rounded-xl w-fit">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
              <span>Analyzing partner database & reliability indices...</span>
            </div>
          )}
        </div>

        {/* Preset quick pills */}
        <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px]">
          <span className="text-slate-400 shrink-0 font-medium">Quick prompts:</span>
          <button
            onClick={() => handleSend('Find me the best electrician near Koramangala')}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md whitespace-nowrap transition-colors"
          >
            Best Electrician near Koramangala
          </button>
          <button
            onClick={() => handleSend('Need 5 event helpers for packing tomorrow')}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md whitespace-nowrap transition-colors"
          >
            5 Event Helpers for Expo
          </button>
          <button
            onClick={() => handleSend('Senior plumber for concealed pipe leak')}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md whitespace-nowrap transition-colors"
          >
            Senior Plumber
          </button>
        </div>

        {/* Input bar */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your requirement (e.g. 'Find top electrician near me')..."
            className="flex-1 px-4 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl transition-colors shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
