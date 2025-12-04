import './ProductList.css';

const ProductList = ({ products, onEdit, onDelete }) => {
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
          Total: {products.length} producto{products.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="products-table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Costo</th>
              <th>Precio Venta</th>
              <th>Stock</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
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
                    <span>{product.nombre}</span>
                  </div>
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
                      className="btn-delete"
                      onClick={() => onDelete(product.id)}
                      title="Eliminar"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
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

