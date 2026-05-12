import { useUserRoles } from '../hooks/useAdminData';

interface Props {
  flash: (msg: string) => void;
}

export default function UserRolesTab({ flash }: Props) {
  const { search, setSearch, results, searching, updating, searchUsers, setRole } = useUserRoles();

  const handleSearch = async () => {
    const found = await searchUsers();
    if (found === false) flash('Search failed');
    else if (!found) flash('No users found');
  };

  const handleSetRole = async (userId: string, role: 'user' | 'admin') => {
    try {
      const updated = await setRole(userId, role);
      if (updated._id) flash(`Role updated to "${role}"`);
      else flash(updated.message || 'Update failed');
    } catch {
      flash('Failed to update role');
    }
  };

  return (
    <div className="adm-section">
      <div className="adm-section-hdr">
        <h2>🔑 User Roles</h2>
        <p className="adm-section-sub">Search a user by email and grant or revoke admin access.</p>
      </div>

      <div className="adm-role-search-bar">
        <input
          className="adm-input"
          placeholder="Search by email address..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <button className="adm-btn-primary" onClick={handleSearch} disabled={searching}>
          {searching ? 'Searching…' : 'Search'}
        </button>
      </div>

      {results.length > 0 && (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Current Role</th><th>Action</th></tr>
            </thead>
            <tbody>
              {results.map((u: any) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`adm-role-badge adm-role-badge--${u.role || 'user'}`}>
                      {u.role === 'admin' ? '🔑 Admin' : '👤 User'}
                    </span>
                  </td>
                  <td>
                    {u.role === 'admin' ? (
                      <button
                        className="adm-btn-danger-sm"
                        disabled={updating === u._id}
                        onClick={() => handleSetRole(u._id, 'user')}
                      >
                        {updating === u._id ? '…' : 'Revoke Admin'}
                      </button>
                    ) : (
                      <button
                        className="adm-btn-primary-sm"
                        disabled={updating === u._id}
                        onClick={() => handleSetRole(u._id, 'admin')}
                      >
                        {updating === u._id ? '…' : 'Grant Admin'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
