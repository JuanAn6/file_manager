import { useEffect, useState } from 'react';
import api from '../api/axios';
import Loading from './custom/Loading';
import Icon from './custom/Icon';
import Modal from './modals/Modal';
import { formatDateFromDatabse } from '../utils/utils';

const PAGE_SIZE = 10;

function UsersList() {
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [roles, setRoles] = useState([]);

  const [editing, setEditing] = useState(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const getUsers = async (targetPage) => {
    setLoadingComplete(false);
    setError('');
    try {
      const response = await api.get('/get_users_list', {
        params: { page: targetPage, pageSize: PAGE_SIZE },
      });
      setUsers(response.data.data ?? []);
      setPagination(response.data);
    } catch (err) {
      console.error('Error getting user list:', err);
      setError('The user list could not be loaded.');
    } finally {
      setLoadingComplete(true);
    }
  };

  useEffect(() => {
    getUsers(page);
  }, [page]);

  useEffect(() => {
    // The role select needs the catalogue; a failure only costs the select.
    api
      .get('/roles')
      .then((response) => setRoles(response.data.roles ?? []))
      .catch((err) => console.error('Error getting roles:', err));
  }, []);

  const lastPage = Number(pagination.last_page) || 1;

  const goEditUser = (user) => {
    setFormError('');
    setEditing({
      id: user.id,
      name: user.name ?? '',
      last_name: user.last_name ?? '',
      email: user.email ?? '',
      rol_id: user.rol_id ?? '',
    });
  };

  const handleEditChange = (evt) => {
    const { name, value } = evt.target;
    setEditing((current) => ({ ...current, [name]: value }));
  };

  const saveUser = async () => {
    setSaving(true);
    setFormError('');
    try {
      await api.put(`/users/${editing.id}`, {
        name: editing.name.trim(),
        last_name: editing.last_name.trim() === '' ? null : editing.last_name.trim(),
        email: editing.email.trim(),
        rol_id: Number(editing.rol_id),
      });
      setEditing(null);
      getUsers(page);
    } catch (err) {
      console.error('Error updating user:', err);
      // Laravel returns 422 with a per-field message; show the first one.
      const messages = err.response?.data?.errors;
      setFormError(
        messages ? Object.values(messages)[0][0] : 'The user could not be saved.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className='card'>
      <p className='kicker'>Administration</p>
      <h2>Users</h2>
      <hr className='hr' />

      {!loadingComplete ? (
        <Loading />
      ) : error ? (
        <p className='field-error' role='alert'>{error}</p>
      ) : (
        <>
          <table className='table'>
            <thead>
              <tr>
                <th>Name</th>
                <th>Last name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created at</th>
                <th className='col-fit'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className='muted'>No users found.</td>
                </tr>
              )}

              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.last_name ?? '—'}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className='tag tag-neutral'>{user.role?.name ?? '—'}</span>
                  </td>
                  <td className='num'>{formatDateFromDatabse(user.created_at)}</td>
                  <td className='col-fit'>
                    <button type='button' className='btn btn-ghost btn-sm' onClick={() => goEditUser(user)}>
                      <Icon name='pencil' size={16} /> Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className='pagination'>
            <p className='kicker' style={{ margin: 0 }}>
              {pagination.from ?? 0} to {pagination.to ?? 0} of {pagination.total ?? 0}
            </p>

            <div className='cluster' style={{ gap: 'var(--space-2xs)' }}>
              <button type='button' className='btn btn-secondary btn-sm' onClick={() => setPage(1)} disabled={page <= 1}>
                <Icon name='chevrons-left' size={16} /> First
              </button>
              <button
                type='button'
                className='btn btn-secondary btn-sm'
                onClick={() => setPage((current) => Math.max(current - 1, 1))}
                disabled={page <= 1}
              >
                <Icon name='chevron-left' size={16} /> Prev
              </button>

              <input
                className='input pagination-input'
                type='number'
                min='1'
                max={lastPage}
                step='1'
                value={page}
                onChange={(evt) => {
                  // The input hands back a string: convert, then clamp to range.
                  const requested = Number(evt.target.value);
                  if (!Number.isFinite(requested)) return;
                  setPage(Math.min(Math.max(Math.trunc(requested), 1), lastPage));
                }}
                aria-label='Page number'
              />

              <button
                type='button'
                className='btn btn-secondary btn-sm'
                onClick={() => setPage((current) => Math.min(current + 1, lastPage))}
                disabled={page >= lastPage}
              >
                Next <Icon name='chevron-right' size={16} />
              </button>
              <button
                type='button'
                className='btn btn-secondary btn-sm'
                onClick={() => setPage(lastPage)}
                disabled={page >= lastPage}
              >
                Last <Icon name='chevrons-right' size={16} />
              </button>
            </div>
          </div>
        </>
      )}

      <Modal isOpen={editing !== null} onClose={() => setEditing(null)} title='Edit user'>
        {editing && (
          <form
            onSubmit={(evt) => {
              evt.preventDefault();
              saveUser();
            }}
          >
            <div className='dialog-body stack'>
              <div className='field'>
                <label htmlFor='user_name'>Name</label>
                <input id='user_name' className='input' name='name' value={editing.name} onChange={handleEditChange} required />
              </div>

              <div className='field'>
                <label htmlFor='user_last_name'>Last name</label>
                <input
                  id='user_last_name'
                  className='input'
                  name='last_name'
                  value={editing.last_name}
                  onChange={handleEditChange}
                />
              </div>

              <div className='field'>
                <label htmlFor='user_email'>Email</label>
                <input
                  id='user_email'
                  className='input'
                  type='email'
                  name='email'
                  value={editing.email}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className='field'>
                <label htmlFor='user_rol_id'>Role</label>
                <select id='user_rol_id' className='input' name='rol_id' value={editing.rol_id} onChange={handleEditChange} required>
                  <option value='' disabled>Select a role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>

              {formError && <p className='field-error' role='alert'>{formError}</p>}
            </div>

            <div className='dialog-actions'>
              <button type='button' className='btn btn-secondary' onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button type='submit' className='btn btn-primary' disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

export default UsersList;
