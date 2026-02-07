import { useState, useEffect } from 'react';
import api from '../api/axios';
import { FaUserPlus, FaTrash, FaEdit, FaUserTie } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Employees = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const { data } = await api.get('/auth/employees');
            setEmployees(data);
        } catch (error) {
            toast.error('Failed to fetch employees');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this employee? They will lose access immediately.')) {
            try {
                await api.delete(`/auth/employees/${id}`);
                toast.success('Employee removed');
                fetchEmployees();
            } catch (error) {
                toast.error('Failed to delete employee');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/create-employee', formData);
            toast.success('Employee account created!');
            setShowModal(false);
            setFormData({ name: '', email: '', password: '' });
            fetchEmployees();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Creation failed');
        }
    };

    if (loading) return <div className="loader">Loading Staff...</div>;

    return (
        <div className="employees-container">
            <header className="page-header">
                <div>
                    <h1>Employee Management</h1>
                    <p>Manage staff access and accounts</p>
                </div>
                <button className="btn-primary" onClick={() => setShowModal(true)}>
                    <FaUserPlus /> Add Employee
                </button>
            </header>

            <div className="employee-list">
                {employees.length === 0 ? (
                    <div className="no-data">No employees found. Add one to get started.</div>
                ) : (
                    employees.map(emp => (
                        <div key={emp._id} className="employee-card">
                            <div className="emp-avatar">
                                <FaUserTie />
                            </div>
                            <div className="emp-info">
                                <h3>{emp.name}</h3>
                                <p>{emp.email}</p>
                            </div>
                            <div className="emp-role">
                                <span className="badge">STAFF</span>
                            </div>
                            <div className="emp-actions">
                                <button className="icon-btn delete" onClick={() => handleDelete(emp._id)}>
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Employee Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Create New Employee</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. John Doe"
                                />
                            </div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="john@store.com"
                                />
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="******"
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Create Account</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .employee-list {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 1.5rem;
                }

                .employee-card {
                    background: var(--card-bg);
                    border: 1px solid var(--glass-border);
                    border-radius: 1rem;
                    padding: 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    transition: transform 0.2s;
                }
                .employee-card:hover { transform: translateY(-3px); }

                .emp-avatar {
                    width: 50px;
                    height: 50px;
                    background: rgba(79, 70, 229, 0.2);
                    color: #818cf8;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                }

                .emp-info { flex: 1; }
                .emp-info h3 { font-size: 1.1rem; margin-bottom: 0.25rem; }
                .emp-info p { color: var(--text-muted); font-size: 0.9rem; }

                .badge {
                    background: rgba(16, 185, 129, 0.2);
                    color: #34d399;
                    font-size: 0.75rem;
                    padding: 0.25rem 0.6rem;
                    border-radius: 1rem;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                }

                .icon-btn.delete {
                    color: #f87171;
                    background: rgba(239, 68, 68, 0.1);
                }
                .icon-btn.delete:hover {
                    background: rgba(239, 68, 68, 0.2);
                }
            `}</style>
        </div>
    );
};

export default Employees;
