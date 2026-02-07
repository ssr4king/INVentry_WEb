import { useEffect, useState, useContext } from 'react';
import api from '../api/axios';
import AuthContext from '../context/AuthContext';
import EmployeeDashboard from './EmployeeDashboard';
import { FaBoxOpen, FaClipboardList, FaMoneyBillWave, FaChartLine, FaArrowUp, FaShoppingCart, FaTimes } from 'react-icons/fa';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Reusable Metric Card
const StatCard = ({ title, value, icon, color, onClick, isClickable = true }) => (
    <div
        className={`stat-card ${isClickable ? 'clickable' : ''}`}
        onClick={onClick}
        style={{ borderTop: `4px solid ${color}` }}
    >
        <div className="stat-content">
            <div className="text-content">
                <p className="stat-title">{title}</p>
                <h3 className="stat-value">{value}</h3>
            </div>
            <div className="stat-icon" style={{ backgroundColor: `${color}15`, color: color }}>
                {icon}
            </div>
        </div>
        <div className="stat-footer">
            <span className="trend-badge" style={{ color: '#10b981', background: '#d1fae5' }}>
                <FaArrowUp size={10} /> +12%
            </span>
            <span className="trend-text">vs last month</span>
        </div>
    </div>
);

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalData, setModalData] = useState(null);

    // Additional Data States
    const [totalStockItems, setTotalStockItems] = useState(0);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // 1. Existing Dashboard Stats
                const { data: dashboardData } = await api.get('/reports/dashboard');
                setStats(dashboardData);

                // 2. Fetch Products for "Total Items in Stock" (Sum of quantities)
                const { data: productsData } = await api.get('/products');
                const stockSum = productsData.reduce((acc, p) => acc + (p.stockQuantity || 0), 0);
                setTotalStockItems(stockSum);

            } catch (error) {
                console.error("Error fetching stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const openModal = (type) => {
        setModalData({
            type,
            description: `Detailed breakdown for ${type}. (Placeholder for chart details)`
        });
        setShowModal(true);
    };

    if (loading) return <div className="loader">Loading Dashboard...</div>;

    return (

        <div className="dashboard-modern-scope">
            <div className="dashboard-container">
                <header className="page-header">
                    <div>
                        <h1>Dashboard Overview</h1>
                        <p>Welcome back, here's what's happening today.</p>
                    </div>
                    <button className="btn-secondary">Download Report</button>
                </header>

                {/* Quick Stats Grid */}
                <div className="stats-grid">
                    <StatCard
                        title="Total Revenue"
                        value={`₹${stats?.totalRevenue?.toLocaleString() || 0}`}
                        icon={<FaMoneyBillWave />}
                        color="#10b981"
                        onClick={() => openModal('Revenue')}
                    />
                    <StatCard
                        title="Total Profit"
                        value={`₹${stats?.totalProfit?.toLocaleString() || 0}`}
                        icon={<FaChartLine />}
                        color="#8b5cf6"
                        onClick={() => openModal('Profit')}
                    />
                    <StatCard
                        title="Unique Products"
                        value={stats?.totalProducts || 0}
                        icon={<FaBoxOpen />}
                        color="#3b82f6"
                        onClick={() => openModal('Products')}
                    />
                    <StatCard
                        title="items In Stock"
                        value={totalStockItems.toLocaleString()}
                        icon={<FaShoppingCart />}
                        color="#f59e0b"
                        onClick={() => openModal('Stock')}
                    />
                    <StatCard
                        title="Total Orders"
                        value={stats?.totalOrders || 0}
                        icon={<FaClipboardList />}
                        color="#ec4899"
                        onClick={() => openModal('Orders')}
                    />
                </div>

                {/* Charts Section (Placeholder for visual appeal) */}
                <div className="charts-section">
                    <div className="chart-card">
                        <h3>Revenue Trend</h3>
                        <div className="chart-area">
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={[
                                    { name: 'Jan', val: 4000 }, { name: 'Feb', val: 3000 }, { name: 'Mar', val: 5000 },
                                    { name: 'Apr', val: 4500 }, { name: 'May', val: 6000 }, { name: 'Jun', val: 7000 }
                                ]}>
                                    <defs>
                                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="val" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Modal Overlay */}
                {showModal && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>{modalData?.type} Details</h2>
                                <button className="close-btn" onClick={() => setShowModal(false)}><FaTimes /></button>
                            </div>
                            <div className="modal-body">
                                <p>{modalData?.description}</p>
                                <div className="placeholder-chart">
                                    [Detailed {modalData?.type} Data Visualization]
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                /* SCOPED WHITE THEME FOR DASHBOARD ONLY */
                .dashboard-modern-scope {
                    background-color: #f8fafc; /* White/Slate-50 */
                    color: #1e293b; /* Slate-800 */
                    padding: 2rem;
                    border-radius: 1.5rem;
                    min-height: 100%;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }

                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: 2rem;
                }
                .page-header h1 {
                    font-size: 1.8rem;
                    font-weight: 800;
                    color: #1e293b;
                    margin-bottom: 0.5rem;
                }
                .page-header p {
                    color: #64748b;
                    font-size: 0.95rem;
                }
                .btn-secondary {
                    background: white;
                    border: 1px solid #e2e8f0;
                    padding: 0.6rem 1rem;
                    border-radius: 0.5rem;
                    color: #475569;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                }
                .btn-secondary:hover { background: #f8fafc; }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }

                .stat-card {
                    background: #ffffff;
                    border-radius: 1rem;
                    padding: 1.5rem;
                    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                    border: 1px solid #f1f5f9;
                }
                .stat-card.clickable { cursor: pointer; }
                .stat-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                }
                .stat-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 1rem;
                }
                .stat-title {
                    color: #64748b;
                    font-size: 0.85rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 0.25rem;
                }
                .stat-value {
                    font-size: 1.75rem;
                    font-weight: 800;
                    color: #1e293b;
                }
                .stat-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.25rem;
                }
                .stat-footer {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.8rem;
                }
                .trend-badge {
                    padding: 0.1rem 0.4rem;
                    border-radius: 1rem;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 0.2rem;
                }
                .trend-text { color: #94a3b8; }

                .charts-section {
                    margin-top: 2rem;
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 2rem;
                }
                .chart-card {
                    background: #ffffff;
                    padding: 1.5rem;
                    border-radius: 1rem;
                    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
                    border: 1px solid #f1f5f9;
                }
                .chart-card h3 {
                    margin-bottom: 1.5rem;
                    color: #1e293b;
                    font-size: 1.1rem;
                }

                /* Modal */
                .modal-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(15, 23, 42, 0.4);
                    backdrop-filter: blur(4px);
                    z-index: 100;
                    display: flex; justify-content: center; align-items: center;
                    animation: fadeIn 0.2s ease;
                }
                .modal-content {
                    background: white;
                    padding: 2rem;
                    border-radius: 1.5rem;
                    width: 500px;
                    max-width: 90%;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    transform: scale(0.95);
                    animation: zoomIn 0.2s ease forwards;
                    color: #1e293b;
                }
                .modal-body { color: #1e293b; }
                @keyframes zoomIn { to { transform: scale(1); } }
                .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
                .modal-header h2 { font-size: 1.5rem; color: #1e293b; }
                .close-btn { background: none; border: none; font-size: 1.25rem; color: #64748b; cursor: pointer; }
            `}</style>
        </div>
    );
};

const Dashboard = () => {
    const { user } = useContext(AuthContext);

    if (user?.role === 'employee') {
        return <EmployeeDashboard />;
    }

    return <AdminDashboard />;
};

export default Dashboard;
