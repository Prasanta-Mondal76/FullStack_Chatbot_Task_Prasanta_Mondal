import { useEffect, useRef, useState } from 'react';
import { api } from '../api/client';
import {
  emptyFlow,
  getFallback,
  getGreeting,
  handleFlowInput,
  matchIntent,
  startEnquiryFlow,
  type ChatMessage,
  type FlowState,
} from '../chatbot/engine';
import '../css/ChatWidget.css';

let idCounter = 1;
const nextId = () => idCounter++;

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [flow, setFlow] = useState<FlowState>(emptyFlow());
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const g = getGreeting();
    setMessages([{ id: nextId(), from: 'bot', text: g.text, chips: g.chips }]);
    const handler = () => setOpen(true);
    window.addEventListener('open-chat', handler);
    // Demo helper: ?chat=open auto-opens the widget (used for screenshots)
    if (new URLSearchParams(window.location.search).get('chat') === 'open') setOpen(true);
    return () => window.removeEventListener('open-chat', handler);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const pushBot = (texts: string[], chips?: string[]) => {
    setMessages((prev) => [
      ...prev,
      ...texts.map((t, i) => ({
        id: nextId(),
        from: 'bot' as const,
        text: t,
        chips: i === texts.length - 1 ? chips : undefined,
      })),
    ]);
  };

  const doSubmit = async (data: FlowState['data']) => {
    setSending(true);
    try {
      const res = await api.create({ ...data });
      pushBot(
        [
          `Done! Your enquiry has been submitted successfully. Our team will contact you soon. (Reference: ${res.data._id})`,
        ],
        ['Our services', 'Courses']
      );
    } catch (e) {
      pushBot(
        [e instanceof Error ? e.message : 'Submission failed. Please try again.'],
        ['Submit an enquiry']
      );
    } finally {
      setSending(false);
      setFlow(emptyFlow());
    }
  };

  const send = (raw: string) => {
    const text = raw.trim();
    if (!text || sending) return;
    setMessages((prev) => [...prev, { id: nextId(), from: 'user', text }]);
    setInput('');

    // Guided enquiry flow takes priority while active
    if (flow.step !== 'idle') {
      const result = handleFlowInput(text, flow);
      setFlow(result.next);
      if (result.submit) {
        void doSubmit(result.next.data);
        return;
      }
      pushBot(result.botTexts, result.chips);
      return;
    }

    const intent = matchIntent(text);
    if (intent?.id === 'enquiry') {
      const s = startEnquiryFlow();
      setFlow(s.next);
      pushBot(s.botTexts);
      return;
    }
    if (intent) {
      pushBot([intent.reply], intent.chips);
    } else {
      const f = getFallback();
      pushBot([f.text], f.chips);
    }
  };

  const clear = () => {
    setFlow(emptyFlow());
    const g = getGreeting();
    setMessages([{ id: nextId(), from: 'bot', text: g.text, chips: g.chips }]);
  };

  const last = messages[messages.length - 1];
  const showChips = last && last.from === 'bot' && last.chips && last.chips.length > 0;

  return (
    <>
      <button
        className={`chat-fab ${open ? 'hidden' : ''}`}
        onClick={() => setOpen(true)}
        aria-label="Open chat"
      >
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      </button>

      {open && (
        <div className="chat-panel" role="dialog" aria-label="DroneTV assistant chat">
          <div className="chat-header">
            <div>
              <strong>DroneTV Assistant</strong>
              <span className="chat-status">Online — replies instantly</span>
            </div>
            <div className="chat-header-actions">
              <button onClick={clear} title="Clear conversation" aria-label="Clear conversation">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                </svg>
              </button>
              <button onClick={() => setOpen(false)} aria-label="Close chat">✕</button>
            </div>
          </div>

          <div className="chat-messages">
            {messages.map((m) => (
              <div key={m.id} className={`msg ${m.from}`}>
                <div className="bubble">{m.text}</div>
              </div>
            ))}
            {sending && (
              <div className="msg bot">
                <div className="bubble typing">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {showChips && (
            <div className="chips">
              {last.chips!.map((c) => (
                <button key={c} onClick={() => send(c)} disabled={sending}>
                  {c}
                </button>
              ))}
            </div>
          )}

          <form
            className="chat-input"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question…"
              aria-label="Type your question"
              disabled={sending}
            />
            <button type="submit" disabled={sending || !input.trim()} aria-label="Send">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13" />
                <path d="M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
