import { useContext } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { FaChartLine, FaBox, FaShoppingCart, FaHistory, FaSignOutAlt, FaUserTie, FaChartPie, FaUsers } from 'react-icons/fa';

const Layout = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isActive = (path) => location.pathname === path ? 'active-link' : '';

    return (
        <div className="layout-container">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="brand">
                    <h2>INVentry</h2>
                </div>

                <Link to="/dashboard" className="user-info" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', cursor: 'pointer' }}>
                    <div className="avatar">
                        <FaUserTie />
                    </div>
                    <div>
                        <p className="name">{user?.name}</p>
                        <span className="role">{user?.role}</span>
                    </div>
                </Link>

                <nav className="nav-menu">
                    <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>
                        <FaChartLine /> Dashboard
                    </Link>

                    {user?.role === 'admin' && (
                        <>
                            <Link to="/analytics" className={`nav-link ${isActive('/analytics')}`}>
                                <FaChartPie /> Analytics
                            </Link>
                            <Link to="/employees" className={`nav-link ${isActive('/employees')}`}>
                                <FaUsers /> Staff
                            </Link>
                            <Link to="/inventory" className={`nav-link ${isActive('/inventory')}`}>
                                <FaBox /> Inventory
                            </Link>
                        </>
                    )}

                    <Link to="/billing" className={`nav-link ${isActive('/billing')}`}>
                        <FaShoppingCart /> Billing
                    </Link>

                    <Link to="/sales-history" className={`nav-link ${isActive('/sales-history')}`}>
                        <FaHistory /> Sales History
                    </Link>
                </nav>

                <div className="logout-section">
                    <button onClick={handleLogout} className="logout-btn">
                        <FaSignOutAlt /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <Outlet />
            </main>

            {/* Styles for Layout */}
            <style>{`
                .layout-container {
                    display: flex;
                    min-height: 100vh;
                }
                .sidebar {
                    width: 260px;
                    background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
                    color: white;
                    display: flex;
                    flex-direction: column;
                    padding: 1.5rem;
                    position: fixed;
                    height: 100vh;
                    box-shadow: 4px 0 24px rgba(0,0,0,0.1);
                    z-index: 50;
                }
                .brand h2 {
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: white;
                    margin-bottom: 2rem;
                    letter-spacing: -0.5px;
                }
                .user-info {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem;
                    background: rgba(255, 255, 255, 0.08);
                    border-radius: 1rem;
                    margin-bottom: 2rem;
                    border: 1px solid rgba(255,255,255,0.05);
                }
                .avatar {
                    width: 40px;
                    height: 40px;
                    background: #10b981;
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.2rem;
                }
                .name {
                    font-weight: 600;
                    font-size: 0.95rem;
                    color: white;
                }
                .role {
                    font-size: 0.75rem;
                    color: #94a3b8;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .nav-menu {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    flex: 1;
                }
                .nav-link {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.85rem 1rem;
                    border-radius: 0.75rem;
                    color: #94a3b8;
                    text-decoration: none;
                    transition: all 0.2s ease;
                    font-weight: 500;
                }
                .nav-link:hover {
                    background: rgba(255, 255, 255, 0.05);
                    color: white;
                    transform: translateX(4px);
                }
                .active-link {
                    background: #10b981 !important;
                    color: white !important;
                    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
                }
                .nav-link svg {
                    font-size: 1.1rem;
                }
                .logout-btn {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    padding: 0.85rem;
                    background: transparent;
                    border: 1px solid rgba(255,255,255,0.1);
                    color: #ef4444;
                    border-radius: 0.75rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-weight: 500;
                }
                .logout-btn:hover {
                    background: rgba(239, 68, 68, 0.1);
                }
                .main-content {
                    flex: 1;
                    margin-left: 260px;
                    padding: 2rem;
                    overflow-y: auto;
                }
            `}</style>
        </div>
    );
};

export default Layout;
