import React, { useState, useEffect } from 'react';
import { logStockEntry, logStockExit, logStockAdjustment } from '../utils/auditLog';
import './InventoryManagement.css';

const InventoryManagement = ({ products, onStockUpdate }) => {
  const [activeTab, setActiveTab] = useState('entry'); // entry, exit, adjustment
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [document, setDocument] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [unitCost, setUnitCost] = useState('');

  const loadSuppliers = () => {
    const saved = localStorage.getItem('colmado_suppliers');
    if (saved) {
      const allSuppliers = JSON.parse(saved);
      setSuppliers(allSuppliers.filter(s => s.activo));
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const filteredProducts = products.filter(product => 
    product.estado === 'Activo' && (
      product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.codigo.includes(searchTerm)
    )
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedProduct) {
      alert('Selecciona un producto');
      return;
    }

    if (!quantity || parseInt(quantity) <= 0) {
      alert('Ingresa una cantidad válida');
      return;
    }

    if (activeTab === 'entry' && (!unitCost || parseFloat(unitCost) <= 0)) {
      alert('Ingresa un costo unitario válido para la compra');
      return;
    }

    if (!reason.trim()) {
      alert('Ingresa un motivo para el movimiento');
      return;
    }

    const qty = parseInt(quantity);
    const user = 'Dueño';

    // Validate stock for exits and adjustments (negative)
    if ((activeTab === 'exit' || (activeTab === 'adjustment' && qty < 0)) && 
        selectedProduct.stock < Math.abs(qty)) {
      alert('Stock insuficiente para realizar esta operación');
      return;
    }

    // Log movement based on type
    switch (activeTab) {
      case 'entry': {
        const cost = parseFloat(unitCost);
        const subtotal = qty * cost;
        logStockEntry(
          selectedProduct.id,
          selectedProduct.nombre,
          selectedProduct.codigo,
          qty,
          reason,
          document || `ENT-${Date.now()}`,
          user,
          selectedSupplier ? {
            id: selectedSupplier.id,
            nombre: selectedSupplier.nombre,
            contacto: selectedSupplier.contacto
          } : null,
          cost,
          subtotal
        );
        onStockUpdate(selectedProduct.id, qty);
        alert(`Entrada registrada: +${qty} unidades de ${selectedProduct.nombre}\nCosto unitario: $${cost.toFixed(2)}\nSubtotal: $${subtotal.toFixed(2)}`);
        break;
      }

      case 'exit':
        logStockExit(
          selectedProduct.id,
          selectedProduct.nombre,
          selectedProduct.codigo,
          qty,
          reason,
          document || `SAL-${Date.now()}`,
          user
        );
        onStockUpdate(selectedProduct.id, -qty);
        alert(`Salida registrada: -${qty} unidades de ${selectedProduct.nombre}`);
        break;

      case 'adjustment': {
        const adjustmentQty = qty;
        logStockAdjustment(
          selectedProduct.id,
          selectedProduct.nombre,
          selectedProduct.codigo,
          adjustmentQty,
          reason,
          user
        );
        onStockUpdate(selectedProduct.id, adjustmentQty);
        alert(`Ajuste registrado: ${adjustmentQty > 0 ? '+' : ''}${adjustmentQty} unidades de ${selectedProduct.nombre}`);
        break;
      }

      default:
        break;
    }

    // Reset form
    setSelectedProduct(null);
    setQuantity('');
    setReason('');
    setDocument('');
    setSearchTerm('');
    setSelectedSupplier(null);
    setUnitCost('');
  };

  const getTabIcon = (tab) => {
    switch (tab) {
      case 'entry':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="19" x2="12" y2="5"></line>
            <polyline points="5 12 12 5 19 12"></polyline>
          </svg>
        );
      case 'exit':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <polyline points="19 12 12 19 5 12"></polyline>
          </svg>
        );
      case 'adjustment':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        );
      default:
        return null;
    }
  };

  const getQuickReasons = () => {
    switch (activeTab) {
      case 'entry':
        return ['Compra de mercancía', 'Devolución de cliente', 'Reposición', 'Inventario inicial'];
      case 'exit':
        return ['Devolución a proveedor', 'Donación', 'Muestra', 'Uso interno'];
      case 'adjustment':
        return ['Pérdida', 'Daño', 'Vencimiento', 'Error de conteo', 'Robo'];
      default:
        return [];
    }
  };

  return (
    <div className="inventory-management">
      <div className="inventory-header">
        <h2 className="view-title">Gestión de Inventario</h2>
        <p className="inventory-subtitle">
          Registra entradas, salidas y ajustes de stock con trazabilidad completa
        </p>
      </div>

      {/* Tabs */}
      <div className="inventory-tabs">
        <button
          className={`tab-button ${activeTab === 'entry' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('entry');
            setSelectedProduct(null);
            setQuantity('');
            setReason('');
          }}
        >
          {getTabIcon('entry')}
          <span>Entrada</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'exit' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('exit');
            setSelectedProduct(null);
            setQuantity('');
            setReason('');
          }}
        >
          {getTabIcon('exit')}
          <span>Salida</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'adjustment' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('adjustment');
            setSelectedProduct(null);
            setQuantity('');
            setReason('');
          }}
        >
          {getTabIcon('adjustment')}
          <span>Ajuste</span>
        </button>
      </div>

      <div className="inventory-content">
        <form onSubmit={handleSubmit} className="inventory-form">
          {/* Product Selection */}
          <div className="form-section">
            <h3 className="section-title">Seleccionar Producto</h3>
            
            <div className="form-group">
              <label htmlFor="product-search">Buscar Producto</label>
              <input
                type="text"
                id="product-search"
                placeholder="Buscar por nombre o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            {searchTerm && filteredProducts.length > 0 && !selectedProduct && (
              <div className="product-dropdown">
                {filteredProducts.slice(0, 5).map((product) => (
                  <div
                    key={product.id}
                    className="product-option"
                    onClick={() => {
                      setSelectedProduct(product);
                      setSearchTerm('');
                    }}
                  >
                    <div className="product-option-main">
                      <span className="product-option-name">{product.nombre}</span>
                      <span className="product-option-stock">Stock: {product.stock}</span>
                    </div>
                    <div className="product-option-code">Código: {product.codigo}</div>
                  </div>
                ))}
              </div>
            )}

            {selectedProduct && (
              <div className="selected-product-card">
                <div className="selected-product-header">
                  <div>
                    <h4>{selectedProduct.nombre}</h4>
                    <p>Código: {selectedProduct.codigo}</p>
                  </div>
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => setSelectedProduct(null)}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
                <div className="selected-product-details">
                  <div className="detail-item">
                    <span className="detail-label">Stock Actual:</span>
                    <span className={`detail-value ${selectedProduct.stock === 0 ? 'critical' : ''}`}>
                      {selectedProduct.stock} unidades
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Categoría:</span>
                    <span className="detail-value">{selectedProduct.categoria || 'Sin categoría'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Precio:</span>
                    <span className="detail-value">RD$ {selectedProduct.precioVenta?.toLocaleString('es-DO')}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Movement Details */}
          {selectedProduct && (
            <div className="form-section">
              <h3 className="section-title">
                Detalles del {activeTab === 'entry' ? 'Ingreso' : activeTab === 'exit' ? 'Egreso' : 'Ajuste'}
              </h3>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="quantity">
                    Cantidad {activeTab === 'adjustment' && '(+ o -)'}*
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    min={activeTab === 'adjustment' ? undefined : "1"}
                    step="1"
                    required
                    placeholder={activeTab === 'adjustment' ? 'Ej: -5 o +10' : 'Ej: 50'}
                    className="quantity-input"
                  />
                  {activeTab === 'adjustment' && (
                    <small className="help-text">
                      Usa números negativos para reducir stock (pérdidas, daños)
                    </small>
                  )}
                </div>

                {activeTab === 'entry' && (
                  <div className="form-group">
                    <label htmlFor="unitCost">Costo Unitario *</label>
                    <input
                      type="number"
                      id="unitCost"
                      value={unitCost}
                      onChange={(e) => setUnitCost(e.target.value)}
                      required
                      min="0"
                      step="0.01"
                      className="cost-input"
                      placeholder="0.00"
                    />
                    {unitCost && quantity && parseFloat(unitCost) > 0 && parseInt(quantity) > 0 && (
                      <small className="help-text subtotal-info">
                        Subtotal: ${(parseFloat(unitCost) * parseInt(quantity)).toFixed(2)}
                      </small>
                    )}
                  </div>
                )}

                {activeTab === 'entry' && (
                  <>
                    <div className="form-group">
                      <label htmlFor="document">Nro. de Documento</label>
                      <input
                        type="text"
                        id="document"
                        value={document}
                        onChange={(e) => setDocument(e.target.value)}
                        placeholder="Ej: FAC-001234"
                        className="document-input"
                      />
                      <small className="help-text">Factura, orden de compra, etc.</small>
                    </div>

                    <div className="form-group full-width">
                      <label htmlFor="supplier">Proveedor</label>
                      <select
                        id="supplier"
                        value={selectedSupplier?.id || ''}
                        onChange={(e) => {
                          const supplier = suppliers.find(s => s.id === parseInt(e.target.value));
                          setSelectedSupplier(supplier || null);
                        }}
                        className="supplier-select"
                      >
                        <option value="">-- Sin proveedor --</option>
                        {suppliers.map(supplier => (
                          <option key={supplier.id} value={supplier.id}>
                            {supplier.nombre} - {supplier.contacto}
                          </option>
                        ))}
                      </select>
                      {selectedSupplier && (
                        <div className="supplier-info-badge">
                          📦 {selectedSupplier.nombre}
                          {selectedSupplier.telefono && ` - 📞 ${selectedSupplier.telefono}`}
                        </div>
                      )}
                      {suppliers.length === 0 && (
                        <small className="help-text warning">
                          ⚠️ No hay proveedores registrados. Ve a Proveedores para agregar uno.
                        </small>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="reason">Motivo *</label>
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  placeholder={`Describe el motivo del ${activeTab === 'entry' ? 'ingreso' : activeTab === 'exit' ? 'egreso' : 'ajuste'}`}
                  rows="3"
                  className="reason-textarea"
                />
              </div>

              {/* Quick Reason Buttons */}
              <div className="quick-reasons">
                <label>Motivos comunes:</label>
                <div className="quick-reason-buttons">
                  {getQuickReasons().map((quickReason) => (
                    <button
                      key={quickReason}
                      type="button"
                      className="btn-quick-reason"
                      onClick={() => setReason(quickReason)}
                    >
                      {quickReason}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stock Preview */}
              <div className="stock-preview">
                <div className="preview-item">
                  <span className="preview-label">Stock Actual:</span>
                  <span className="preview-value current">{selectedProduct.stock}</span>
                </div>
                <div className="preview-arrow">→</div>
                <div className="preview-item">
                  <span className="preview-label">Stock Nuevo:</span>
                  <span className={`preview-value new ${
                    activeTab === 'entry' 
                      ? 'positive' 
                      : activeTab === 'exit' 
                      ? 'negative' 
                      : parseInt(quantity) > 0 ? 'positive' : 'negative'
                  }`}>
                    {activeTab === 'entry' 
                      ? selectedProduct.stock + (parseInt(quantity) || 0)
                      : activeTab === 'exit'
                      ? Math.max(0, selectedProduct.stock - (parseInt(quantity) || 0))
                      : selectedProduct.stock + (parseInt(quantity) || 0)
                    }
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <div className="form-actions">
                <button type="submit" className="btn-submit">
                  {getTabIcon(activeTab)}
                  <span>
                    Registrar {activeTab === 'entry' ? 'Entrada' : activeTab === 'exit' ? 'Salida' : 'Ajuste'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Info Panel */}
        {!selectedProduct && (
          <div className="info-panel">
            <div className="info-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </div>
            <h3>
              {activeTab === 'entry' && 'Registro de Entradas'}
              {activeTab === 'exit' && 'Registro de Salidas'}
              {activeTab === 'adjustment' && 'Ajustes de Inventario'}
            </h3>
            <p>
              {activeTab === 'entry' && 'Registra ingresos de mercancía por compras, devoluciones o reposiciones. Todos los movimientos quedan registrados en el historial.'}
              {activeTab === 'exit' && 'Registra salidas de inventario que no son ventas, como devoluciones a proveedor, donaciones o uso interno.'}
              {activeTab === 'adjustment' && 'Ajusta el stock por pérdidas, daños, vencimientos, robos o errores de conteo. Usa valores negativos para reducciones.'}
            </p>
            <div className="info-steps">
              <div className="info-step">
                <span className="step-number">1</span>
                <span>Busca y selecciona el producto</span>
              </div>
              <div className="info-step">
                <span className="step-number">2</span>
                <span>Ingresa la cantidad y motivo</span>
              </div>
              <div className="info-step">
                <span className="step-number">3</span>
                <span>Confirma el registro</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryManagement;
