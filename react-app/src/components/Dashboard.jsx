import { useState, useEffect } from 'react';
import ProductList from './ProductList';
import ProductForm from './ProductForm';
import Sales from './Sales';
import LowStockAlerts from './LowStockAlerts';
import InventoryManagement from './InventoryManagement';
import SupplierManagement from './SupplierManagement';
import SupplierHistory from './SupplierHistory';
import { logProductCreate, logProductUpdate, logProductStatusChange } from '../utils/auditLog';
import { ensurePlaceholderExists } from '../utils/initializeData';
import './Dashboard.css';

const Dashboard = ({ user, onLogout }) => {
  const [activeView, setActiveView] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);

  // Cargar productos del localStorage al montar
  useEffect(() => {
    ensurePlaceholderExists();
    const savedProducts = localStorage.getItem('colmado_products');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
  }, []);

  // Guardar productos en localStorage cuando cambien
  useEffect(() => {
    if (products.length > 0) {
      ensurePlaceholderExists();
    }
    localStorage.setItem('colmado_products', JSON.stringify(products));
  }, [products]);

  const handleAddProduct = (product) => {
    const newProduct = {
      ...product,
      id: Date.now().toString(),
      fechaCreacion: new Date().toISOString(),
    };
    setProducts([...products, newProduct]);
    
    // Log audit trail
    logProductCreate(
      newProduct.id,
      newProduct.nombre,
      newProduct.codigo,
      newProduct.stock || 0,
      user?.email || 'Dueño'
    );
    
    setActiveView('products');
  };

  const handleEditProduct = (product) => {
    // Prevent editing placeholder product
    if (product.id === 'placeholder_product') {
      alert('No se puede editar el producto de ejemplo');
      return;
    }
    setEditingProduct(product);
    setActiveView('add-product');
  };

  const handleUpdateProduct = (updatedProduct) => {
    setProducts(
      products.map((p) =>
        p.id === updatedProduct.id ? updatedProduct : p
      )
    );
    
    // Log audit trail
    logProductUpdate(
      updatedProduct.id,
      updatedProduct.nombre,
      updatedProduct.codigo,
      user?.email || 'Dueño',
      'Información del producto actualizada'
    );
    
    setEditingProduct(null);
    setActiveView('products');
  };

  const handleToggleProductStatus = (productId) => {
    // Prevent toggling placeholder product
    if (productId === 'placeholder_product') {
      alert('No se puede cambiar el estado del producto de ejemplo');
      return;
    }
    
    setProducts(
      products.map((p) => {
        if (p.id === productId) {
          const newStatus = p.estado === 'Activo' ? 'Inactivo' : 'Activo';
          
          // Log audit trail
          logProductStatusChange(
            p.id,
            p.nombre,
            p.codigo,
            newStatus,
            user?.email || 'Dueño'
          );
          
          return { ...p, estado: newStatus };
        }
        return p;
      })
    );
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setActiveView('products');
  };

  const handleSaleComplete = (productId, quantity) => {
    setProducts(
      products.map((p) => {
        if (p.id === productId) {
          return {
            ...p,
            stock: Math.max(0, (p.stock || 0) - quantity),
          };
        }
        return p;
      })
    );
  };

  const handleStockUpdate = (productId, quantityChange) => {
    setProducts(
      products.map((p) => {
        if (p.id === productId) {
          return {
            ...p,
            stock: Math.max(0, (p.stock || 0) + quantityChange),
          };
        }
        return p;
      })
    );
  };

  // Calcular estadísticas
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + (p.costo * p.stock), 0);
  const totalSales = products.reduce((sum, p) => sum + (p.precioVenta * (p.stock || 0)), 0);
  
  // Calcular alertas de stock bajo
  const lowStockProducts = products.filter(p => {
    if (p.estado !== 'Activo') return false;
    const minStock = p.stockMinimo || 0;
    return p.stock <= minStock;
  });
  const criticalStockProducts = lowStockProducts.filter(p => p.stock === 0);
  const warningStockProducts = lowStockProducts.filter(p => {
    const minStock = p.stockMinimo || 0;
    return p.stock > 0 && p.stock <= minStock / 2;
  });

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="user-info">
            <div className="user-avatar">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <div className="user-name">Dueño</div>
              <div className="user-status">Online</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-menu">
          <div className="menu-title">MENÚ</div>
          <button
            className={`menu-item ${activeView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveView('dashboard')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span>Inicio</span>
          </button>
          <button
            className={`menu-item ${activeView === 'products' ? 'active' : ''}`}
            onClick={() => setActiveView('products')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span>Productos</span>
          </button>
          <button
            className={`menu-item ${activeView === 'add-product' ? 'active' : ''}`}
            onClick={() => {
              setEditingProduct(null);
              setActiveView('add-product');
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Agregar Producto</span>
          </button>
          <button
            className={`menu-item ${activeView === 'sales' ? 'active' : ''}`}
            onClick={() => setActiveView('sales')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <span>Ventas</span>
          </button>
          <button
            className={`menu-item ${activeView === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveView('inventory')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
            <span>Gestión de Inventario</span>
          </button>
          <button
            className={`menu-item ${activeView === 'alerts' ? 'active' : ''}`}
            onClick={() => setActiveView('alerts')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <span>Alertas de Stock</span>
            {lowStockProducts.length > 0 && (
              <span className="menu-badge">{lowStockProducts.length}</span>
            )}
          </button>
          <button
            className={`menu-item ${activeView === 'suppliers' ? 'active' : ''}`}
            onClick={() => setActiveView('suppliers')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>Proveedores</span>
          </button>
          <button
            className={`menu-item ${activeView === 'supplier-history' ? 'active' : ''}`}
            onClick={() => setActiveView('supplier-history')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3v18h18"></path>
              <path d="M18 17V9"></path>
              <path d="M13 17V5"></path>
              <path d="M8 17v-3"></path>
            </svg>
            <span>Historial Proveedores</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={onLogout}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="content-header">
          <div className="header-left">
            <h1 className="app-title">Sistema de Inventario - Colmado</h1>
          </div>
          <div className="header-right">
            <div className="header-user">
              <div className="header-user-avatar">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="header-user-info">
                <div className="header-user-name">Dueño</div>
                <div className="header-user-status">Online</div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="content-area">
          {activeView === 'dashboard' && (
            <div className="dashboard-view">
              <h2 className="view-title">Panel de Control</h2>
              
              {/* Low Stock Alert Banner */}
              {lowStockProducts.length > 0 && (
                <div className="alert-banner">
                  <div className="alert-banner-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                      <line x1="12" y1="9" x2="12" y2="13"></line>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                  </div>
                  <div className="alert-banner-content">
                    <div className="alert-banner-title">Alerta de Stock Bajo</div>
                    <div className="alert-banner-message">
                      Tienes {lowStockProducts.length} producto{lowStockProducts.length !== 1 ? 's' : ''} con stock bajo
                      {criticalStockProducts.length > 0 && (
                        <span className="alert-critical"> ({criticalStockProducts.length} sin stock)</span>
                      )}
                      {warningStockProducts.length > 0 && (
                        <span className="alert-warning"> ({warningStockProducts.length} crítico{warningStockProducts.length !== 1 ? 's' : ''})</span>
                      )}
                    </div>
                  </div>
                  <button
                    className="alert-banner-action"
                    onClick={() => setActiveView('alerts')}
                  >
                    Ver Alertas
                  </button>
                </div>
              )}
              
              {/* Stats Cards */}
              <div className="stats-grid">
                <div className="stat-card stat-card-green">
                  <div className="stat-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{totalProducts}</div>
                    <div className="stat-label">Productos</div>
                  </div>
                </div>

                <div className="stat-card stat-card-blue">
                  <div className="stat-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                      <line x1="1" y1="10" x2="23" y2="10"></line>
                    </svg>
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">RD$ {totalValue.toLocaleString('es-DO')}</div>
                    <div className="stat-label">Valor Total</div>
                  </div>
                </div>

                <div className="stat-card stat-card-orange">
                  <div className="stat-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="9" cy="21" r="1"></circle>
                      <circle cx="20" cy="21" r="1"></circle>
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{products.filter(p => p.stock > 0).length}</div>
                    <div className="stat-label">En Stock</div>
                  </div>
                </div>

                <div className="stat-card stat-card-yellow">
                  <div className="stat-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="1" x2="12" y2="23"></line>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                    </svg>
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">RD$ {totalSales.toLocaleString('es-DO')}</div>
                    <div className="stat-label">Valor Venta</div>
                  </div>
                </div>
              </div>

              {/* Recent Products */}
              <div className="recent-products">
                <h3 className="section-title">Productos Recientes</h3>
                {products.length === 0 ? (
                  <div className="empty-state">
                    <p>No hay productos registrados aún.</p>
                    <button
                      className="btn-primary"
                      onClick={() => setActiveView('add-product')}
                    >
                      Agregar Primer Producto
                    </button>
                  </div>
                ) : (
                  <div className="products-grid">
                    {products.slice(-6).reverse().map((product) => (
                      <div key={product.id} className="product-card-mini">
                        <div className="product-card-mini-image">
                          {product.imagen ? (
                            <img src={product.imagen} alt={product.nombre} />
                          ) : (
                            <div className="product-placeholder">
                              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                <polyline points="21 15 16 10 5 21"></polyline>
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="product-card-mini-info">
                          <div className="product-card-mini-name">{product.nombre}</div>
                          <div className="product-card-mini-price">RD$ {product.precioVenta?.toLocaleString('es-DO')}</div>
                          <div className="product-card-mini-stock">Stock: {product.stock || 0}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeView === 'products' && (
            <ProductList
              products={products}
              onEdit={handleEditProduct}
              onToggleStatus={handleToggleProductStatus}
            />
          )}

          {activeView === 'add-product' && (
            <ProductForm
              product={editingProduct}
              onSave={editingProduct ? handleUpdateProduct : handleAddProduct}
              onCancel={editingProduct ? handleCancelEdit : () => setActiveView('products')}
            />
          )}

          {activeView === 'sales' && (
            <Sales
              products={products}
              onSaleComplete={handleSaleComplete}
            />
          )}

          {activeView === 'inventory' && (
            <InventoryManagement
              products={products}
              onStockUpdate={handleStockUpdate}
            />
          )}

          {activeView === 'alerts' && (
            <LowStockAlerts products={products} />
          )}

          {activeView === 'suppliers' && (
            <SupplierManagement />
          )}

          {activeView === 'supplier-history' && (
            <SupplierHistory />
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

