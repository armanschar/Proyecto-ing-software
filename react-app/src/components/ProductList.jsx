import { useState } from 'react';
import './ProductList.css';

const ProductList = ({ products, onEdit, onToggleStatus }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // Filtrar productos por búsqueda
  const filteredProducts = products.filter((product) => {
    const matchesSearch = 
      product.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.codigo?.includes(searchTerm) ||
      product.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !filterCategory || product.categoria === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (products.length === 0) {
    return (
      <div className="product-list-container">
        <div className="list-header">
          <h2 className="view-title">Productos</h2>
        </div>
        <div className="empty-state">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          <p>No hay productos registrados</p>
          <p className="empty-state-subtitle">Agrega tu primer producto para comenzar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="product-list-container">
      <div className="list-header">
        <h2 className="view-title">Lista de Productos</h2>
        <div className="list-stats">
          Total: {filteredProducts.length} de {products.length} producto{products.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="search-filter-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar por nombre, código o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button
              className="clear-search"
              onClick={() => setSearchTerm('')}
              title="Limpiar búsqueda"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>

        <div className="filter-category">
          <label htmlFor="category-filter">Categoría:</label>
          <select
            id="category-filter"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="category-select"
          >
            <option value="">Todas las categorías</option>
            <option value="Alimentos">Alimentos</option>
            <option value="Bebidas">Bebidas</option>
            <option value="Lacteos">Lácteos</option>
            <option value="Limpieza">Limpieza</option>
            <option value="Higiene">Higiene</option>
            <option value="Snacks">Snacks</option>
            <option value="Enlatados">Enlatados</option>
            <option value="Panaderia">Panadería</option>
            <option value="Carnes">Carnes</option>
            <option value="Otros">Otros</option>
          </select>
        </div>
      </div>

      <div className="products-table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Descripción</th>
              <th>Costo</th>
              <th>Precio Venta</th>
              <th>Stock</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
              {filteredProducts.map((product) => (
              <tr key={product.id} className={product.id === 'placeholder_product' ? 'placeholder-row' : ''}>
                <td>{product.codigo}</td>
                <td>
                  <div className="product-name-cell">
                    {product.imagen && (
                      <img
                        src={product.imagen}
                        alt={product.nombre}
                        className="product-table-image"
                      />
                    )}
                    <span>
                      {product.nombre}
                      {product.id === 'placeholder_product' && (
                        <span className="placeholder-badge">Ejemplo</span>
                      )}
                    </span>
                  </div>
                </td>
                <td>
                  <span className="category-badge">
                    {product.categoria || 'Sin categoría'}
                  </span>
                </td>
                <td className="description-cell">
                  {product.descripcion || '-'}
                </td>
                <td>RD$ {product.costo?.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</td>
                <td>RD$ {product.precioVenta?.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</td>
                <td>
                  <span className={`stock-badge ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                    {product.stock || 0}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${product.estado === 'Activo' ? 'active' : 'inactive'}`}>
                    {product.estado || 'Activo'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-edit"
                      onClick={() => onEdit(product)}
                      title="Editar"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                    <button
                      className={product.estado === 'Activo' ? 'btn-deactivate' : 'btn-activate'}
                      onClick={() => onToggleStatus(product.id)}
                      title={product.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                    >
                      {product.estado === 'Activo' ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="15" y1="9" x2="9" y2="15"></line>
                          <line x1="9" y1="9" x2="15" y2="15"></line>
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductList;

