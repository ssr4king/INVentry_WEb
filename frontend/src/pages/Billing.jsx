import { useState, useEffect } from 'react';
import api from '../api/axios';
import { FaSearch, FaShoppingCart, FaReceipt, FaTrash, FaPrint, FaPlus, FaMinus } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Billing = () => {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [taxRate, setTaxRate] = useState(18); // Default 18% GST
    const [showReceipt, setShowReceipt] = useState(false);
    const [lastSale, setLastSale] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data } = await api.get('/products');
            setProducts(data);
        } catch (error) {
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (product) => {
        if (product.stockQuantity <= 0) {
            toast.error('Out of Stock!');
            return;
        }

        const existingItem = cart.find(item => item.product._id === product._id);

        if (existingItem) {
            if (existingItem.quantity + 1 > product.stockQuantity) {
                toast.error('Not enough stock!');
                return;
            }
            setCart(cart.map(item =>
                item.product._id === product._id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setCart([...cart, { product, quantity: 1 }]);
        }
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.product._id !== productId));
    };

    const updateQuantity = (productId, newQty) => {
        if (newQty < 1) return;
        const item = cart.find(i => i.product._id === productId);
        if (newQty > item.product.stockQuantity) {
            toast.error('Stock limit reached');
            return;
        }
        setCart(cart.map(item =>
            item.product._id === productId
                ? { ...item, quantity: newQty }
                : item
        ));
    };

    const subTotal = cart.reduce((acc, item) => acc + (item.product.sellingPrice * item.quantity), 0);
    const taxAmount = (subTotal * taxRate) / 100;
    const grandTotal = subTotal + taxAmount;

    const handleCheckout = async () => {
        if (cart.length === 0) return;

        if (!window.confirm(`Confirm Sale of ₹${grandTotal.toLocaleString()}?`)) return;

        try {
            const salesData = {
                items: cart.map(item => ({
                    product: item.product._id,
                    quantity: item.quantity
                })),
                taxAmount: taxAmount
            };

            const { data } = await api.post('/sales', salesData);
            setLastSale(data);
            setShowReceipt(true);
            toast.success('Sale Completed Successfully!');
            setCart([]);
            fetchProducts();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Checkout Failed');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="billing-container">
            {/* LEFT: Product Catalog */}
            <div className={`catalog-section ${showReceipt ? 'hide-on-print' : ''}`}>
                <div className="search-bar">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search products by name or SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="product-grid">
                    {filteredProducts.map(product => (
                        <div key={product._id} className="product-card" onClick={() => addToCart(product)}>
                            <div className="card-top">
                                <span className={product.stockQuantity > 5 ? 'badge-stock' : 'badge-low'}>
                                    {product.stockQuantity} Left
                                </span>
                                <span className="price-tag">₹{product.sellingPrice}</span>
                            </div>
                            <h3>{product.name}</h3>
                            <p className="sku">{product.sku}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* RIGHT: Invoice Area */}
            <div className={`invoice-section ${showReceipt ? 'hide-on-print' : ''}`}>
                <div className="invoice-card">
                    <header className="invoice-header">
                        <h2>Current Order</h2>
                        <span className="item-count">{cart.length} items</span>
                    </header>

                    <div className="invoice-body">
                        {cart.length === 0 ? (
                            <div className="empty-state">
                                <FaShoppingCart size={40} />
                                <p>Cart is empty</p>
                            </div>
                        ) : (
                            <div className="cart-list">
                                {cart.map(item => (
                                    <div key={item.product._id} className="cart-row">
                                        <div className="row-info">
                                            <h4>{item.product.name}</h4>
                                            <p>₹{item.product.sellingPrice} x {item.quantity}</p>
                                        </div>
                                        <div className="row-actions">
                                            <button className="qty-btn" onClick={() => updateQuantity(item.product._id, item.quantity - 1)}><FaMinus /></button>
                                            <span className="qty-val">{item.quantity}</span>
                                            <button className="qty-btn" onClick={() => updateQuantity(item.product._id, item.quantity + 1)}><FaPlus /></button>
                                            <button className="del-btn" onClick={() => removeFromCart(item.product._id)}><FaTrash /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="invoice-footer">
                        <div className="calc-row">
                            <label>Subtotal</label>
                            <span>₹{subTotal.toLocaleString()}</span>
                        </div>
                        <div className="calc-row">
                            <label>Tax Rate</label>
                            <select value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))}>
                                <option value={0}>0%</option>
                                <option value={5}>5%</option>
                                <option value={12}>12%</option>
                                <option value={18}>18%</option>
                                <option value={28}>28%</option>
                            </select>
                        </div>
                        <div className="calc-row">
                            <label>Tax Amount</label>
                            <span>₹{taxAmount.toLocaleString()}</span>
                        </div>
                        <div className="total-row">
                            <label>Total</label>
                            <span>₹{grandTotal.toLocaleString()}</span>
                        </div>

                        <button
                            className="checkout-btn"
                            disabled={cart.length === 0}
                            onClick={handleCheckout}
                        >
                            Complete Sale
                        </button>
                    </div>
                </div>
            </div>

            {/* Print Modal */}
            {showReceipt && lastSale && (
                <div className="modal-overlay">
                    <div className="receipt-paper">
                        <div className="receipt-header">
                            <h1>INVOICE</h1>
                            <p>#{lastSale._id.slice(-6).toUpperCase()}</p>
                            <p>{new Date().toLocaleDateString()}</p>
                        </div>
                        <hr />
                        {lastSale.items.map((item, idx) => (
                            <div key={idx} className="receipt-row">
                                <span>{item.name} x{item.quantity}</span>
                                <span>{item.priceAtSale * item.quantity}</span>
                            </div>
                        ))}
                        <hr />
                        <div className="receipt-summary">
                            <p>Subtotal: {lastSale.totalAmount - lastSale.taxAmount}</p>
                            <p>Tax: {lastSale.taxAmount}</p>
                            <h3>Total: {lastSale.totalAmount}</h3>
                        </div>
                        <div className="receipt-actions">
                            <button onClick={handlePrint} className="btn-primary">Print Now</button>
                            <button onClick={() => setShowReceipt(false)} className="btn-secondary">Close</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .billing-container {
                    display: grid;
                    grid-template-columns: 1fr 400px;
                    gap: 2rem;
                    height: calc(100vh - 4rem);
                }

                /* Catalog Section */
                .catalog-section {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                .search-bar {
                    position: relative;
                }
                .search-bar input {
                    width: 100%;
                    padding: 1rem 1rem 1rem 3rem;
                    border: 1px solid var(--glass-border);
                    background: var(--card-bg);
                    color: var(--text-light);
                    border-radius: 1rem;
                    font-size: 1rem;
                }
                .search-icon {
                    position: absolute;
                    left: 1rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-muted);
                }
                .product-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 1rem;
                    overflow-y: auto;
                    padding: 0.5rem; 
                }
                .product-card {
                    background: var(--card-bg);
                    border-radius: 1rem;
                    padding: 1rem;
                    border: 1px solid var(--glass-border);
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .product-card:hover {
                    transform: translateY(-4px);
                    border-color: var(--primary);
                }
                .card-top {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 0.5rem;
                }
                .badge-stock { background: rgba(22, 163, 74, 0.2); color: #4ade80; padding: 0.2rem 0.5rem; border-radius: 0.5rem; font-size: 0.75rem; font-weight: 600; }
                .badge-low { background: rgba(220, 38, 38, 0.2); color: #f87171; padding: 0.2rem 0.5rem; border-radius: 0.5rem; font-size: 0.75rem; font-weight: 600; }
                .price-tag { font-weight: 700; color: var(--text-light); }
                .product-card h3 { font-size: 1rem; color: var(--text-light); margin-bottom: 0.2rem; }
                .sku { font-size: 0.8rem; color: var(--text-muted); }

                /* Invoice Section */
                .invoice-card {
                    background: var(--card-bg);
                    border-radius: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    overflow: hidden;
                    border: 1px solid var(--glass-border);
                }
                .invoice-header {
                    padding: 1.5rem;
                    background: rgba(0,0,0,0.2);
                    border-bottom: 1px solid var(--glass-border);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .invoice-header h2 { font-size: 1.1rem; color: var(--text-light); }
                .item-count { background: rgba(255,255,255,0.1); padding: 0.2rem 0.6rem; border-radius: 1rem; font-size: 0.8rem; color: var(--text-muted); font-weight: 600; }
                
                .invoice-body {
                    flex: 1;
                    overflow-y: auto;
                    padding: 1rem;
                }
                .empty-state {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: var(--text-muted);
                    gap: 1rem;
                }
                .cart-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0.75rem;
                    border-bottom: 1px solid var(--glass-border);
                }
                .row-info h4 { font-size: 0.9rem; color: var(--text-light); }
                .row-info p { font-size: 0.8rem; color: var(--text-muted); }
                .row-actions { display: flex; align-items: center; gap: 0.5rem; }
                .qty-btn { width: 24px; height: 24px; border-radius: 6px; border: 1px solid var(--glass-border); background: rgba(255,255,255,0.05); cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--text-light); }
                .qty-val { font-weight: 600; font-size: 0.9rem; width: 20px; text-align: center; color: var(--text-light); }
                .del-btn { color: #ef4444; background: none; border: none; cursor: pointer; margin-left: 0.5rem; }

                .invoice-footer {
                    padding: 1.5rem;
                    background: rgba(0,0,0,0.2);
                    border-top: 1px solid var(--glass-border);
                }
                .calc-row { display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.9rem; color: var(--text-muted); align-items: center; }
                .calc-row select { padding: 0.2rem; border-radius: 4px; background: #334155; color: white; border: none; }
                .total-row { display: flex; justify-content: space-between; font-size: 1.25rem; font-weight: 800; color: #10b981; margin-top: 1rem; padding-top: 1rem; border-top: 1px dashed var(--glass-border); }
                
                .checkout-btn {
                    width: 100%;
                    background: var(--primary);
                    color: white;
                    border: none;
                    padding: 1rem;
                    border-radius: 1rem;
                    font-weight: 600;
                    margin-top: 1.5rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2);
                }
                .checkout-btn:hover { background: var(--primary-hover); transform: translateY(-2px); }
                .checkout-btn:disabled { background: #475569; cursor: not-allowed; box-shadow: none; transform: none; }

                /* Receipt Modal */
                .receipt-paper {
                    background: white;
                    color: black; /* Receipt always black on white */
                    padding: 2rem;
                    width: 350px;
                    border-radius: 0.5rem;
                    text-align: center;
                }
                .receipt-header h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
                .receipt-row { display: flex; justify-content: space-between; padding: 0.25rem 0; font-size: 0.9rem; }
                .receipt-summary { margin-top: 1rem; text-align: right; }
                .receipt-actions { margin-top: 2rem; display: flex; gap: 1rem; justify-content: center; }
                
                @media print {
                    .hide-on-print { display: none !important; }
                    .billing-container { display: block; height: auto; }
                    .receipt-paper { box-shadow: none; width: 100%; }
                    .receipt-actions { display: none; }
                }
            `}</style>
        </div>
    );
};

export default Billing;
