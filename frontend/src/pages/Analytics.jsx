import { useState, useEffect } from 'react';
import api from '../api/axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Analytics = () => {
    const [dailyData, setDailyData] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [dailyRes, monthlyRes, categoryRes] = await Promise.all([
                    api.get('/reports/daily'),
                    api.get('/reports/monthly'),
                    api.get('/reports/category')
                ]);

                setDailyData(dailyRes.data);
                setMonthlyData(monthlyRes.data);
                setCategoryData(categoryRes.data);
            } catch (error) {
                console.error("Error fetching analytics", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="loader">Loading Analytics...</div>;

    return (
        <div className="analytics-container">
            <header className="page-header">
                <h1>Business Analytics</h1>
                <p>Visualizing your performance metrics</p>
            </header>

            <div className="charts-grid">
                {/* 1. Daily Sales Bar Chart */}
                <div className="chart-card">
                    <h3>Last 7 Days Sales</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={dailyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                <XAxis dataKey="_id" stroke="#ccc" />
                                <YAxis stroke="#ccc" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #333' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend />
                                <Bar dataKey="revenue" name="Revenue (₹)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="profit" name="Profit (₹)" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Monthly Trends Line Chart */}
                <div className="chart-card">
                    <h3>Monthly Growth Trend</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <LineChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                <XAxis dataKey="_id" stroke="#ccc" />
                                <YAxis stroke="#ccc" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #333' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="revenue" name="Revenue (₹)" stroke="#3b82f6" strokeWidth={3} />
                                <Line type="monotone" dataKey="profit" name="Profit (₹)" stroke="#f59e0b" strokeWidth={3} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 3. Category Pie Chart */}
                <div className="chart-card">
                    <h3>Top Selling Products</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <style>{`
                .charts-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                    gap: 2rem;
                    padding-bottom: 2rem;
                }
                .chart-card {
                    background: var(--card-bg);
                    border: 1px solid var(--glass-border);
                    border-radius: 1rem;
                    padding: 1.5rem;
                }
                .chart-card h3 {
                    margin-bottom: 1.5rem;
                    font-size: 1.1rem;
                    color: var(--text-light);
                }
            `}</style>
        </div>
    );
};

export default Analytics;
