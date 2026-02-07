import { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import AuthContext from '../context/AuthContext';
import { FaWallet, FaReceipt, FaChartLine } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const EmployeeDashboard = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState(null);
    const [recentSales, setRecentSales] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Stats
                const { data: statsData } = await api.get('/reports/employee-stats');
                setStats(statsData);

                // Fetch Recent Sales
                const { data: salesData } = await api.get('/sales/my-sales');
                setRecentSales(salesData.slice(0, 5)); // Top 5
            } catch (error) {
                console.error("Error fetching data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="loader">Loading Dashboard...</div>;

    return (
        <div className="emp-dashboard-container">
            {/* Header Section */}
            <header className="emp-header">
                <div className="header-content">
                    <h1>Welcome, {user.name} 👋</h1>
                    <p>Ready to hit your targets today?</p>
                </div>
                <div className="date-badge">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </div>
            </header>

            {/* Stats Overview */}
            <div className="emp-stats-grid">
                <div className="emp-card stat-card" style={{ borderTop: '4px solid #10b981' }}>
                    <div className="icon-box green">
                        <FaWallet />
                    </div>
                    <div>
                        <p className="label">Today's Revenue</p>
                        <h3>₹{stats?.todayRevenue?.toLocaleString() || 0}</h3>
                        <div className="progress-bar">
                            <div className="fill green-fill" style={{ width: '65%' }}></div>
                        </div>
                    </div>
                </div>

                <div className="emp-card stat-card" style={{ borderTop: '4px solid #3b82f6' }}>
                    <div className="icon-box blue">
                        <FaReceipt />
                    </div>
                    <div>
                        <p className="label">Today's Sales</p>
                        <h3>{stats?.todaySalesCount || 0}</h3>
                        <div className="progress-bar">
                            <div className="fill blue-fill" style={{ width: '40%' }}></div>
                        </div>
                    </div>
                </div>

                <div className="emp-card stat-card" style={{ borderTop: '4px solid #8b5cf6' }}>
                    <div className="icon-box purple">
                        <FaChartLine />
                    </div>
                    <div>
                        <p className="label">Total Since Joining</p>
                        <h3>₹{stats?.totalRevenue?.toLocaleString() || 0}</h3>
                        <div className="progress-bar">
                            <div className="fill purple-fill" style={{ width: '80%' }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Action Area */}
            <div className="action-section">
                <h2>Quick Actions</h2>
                <div className="action-buttons">
                    <Link to="/billing" className="big-btn primary-btn">
                        <div className="btn-icon">
                            <FaWallet size={24} />
                        </div>
                        <div className="btn-text">
                            <h3>Start New Sale</h3>
                            <p>Open POS Terminal</p>
                        </div>
                    </Link>

                    <Link to="/sales-history" className="big-btn secondary-btn">
                        <div className="btn-icon">
                            <FaReceipt size={24} />
                        </div>
                        <div className="btn-text">
                            <h3>Sales History</h3>
                            <p>View Past Transactions</p>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="activity-section">
                <h2>Recent Activity</h2>
                <div className="emp-card table-card">
                    {recentSales.length > 0 ? (
                        <table className="recent-table">
                            <thead>
                                <tr>
                                    <th>Receipt ID</th>
                                    <th>Time</th>
                                    <th>Items</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentSales.map(sale => (
                                    <tr key={sale._id}>
                                        <td className="sale-id">#{sale._id.slice(-6).toUpperCase()}</td>
                                        <td>{new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                        <td>{sale.items.length} Items</td>
                                        <td className="amount">₹{sale.totalAmount.toLocaleString()}</td>
                                        <td><span className="status-badge">Completed</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="empty-activity">
                            <p>No sales today yet. Start selling!</p>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .emp-dashboard-container {
                    color: white;
                    max-width: 1200px;
                    margin: 0 auto;
                    animation: fadeIn 0.5s ease-in-out;
                }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

                .emp-header {
                    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
                    padding: 2.5rem;
                    border-radius: 1.5rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                .emp-header h1 { font-size: 2rem; margin-bottom: 0.5rem; }
                .emp-header p { color: #94a3b8; font-size: 1.1rem; }
                .date-badge {
                    background: rgba(255, 255, 255, 0.1);
                    padding: 0.5rem 1rem;
                    border-radius: 2rem;
                    font-weight: 600;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .emp-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 3rem;
                }
                .emp-card {
                    background: rgba(30, 41, 59, 0.7);
                    backdrop-filter: blur(10px);
                    border-radius: 1rem;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    padding: 1.5rem;
                }
                .stat-card {
                    display: flex;
                    gap: 1.5rem;
                    align-items: center;
                    transition: transform 0.2s;
                }
                .stat-card:hover { transform: translateY(-5px); }
                .icon-box {
                    width: 60px; height: 60px;
                    border-radius: 1rem;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 1.5rem;
                }
                .green { background: rgba(16, 185, 129, 0.2); color: #10b981; }
                .blue { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
                .purple { background: rgba(139, 92, 246, 0.2); color: #8b5cf6; }
                
                .label { color: #94a3b8; font-size: 0.9rem; margin-bottom: 0.25rem; }
                .stat-card h3 { font-size: 1.8rem; margin-bottom: 0.5rem; }
                
                .progress-bar {
                    width: 100%; height: 6px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 3px;
                    overflow: hidden;
                }
                .fill { height: 100%; border-radius: 3px; animation: slideIn 1s ease-out; }
                .green-fill { background: #10b981; }
                .blue-fill { background: #3b82f6; }
                .purple-fill { background: #8b5cf6; }
                @keyframes slideIn { from { width: 0; } }

                .action-section { margin-bottom: 3rem; }
                .action-section h2 { margin-bottom: 1.5rem; font-size: 1.5rem; }
                .action-buttons {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 2rem;
                }
                .big-btn {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    padding: 2rem;
                    border-radius: 1.5rem;
                    text-decoration: none;
                    transition: all 0.3s;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }
                .primary-btn {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    color: white;
                    box-shadow: 0 10px 20px -5px rgba(16, 185, 129, 0.4);
                }
                .primary-btn:hover { transform: translateY(-5px); box-shadow: 0 20px 25px -5px rgba(16, 185, 129, 0.5); }
                
                .secondary-btn {
                    background: rgba(30, 41, 59, 0.8);
                    color: white;
                }
                .secondary-btn:hover { background: rgba(30, 41, 59, 1); transform: translateY(-5px); }

                .btn-icon { font-size: 2rem; }
                .btn-text h3 { font-size: 1.4rem; margin-bottom: 0.25rem; }
                .btn-text p { opacity: 0.8; font-size: 0.95rem; }

                .activity-section h2 { margin-bottom: 1.5rem; font-size: 1.5rem; }
                .table-card { padding: 0; overflow: hidden; }
                .recent-table { width: 100%; border-collapse: collapse; }
                .recent-table th {
                    text-align: left;
                    padding: 1.25rem;
                    background: rgba(0, 0, 0, 0.2);
                    color: #94a3b8;
                    font-weight: 600;
                    font-size: 0.9rem;
                }
                .recent-table td {
                    padding: 1.25rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    color: #e2e8f0;
                }
                .recent-table tr:last-child td { border-bottom: none; }
                .recent-table tr:hover { background: rgba(255, 255, 255, 0.02); }
                
                .sale-id { font-family: monospace; color: #94a3b8; }
                .amount { font-weight: 700; color: #10b981; }
                .status-badge {
                    background: rgba(16, 185, 129, 0.2);
                    color: #10b981;
                    padding: 0.25rem 0.75rem;
                    border-radius: 1rem;
                    font-size: 0.8rem;
                    font-weight: 600;
                }
                .empty-activity { padding: 3rem; text-align: center; color: #94a3b8; }
            `}</style>
        </div>
    );
};

export default EmployeeDashboard;
