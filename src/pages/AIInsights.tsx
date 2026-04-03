import React, { useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../components/GlassCard';
import { Cpu, MessageSquare, Sparkles, BarChart, Activity } from 'lucide-react';

const AIInsights: React.FC = () => {
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hello Tony. Systems are operating at peak efficiency. How can I assist with the broadcast tonight?' }
  ]);

  const handleSend = () => {
    if (!chatInput.trim()) return;
    
    const newMessages = [...messages, { role: 'user', text: chatInput }];
    setMessages(newMessages);
    setChatInput('');

    // Mock AI Response
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', text: `Analyzing "${chatInput}"... Sentiment: POSITIVE. Recommendation: Increase high-fidelity output by 12%.` }]);
    }, 1000);
  };

  return (
    <div style={{ padding: 'var(--spacing-3xl) var(--spacing-xl) 120px var(--spacing-xl)' }}>
      <header style={{ marginBottom: 'var(--spacing-2xl)' }}>
        <h1 style={{ fontSize: '48px', marginBottom: '8px' }}>TONY <span style={{ color: 'var(--tony-primary)' }}>AI</span> INSIGHTS</h1>
        <p style={{ color: 'var(--foreground-muted)' }}>Neural analysis of station data and cultural trends.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '32px' }}>
        
        {/* Analytics Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <GlassCard>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <Activity size={20} color="var(--tony-primary)" />
                <h3 style={{ fontSize: '18px' }}>SENTIMENT ANALYSIS</h3>
              </div>
              <div style={{ height: '100px', display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
                {[40, 70, 45, 90, 65, 80, 85].map((h, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    style={{ flex: 1, backgroundColor: 'var(--tony-primary)', opacity: 0.6, borderRadius: '2px' }} 
                  />
                ))}
              </div>
              <p style={{ marginTop: '16px', fontSize: '12px', color: 'var(--foreground-muted)' }}>Current audience vibe: <span style={{ color: 'var(--tony-primary)', fontWeight: 900 }}>EXTREMELY POSITIVE</span></p>
            </GlassCard>

            <GlassCard>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <BarChart size={20} color="var(--tony-secondary)" />
                <h3 style={{ fontSize: '18px' }}>GENRE VELOCITY</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { name: 'AFRO-BEAT', val: '88%' },
                  { name: 'TECHNO', val: '72%' },
                  { name: 'DUBSTEP', val: '45%' },
                ].map(g => (
                  <div key={g.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: 'var(--foreground-dim)' }}>{g.name}</span>
                    <span style={{ color: 'var(--tony-secondary)', fontWeight: 900 }}>{g.val}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          <GlassCard style={{ flex: 1 }}>
            <h3 style={{ fontSize: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Sparkles size={20} style={{ color: '#FFD700' }} /> AUTONOMOUS AGENTS
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                { name: 'AI DJ', status: 'BROADCASTING', desc: 'Real-time set curation and crossfading.' },
                { name: 'CURATOR', status: 'ACTIVE', desc: 'Scanning media vault for high-fidelity gems.' },
                { name: 'ANALYST', status: 'SLEEP', desc: 'Predicting next cultural genre velocity.' },
                { name: 'MODERATOR', status: 'ONLINE', desc: 'Monitoring community chat for vibe sync.' },
              ].map((agent, i) => (
                <div key={i} style={{ padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 900, fontSize: '12px' }}>{agent.name}</span>
                    <span style={{ fontSize: '8px', padding: '2px 6px', borderRadius: '4px', background: agent.status === 'BROADCASTING' ? 'var(--tony-secondary)' : 'var(--tony-primary)', color: 'black', fontWeight: 900 }}>{agent.status}</span>
                  </div>
                  <p style={{ fontSize: '10px', color: 'var(--foreground-muted)', lineHeight: 1.4 }}>{agent.desc}</p>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard style={{ flex: 1 }}>
            <h3 style={{ fontSize: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Sparkles size={20} style={{ color: '#FFD700' }} /> AI RECOMMENDATIONS
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                'Schedule more high-BPM tracks between 10PM and 2AM based on listener density.',
                'The sentiment spikes during "Midnight Frequency" sets—consider extending the time slot.',
                'Audience in London is showing increased interest in limited edition vinyl drops.',
              ].map((rec, i) => (
                <div key={i} style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', fontSize: '14px', lineHeight: 1.5 }}>
                  {rec}
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* AI Chat Section */}
        <GlassCard style={{ display: 'flex', flexDirection: 'column', height: '600px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--tony-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--tony-dark)' }}>
              <Cpu size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px' }}>TONY AI</h3>
              <div style={{ fontSize: '10px', color: 'var(--tony-primary)', fontWeight: 900 }}>SYSTEMS ONLINE</div>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ 
                alignSelf: msg.role === 'ai' ? 'flex-start' : 'flex-end', 
                maxWidth: '80%', 
                padding: '12px', 
                borderRadius: '12px', 
                background: msg.role === 'ai' ? 'rgba(255,255,255,0.05)' : 'var(--tony-primary)', 
                color: msg.role === 'ai' ? 'white' : 'var(--tony-dark)',
                fontSize: '14px',
                fontWeight: msg.role === 'user' ? 500 : 400
              }}>
                {msg.text}
              </div>
            ))}
          </div>

          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            style={{ position: 'relative' }}
          >
            <input 
              type="text" 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask Tony AI..." 
              style={{ 
                width: '100%', 
                backgroundColor: 'rgba(0,0,0,0.3)', 
                border: '1px solid var(--tony-border)', 
                borderRadius: '12px',
                padding: '16px 48px 16px 16px',
                color: 'white',
                fontFamily: 'inherit'
              }} 
            />
            <button 
              type="submit"
              style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--tony-primary)', background: 'none' }}
            >
              <MessageSquare size={20} />
            </button>
          </form>
        </GlassCard>

      </div>
    </div>
  );
};

export default AIInsights;
