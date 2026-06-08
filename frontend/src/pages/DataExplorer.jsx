import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import Header from '../components/layout/Header';
import Modal from '../components/ui/Modal';
import ConfirmModal from '../components/ui/ConfirmModal';
import { ShoppingCart, Package, Warehouse, FolderOpen, Plus, Pencil, Trash2 } from 'lucide-react';

const TABS = [
  { key: 'sales', label: 'Sales', icon: ShoppingCart, endpoint: '/api/data/sales' },
  { key: 'products', label: 'Products', icon: Package, endpoint: '/api/data/products' },
  { key: 'inventory', label: 'Inventory', icon: Warehouse, endpoint: '/api/data/inventory' },
  { key: 'categories', label: 'Categories', icon: FolderOpen, endpoint: '/api/data/categories' },
];

const COL_LABELS = {
  transaction_id: 'ID', product_name: 'Product', category_name: 'Category', cost_price: 'Cost',
  quantity_sold: 'Qty', retail_price: 'Retail Price', total_revenue: 'Revenue',
  transaction_date: 'Date', product_id: 'ID', name: 'Name', unit_price: 'Cost Price',
  inventory_id: 'ID', current_stock: 'Stock', low_stock_threshold: 'Threshold',
  last_updated: 'Updated', category_id: 'ID', description: 'Description',
};

const HIDDEN_COLS = { sales: ['product_id'], products: ['category_id'], inventory: ['product_id', 'inventory_id'], categories: [] };

function fmt(key, val) {
  if (val === null || val === undefined) return '—';
  if (['cost_price', 'retail_price', 'total_revenue', 'unit_price'].includes(key))
    return `£${parseFloat(val).toLocaleString('en-GB', { minimumFractionDigits: 2 })}`;
  if (['transaction_date', 'last_updated'].includes(key))
    return new Date(val).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  if (['quantity_sold', 'current_stock', 'low_stock_threshold'].includes(key))
    return parseInt(val).toLocaleString();
  return String(val);
}

