// Utility to log inventory movements for audit trail

export const logMovement = (movementData) => {
  const {
    type, // 'sale', 'entry', 'exit', 'adjustment', 'create', 'update', 'deactivate', 'activate'
    productId,
    productName,
    productCode,
    quantityChange, // positive for increases, negative for decreases
    user,
    reason,
    document,
    supplier, // { id, nombre, contacto }
    additionalData,
  } = movementData;

  const movement = {
    id: `mov_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    productId,
    productName,
    productCode,
    quantityChange: quantityChange || 0,
    user: user || 'Sistema',
    reason: reason || '',
    document: document || '',
    supplier: supplier || null,
    date: new Date().toISOString(),
    timestamp: Date.now(),
    ...additionalData,
  };

  // Obtener movimientos existentes
  const existingMovements = JSON.parse(localStorage.getItem('colmado_movements') || '[]');
  
  // Agregar nuevo movimiento
  const updatedMovements = [movement, ...existingMovements];
  
  // Guardar en localStorage
  localStorage.setItem('colmado_movements', JSON.stringify(updatedMovements));
  
  return movement;
};

// Log para ventas
export const logSale = (productId, productName, productCode, quantity, user = 'Dueño') => {
  return logMovement({
    type: 'sale',
    productId,
    productName,
    productCode,
    quantityChange: -quantity,
    user,
    reason: `Venta de ${quantity} unidad(es)`,
    document: `VENTA-${Date.now()}`,
  });
};

// Log para creación de productos
export const logProductCreate = (productId, productName, productCode, initialStock, user = 'Dueño') => {
  return logMovement({
    type: 'create',
    productId,
    productName,
    productCode,
    quantityChange: initialStock,
    user,
    reason: `Producto creado con stock inicial de ${initialStock}`,
    document: `PROD-${productId}`,
  });
};

// Log para actualización de productos
export const logProductUpdate = (productId, productName, productCode, user = 'Dueño', changes = '') => {
  return logMovement({
    type: 'update',
    productId,
    productName,
    productCode,
    quantityChange: 0,
    user,
    reason: `Producto actualizado${changes ? ': ' + changes : ''}`,
    document: `UPD-${Date.now()}`,
  });
};

// Log para desactivación/activación
export const logProductStatusChange = (productId, productName, productCode, newStatus, user = 'Dueño') => {
  return logMovement({
    type: newStatus === 'Inactivo' ? 'deactivate' : 'activate',
    productId,
    productName,
    productCode,
    quantityChange: 0,
    user,
    reason: `Producto ${newStatus === 'Inactivo' ? 'desactivado' : 'activado'}`,
    document: `STATUS-${Date.now()}`,
  });
};

// Log para ajustes de inventario
export const logStockAdjustment = (productId, productName, productCode, quantityChange, reason, user = 'Dueño') => {
  return logMovement({
    type: 'adjustment',
    productId,
    productName,
    productCode,
    quantityChange,
    user,
    reason: reason || 'Ajuste de inventario',
    document: `ADJ-${Date.now()}`,
  });
};

// Log para entradas de inventario
export const logStockEntry = (productId, productName, productCode, quantity, reason, document, user = 'Dueño', supplier = null, unitCost = null, subtotal = null) => {
  return logMovement({
    type: 'entry',
    productId,
    productName,
    productCode,
    quantityChange: quantity,
    user,
    reason: reason || 'Entrada de inventario',
    document: document || `ENT-${Date.now()}`,
    supplier,
    unitCost,
    subtotal,
  });
};

// Log para salidas de inventario (no ventas)
export const logStockExit = (productId, productName, productCode, quantity, reason, document, user = 'Dueño') => {
  return logMovement({
    type: 'exit',
    productId,
    productName,
    productCode,
    quantityChange: -quantity,
    user,
    reason: reason || 'Salida de inventario',
    document: document || `SAL-${Date.now()}`,
  });
};

// Log para anulación de ventas
export const logSaleVoid = (productId, productName, productCode, quantity, originalSaleId, user = 'Dueño') => {
  return logMovement({
    type: 'void',
    productId,
    productName,
    productCode,
    quantityChange: quantity, // Positive - restores stock
    user,
    reason: `Venta anulada (Transacción: ${originalSaleId})`,
    document: `VOID-${Date.now()}`,
    additionalData: {
      originalSaleId,
      voidDate: new Date().toISOString(),
    },
  });
};
