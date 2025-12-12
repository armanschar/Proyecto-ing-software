// Initialize default data in localStorage

export const initializeDefaultProduct = () => {
  const products = JSON.parse(localStorage.getItem('colmado_products') || '[]');
  
  // Check if placeholder product already exists
  const hasPlaceholder = products.some(p => p.id === 'placeholder_product');
  
  if (!hasPlaceholder) {
    const placeholderProduct = {
      id: 'placeholder_product',
      codigo: '000000000',
      nombre: 'Producto de Ejemplo',
      categoria: 'Otros',
      descripcion: 'Este es un producto de ejemplo para demostrar el sistema',
      fabricante: 'Sistema',
      costo: 10.00,
      precioVenta: 15.00,
      modelo: 'DEMO-001',
      presentacion: 'UNIDAD',
      estado: 'Activo',
      utilidad: 50.00,
      stock: 100,
      stockMinimo: 10,
      imagen: '',
      fechaCreacion: '2025-01-01T00:00:00.000Z',
    };
    
    products.push(placeholderProduct);
    localStorage.setItem('colmado_products', JSON.stringify(products));
  }
};

export const ensurePlaceholderExists = () => {
  const products = JSON.parse(localStorage.getItem('colmado_products') || '[]');
  const hasPlaceholder = products.some(p => p.id === 'placeholder_product');
  
  if (!hasPlaceholder) {
    initializeDefaultProduct();
  }
};
