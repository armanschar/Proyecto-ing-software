import { useState, useEffect } from 'react';
import './PurchaseDetails.css';

function PurchaseDetails({ purchaseId, onClose }) {
  const [purchase, setPurchase] = useState(null);
  const [supplier, setSupplier] = useState(null);

  const loadPurchaseDetails = () => {
    const movements = JSON.parse(localStorage.getItem('colmado_movements') || '[]');
    const purchaseMovement = movements.find(m => m.id === purchaseId);

    if (purchaseMovement) {
      setPurchase(purchaseMovement);
      
      if (purchaseMovement.supplier) {
        const suppliers = JSON.parse(localStorage.getItem('colmado_suppliers') || '[]');
        const supplierData = suppliers.find(s => s.id === purchaseMovement.supplier.id);
        setSupplier(supplierData);
      }
    }
  };

  useEffect(() => {
    if (purchaseId) {
      loadPurchaseDetails();
    }
  }, [purchaseId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-DO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (!purchase) {
    return null;
  }

  return (
    <div className="purchase-details-overlay" onClick={onClose}>
      <div className="purchase-details-container" onClick={(e) => e.stopPropagation()}>
        <div className="purchase-details-header">
          <h2>📋 Detalles de Compra</h2>
          <button className="btn-close-details" onClick={onClose}>✖</button>
        </div>

        <div className="purchase-details-content">
          {/* Purchase Header Info */}
          <div className="purchase-header-info">
            <div className="info-section">
              <div className="info-row">
                <span className="info-label">📅 Fecha:</span>
                <span className="info-value">{formatDate(purchase.date)}</span>
              </div>
              <div className="info-row">
                <span className="info-label">📄 Documento:</span>
                <span className="info-value">{purchase.document}</span>
              </div>
              <div className="info-row">
                <span className="info-label">👤 Registrado por:</span>
                <span className="info-value">{purchase.user}</span>
              </div>
            </div>

            {supplier && (
              <div className="info-section supplier-section">
                <h4>📦 Proveedor</h4>
                <div className="info-row">
                  <span className="info-label">Nombre:</span>
                  <span className="info-value">{supplier.nombre}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Contacto:</span>
                  <span className="info-value">{supplier.contacto}</span>
                </div>
                {supplier.telefono && (
                  <div className="info-row">
                    <span className="info-label">Teléfono:</span>
                    <span className="info-value">{supplier.telefono}</span>
                  </div>
                )}
                {supplier.rnc && (
                  <div className="info-row">
                    <span className="info-label">RNC:</span>
                    <span className="info-value">{supplier.rnc}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="purchase-product-section">
            <h4>Producto Adquirido</h4>
            <div className="product-details-card">
              <div className="product-main-info">
                <h5>{purchase.productName}</h5>
                <p className="product-code">Código: {purchase.productCode}</p>
              </div>
              <div className="product-quantity-info">
                <div className="quantity-row">
                  <span className="quantity-label">Cantidad:</span>
                  <span className="quantity-value">+{purchase.quantityChange} unidades</span>
                </div>
                {purchase.unitCost && (
                  <>
                    <div className="quantity-row">
                      <span className="quantity-label">Costo Unitario:</span>
                      <span className="quantity-value">${purchase.unitCost.toFixed(2)}</span>
                    </div>
                    <div className="quantity-row total-row">
                      <span className="quantity-label">Subtotal:</span>
                      <span className="quantity-value">${(purchase.subtotal || (purchase.unitCost * purchase.quantityChange)).toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Reason */}
          {purchase.reason && (
            <div className="purchase-reason-section">
              <h4>📝 Motivo</h4>
              <p className="reason-text">{purchase.reason}</p>
            </div>
          )}

          {/* Notes Section */}
          <div className="purchase-notes">
            <p>✓ Esta compra actualizó el inventario automáticamente</p>
            <p>✓ Registro creado para auditoría y trazabilidad</p>
          </div>
        </div>

        <div className="purchase-details-actions">
          <button className="btn-print" onClick={handlePrint}>
            🖨️ Imprimir
          </button>
          <button className="btn-close-action" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default PurchaseDetails;
