'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const CATEGORIES = [
    'Xom ashyo',
    'Tayyor mahsulot',
    'Ehtiyot qism',
    'Asbob-uskunalar',
    'Qadoqlash',
    'Kimyoviy moddalar',
    'Elektr jihozlar',
    'Boshqa',
];

const UNITS = [
    { value: 'dona', label: 'Dona' },
    { value: 'kg', label: 'Kilogramm (kg)' },
    { value: 'litr', label: 'Litr' },
    { value: 'metr', label: 'Metr' },
    { value: 'pachka', label: 'Pachka' },
    { value: 'quti', label: 'Quti' },
];

export default function OmborPanel() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showQR, setShowQR] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeCategory, setActiveCategory] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('products');

    // New product form
    const [newProduct, setNewProduct] = useState({
        name: '',
        category: CATEGORIES[0],
        description: '',
        quantity: '',
        unit: 'dona',
        price: '',
    });

    const getToken = () => localStorage.getItem('omboruz_token');

    const fetchProducts = useCallback(async () => {
        try {
            let url = '/api/products?';
            if (activeCategory) url += `category=${encodeURIComponent(activeCategory)}&`;
            if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;

            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            const data = await res.json();
            if (data.success) {
                setProducts(data.products);
                setCategories(data.categories || []);
            }
        } catch (err) {
            console.error('Fetch products error:', err);
        }
    }, [activeCategory, searchQuery]);

    useEffect(() => {
        const userData = localStorage.getItem('omboruz_user');
        if (!userData) {
            router.push('/');
            return;
        }

        const parsed = JSON.parse(userData);
        if (parsed.role !== 'ombor' && parsed.role !== 'rahbar') {
            router.push('/');
            return;
        }

        setUser(parsed);
        setLoading(false);
    }, [router]);

    useEffect(() => {
        if (user) {
            fetchProducts();
        }
    }, [user, fetchProducts]);

    const handleCreateProduct = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!newProduct.name || !newProduct.category) {
            setError('Mahsulot nomi va kategoriyasi kerak');
            return;
        }

        try {
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify({
                    ...newProduct,
                    quantity: Number(newProduct.quantity) || 0,
                    price: Number(newProduct.price) || 0,
                }),
            });

            const data = await res.json();

            if (data.success) {
                setSuccess(`✅ "${data.product.name}" qo'shildi! SKU: ${data.product.sku}`);
                setShowQR(data.product);
                setNewProduct({
                    name: '',
                    category: CATEGORIES[0],
                    description: '',
                    quantity: '',
                    unit: 'dona',
                    price: '',
                });
                fetchProducts();
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Server xatosi');
        }
    };

    const handleDeleteProduct = async (id, name) => {
        if (!confirm(`"${name}" ni o'chirmoqchimisiz?`)) return;

        try {
            const res = await fetch(`/api/products?id=${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${getToken()}` },
            });

            const data = await res.json();
            if (data.success) {
                fetchProducts();
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

    const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0);
    const uniqueCategories = [...new Set(products.map(p => p.category))];

    return (
        <div className="dashboard">
            {/* Header */}
            <header className="dashboard-header">
                <div className="header-left">
                    <div className="header-icon">📦</div>
                    <div>
                        <div className="header-title">Ombor</div>
                        <div className="header-role">{user?.fullName}</div>
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
                        <div className="stat-icon">📦</div>
                        <div className="stat-value">{products.length}</div>
                        <div className="stat-label">Mahsulotlar</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">📊</div>
                        <div className="stat-value">{totalQuantity}</div>
                        <div className="stat-label">Jami soni</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🏷</div>
                        <div className="stat-value">{uniqueCategories.length}</div>
                        <div className="stat-label">Kategoriyalar</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">📱</div>
                        <div className="stat-value">{products.filter(p => p.qrCode).length}</div>
                        <div className="stat-label">QR kodlar</div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="tabs">
                    <button
                        className={`tab ${activeTab === 'products' ? 'active' : ''}`}
                        onClick={() => setActiveTab('products')}
                    >
                        📦 Mahsulotlar
                    </button>
                    <button
                        className={`tab ${activeTab === 'add' ? 'active' : ''}`}
                        onClick={() => setActiveTab('add')}
                    >
                        ➕ Qo'shish
                    </button>
                </div>

                {/* Add Product Tab */}
                {activeTab === 'add' && (
                    <div className="section">
                        <div className="section-header">
                            <h2 className="section-title">➕ Yangi Mahsulot</h2>
                        </div>

                        <div className="card-item">
                            <form onSubmit={handleCreateProduct}>
                                {error && <div className="error-message">{error}</div>}
                                {success && <div className="success-message">{success}</div>}

                                <div className="form-group">
                                    <label className="form-label">Mahsulot nomi</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Mahsulot nomini kiriting"
                                        value={newProduct.name}
                                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Kategoriya</label>
                                    <select
                                        className="form-select"
                                        value={newProduct.category}
                                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                                    >
                                        {CATEGORIES.map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Tavsif</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Qisqa tavsif (ixtiyoriy)"
                                        value={newProduct.description}
                                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div className="form-group">
                                        <label className="form-label">Soni</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            placeholder="0"
                                            min="0"
                                            value={newProduct.quantity}
                                            onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">O'lchov birligi</label>
                                        <select
                                            className="form-select"
                                            value={newProduct.unit}
                                            onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                                        >
                                            {UNITS.map((u) => (
                                                <option key={u.value} value={u.value}>{u.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Narxi (so'm)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        placeholder="0"
                                        min="0"
                                        value={newProduct.price}
                                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                    />
                                </div>

                                <button type="submit" className="btn-primary">
                                    📦 Mahsulotni Qo'shish + QR Kod
                                </button>
                            </form>
                        </div>

                        {/* Show QR Code after adding */}
                        {showQR && (
                            <div className="card-item" style={{ marginTop: '16px', textAlign: 'center' }}>
                                <h3 style={{ marginBottom: '12px', color: 'var(--accent-success)' }}>
                                    ✅ QR Kod Yaratildi!
                                </h3>
                                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                    {showQR.name} — {showQR.sku}
                                </p>
                                <div className="qr-container">
                                    <img src={showQR.qrCode} alt="QR Code" className="qr-image" />
                                    <p className="qr-sku">{showQR.sku}</p>
                                </div>
                                <button
                                    className="btn-secondary"
                                    style={{ marginTop: '12px' }}
                                    onClick={() => {
                                        const link = document.createElement('a');
                                        link.download = `QR_${showQR.sku}.png`;
                                        link.href = showQR.qrCode;
                                        link.click();
                                    }}
                                >
                                    📥 QR Kodni Yuklab Olish
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Products Tab */}
                {activeTab === 'products' && (
                    <div className="section">
                        <div className="section-header">
                            <h2 className="section-title">📦 Mahsulotlar</h2>
                        </div>

                        {/* Search */}
                        <div className="search-bar">
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Qidirish..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Category Filter */}
                        <div className="category-filter">
                            <button
                                className={`category-chip ${activeCategory === '' ? 'active' : ''}`}
                                onClick={() => setActiveCategory('')}
                            >
                                Barchasi
                            </button>
                            {(categories.length > 0 ? categories : uniqueCategories).map((cat) => (
                                <button
                                    key={cat}
                                    className={`category-chip ${activeCategory === cat ? 'active' : ''}`}
                                    onClick={() => setActiveCategory(activeCategory === cat ? '' : cat)}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Product List */}
                        <div className="card-list">
                            {products.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">📦</div>
                                    <p className="empty-text">Hozircha mahsulotlar yo'q</p>
                                    <p className="empty-text">"Qo'shish" tabiga o'ting va birinchi mahsulotni qo'shing</p>
                                </div>
                            ) : (
                                products.map((product) => (
                                    <ProductCard
                                        key={product._id}
                                        product={product}
                                        onDelete={handleDeleteProduct}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function ProductCard({ product, onDelete }) {
    const [showQR, setShowQR] = useState(false);

    return (
        <div className="card-item">
            <div className="card-header">
                <span className="card-name">{product.name}</span>
                <span className="card-badge badge-category">{product.category}</span>
            </div>

            <div className="card-details">
                <span className="card-detail">📊 {product.quantity} {product.unit}</span>
                <span className="card-detail">🔖 {product.sku}</span>
                {product.price > 0 && (
                    <span className="card-detail">💰 {product.price.toLocaleString()} so'm</span>
                )}
            </div>

            {product.description && (
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
                    {product.description}
                </p>
            )}

            <div className="card-actions">
                <button
                    className="btn-secondary"
                    style={{ fontSize: '12px', padding: '6px 12px' }}
                    onClick={() => setShowQR(!showQR)}
                >
                    📱 {showQR ? 'Yopish' : 'QR Kod'}
                </button>
                <button
                    className="btn-danger"
                    style={{ fontSize: '12px', padding: '6px 12px' }}
                    onClick={() => onDelete(product._id, product.name)}
                >
                    🗑 O'chirish
                </button>
            </div>

            {showQR && product.qrCode && (
                <div style={{ marginTop: '12px' }}>
                    <div className="qr-container">
                        <img src={product.qrCode} alt="QR Code" className="qr-image" />
                        <p className="qr-sku">{product.sku}</p>
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '8px' }}>
                        <button
                            className="btn-secondary"
                            style={{ fontSize: '12px' }}
                            onClick={() => {
                                const link = document.createElement('a');
                                link.download = `QR_${product.sku}.png`;
                                link.href = product.qrCode;
                                link.click();
                            }}
                        >
                            📥 Yuklab Olish
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
