import type { AdminMessage } from '../types';

interface Props {
  messages: AdminMessage[];
  deleteMessage: (id: string) => Promise<void>;
}

function MessageRow({ msg, onDelete }: { msg: AdminMessage; onDelete: () => void }) {
  return (
    <tr>
      <td className="adm-td-bold">{msg.name}</td>
      <td className="adm-td-dim">{msg.email}</td>
      <td className="adm-td-comment">
        {msg.message?.slice(0, 100)}{msg.message?.length > 100 ? '…' : ''}
      </td>
      <td>
        <span className="adm-role-badge adm-role-badge--user">{msg.type || 'contact'}</span>
      </td>
      <td className="adm-td-date">
        {new Date(msg.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
      </td>
      <td>
        <button className="adm-btn-danger-sm" onClick={onDelete}>Delete</button>
      </td>
    </tr>
  );
}

export default function MessagesTab({ messages, deleteMessage }: Props) {
  return (
    <div className="adm-content">
      <header className="adm-header">
        <div>
          <h1 className="adm-h1">Contact Messages</h1>
          <p className="adm-sub">{messages.length} messages received</p>
        </div>
      </header>
      <div className="adm-card">
        <table className="adm-table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Message</th><th>Type</th><th>Date</th><th></th></tr>
          </thead>
          <tbody>
            {messages.map(m => (
              <MessageRow key={m._id} msg={m} onDelete={() => deleteMessage(m._id)} />
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
