import { useState, useEffect } from 'react';
import './AuditHistory.css';

const AuditHistory = () => {
  const [movements, setMovements] = useState([]);
  const [filteredMovements, setFilteredMovements] = useState([]);
  const [filterType, setFilterType] = useState('');
  const [filterProduct, setFilterProduct] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  const loadMovements = () => {
    const savedMovements = localStorage.getItem('colmado_movements');
    if (savedMovements) {
      try {
        const parsed = JSON.parse(savedMovements);
        setMovements(parsed);
        setFilteredMovements(parsed);
      } catch (error) {
        console.error('Error loading movements:', error);
        setMovements([]);
        setFilteredMovements([]);
      }
    }
  };

  // Cargar datos del localStorage
  useEffect(() => {
    loadMovements();
  }, []);

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...movements];

    // Filtrar por tipo
    if (filterType) {
      filtered = filtered.filter(m => m.type === filterType);
    }

    // Filtrar por producto
    if (filterProduct) {
      filtered = filtered.filter(m => 
        m.productName?.toLowerCase().includes(filterProduct.toLowerCase()) ||
        m.productCode?.includes(filterProduct)
      );
    }

    // Filtrar por usuario
    if (filterUser) {
      filtered = filtered.filter(m => 
        m.user?.toLowerCase().includes(filterUser.toLowerCase())
      );
    }

    // Filtrar por fecha desde
    if (filterDateFrom) {
      const fromDate = new Date(filterDateFrom);
      filtered = filtered.filter(m => new Date(m.date) >= fromDate);
    }

    // Filtrar por fecha hasta
    if (filterDateTo) {
      const toDate = new Date(filterDateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(m => new Date(m.date) <= toDate);
    }

    // Ordenar por fecha descendente
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    setFilteredMovements(filtered);
  }, [movements, filterType, filterProduct, filterUser, filterDateFrom, filterDateTo]);

  const clearFilters = () => {
    setFilterType('');
    setFilterProduct('');
    setFilterUser('');
    setFilterDateFrom('');
    setFilterDateTo('');
  };

  const getMovementIcon = (type) => {
    switch (type) {
      case 'sale':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
        );
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
      case 'create':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        );
      case 'update':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
        );
      case 'deactivate':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        );
      case 'void':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        );
      default:
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
          </svg>
        );
    }
  };

  const getMovementLabel = (type) => {
    const labels = {
      sale: 'Venta',
      entry: 'Entrada',
      exit: 'Salida',
      adjustment: 'Ajuste',
      create: 'Creación',
      update: 'Actualización',
      deactivate: 'Desactivación',
      activate: 'Activación',
      void: 'Anulación',
    };
    return labels[type] || type;
  };

  return (
    <div className="audit-history-container">
      <div className="audit-header">
        <h2 className="view-title">Historial de Movimientos</h2>
        <div className="audit-stats">
          <span className="audit-stat-label">Total de movimientos:</span>
          <span className="audit-stat-value">{filteredMovements.length}</span>
        </div>
      </div>

      {/* Filters Section */}
      <div className="audit-filters-section">
        <h3 className="filters-title">Filtros Avanzados</h3>
        <div className="filters-grid">
          <div className="filter-group">
            <label htmlFor="filter-type">Tipo de Movimiento</label>
            <select
              id="filter-type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="">Todos los tipos</option>
              <option value="sale">Venta</option>
              <option value="entry">Entrada</option>
              <option value="exit">Salida</option>
              <option value="adjustment">Ajuste</option>
              <option value="create">Creación</option>
              <option value="update">Actualización</option>
              <option value="deactivate">Desactivación</option>
              <option value="activate">Activación</option>
              <option value="void">Anulación</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="filter-product">Producto</label>
            <input
              type="text"
              id="filter-product"
              value={filterProduct}
              onChange={(e) => setFilterProduct(e.target.value)}
              placeholder="Buscar por nombre o código..."
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="filter-user">Usuario</label>
            <input
              type="text"
              id="filter-user"
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              placeholder="Buscar por usuario..."
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="filter-date-from">Fecha Desde</label>
            <input
              type="date"
              id="filter-date-from"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="filter-date-to">Fecha Hasta</label>
            <input
              type="date"
              id="filter-date-to"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-actions">
            <button onClick={clearFilters} className="btn-clear-filters">
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Movements List */}
      <div className="movements-container">
        {filteredMovements.length === 0 ? (
          <div className="empty-state">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <p>No se encontraron movimientos</p>
            <p className="empty-state-subtitle">
              {movements.length === 0 
                ? 'Aún no hay movimientos registrados' 
                : 'Intenta ajustar los filtros de búsqueda'}
            </p>
          </div>
        ) : (
          <div className="movements-table-container">
            <table className="movements-table">
              <thead>
                <tr>
                  <th>Fecha y Hora</th>
                  <th>Tipo</th>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Usuario</th>
                  <th>Motivo/Detalle</th>
                  <th>Documento</th>
                </tr>
              </thead>
              <tbody>
                {filteredMovements.map((movement) => (
                  <tr key={movement.id}>
                    <td>
                      {new Date(movement.date).toLocaleString('es-DO', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td>
                      <span className={`movement-type-badge ${movement.type}`}>
                        {getMovementIcon(movement.type)}
                        <span>{getMovementLabel(movement.type)}</span>
                      </span>
                    </td>
                    <td>
                      <div className="movement-product">
                        <div className="movement-product-name">{movement.productName}</div>
                        {movement.productCode && (
                          <div className="movement-product-code">Código: {movement.productCode}</div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`quantity-badge ${movement.quantityChange > 0 ? 'positive' : movement.quantityChange < 0 ? 'negative' : 'neutral'}`}>
                        {movement.type === 'sale' 
                          ? Math.abs(movement.quantityChange || 0)
                          : movement.quantityChange > 0 ? '+' : ''}{movement.type === 'sale' ? '' : (movement.quantityChange || '-')}
                      </span>
                    </td>
                    <td>{movement.user || 'Sistema'}</td>
                    <td className="movement-reason">{movement.reason || '-'}</td>
                    <td>{movement.document || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="audit-footer">
        <div className="audit-notice">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <span>Este historial es de solo lectura y no puede ser modificado</span>
        </div>
      </div>
    </div>
  );
};

export default AuditHistory;
