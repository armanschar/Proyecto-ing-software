import React, { useState, useMemo } from 'react';
import './LowStockAlerts.css';

const LowStockAlerts = ({ products }) => {
  const [sortBy, setSortBy] = useState('criticality'); // criticality, name, stock
  const [filterCategory, setFilterCategory] = useState('all');
  const [alertType, setAlertType] = useState('all'); // all, stock, expiration

  // Get unique categories from products
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.categoria).filter(Boolean));
    return ['all', ...Array.from(cats).sort()];
  }, [products]);

  // Calculate alerts with criticality levels
  const alerts = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return products
      .filter(product => {
        // Only active products
        if (product.estado !== 'Activo') return false;
        
        // Filter by category
        if (filterCategory !== 'all' && product.categoria !== filterCategory) return false;
        
        return true;
      })
      .map(product => {
        const minStock = product.stockMinimo || 0;
        const stock = product.stock || 0;
        
        // Check stock level
        let stockCriticality = null;
        let hasStockAlert = stock <= minStock;
        
        if (hasStockAlert) {
          if (stock === 0) {
            stockCriticality = 'critical';
          } else if (stock <= minStock / 2) {
            stockCriticality = 'warning';
          } else {
            stockCriticality = 'low';
          }
        }
        
        // Check expiration date
        let expirationCriticality = null;
        let hasExpirationAlert = false;
        let daysUntilExpiration = null;
        
        if (product.fechaVencimiento) {
          const expirationDate = new Date(product.fechaVencimiento);
          expirationDate.setHours(0, 0, 0, 0);
          const diffTime = expirationDate - today;
          daysUntilExpiration = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (daysUntilExpiration <= 0) {
            expirationCriticality = 'expired';
            hasExpirationAlert = true;
          } else if (daysUntilExpiration <= 7) {
            expirationCriticality = 'critical';
            hasExpirationAlert = true;
          } else if (daysUntilExpiration <= 30) {
            expirationCriticality = 'warning';
            hasExpirationAlert = true;
          }
        }
        
        // Determine overall criticality (worst case)
        let overallCriticality = null;
        if (expirationCriticality === 'expired' || stockCriticality === 'critical') {
          overallCriticality = 'critical';
        } else if (expirationCriticality === 'critical' || stockCriticality === 'warning') {
          overallCriticality = 'warning';
        } else if (expirationCriticality === 'warning' || stockCriticality === 'low') {
          overallCriticality = 'low';
        }
        
        return {
          ...product,
          hasStockAlert,
          hasExpirationAlert,
          stockCriticality,
          expirationCriticality,
          daysUntilExpiration,
          criticality: overallCriticality,
          criticalityValue: overallCriticality === 'critical' ? 3 : overallCriticality === 'warning' ? 2 : 1,
        };
      })
      .filter(product => {
        // Filter by alert type
        if (alertType === 'stock') return product.hasStockAlert;
        if (alertType === 'expiration') return product.hasExpirationAlert;
        // 'all' - show products with any alert
        return product.hasStockAlert || product.hasExpirationAlert;
      });
  }, [products, filterCategory, alertType]);

  // Sort alerts
  const sortedAlerts = useMemo(() => {
    const sorted = [...alerts];
    
    switch (sortBy) {
      case 'criticality':
        sorted.sort((a, b) => b.criticalityValue - a.criticalityValue);
        break;
      case 'name':
        sorted.sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
      case 'stock':
        sorted.sort((a, b) => a.stock - b.stock);
        break;
      default:
        break;
    }
    
    return sorted;
  }, [alerts, sortBy]);

  const getCriticalityBadge = (criticality, isExpired) => {
    if (isExpired) {
      return { text: 'VENCIDO', className: 'criticality-expired' };
    }
    
    const badges = {
      critical: { text: 'CRÍTICO', className: 'criticality-critical' },
      warning: { text: 'ADVERTENCIA', className: 'criticality-warning' },
      low: { text: 'BAJO', className: 'criticality-low' },
    };
    return badges[criticality] || badges.low;
  };

  const getCriticalityIcon = (criticality) => {
    if (criticality === 'critical') {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      );
    } else if (criticality === 'warning') {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      );
    } else {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v20M2 12h20"></path>
        </svg>
      );
    }
  };

  // Count by criticality
  const criticalCount = alerts.filter(a => a.criticality === 'critical').length;
  const warningCount = alerts.filter(a => a.criticality === 'warning').length;
  const lowCount = alerts.filter(a => a.criticality === 'low').length;

  return (
    <div className="low-stock-alerts">
      <div className="alerts-header">
        <div className="alerts-title">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          <h2>Alertas de Stock Bajo</h2>
          <span className="alerts-count">{alerts.length}</span>
        </div>
        
        <div className="alerts-summary">
          <div className="summary-item critical">
            <span className="summary-label">Sin Stock</span>
            <span className="summary-value">{criticalCount}</span>
          </div>
          <div className="summary-item warning">
            <span className="summary-label">Crítico</span>
            <span className="summary-value">{warningCount}</span>
          </div>
          <div className="summary-item low">
            <span className="summary-label">Bajo</span>
            <span className="summary-value">{lowCount}</span>
          </div>
        </div>
      </div>

      <div className="alerts-filters">
        <div className="filter-group">
          <label>Tipo de Alerta:</label>
          <select value={alertType} onChange={(e) => setAlertType(e.target.value)}>
            <option value="all">Todas las Alertas</option>
            <option value="stock">Solo Stock Bajo</option>
            <option value="expiration">Solo Vencimientos</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Ordenar por:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="criticality">Criticidad</option>
            <option value="name">Nombre</option>
            <option value="stock">Stock Actual</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Categoría:</label>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'Todas las Categorías' : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="no-alerts">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <p>No hay alertas de stock bajo</p>
          <span>Todos los productos tienen stock suficiente</span>
        </div>
      ) : (
        <div className="alerts-list">
          {sortedAlerts.map(alert => {
            const isExpired = alert.expirationCriticality === 'expired';
            const badge = getCriticalityBadge(alert.criticality, isExpired);
            
            return (
              <div key={alert.id} className={`alert-card ${alert.criticality} ${isExpired ? 'expired' : ''}`}>
                <div className="alert-icon">
                  {getCriticalityIcon(alert.criticality)}
                </div>
                
                <div className="alert-content">
                  <div className="alert-header">
                    <h3>{alert.nombre}</h3>
                    <span className={`alert-badge ${badge.className}`}>
                      {badge.text}
                    </span>
                  </div>
                  
                  <div className="alert-details">
                    <div className="detail-item">
                      <span className="detail-label">Código:</span>
                      <span className="detail-value">{alert.codigo}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Categoría:</span>
                      <span className="detail-value">{alert.categoria || 'Sin categoría'}</span>
                    </div>
                    
                    {alert.hasStockAlert && (
                      <>
                        <div className="detail-item">
                          <span className="detail-label">Stock Actual:</span>
                          <span className={`detail-value stock-${alert.stockCriticality}`}>
                            {alert.stock === 0 ? 'SIN STOCK' : `${alert.stock} unidades`}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Nivel Mínimo:</span>
                          <span className="detail-value">{alert.stockMinimo || 0} unidades</span>
                        </div>
                      </>
                    )}
                    
                    {alert.hasExpirationAlert && (
                      <>
                        <div className="detail-item">
                          <span className="detail-label">Fecha de Vencimiento:</span>
                          <span className={`detail-value expiration-${alert.expirationCriticality}`}>
                            {new Date(alert.fechaVencimiento).toLocaleDateString('es-DO')}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Estado:</span>
                          <span className={`detail-value expiration-${alert.expirationCriticality}`}>
                            {isExpired 
                              ? 'VENCIDO' 
                              : alert.daysUntilExpiration === 1
                                ? 'Vence mañana'
                                : `Vence en ${alert.daysUntilExpiration} días`
                            }
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LowStockAlerts;
