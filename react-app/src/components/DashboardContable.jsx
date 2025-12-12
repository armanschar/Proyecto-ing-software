import { useState, useEffect } from 'react';
import AuditHistory from './AuditHistory';
import { ensurePlaceholderExists } from '../utils/initializeData';
import './DashboardContable.css';

const DashboardContable = ({ user, onLogout }) => {
  const [activeView, setActiveView] = useState('statistics');
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);

  // Cargar datos del localStorage
  useEffect(() => {
    ensurePlaceholderExists();
    const savedProducts = localStorage.getItem('colmado_products');
    const savedSales = localStorage.getItem('colmado_sales');
    
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
    if (savedSales) {
      setSales(JSON.parse(savedSales));
    }
  }, []);

  // Calcular estadísticas financieras
  const calculateStats = () => {
    // Ventas totales
    const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
    
    // Costos totales de productos vendidos
    const totalCosts = sales.reduce((sum, sale) => {
      // Usar el costo almacenado en la venta, o buscar en productos como fallback
      const cost = sale.productCost || (products.find(p => p.id === sale.productId)?.costo || 0);
      return sum + (cost * sale.quantity);
    }, 0);
    
    // Ganancia bruta
    const grossProfit = totalSales - totalCosts;
    
    // Margen de ganancia (%)
    const profitMargin = totalSales > 0 ? (grossProfit / totalSales) * 100 : 0;
    
    // Ventas del día
    const today = new Date();
    const todaySales = sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return (
        saleDate.getDate() === today.getDate() &&
        saleDate.getMonth() === today.getMonth() &&
        saleDate.getFullYear() === today.getFullYear()
      );
    });
    const todayTotal = todaySales.reduce((sum, sale) => sum + sale.total, 0);
    const todayCount = todaySales.length;
    
    // Ventas de la semana
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekSales = sales.filter(sale => new Date(sale.date) >= weekAgo);
    const weekTotal = weekSales.reduce((sum, sale) => sum + sale.total, 0);
    const weekCount = weekSales.length;
    
    // Ventas del mes
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const monthSales = sales.filter(sale => new Date(sale.date) >= monthAgo);
    const monthTotal = monthSales.reduce((sum, sale) => sum + sale.total, 0);
    const monthCount = monthSales.length;
    
    // Productos más vendidos
    const productSales = {};
    sales.forEach(sale => {
      if (!productSales[sale.productId]) {
        productSales[sale.productId] = {
          productId: sale.productId,
          productName: sale.productName,
          quantity: 0,
          revenue: 0,
          cost: 0,
        };
      }
      // Usar el costo almacenado en la venta, o buscar en productos como fallback
      const cost = sale.productCost || (products.find(p => p.id === sale.productId)?.costo || 0);
      productSales[sale.productId].quantity += sale.quantity;
      productSales[sale.productId].revenue += sale.total;
      productSales[sale.productId].cost += cost * sale.quantity;
    });
    
    const topProducts = Object.values(productSales)
      .map(item => ({
        ...item,
        profit: item.revenue - item.cost,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    
    // Valor del inventario actual
    const inventoryValue = products.reduce((sum, p) => sum + (p.costo * (p.stock || 0)), 0);
    
    // Productos con bajo stock (menos de 10 unidades)
    const lowStockProducts = products.filter(p => (p.stock || 0) < 10 && p.estado === 'Activo');
    
    // Productos sin stock
    const outOfStockProducts = products.filter(p => (p.stock || 0) === 0 && p.estado === 'Activo');
    
    // Rotación de inventario (simulado - productos vendidos / productos en stock)
    const totalUnitsSold = sales.reduce((sum, sale) => sum + sale.quantity, 0);
    const totalUnitsInStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
    const inventoryTurnover = totalUnitsInStock > 0 ? (totalUnitsSold / totalUnitsInStock) : 0;

    return {
      totalSales,
      totalCosts,
      grossProfit,
      profitMargin,
      todayTotal,
      todayCount,
      weekTotal,
      weekCount,
      monthTotal,
      monthCount,
      topProducts,
      inventoryValue,
      lowStockProducts,
      outOfStockProducts,
      inventoryTurnover,
      totalSalesCount: sales.length,
    };
  };

  const stats = calculateStats();

  return (
    <div className="dashboard-contable-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="user-info">
            <div className="user-avatar contable-avatar">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <div className="user-name">Contable</div>
              <div className="user-status">Online</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-menu">
          <div className="menu-title">PANEL CONTABLE</div>
          <button
            className={`menu-item ${activeView === 'statistics' ? 'active' : ''}`}
            onClick={() => setActiveView('statistics')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
            <span>Estadísticas</span>
          </button>
          <button
            className={`menu-item ${activeView === 'audit' ? 'active' : ''}`}
            onClick={() => setActiveView('audit')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <span>Historial de Auditoría</span>
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
        <header className="content-header">
          <div className="header-left">
            <h1 className="app-title">Panel Contable - Sistema de Inventario</h1>
          </div>
          <div className="header-right">
            <div className="header-user">
              <div className="header-user-avatar contable-avatar">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="header-user-info">
                <div className="header-user-name">Contable</div>
                <div className="header-user-status">Online</div>
              </div>
            </div>
          </div>
        </header>

        <div className="content-area">
          {activeView === 'statistics' && (
            <>
              <h2 className="view-title">Análisis Financiero y Estadísticas</h2>

          {/* Main Stats Cards */}
          <div className="stats-grid-main">
            <div className="stat-card-main stat-revenue">
              <div className="stat-icon-main">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
              <div className="stat-content-main">
                <div className="stat-label-main">Ingresos Totales</div>
                <div className="stat-value-main">RD$ {stats.totalSales.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</div>
                <div className="stat-subtitle">{stats.totalSalesCount} ventas registradas</div>
              </div>
            </div>

            <div className="stat-card-main stat-costs">
              <div className="stat-icon-main">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                  <line x1="1" y1="10" x2="23" y2="10"></line>
                </svg>
              </div>
              <div className="stat-content-main">
                <div className="stat-label-main">Costos Totales</div>
                <div className="stat-value-main">RD$ {stats.totalCosts.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</div>
                <div className="stat-subtitle">Costo de productos vendidos</div>
              </div>
            </div>

            <div className="stat-card-main stat-profit">
              <div className="stat-icon-main">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                  <polyline points="17 6 23 6 23 12"></polyline>
                </svg>
              </div>
              <div className="stat-content-main">
                <div className="stat-label-main">Ganancia Bruta</div>
                <div className="stat-value-main">RD$ {stats.grossProfit.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</div>
                <div className="stat-subtitle">Margen: {stats.profitMargin.toFixed(2)}%</div>
              </div>
            </div>
          </div>

          {/* Period Stats */}
          <div className="period-stats">
            <h3 className="section-title">Ventas por Período</h3>
            <div className="period-cards">
              <div className="period-card">
                <div className="period-label">Hoy</div>
                <div className="period-value">RD$ {stats.todayTotal.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</div>
                <div className="period-count">{stats.todayCount} ventas</div>
              </div>
              <div className="period-card">
                <div className="period-label">Última Semana</div>
                <div className="period-value">RD$ {stats.weekTotal.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</div>
                <div className="period-count">{stats.weekCount} ventas</div>
              </div>
              <div className="period-card">
                <div className="period-label">Último Mes</div>
                <div className="period-value">RD$ {stats.monthTotal.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</div>
                <div className="period-count">{stats.monthCount} ventas</div>
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="two-column-layout">
            {/* Left Column */}
            <div className="column-left">
              {/* Top Products */}
              <div className="panel-card">
                <h3 className="panel-title">Productos Más Vendidos</h3>
                {stats.topProducts.length === 0 ? (
                  <div className="empty-state">
                    <p>No hay ventas registradas</p>
                  </div>
                ) : (
                  <div className="top-products-list">
                    {stats.topProducts.map((item, index) => {
                      const product = products.find(p => p.id === item.productId);
                      return (
                        <div key={item.productId} className="top-product-item">
                          <div className="product-rank">#{index + 1}</div>
                          <div className="product-info">
                            <div className="product-name">{item.productName}</div>
                            <div className="product-metrics">
                              <span>Cantidad: {item.quantity}</span>
                              <span>•</span>
                              <span>Ganancia: RD$ {item.profit.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</span>
                            </div>
                          </div>
                          <div className="product-revenue">
                            RD$ {item.revenue.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Inventory Analysis */}
              <div className="panel-card">
                <h3 className="panel-title">Análisis de Inventario</h3>
                <div className="inventory-stats">
                  <div className="inventory-stat-item">
                    <div className="inventory-stat-label">Valor del Inventario</div>
                    <div className="inventory-stat-value">
                      RD$ {stats.inventoryValue.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="inventory-stat-item">
                    <div className="inventory-stat-label">Rotación de Inventario</div>
                    <div className="inventory-stat-value">{stats.inventoryTurnover.toFixed(2)}x</div>
                  </div>
                  <div className="inventory-stat-item">
                    <div className="inventory-stat-label">Productos con Bajo Stock</div>
                    <div className="inventory-stat-value warning">{stats.lowStockProducts.length}</div>
                  </div>
                  <div className="inventory-stat-item">
                    <div className="inventory-stat-label">Productos Sin Stock</div>
                    <div className="inventory-stat-value danger">{stats.outOfStockProducts.length}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="column-right">
              {/* Profit Analysis */}
              <div className="panel-card">
                <h3 className="panel-title">Análisis de Rentabilidad</h3>
                <div className="profit-analysis">
                  <div className="profit-bar">
                    <div className="profit-bar-label">
                      <span>Ingresos</span>
                      <span>RD$ {stats.totalSales.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="profit-bar-container">
                      <div 
                        className="profit-bar-fill revenue"
                        style={{ width: '100%' }}
                      ></div>
                    </div>
                  </div>
                  <div className="profit-bar">
                    <div className="profit-bar-label">
                      <span>Costos</span>
                      <span>RD$ {stats.totalCosts.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="profit-bar-container">
                      <div 
                        className="profit-bar-fill costs"
                        style={{ width: `${stats.totalSales > 0 ? (stats.totalCosts / stats.totalSales) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="profit-bar">
                    <div className="profit-bar-label">
                      <span>Ganancia</span>
                      <span>RD$ {stats.grossProfit.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="profit-bar-container">
                      <div 
                        className="profit-bar-fill profit"
                        style={{ width: `${stats.profitMargin}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="profit-summary">
                    <div className="profit-summary-item">
                      <span>Margen de Ganancia:</span>
                      <span className="profit-margin">{stats.profitMargin.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Sales */}
              <div className="panel-card">
                <h3 className="panel-title">Ventas Recientes</h3>
                <div className="recent-sales-list">
                  {sales.length === 0 ? (
                    <div className="empty-state">
                      <p>No hay ventas registradas</p>
                    </div>
                  ) : (
                    sales.slice(0, 10).map((sale) => (
                      <div key={sale.id} className="recent-sale-item">
                        <div className="sale-info">
                          <div className="sale-product">{sale.productName}</div>
                          <div className="sale-details">
                            {sale.quantity} x RD$ {sale.unitPrice.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                          </div>
                          <div className="sale-date">
                            {new Date(sale.date).toLocaleString('es-DO', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                        <div className="sale-total">
                          RD$ {sale.total.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
            </>
          )}

          {activeView === 'audit' && (
            <AuditHistory />
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardContable;

