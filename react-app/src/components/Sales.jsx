import { useState, useEffect } from 'react';
import './Sales.css';

const Sales = ({ products, onSaleComplete }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [salesHistory, setSalesHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar historial de ventas del localStorage
  useEffect(() => {
    const savedSales = localStorage.getItem('colmado_sales');
    if (savedSales) {
      setSalesHistory(JSON.parse(savedSales));
    }
  }, []);

  // Guardar ventas en localStorage
  useEffect(() => {
    localStorage.setItem('colmado_sales', JSON.stringify(salesHistory));
  }, [salesHistory]);

  // Filtrar productos disponibles
  const availableProducts = products.filter(
    (product) =>
      product.estado === 'Activo' &&
      product.stock > 0 &&
      (product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.codigo.includes(searchTerm))
  );

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setQuantity(1);
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    if (selectedProduct) {
      const maxQuantity = selectedProduct.stock;
      setQuantity(Math.min(Math.max(1, value), maxQuantity));
    }
  };

  const calculateSubtotal = () => {
    if (!selectedProduct) return 0;
    return selectedProduct.precioVenta * quantity;
  };

  const handleCompleteSale = () => {
    if (!selectedProduct || quantity <= 0) {
      alert('Por favor, selecciona un producto y una cantidad válida');
      return;
    }

    if (quantity > selectedProduct.stock) {
      alert('No hay suficiente stock disponible');
      return;
    }

    const sale = {
      id: Date.now().toString(),
      productId: selectedProduct.id,
      productName: selectedProduct.nombre,
      productCode: selectedProduct.codigo,
      quantity: quantity,
      unitPrice: selectedProduct.precioVenta,
      total: calculateSubtotal(),
      date: new Date().toISOString(),
      timestamp: Date.now(),
    };

    // Agregar a historial
    setSalesHistory([sale, ...salesHistory]);

    // Reducir stock del producto
    if (onSaleComplete) {
      onSaleComplete(selectedProduct.id, quantity);
    }

    // Resetear formulario
    setSelectedProduct(null);
    setQuantity(1);
    setSearchTerm('');

    alert(`Venta completada: ${quantity} x ${selectedProduct.nombre} = RD$ ${calculateSubtotal().toLocaleString('es-DO', { minimumFractionDigits: 2 })}`);
  };

  const totalSalesToday = salesHistory
    .filter((sale) => {
      const saleDate = new Date(sale.date);
      const today = new Date();
      return (
        saleDate.getDate() === today.getDate() &&
        saleDate.getMonth() === today.getMonth() &&
        saleDate.getFullYear() === today.getFullYear()
      );
    })
    .reduce((sum, sale) => sum + sale.total, 0);

  const totalSalesCount = salesHistory.length;

  return (
    <div className="sales-container">
      <div className="sales-header">
        <h2 className="view-title">Registro de Ventas</h2>
        <div className="sales-stats">
          <div className="stat-item">
            <span className="stat-label">Ventas hoy:</span>
            <span className="stat-value">RD$ {totalSalesToday.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total ventas:</span>
            <span className="stat-value">{totalSalesCount}</span>
          </div>
        </div>
      </div>

      <div className="sales-layout">
        {/* Left Panel - Product Selection */}
        <div className="sales-left-panel">
          <div className="panel-card">
            <h3 className="panel-title">Seleccionar Producto</h3>
            
            <div className="search-box">
              <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input
                type="text"
                placeholder="Buscar por nombre o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="products-list">
              {availableProducts.length === 0 ? (
                <div className="empty-state">
                  <p>No hay productos disponibles</p>
                </div>
              ) : (
                availableProducts.map((product) => (
                  <div
                    key={product.id}
                    className={`product-item ${selectedProduct?.id === product.id ? 'selected' : ''}`}
                    onClick={() => handleProductSelect(product)}
                  >
                    <div className="product-item-image">
                      {product.imagen ? (
                        <img src={product.imagen} alt={product.nombre} />
                      ) : (
                        <div className="product-placeholder-small">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                            <polyline points="21 15 16 10 5 21"></polyline>
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="product-item-info">
                      <div className="product-item-name">{product.nombre}</div>
                      <div className="product-item-details">
                        <span className="product-code">{product.codigo}</span>
                        <span className="product-stock">Stock: {product.stock}</span>
                      </div>
                      <div className="product-item-price">
                        RD$ {product.precioVenta?.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Sale Details */}
        <div className="sales-right-panel">
          <div className="panel-card">
            <h3 className="panel-title">Detalles de Venta</h3>

            {selectedProduct ? (
              <div className="sale-details">
                <div className="selected-product-info">
                  <div className="selected-product-image">
                    {selectedProduct.imagen ? (
                      <img src={selectedProduct.imagen} alt={selectedProduct.nombre} />
                    ) : (
                      <div className="product-placeholder-large">
                        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <circle cx="8.5" cy="8.5" r="1.5"></circle>
                          <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="selected-product-details">
                    <h4 className="selected-product-name">{selectedProduct.nombre}</h4>
                    <p className="selected-product-code">Código: {selectedProduct.codigo}</p>
                    <p className="selected-product-stock">
                      Stock disponible: <strong>{selectedProduct.stock}</strong>
                    </p>
                  </div>
                </div>

                <div className="quantity-section">
                  <label htmlFor="quantity">Cantidad</label>
                  <div className="quantity-controls">
                    <button
                      type="button"
                      className="quantity-btn"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    </button>
                    <input
                      type="number"
                      id="quantity"
                      value={quantity}
                      onChange={handleQuantityChange}
                      min="1"
                      max={selectedProduct.stock}
                      className="quantity-input"
                    />
                    <button
                      type="button"
                      className="quantity-btn"
                      onClick={() => setQuantity(Math.min(selectedProduct.stock, quantity + 1))}
                      disabled={quantity >= selectedProduct.stock}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="sale-summary">
                  <div className="summary-row">
                    <span>Precio unitario:</span>
                    <span>RD$ {selectedProduct.precioVenta?.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="summary-row">
                    <span>Cantidad:</span>
                    <span>{quantity}</span>
                  </div>
                  <div className="summary-row total-row">
                    <span>Total:</span>
                    <span>RD$ {calculateSubtotal().toLocaleString('es-DO', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <button
                  className="btn-complete-sale"
                  onClick={handleCompleteSale}
                  disabled={quantity <= 0 || quantity > selectedProduct.stock}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Completar Venta
                </button>
              </div>
            ) : (
              <div className="no-product-selected">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <p>Selecciona un producto para realizar la venta</p>
              </div>
            )}
          </div>

          {/* Sales History */}
          <div className="panel-card sales-history">
            <h3 className="panel-title">Historial de Ventas Recientes</h3>
            <div className="history-list">
              {salesHistory.length === 0 ? (
                <div className="empty-state">
                  <p>No hay ventas registradas</p>
                </div>
              ) : (
                salesHistory.slice(0, 10).map((sale) => (
                  <div key={sale.id} className="history-item">
                    <div className="history-item-info">
                      <div className="history-item-name">{sale.productName}</div>
                      <div className="history-item-details">
                        {sale.quantity} x RD$ {sale.unitPrice.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="history-item-date">
                        {new Date(sale.date).toLocaleString('es-DO', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                    <div className="history-item-total">
                      RD$ {sale.total.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sales;

