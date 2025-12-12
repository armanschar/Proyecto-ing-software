import React from 'react';
import './SaleReceipt.css';

const SaleReceipt = ({ sale, onClose, onPrint }) => {
  if (!sale) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-DO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handlePrint = () => {
    window.print();
    if (onPrint) onPrint();
  };

  return (
    <div className="receipt-overlay" onClick={onClose}>
      <div className="receipt-modal" onClick={(e) => e.stopPropagation()}>
        <div className="receipt-content">
          {/* Header */}
          <div className="receipt-header">
            <h1 className="store-name">Colmado</h1>
            <p className="store-subtitle">Sistema de Inventario</p>
            <div className="receipt-divider"></div>
          </div>

          {/* Transaction Info */}
          <div className="receipt-info">
            <div className="info-row">
              <span className="info-label">Fecha:</span>
              <span className="info-value">{formatDate(sale.date)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Transacción:</span>
              <span className="info-value">#{sale.saleGroupId}</span>
            </div>
            <div className="receipt-divider"></div>
          </div>

          {/* Items */}
          <div className="receipt-items">
            <table className="receipt-table">
              <thead>
                <tr>
                  <th className="item-name-col">Producto</th>
                  <th className="item-qty-col">Cant.</th>
                  <th className="item-price-col">Precio</th>
                  <th className="item-total-col">Total</th>
                </tr>
              </thead>
              <tbody>
                {sale.items.map((item, index) => (
                  <tr key={index}>
                    <td className="item-name">{item.productName}</td>
                    <td className="item-qty">{item.quantity}</td>
                    <td className="item-price">RD$ {item.unitPrice.toFixed(2)}</td>
                    <td className="item-total">RD$ {item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total */}
          <div className="receipt-total-section">
            <div className="receipt-divider"></div>
            <div className="receipt-total">
              <span className="total-label">TOTAL:</span>
              <span className="total-value">RD$ {sale.total.toFixed(2)}</span>
            </div>
            <div className="receipt-divider"></div>
          </div>

          {/* Footer */}
          <div className="receipt-footer">
            <p className="footer-text">¡Gracias por su compra!</p>
            <p className="footer-date">{formatDate(sale.date)}</p>
          </div>
        </div>

        {/* Action Buttons - Hidden on print */}
        <div className="receipt-actions no-print">
          <button className="btn-print" onClick={handlePrint}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
            Imprimir
          </button>
          <button className="btn-close" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaleReceipt;
