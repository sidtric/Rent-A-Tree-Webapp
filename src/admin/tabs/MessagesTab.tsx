import { useState } from 'react';
import type { AdminMessage } from '../types';

interface Props {
  messages: AdminMessage[];
  deleteMessage: (id: string) => Promise<void>;
}

function MessageRow({ msg, expanded, onToggle, onDelete }: {
  msg: AdminMessage;
  expanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <>
      <tr style={{ cursor: 'pointer' }} onClick={onToggle}>
        <td className="adm-td-bold">{msg.name}</td>
        <td className="adm-td-dim">{msg.email}</td>
        <td className="adm-td-comment">
          {expanded ? msg.message : (msg.message?.slice(0, 100) + (msg.message?.length > 100 ? '…' : ''))}
        </td>
        <td>
          <span className="adm-role-badge adm-role-badge--user">{msg.type || 'contact'}</span>
        </td>
        <td className="adm-td-date">
          {new Date(msg.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
        </td>
        <td onClick={e => e.stopPropagation()}>
          <button className="adm-btn-danger-sm" onClick={onDelete}>Delete</button>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={6} style={{ background: '#f6f9f5', padding: '12px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.6, whiteSpace: 'pre-wrap', flex: 1 }}>
                {msg.message}
              </div>
              <a
                href={`mailto:${msg.email}?subject=Re: Your message to YourOrchard`}
                className="adm-btn-sm"
                onClick={e => e.stopPropagation()}
                style={{ flexShrink: 0 }}
              >
                Reply
              </a>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function MessagesTab({ messages, deleteMessage }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="adm-content">
      <header className="adm-header">
        <div>
          <h1 className="adm-h1">Contact Messages</h1>
          <p className="adm-sub">{messages.length} messages received · click a row to expand</p>
        </div>
      </header>
      <div className="adm-card">
        <table className="adm-table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Message</th><th>Type</th><th>Date</th><th></th></tr>
          </thead>
          <tbody>
            {messages.map(m => (
              <MessageRow
                key={m._id}
                msg={m}
                expanded={expanded === m._id}
                onToggle={() => setExpanded(prev => prev === m._id ? null : m._id)}
                onDelete={() => deleteMessage(m._id)}
              />
            ))}
            {messages.length === 0 && (
              <tr><td colSpan={6} className="adm-td-empty">No messages yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