// ── Form field component ──
function Field({ label, children, required }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";

// ════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════
const DataExplorer = () => {
  const { user } = useAuth();
  const isSuper = user?.role === 'super';

  const [activeTab, setActiveTab] = useState('sales');
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null); // { type: 'create'|'edit', tab, item? }
  const [deleteTarget, setDeleteTarget] = useState(null); // { tab, id, label }
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Supporting data for dropdowns
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const fetchTab = useCallback(async (tabKey) => {
    setLoading(true);
    try {
      const tab = TABS.find((t) => t.key === tabKey);
      const res = await api.get(tab.endpoint);
      setData((prev) => ({ ...prev, [tabKey]: res.data }));
    } catch (err) {
      console.error(`Failed to fetch ${tabKey}:`, err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSupporting = async () => {
    try {
      const [catRes, prodRes] = await Promise.all([
        api.get('/api/data/categories'),
        api.get('/api/data/products'),
      ]);
      setCategories(catRes.data);
      setProducts(prodRes.data);
    } catch (err) {
      console.error('Failed to fetch supporting data:', err);
    }
  };

  useEffect(() => {
    fetchTab(activeTab);
    fetchSupporting();
  }, [activeTab, fetchTab]);

  const clearMessages = () => { setError(''); setSuccess(''); };

  const refresh = () => {
    fetchTab(activeTab);
    fetchSupporting();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    clearMessages();
    try {
      await api.delete(`/api/data/${deleteTarget.tab}/${deleteTarget.id}`);
      setSuccess('Deleted successfully');
      setDeleteTarget(null);
      refresh();
    } catch (err) {
      setError(err.response?.data?.error || 'Delete failed');
      setDeleteTarget(null);
    }
  };

  const rows = data[activeTab] || [];
  const allCols = rows.length > 0 ? Object.keys(rows[0]) : [];
  const hidden = HIDDEN_COLS[activeTab] || [];
  const columns = allCols.filter((c) => !hidden.includes(c));

  const getIdField = () => {
    if (activeTab === 'sales') return 'transaction_id';
    if (activeTab === 'products') return 'product_id';
    if (activeTab === 'inventory') return 'inventory_id';
    return 'category_id';
  };

  const getLabel = (row) => {
    return row.product_name || row.name || row.category_name || `#${row[getIdField()]}`;
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen font-sans transition-colors">
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Data Explorer</h2>
            <p className="text-gray-600 dark:text-slate-400 mt-1">Browse and manage all database records.</p>
          </div>
          {isSuper && activeTab !== 'inventory' && (
            <button
              onClick={() => { clearMessages(); setModal({ type: 'create', tab: activeTab }); }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
            >
              <Plus size={18} />
              Add {activeTab === 'sales' ? 'Sale' : activeTab === 'products' ? 'Product' : 'Category'}
            </button>
          )}
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">{error}</div>}
        {success && <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-700 dark:text-emerald-400 text-sm">{success}</div>}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button key={tab.key} onClick={() => { setActiveTab(tab.key); clearMessages(); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
                }`}>
                <Icon size={16} />
                {tab.label}
                {data[tab.key] && <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-blue-500 text-blue-100' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400'}`}>{data[tab.key].length}</span>}
              </button>
            );
          })}
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : rows.length === 0 ? (
            <div className="text-center py-16 text-gray-500 dark:text-slate-400">No data available.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800">
                    {columns.map((col) => (
                      <th key={col} className="py-3 px-4 font-semibold text-gray-700 dark:text-slate-300 whitespace-nowrap">
                        {COL_LABELS[col] || col}
                      </th>
                    ))}
                    {isSuper && <th className="py-3 px-4 font-semibold text-gray-700 dark:text-slate-300 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, ri) => (
                    <tr key={ri} className="border-b border-gray-50 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                      {columns.map((col) => {
                        const isLowStock = col === 'current_stock' && row.low_stock_threshold && row.current_stock < row.low_stock_threshold;
                        return (
                          <td key={col} className={`py-2.5 px-4 whitespace-nowrap ${isLowStock ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-gray-900 dark:text-slate-200'}`}>
                            {fmt(col, row[col])}
                          </td>
                        );
                      })}
                      {isSuper && (
                        <td className="py-2.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {activeTab !== 'sales' && (
                              <button onClick={() => { clearMessages(); setModal({ type: 'edit', tab: activeTab, item: row }); }}
                                className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Edit">
                                <Pencil size={15} />
                              </button>
                            )}
                            {activeTab !== 'inventory' && (
                              <button onClick={() => setDeleteTarget({ tab: activeTab, id: row[getIdField()], label: getLabel(row) })}
                                className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Delete">
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-400 dark:text-slate-500 mt-4 text-right">{rows.length} records</p>
      </main>

      {/* ── MODALS ── */}
      {modal && (
        <CrudModal
          modal={modal}
          categories={categories}
          products={products}
          onClose={() => setModal(null)}
          onSuccess={(msg) => { setModal(null); setSuccess(msg); refresh(); }}
          onError={(msg) => setError(msg)}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          title={`Delete ${deleteTarget.tab === 'sales' ? 'Transaction' : deleteTarget.tab === 'products' ? 'Product' : 'Category'}`}
          message={`Are you sure you want to delete "${deleteTarget.label}"? This action cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

// ════════════════════════════════════════
// CRUD MODAL — handles all create/edit forms
// ════════════════════════════════════════
function CrudModal({ modal, categories, products, onClose, onSuccess, onError }) {
  const { type, tab, item } = modal;
  const isEdit = type === 'edit';

  // ── Category form ──
  const [catName, setCatName] = useState(item?.category_name || '');
  const [catDesc, setCatDesc] = useState(item?.description || '');

  // ── Product form ──
  const [prodName, setProdName] = useState(item?.name || '');
  const [prodCat, setProdCat] = useState(item?.category_id || '');
  const [prodPrice, setProdPrice] = useState(item?.unit_price ?? '');
  const [prodStock, setProdStock] = useState('0');
  const [prodThreshold, setProdThreshold] = useState('10');

  // ── Inventory form ──
  const [invStock, setInvStock] = useState(item?.current_stock ?? '');
  const [invThreshold, setInvThreshold] = useState(item?.low_stock_threshold ?? '');

  // ── Sales form ──
  const [saleProduct, setSaleProduct] = useState('');
  const [saleQty, setSaleQty] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [saleDate, setSaleDate] = useState(new Date().toISOString().slice(0, 16));

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (tab === 'categories') {
        if (isEdit) {
          await api.put(`/api/data/categories/${item.category_id}`, { category_name: catName, description: catDesc });
          onSuccess('Category updated');
        } else {
          await api.post('/api/data/categories', { category_name: catName, description: catDesc });
          onSuccess('Category created');
        }
      } else if (tab === 'products') {
        const payload = { name: prodName, category_id: prodCat, unit_price: prodPrice };
        if (isEdit) {
          await api.put(`/api/data/products/${item.product_id}`, payload);
          onSuccess('Product updated');
        } else {
          await api.post('/api/data/products', { ...payload, initial_stock: prodStock, low_stock_threshold: prodThreshold });
          onSuccess('Product created with inventory');
        }
      } else if (tab === 'inventory') {
        await api.put(`/api/data/inventory/${item.inventory_id}`, { current_stock: invStock, low_stock_threshold: invThreshold });
        onSuccess('Stock levels updated');
      } else if (tab === 'sales') {
        await api.post('/api/data/sales', {
          product_id: saleProduct, quantity_sold: saleQty,
          sale_price: salePrice, transaction_date: saleDate.replace('T', ' ') + ':00',
        });
        onSuccess('Sale recorded & inventory deducted');
      }
    } catch (err) {
      onError(err.response?.data?.error || 'Operation failed');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const title = isEdit
    ? `Edit ${tab === 'categories' ? 'Category' : tab === 'products' ? 'Product' : 'Inventory'}`
    : `Add ${tab === 'sales' ? 'Sale' : tab === 'products' ? 'Product' : 'Category'}`;

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* CATEGORY FORM */}
        {tab === 'categories' && (
          <>
            <Field label="Category Name" required>
              <input type="text" value={catName} onChange={(e) => setCatName(e.target.value)} required className={inputCls} placeholder="e.g. Electronics" />
            </Field>
            <Field label="Description">
              <input type="text" value={catDesc} onChange={(e) => setCatDesc(e.target.value)} className={inputCls} placeholder="Optional description" />
            </Field>
          </>
        )}

        {/* PRODUCT FORM */}
        {tab === 'products' && (
          <>
            <Field label="Product Name" required>
              <input type="text" value={prodName} onChange={(e) => setProdName(e.target.value)} required className={inputCls} placeholder="e.g. Wireless Earbuds" />
            </Field>
            <Field label="Category" required>
              <select value={prodCat} onChange={(e) => setProdCat(e.target.value)} required className={inputCls}>
                <option value="">Select category...</option>
                {categories.map((c) => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
              </select>
            </Field>
            <Field label="Cost Price (£)" required>
              <input type="number" step="0.01" min="0" value={prodPrice} onChange={(e) => setProdPrice(e.target.value)} required className={inputCls} placeholder="0.00" />
            </Field>
            {!isEdit && (
              <div className="grid grid-cols-2 gap-4">
                <Field label="Initial Stock">
                  <input type="number" min="0" value={prodStock} onChange={(e) => setProdStock(e.target.value)} className={inputCls} />
                </Field>
                <Field label="Low Stock Threshold">
                  <input type="number" min="1" value={prodThreshold} onChange={(e) => setProdThreshold(e.target.value)} className={inputCls} />
                </Field>
              </div>
            )}
          </>
        )}

        {/* INVENTORY FORM (edit only) */}
        {tab === 'inventory' && (
          <>
            <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg text-sm text-gray-700 dark:text-slate-300">
              Updating stock for: <strong>{item?.product_name}</strong>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Current Stock" required>
                <input type="number" min="0" value={invStock} onChange={(e) => setInvStock(e.target.value)} required className={inputCls} />
              </Field>
              <Field label="Low Stock Threshold" required>
                <input type="number" min="1" value={invThreshold} onChange={(e) => setInvThreshold(e.target.value)} required className={inputCls} />
              </Field>
            </div>
          </>
        )}

        {/* SALES FORM (create only) */}
        {tab === 'sales' && (
          <>
            <Field label="Product" required>
              <select value={saleProduct} onChange={(e) => setSaleProduct(e.target.value)} required className={inputCls}>
                <option value="">Select product...</option>
                {products.map((p) => <option key={p.product_id} value={p.product_id}>{p.name} (£{parseFloat(p.unit_price).toFixed(2)} cost)</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Quantity Sold" required>
                <input type="number" min="1" value={saleQty} onChange={(e) => setSaleQty(e.target.value)} required className={inputCls} placeholder="1" />
              </Field>
              <Field label="Retail Price (£)" required>
                <input type="number" step="0.01" min="0.01" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} required className={inputCls} placeholder="0.00" />
              </Field>
            </div>
            <Field label="Transaction Date" required>
              <input type="datetime-local" value={saleDate} onChange={(e) => setSaleDate(e.target.value)} required className={inputCls} />
            </Field>
            {saleQty && salePrice && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-700 dark:text-blue-400">
                Total Revenue: £{(Number(saleQty) * Number(salePrice)).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
              </div>
            )}
          </>
        )}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50">
            {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create'}
          </button>
          <button type="button" onClick={onClose}
            className="bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 font-medium py-2 px-4 rounded-lg transition-colors hover:bg-gray-200 dark:hover:bg-slate-600">
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default DataExplorer;
