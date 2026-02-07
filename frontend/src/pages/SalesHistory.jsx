import { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/axios';
import AuthContext from '../context/AuthContext'; // Import AuthContext
import { FaCalendar, FaFileExcel, FaFilePdf } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const SalesHistory = () => {
    const { user } = useContext(AuthContext); // Get current user
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedSaleId, setExpandedSaleId] = useState(null);
    const location = useLocation();

    useEffect(() => {
        const fetchSales = async () => {
            try {
                // Determine endpoint based on role
                const endpoint = user?.role === 'admin' ? '/sales' : '/sales/my-sales';

                // Add timestamp to prevent browser caching
                const { data } = await api.get(`${endpoint}?_=${Date.now()}`);
                setSales(data);
            } catch (error) {
                console.error('Error fetching sales', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSales();
    }, [location.key, user]); // Re-run when navigation or user changes

    const toggleExpand = (id) => {
        setExpandedSaleId(expandedSaleId === id ? null : id);
    };

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(sales.map(s => ({
            ID: s._id,
            Date: new Date(s.createdAt).toLocaleDateString(),
            Items: s.items.map(i => `${i.name} (${i.quantity})`).join(', '),
            Total: s.totalAmount,
            Profit: s.totalProfit
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sales");
        XLSX.writeFile(workbook, "SalesHistory.xlsx");
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text("Sales Report", 14, 15);

        const tableColumn = ["ID", "Date", "Items", "Total (Rs)"];
        const tableRows = [];

        sales.forEach(sale => {
            const saleData = [
                sale._id.slice(-6).toUpperCase(),
                new Date(sale.createdAt).toLocaleDateString(),
                sale.items.map(i => `${i.name} (x${i.quantity})`).join(', '),
                sale.totalAmount
            ];
            tableRows.push(saleData);
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 20,
        });

        doc.save("Sales_Report.pdf");
    };

    if (loading) return <div className="loader">Loading History...</div>;

    return (
        <div className="history-container">
            <header className="page-header">
                <div>
                    <h1>Sales History</h1>
                    <p>Track your past transactions</p>
                </div>
                <div className="actions">
                    <button className="btn-secondary" onClick={exportToExcel}>
                        <FaFileExcel /> Excel
                    </button>
                    <button className="btn-secondary" onClick={exportToPDF}>
                        <FaFilePdf /> PDF
                    </button>
                </div>
            </header>

            <div className="history-list">
                {sales.length === 0 ? (
                    <p className="no-data">No sales found.</p>
                ) : (
                    sales.map(sale => (
                        <div
                            key={sale._id}
                            className={`sale-card ${expandedSaleId === sale._id ? 'expanded' : ''}`}
                            onClick={() => toggleExpand(sale._id)}
                        >
                            <div className="sale-header">
                                <div className="date-info">
                                    <FaCalendar className="icon" />
                                    <span>{new Date(sale.createdAt).toLocaleString()}</span>
                                </div>
                                <div className="header-right">
                                    <span className="sale-id">#{sale._id.slice(-6).toUpperCase()}</span>
                                    <span className="summary-total">₹{sale.totalAmount.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Collapsed View Summary */}
                            {expandedSaleId !== sale._id && (
                                <div className="sale-preview">
                                    <span>{sale.items.length} Items</span>
                                    <span className="click-hint">Click to view details</span>
                                </div>
                            )}

                            {/* Expanded Invoice View */}
                            {expandedSaleId === sale._id && (
                                <div className="invoice-details" onClick={(e) => e.stopPropagation()}>
                                    <div className="invoice-table-wrapper">
                                        <table className="invoice-table">
                                            <thead>
                                                <tr>
                                                    <th>Item</th>
                                                    <th className="text-center">Qty</th>
                                                    <th className="text-right">Price</th>
                                                    <th className="text-right">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sale.items.map((item, idx) => (
                                                    <tr key={idx}>
                                                        <td>{item.name}</td>
                                                        <td className="text-center">{item.quantity}</td>
                                                        <td className="text-right">₹{item.priceAtSale}</td>
                                                        <td className="text-right">₹{item.priceAtSale * item.quantity}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="invoice-summary">
                                        <div className="summary-row">
                                            <span>Subtotal</span>
                                            <span>₹{(sale.totalAmount - (sale.taxAmount || 0)).toLocaleString()}</span>
                                        </div>
                                        <div className="summary-row">
                                            <span>Tax</span>
                                            <span>₹{(sale.taxAmount || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="summary-row total-row">
                                            <span>Grand Total</span>
                                            <span>₹{sale.totalAmount.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            <style>{`
                .history-container { max-width: 800px; margin: 0 auto; padding-bottom: 2rem; }
                .page-header { margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center; }
                .actions { display: flex; gap: 1rem; }
                .btn-secondary { display: flex; align-items: center; gap: 0.5rem; background: #333; color: white; border: 1px solid #555; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; transition: 0.2s; }
                .btn-secondary:hover { background: #444; }

                .history-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .sale-card {
                    background: var(--card-bg);
                    border: 1px solid var(--glass-border);
                    border-radius: 0.75rem;
                    padding: 1.25rem;
                    cursor: pointer;
                    transition: all 0.2s ease-in-out;
                    overflow: hidden;
                }
                .sale-card:hover {
                    border-color: rgba(255,255,255,0.2);
                    background: rgba(255,255,255,0.08); 
                }
                .sale-card.expanded {
                    background: rgba(0,0,0,0.4);
                    border-color: var(--primary);
                    cursor: default;
                }

                .sale-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.5rem;
                }
                .date-info { display: flex; align-items: center; gap: 0.5rem; color: var(--text-muted); font-size: 0.9rem; }
                .header-right { display: flex; gap: 1rem; align-items: center; }
                .sale-id { background: rgba(255,255,255,0.1); padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8rem; font-family: monospace; }
                .summary-total { font-weight: 700; color: #10b981; font-size: 1.1rem; }

                .sale-preview {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.9rem;
                    color: var(--text-muted);
                }
                .click-hint { font-size: 0.8rem; opacity: 0.6; }

                /* Expanded Invoice Styles */
                .invoice-details {
                    margin-top: 1rem;
                    border-top: 1px dashed rgba(255,255,255,0.1);
                    padding-top: 1rem;
                    animation: fadeIn 0.3s ease;
                }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }

                .invoice-table { width: 100%; border-collapse: collapse; font-size: 0.95rem; }
                .invoice-table th { text-align: left; color: var(--text-muted); font-weight: 500; padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.1); }
                .invoice-table td { padding: 0.75rem 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: #e5e7eb; }
                .invoice-table tr:last-child td { border-bottom: none; }
                
                .text-right { text-align: right; }
                .text-center { text-align: center; }

                .invoice-summary {
                    margin-top: 1.5rem;
                    border-top: 1px solid rgba(255,255,255,0.1);
                    padding-top: 1rem;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                }
                .summary-row { display: flex; justify-content: space-between; width: 200px; margin-bottom: 0.5rem; font-size: 0.9rem; color: var(--text-muted); }
                .total-row { font-size: 1.2rem; font-weight: 700; color: #10b981; margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px dashed rgba(255,255,255,0.2); }
            `}</style>
        </div>
    );
};

export default SalesHistory;
