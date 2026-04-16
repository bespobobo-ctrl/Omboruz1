'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function RahbarPanel() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [stats, setStats] = useState({ totalUsers: 0, activeUsers: 0, totalProducts: 0 });

    // New user form
    const [newUser, setNewUser] = useState({
        fullName: '',
        username: '',
        password: '',
    });

    const getToken = () => localStorage.getItem('omboruz_token');

    const fetchUsers = useCallback(async () => {
        try {
            const res = await fetch('/api/users', {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            const data = await res.json();
            if (data.success) {
                setUsers(data.users);
                setStats(prev => ({
                    ...prev,
                    totalUsers: data.users.length,
                    activeUsers: data.users.filter(u => u.isActive).length,
                }));
            }
        } catch (err) {
            console.error('Fetch users error:', err);
        }
    }, []);

    const fetchProducts = useCallback(async () => {
        try {
            const res = await fetch('/api/products', {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            const data = await res.json();
            if (data.success) {
                setStats(prev => ({
                    ...prev,
                    totalProducts: data.products.length,
                }));
            }
        } catch (err) {
            console.error('Fetch products error:', err);
        }
    }, []);

    useEffect(() => {
        const userData = localStorage.getItem('omboruz_user');
        if (!userData) {
            router.push('/');
            return;
        }

        const parsed = JSON.parse(userData);
        if (parsed.role !== 'rahbar') {
            router.push('/');
            return;
        }

        setUser(parsed);
        setLoading(false);
        fetchUsers();
        fetchProducts();
    }, [router, fetchUsers, fetchProducts]);

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!newUser.fullName || !newUser.username || !newUser.password) {
            setError('Barcha maydonlarni to\'ldiring');
            return;
        }

        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify(newUser),
            });

            const data = await res.json();

            if (data.success) {
                setSuccess(`✅ "${data.user.fullName}" muvaffaqiyatli qo'shildi!`);
                setNewUser({ fullName: '', username: '', password: '' });
                fetchUsers();
                setTimeout(() => {
                    setShowModal(false);
                    setSuccess('');
                }, 1500);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Server xatosi');
        }
    };

    const handleDeleteUser = async (userId, userName) => {
        if (!confirm(`"${userName}" ni o'chirmoqchimisiz?`)) return;

        try {
            const res = await fetch(`/api/users?id=${userId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${getToken()}` },
            });

            const data = await res.json();
            if (data.success) {
                fetchUsers();
            }
        } catch (err) {
            console.error('Delete error:', err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('omboruz_token');
        localStorage.removeItem('omboruz_user');
        router.push('/');
    };

    if (loading) {
        return (
            <div className="login-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard">
            {/* Header */}
            <header className="dashboard-header">
                <div className="header-left">
                    <div className="header-icon">👔</div>
                    <div>
                        <div className="header-title">Rahbar Panel</div>
                        <div className="header-role">Administrator</div>
                    </div>
                </div>
                <button className="btn-logout" onClick={handleLogout}>
                    Chiqish
                </button>
            </header>

            <div className="dashboard-content">
                {/* Stats */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">👥</div>
                        <div className="stat-value">{stats.totalUsers}</div>
                        <div className="stat-label">Jami xodimlar</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">✅</div>
                        <div className="stat-value">{stats.activeUsers}</div>
                        <div className="stat-label">Faol xodimlar</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">📦</div>
                        <div className="stat-value">{stats.totalProducts}</div>
                        <div className="stat-label">Jami mahsulotlar</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🏭</div>
                        <div className="stat-value">1</div>
                        <div className="stat-label">Ombor</div>
                    </div>
                </div>

                {/* Users Section */}
                <div className="section">
                    <div className="section-header">
                        <h2 className="section-title">
                            👥 Ombor Xodimlari
                        </h2>
                        <button className="btn-add" onClick={() => setShowModal(true)}>
                            ➕ Qo'shish
                        </button>
                    </div>

                    <div className="card-list">
                        {users.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">👤</div>
                                <p className="empty-text">Hozircha xodimlar yo'q</p>
                                <p className="empty-text">Ombor xodimini qo'shish uchun "Qo'shish" tugmasini bosing</p>
                            </div>
                        ) : (
                            users.map((u) => (
                                <div className="card-item" key={u._id}>
                                    <div className="card-header">
                                        <span className="card-name">👤 {u.fullName}</span>
                                        <span className={`card-badge ${u.isActive ? 'badge-active' : 'badge-inactive'}`}>
                                            {u.isActive ? 'Faol' : 'Nofaol'}
                                        </span>
                                    </div>
                                    <div className="card-details">
                                        <span className="card-detail">🔑 Login: <strong>{u.username}</strong></span>
                                        <span className="card-detail">📅 {new Date(u.createdAt).toLocaleDateString('uz-UZ')}</span>
                                    </div>
                                    {u.isActive && (
                                        <div className="card-actions">
                                            <button
                                                className="btn-danger"
                                                onClick={() => handleDeleteUser(u._id, u.fullName)}
                                            >
                                                🗑 O'chirish
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Create User Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="modal-title">➕ Yangi Xodim</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>

                        <form onSubmit={handleCreateUser}>
                            {error && <div className="error-message">{error}</div>}
                            {success && <div className="success-message">{success}</div>}

                            <div className="form-group">
                                <label className="form-label">To'liq ism</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Familiya Ism"
                                    value={newUser.fullName}
                                    onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Login</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Loginni kiriting"
                                    value={newUser.username}
                                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Parol</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Parolni kiriting"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    required
                                />
                            </div>

                            <button type="submit" className="btn-primary">
                                ✅ Xodimni Qo'shish
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
