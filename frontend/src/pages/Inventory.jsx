import { useState, useEffect } from 'react';
import api from '../api/axios';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Inventory = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '', sku: '', purchasePrice: '', sellingPrice: '', stockQuantity: '', lowStockThreshold: ''
    });

    const fetchProducts = async () => {
        try {
            const { data } = await api.get('/products');
            setProducts(data);
        } catch (error) {
            toast.error('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await api.delete(`/products/${id}`);
                toast.success('Product deleted');
                fetchProducts();
            } catch (error) {
                toast.error('Failed to delete product');
            }
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            sku: product.sku || '',
            purchasePrice: product.purchasePrice,
            sellingPrice: product.sellingPrice,
            stockQuantity: product.stockQuantity,
            lowStockThreshold: product.lowStockThreshold
        });
        setShowModal(true);
    };

    const handleAddNew = () => {
        setEditingProduct(null);
        setFormData({
            name: '', sku: '', purchasePrice: '', sellingPrice: '', stockQuantity: '', lowStockThreshold: ''
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingProduct) {
                await api.put(`/products/${editingProduct._id}`, formData);
                toast.success('Product updated');
            } else {
                await api.post('/products', formData);
                toast.success('Product created');
            }
            setShowModal(false);
            fetchProducts();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return <div className="loader">Loading Inventory...</div>;

    return (
        <div className="inventory-container">
            <header className="page-header">
                <div className="header-left">
                    <h1>Inventory</h1>
                    <p>Manage your stock and pricing</p>
                </div>
                <button className="btn-primary" onClick={handleAddNew}>
                    <FaPlus /> Add Product
                </button>
            </header>

            <div className="toolbar">
                <div className="search-bar">
                    <FaSearch className="icon" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>SKU</th>
                            <th>Stock</th>
                            <th>Buy Price</th>
                            <th>Sell Price</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map(product => (
                            <tr key={product._id}>
                                <td>{product.name}</td>
                                <td>{product.sku || '-'}</td>
                                <td>
                                    <span className={`badge ${product.stockQuantity <= product.lowStockThreshold ? 'low-stock' : 'in-stock'}`}>
                                        {product.stockQuantity}
                                    </span>
                                </td>
                                <td>₹{product.purchasePrice}</td>
                                <td>₹{product.sellingPrice}</td>
                                <td className="actions">
                                    <button className="icon-btn edit" onClick={() => handleEdit(product)}><FaEdit /></button>
                                    <button className="icon-btn delete" onClick={() => handleDelete(product._id)}><FaTrash /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Simple Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Product Name</label>
                                    <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>SKU (Optional)</label>
                                    <input value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Purchase Price</label>
                                    <input type="number" required value={formData.purchasePrice} onChange={e => setFormData({ ...formData, purchasePrice: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Selling Price</label>
                                    <input type="number" required value={formData.sellingPrice} onChange={e => setFormData({ ...formData, sellingPrice: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Stock Quantity</label>
                                    <input type="number" required value={formData.stockQuantity} onChange={e => setFormData({ ...formData, stockQuantity: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Low Stock Alert At</label>
                                    <input type="number" required value={formData.lowStockThreshold} onChange={e => setFormData({ ...formData, lowStockThreshold: e.target.value })} />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Save Product</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }
                .toolbar { margin-bottom: 1.5rem; }
                .search-bar {
                    position: relative;
                    max-width: 400px;
                }
                .search-bar .icon {
                    position: absolute;
                    left: 1rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-muted);
                }
                .search-bar input {
                    width: 100%;
                    padding: 0.75rem 1rem 0.75rem 2.5rem;
                    background: rgba(15, 23, 42, 0.6);
                    border: 1px solid var(--glass-border);
                    border-radius: 0.5rem;
                    color: white;
                }

                .table-container {
                    background: var(--card-bg);
                    border: 1px solid var(--glass-border);
                    border-radius: 1rem;
                    overflow: hidden;
                }
                table { width: 100%; border-collapse: collapse; }
                th, td {
                    padding: 1rem;
                    text-align: left;
                    border-bottom: 1px solid var(--glass-border);
                }
                th {
                    background: rgba(0,0,0,0.2);
                    font-weight: 600;
                    color: var(--text-muted);
                }
                tr:last-child td { border-bottom: none; }
                
                .badge {
                    padding: 0.25rem 0.75rem;
                    border-radius: 1rem;
                    font-size: 0.85rem;
                    font-weight: 600;
                }
                .in-stock { background: rgba(16, 185, 129, 0.2); color: #34d399; }
                .low-stock { background: rgba(239, 68, 68, 0.2); color: #f87171; }

                .actions { display: flex; gap: 0.5rem; }
                .icon-btn {
                    padding: 0.5rem;
                    border-radius: 0.5rem;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }
                .edit { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
                .delete { background: rgba(239, 68, 68, 0.2); color: #f87171; }
                .icon-btn:hover { transform: scale(1.1); }

                /* Modal Styles */
                .modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.7);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }
                .modal-content {
                    background: #1e293b;
                    padding: 2rem;
                    border-radius: 1rem;
                    width: 100%;
                    max-width: 600px;
                    border: 1px solid var(--glass-border);
                }
                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                    margin: 1.5rem 0;
                }
                .form-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-size: 0.9rem;
                    color: var(--text-muted);
                }
                .form-group input {
                    width: 100%;
                    padding: 0.75rem;
                    background: rgba(0,0,0,0.2);
                    border: 1px solid var(--glass-border);
                    border-radius: 0.5rem;
                    color: white;
                }
                .modal-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                }
                .btn-secondary {
                    background: transparent;
                    border: 1px solid var(--glass-border);
                    color: var(--text-muted);
                    padding: 0.75rem 1.5rem;
                    border-radius: 0.5rem;
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
};

export default Inventory;
