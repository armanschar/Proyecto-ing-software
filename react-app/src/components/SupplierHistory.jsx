import { useState, useEffect } from 'react';
import './SupplierHistory.css';
import PurchaseDetails from './PurchaseDetails';

function SupplierHistory() {
  const [suppliers, setSuppliers] = useState([]);
  const [movements, setMovements] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  const loadData = () => {
    const savedSuppliers = localStorage.getItem('colmado_suppliers');
    const savedMovements = localStorage.getItem('colmado_movements');
    
    if (savedSuppliers) {
      setSuppliers(JSON.parse(savedSuppliers));
    }
    
    if (savedMovements) {
      const allMovements = JSON.parse(savedMovements);
      // Filter only entry movements that have supplier data
      const entriesWithSuppliers = allMovements.filter(m => m.type === 'entry' && m.supplier);
      setMovements(entriesWithSuppliers);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getSupplierStats = (supplierId) => {
    const supplierMovements = movements.filter(m => m.supplier && m.supplier.id === supplierId);
    const totalPurchases = supplierMovements.length;
    const totalUnits = supplierMovements.reduce((sum, m) => sum + (m.quantityChange || 0), 0);
    const lastPurchase = supplierMovements.length > 0 ? new Date(supplierMovements[0].date) : null;

    return {
      totalPurchases,
      totalUnits,
      lastPurchase,
      movements: supplierMovements
    };
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contacto.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewHistory = (supplier) => {
    setSelectedSupplier(supplier);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-DO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysSinceLastPurchase = (lastPurchaseDate) => {
    if (!lastPurchaseDate) return null;
    const days = Math.floor((new Date() - lastPurchaseDate) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="supplier-history">
      <div className="history-header">
        <h2>📊 Historial de Compras por Proveedor</h2>
        <p className="history-subtitle">
          Visualiza el historial de entradas de inventario asociadas a cada proveedor
        </p>
      </div>

      {!selectedSupplier ? (
        <>
          <div className="search-bar">
            <input
              type="text"
              className="search-input"
              placeholder="Buscar proveedor por nombre o contacto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="suppliers-stats-grid">
            {filteredSuppliers.map(supplier => {
              const stats = getSupplierStats(supplier.id);
              const daysSince = getDaysSinceLastPurchase(stats.lastPurchase);
              
              return (
                <div key={supplier.id} className="supplier-stat-card">
                  <div className="stat-card-header">
                    <div className="supplier-main-info">
                      <h3>{supplier.nombre}</h3>
                      <p className="supplier-contact">👤 {supplier.contacto}</p>
                      {supplier.telefono && (
                        <p className="supplier-phone">📞 {supplier.telefono}</p>
                      )}
                    </div>
                    {!supplier.activo && (
                      <span className="status-badge inactive">Inactivo</span>
                    )}
                  </div>

                  <div className="stats-summary">
                    <div className="stat-item">
                      <span className="stat-icon">📦</span>
                      <div className="stat-content">
                        <span className="stat-value">{stats.totalPurchases}</span>
                        <span className="stat-label">Compras</span>
                      </div>
                    </div>
                    <div className="stat-item">
                      <span className="stat-icon">📊</span>
                      <div className="stat-content">
                        <span className="stat-value">{stats.totalUnits.toLocaleString()}</span>
                        <span className="stat-label">Unidades</span>
                      </div>
                    </div>
                    <div className="stat-item">
                      <span className="stat-icon">📅</span>
                      <div className="stat-content">
                        {stats.lastPurchase ? (
                          <>
                            <span className="stat-value">
                              {daysSince === 0 ? 'Hoy' : daysSince === 1 ? 'Ayer' : `${daysSince} días`}
                            </span>
                            <span className="stat-label">Última compra</span>
                          </>
                        ) : (
                          <>
                            <span className="stat-value">-</span>
                            <span className="stat-label">Sin compras</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {stats.totalPurchases > 0 && (
                    <button
                      className="btn-view-history"
                      onClick={() => handleViewHistory(supplier)}
                    >
                      📋 Ver Historial Completo
                    </button>
                  )}

                  {stats.totalPurchases === 0 && (
                    <div className="no-purchases">
                      <p>No hay compras registradas con este proveedor</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredSuppliers.length === 0 && (
            <div className="no-data">
              {searchTerm ? (
                <>
                  <p>🔍 No se encontraron proveedores que coincidan con "{searchTerm}"</p>
                </>
              ) : (
                <>
                  <p>📦 No hay proveedores registrados</p>
                  <p>Ve a Proveedores para agregar uno</p>
                </>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="detailed-history">
          <div className="detailed-header">
            <button
              className="btn-back"
              onClick={() => setSelectedSupplier(null)}
            >
              ← Volver
            </button>
            <div className="supplier-details">
              <h3>{selectedSupplier.nombre}</h3>
              <p>👤 {selectedSupplier.contacto}</p>
              {selectedSupplier.telefono && <p>📞 {selectedSupplier.telefono}</p>}
              {selectedSupplier.email && <p>✉️ {selectedSupplier.email}</p>}
              {selectedSupplier.rnc && <p>📄 RNC: {selectedSupplier.rnc}</p>}
            </div>
          </div>

          <div className="movements-list">
            <h4>Historial de Entradas</h4>
            {getSupplierStats(selectedSupplier.id).movements.length > 0 ? (
              <div className="movements-table-wrapper">
                <div className="movements-table">
                  <div className="table-header">
                    <span className="col-date">Fecha</span>
                    <span className="col-product">Producto</span>
                    <span className="col-quantity">Cantidad</span>
                    <span className="col-document">Documento</span>
                    <span className="col-reason">Motivo</span>
                    <span className="col-actions">Acciones</span>
                  </div>
                  {getSupplierStats(selectedSupplier.id).movements.map(movement => (
                    <div key={movement.id} className="table-row">
                      <span className="col-date">{formatDate(movement.date)}</span>
                      <span className="col-product">
                        <strong>{movement.productName}</strong>
                        <small>{movement.productCode}</small>
                      </span>
                      <span className="col-quantity positive">
                        +{movement.quantityChange} unidades
                      </span>
                      <span className="col-document">{movement.document || '-'}</span>
                      <span className="col-reason">{movement.reason || '-'}</span>
                      <span className="col-actions">
                        <button
                          className="btn-view-details"
                          onClick={() => {
                            console.log('Button clicked, movement id:', movement.id);
                            setSelectedPurchase(movement.id);
                          }}
                          title="Ver detalles completos de la compra"
                        >
                          Ver Detalles
                        </button>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="no-movements">
                <p>No hay movimientos registrados para este proveedor</p>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedPurchase && (
        <PurchaseDetails
          purchaseId={selectedPurchase}
          onClose={() => setSelectedPurchase(null)}
        />
      )}
    </div>
  );
}

export default SupplierHistory;
