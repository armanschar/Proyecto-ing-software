import { useState, useEffect } from 'react';
import { logSale } from '../utils/auditLog';
import SaleReceipt from './SaleReceipt';
import './Sales.css';

const Sales = ({ products, onSaleComplete }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState([]);
  const [salesHistory, setSalesHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState(null);

  // Función para cargar ventas desde localStorage
  const loadSales = () => {
    const savedSales = localStorage.getItem('colmado_sales');
    if (savedSales) {
      try {
        setSalesHistory(JSON.parse(savedSales));
      } catch (error) {
        console.error('Error loading sales:', error);
        setSalesHistory([]);
      }
    }
  };

  // Cargar historial de ventas del localStorage al montar y cuando cambie products
  useEffect(() => {
    loadSales();
  }, [products]);

  // Guardar ventas en localStorage cuando cambien
  useEffect(() => {
    if (salesHistory.length > 0) {
      localStorage.setItem('colmado_sales', JSON.stringify(salesHistory));
    }
  }, [salesHistory]);

  // Filtrar productos disponibles
  const availableProducts = products.filter(
    (product) =>
      product.estado === 'Activo' &&
      product.stock > 0 &&
      (product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.codigo.includes(searchTerm) ||
        product.categoria?.toLowerCase().includes(searchTerm.toLowerCase()))
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

  const calculateCartTotal = () => {
    return cart.reduce((total, item) => total + (item.unitPrice * item.quantity), 0);
  };

  const handleAddToCart = () => {
    if (!selectedProduct || quantity <= 0) {
      alert('Por favor, selecciona un producto y una cantidad válida');
      return;
    }

    if (quantity > selectedProduct.stock) {
      alert('No hay suficiente stock disponible');
      return;
    }

    // Check if product already in cart
    const existingItemIndex = cart.findIndex(item => item.productId === selectedProduct.id);
    
    if (existingItemIndex >= 0) {
      // Update quantity if product already in cart
      const newCart = [...cart];
      const newQuantity = newCart[existingItemIndex].quantity + quantity;
      
      if (newQuantity > selectedProduct.stock) {
        alert('No hay suficiente stock para esta cantidad');
        return;
      }
      
      newCart[existingItemIndex].quantity = newQuantity;
      setCart(newCart);
    } else {
      // Add new item to cart
      const cartItem = {
        productId: selectedProduct.id,
        productName: selectedProduct.nombre,
        productCode: selectedProduct.codigo,
        productCost: selectedProduct.costo,
        quantity: quantity,
        unitPrice: selectedProduct.precioVenta,
        stock: selectedProduct.stock,
      };
      setCart([...cart, cartItem]);
    }

    // Reset selection
    setSelectedProduct(null);
    setQuantity(1);
    setSearchTerm('');
  };

  const handleRemoveFromCart = (productId) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const handleUpdateCartQuantity = (productId, newQuantity) => {
    const product = products.find(p => p.id === productId);
    
    if (newQuantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }

    if (newQuantity > product.stock) {
      alert('No hay suficiente stock disponible');
      return;
    }

    setCart(cart.map(item => 
      item.productId === productId 
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const handleCompleteSale = () => {
    if (cart.length === 0) {
      alert('Agrega al menos un producto al carrito');
      return;
    }

    const saleId = Date.now().toString();
    const saleDate = new Date().toISOString();
    const saleTimestamp = Date.now();

    // Create individual sale records for each item
    const newSales = cart.map((item, index) => ({
      id: `${saleId}_${index}`,
      productId: item.productId,
      productName: item.productName,
      productCode: item.productCode,
      productCost: item.productCost,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.unitPrice * item.quantity,
      date: saleDate,
      timestamp: saleTimestamp,
      saleGroupId: saleId, // Group related sales together
    }));

    // Add to history and save
    const updatedSalesHistory = [...newSales, ...salesHistory];
    setSalesHistory(updatedSalesHistory);
    localStorage.setItem('colmado_sales', JSON.stringify(updatedSalesHistory));

    // Log audit trail for each sale
    cart.forEach(item => {
      logSale(
        item.productId,
        item.productName,
        item.productCode,
        item.quantity,
        'Dueño'
      );

      // Reduce stock
      if (onSaleComplete) {
        onSaleComplete(item.productId, item.quantity);
      }
    });

    // Calculate total for message
    const totalAmount = calculateCartTotal();

    // Clear cart
    setCart([]);
    setSelectedProduct(null);
    setQuantity(1);
    setSearchTerm('');

    alert(`Venta completada: ${cart.length} producto(s) por RD$ ${totalAmount.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`);
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

  // Group sales by saleGroupId for display
  const groupedSales = salesHistory.reduce((groups, sale) => {
    const groupId = sale.saleGroupId || sale.id;
    if (!groups[groupId]) {
      groups[groupId] = {
        id: groupId,
        date: sale.date,
        timestamp: sale.timestamp,
        items: [],
        total: 0,
        voided: sale.voided || false,
      };
    }
    groups[groupId].items.push(sale);
    groups[groupId].total += sale.total;
    groups[groupId].voided = groups[groupId].voided || sale.voided;
    return groups;
  }, {});

  const groupedSalesArray = Object.values(groupedSales).sort((a, b) => b.timestamp - a.timestamp);

  const handleViewReceipt = (saleGroup) => {
    setCurrentReceipt(saleGroup);
    setShowReceipt(true);
  };

  const handleVoidSale = (saleGroup) => {
    // Check if sale is recent (within 24 hours)
    const saleDate = new Date(saleGroup.date);
    const now = new Date();
    const hoursDiff = (now - saleDate) / (1000 * 60 * 60);
    
    if (hoursDiff > 24) {
      alert('Solo se pueden anular ventas de las últimas 24 horas');
      return;
    }

    if (saleGroup.voided) {
      alert('Esta venta ya fue anulada');
      return;
    }

    if (!window.confirm(`¿Estás seguro de anular esta venta?\nTransacción: #${saleGroup.id}\nTotal: RD$ ${saleGroup.total.toFixed(2)}\n\nEsta acción revertirá el stock.`)) {
      return;
    }

    // Import logSaleVoid dynamically
    import('../utils/auditLog').then(({ logSaleVoid }) => {
      // Restore stock for each item
      saleGroup.items.forEach(item => {
        if (onSaleComplete) {
          // Reverse the sale - add stock back (negative quantity becomes positive)
          onSaleComplete(item.productId, -item.quantity);
        }

        // Log void in audit trail
        logSaleVoid(
          item.productId,
          item.productName,
          item.productCode,
          item.quantity,
          saleGroup.id,
          'Dueño'
        );
      });

      // Mark sales as voided in history
      const updatedHistory = salesHistory.map(sale => {
        if (sale.saleGroupId === saleGroup.id) {
          return { ...sale, voided: true };
        }
        return sale;
      });

      setSalesHistory(updatedHistory);
      localStorage.setItem('colmado_sales', JSON.stringify(updatedHistory));

      alert(`Venta anulada exitosamente\nStock restaurado para ${saleGroup.items.length} producto(s)`);
    });
  };

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
            <h3 className="panel-title">Carrito de Venta</h3>

            {/* Cart Items */}
            {cart.length > 0 && (
              <div className="cart-items">
                {cart.map((item) => (
                  <div key={item.productId} className="cart-item">
                    <div className="cart-item-info">
                      <div className="cart-item-name">{item.productName}</div>
                      <div className="cart-item-price">
                        RD$ {item.unitPrice.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="cart-item-controls">
                      <div className="cart-quantity-controls">
                        <button
                          type="button"
                          className="quantity-btn-small"
                          onClick={() => handleUpdateCartQuantity(item.productId, item.quantity - 1)}
                        >
                          -
                        </button>
                        <span className="cart-quantity">{item.quantity}</span>
                        <button
                          type="button"
                          className="quantity-btn-small"
                          onClick={() => handleUpdateCartQuantity(item.productId, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <div className="cart-item-total">
                        RD$ {(item.unitPrice * item.quantity).toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                      </div>
                      <button
                        type="button"
                        className="btn-remove-item"
                        onClick={() => handleRemoveFromCart(item.productId)}
                        title="Eliminar"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Product Section */}
            {selectedProduct ? (
              <div className="add-product-section">
                <div className="section-divider">Agregar Producto</div>
                <div className="selected-product-info-compact">
                  <div className="selected-product-name-compact">{selectedProduct.nombre}</div>
                  <div className="selected-product-price-compact">
                    RD$ {selectedProduct.precioVenta?.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
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

                <button
                  className="btn-add-to-cart"
                  onClick={handleAddToCart}
                  disabled={quantity <= 0 || quantity > selectedProduct.stock}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                  Agregar al Carrito
                </button>
              </div>
            ) : (
              cart.length === 0 && (
                <div className="no-product-selected">
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                  <p>Selecciona productos para agregar al carrito</p>
                </div>
              )
            )}

            {/* Cart Summary and Complete Sale */}
            {cart.length > 0 && (
              <>
                <div className="cart-summary">
                  <div className="summary-row">
                    <span>Productos:</span>
                    <span>{cart.length}</span>
                  </div>
                  <div className="summary-row">
                    <span>Unidades totales:</span>
                    <span>{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
                  </div>
                  <div className="summary-row total-row">
                    <span>Total a Pagar:</span>
                    <span>RD$ {calculateCartTotal().toLocaleString('es-DO', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <button
                  className="btn-complete-sale"
                  onClick={handleCompleteSale}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Completar Venta
                </button>
              </>
            )}
          </div>

          {/* Sales History */}
          <div className="panel-card sales-history">
            <h3 className="panel-title">Historial de Ventas Recientes</h3>
            <div className="history-list">
              {groupedSalesArray.length === 0 ? (
                <div className="empty-state">
                  <p>No hay ventas registradas</p>
                </div>
              ) : (
                groupedSalesArray.slice(0, 10).map((group) => (
                  <div key={group.id} className={`history-item-group ${group.voided ? 'voided' : ''}`}>
                    <div className="history-item">
                      <div className="history-item-info">
                        <div className="history-item-name">
                          {group.voided && <span className="voided-badge">ANULADA</span>}
                          {group.items.length === 1 
                            ? group.items[0].productName
                            : `Venta de ${group.items.length} producto(s)`}
                        </div>
                        <div className="history-item-details">
                          {group.items.length === 1 ? (
                            `${group.items[0].quantity} x RD$ ${group.items[0].unitPrice.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`
                          ) : (
                            `${group.items.reduce((sum, item) => sum + item.quantity, 0)} unidades totales`
                          )}
                        </div>
                        <div className="history-item-date">
                          {new Date(group.date).toLocaleString('es-DO', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                      <div className="history-item-total">
                        RD$ {group.total.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="history-item-actions">
                        <button 
                          className="btn-view-receipt"
                          onClick={() => handleViewReceipt(group)}
                          title="Ver recibo"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                          </svg>
                        </button>
                        {!group.voided && (() => {
                          const hoursSinceSale = (new Date() - new Date(group.date)) / (1000 * 60 * 60);
                          return hoursSinceSale <= 24 && (
                            <button 
                              className="btn-void-sale"
                              onClick={() => handleVoidSale(group)}
                              title="Anular venta"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              </svg>
                            </button>
                          );
                        })()}
                      </div>
                    </div>
                    {group.items.length > 1 && (
                      <div className="history-item-details-list">
                        {group.items.map((item, idx) => (
                          <div key={idx} className="history-item-detail">
                            <span className="history-detail-product">{item.productName}</span>
                            <span className="history-detail-quantity">{item.quantity} x RD$ {item.unitPrice.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</span>
                            <span className="history-detail-total">RD$ {item.total.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceipt && currentReceipt && (
        <SaleReceipt
          sale={currentReceipt}
          onClose={() => setShowReceipt(false)}
          onPrint={() => setShowReceipt(false)}
        />
      )}
    </div>
  );
};

export default Sales;

