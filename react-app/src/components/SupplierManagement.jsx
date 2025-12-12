import { useState, useEffect } from 'react';
import './SupplierManagement.css';

function SupplierManagement() {
  const [suppliers, setSuppliers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    contacto: '',
    telefono: '',
    email: '',
    direccion: '',
    rnc: '',
    notas: ''
  });

  const loadSuppliers = () => {
    const saved = localStorage.getItem('colmado_suppliers');
    if (saved) {
      setSuppliers(JSON.parse(saved));
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const saveSuppliers = (updatedSuppliers) => {
    localStorage.setItem('colmado_suppliers', JSON.stringify(updatedSuppliers));
    setSuppliers(updatedSuppliers);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.nombre.trim() || !formData.contacto.trim()) {
      alert('El nombre y el contacto son obligatorios');
      return;
    }

    if (editingSupplier) {
      // Update existing supplier
      const updated = suppliers.map(sup =>
        sup.id === editingSupplier.id
          ? { ...sup, ...formData, fechaModificacion: new Date().toISOString() }
          : sup
      );
      saveSuppliers(updated);
      alert('Proveedor actualizado exitosamente');
    } else {
      // Create new supplier
      const newSupplier = {
        id: Date.now(),
        ...formData,
        fechaCreacion: new Date().toISOString(),
        activo: true
      };
      saveSuppliers([...suppliers, newSupplier]);
      alert('Proveedor creado exitosamente');
    }

    resetForm();
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      nombre: supplier.nombre,
      contacto: supplier.contacto,
      telefono: supplier.telefono || '',
      email: supplier.email || '',
      direccion: supplier.direccion || '',
      rnc: supplier.rnc || '',
      notas: supplier.notas || ''
    });
    setShowForm(true);
  };

  const handleToggleStatus = (supplier) => {
    const updated = suppliers.map(sup =>
      sup.id === supplier.id
        ? { ...sup, activo: !sup.activo }
        : sup
    );
    saveSuppliers(updated);
  };

  const handleDelete = (supplier) => {
    if (window.confirm(`¿Está seguro de eliminar el proveedor "${supplier.nombre}"?`)) {
      const updated = suppliers.filter(sup => sup.id !== supplier.id);
      saveSuppliers(updated);
      alert('Proveedor eliminado exitosamente');
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      contacto: '',
      telefono: '',
      email: '',
      direccion: '',
      rnc: '',
      notas: ''
    });
    setEditingSupplier(null);
    setShowForm(false);
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contacto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (supplier.rnc && supplier.rnc.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const activeSuppliers = filteredSuppliers.filter(s => s.activo);
  const inactiveSuppliers = filteredSuppliers.filter(s => !s.activo);

  return (
    <div className="supplier-management">
      <div className="supplier-header">
        <h2>📦 Gestión de Proveedores</h2>
        <button
          className="btn-new-supplier"
          onClick={() => setShowForm(true)}
        >
          ➕ Nuevo Proveedor
        </button>
      </div>

      {showForm && (
        <div className="supplier-form-overlay">
          <div className="supplier-form-container">
            <div className="form-header">
              <h3>{editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h3>
              <button className="btn-close" onClick={resetForm}>✖</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Nombre del Proveedor *</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    placeholder="Ej: Distribuidora La Económica"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Persona de Contacto *</label>
                  <input
                    type="text"
                    name="contacto"
                    value={formData.contacto}
                    onChange={handleInputChange}
                    placeholder="Ej: Juan Pérez"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    placeholder="Ej: 809-555-1234"
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Ej: contacto@proveedor.com"
                  />
                </div>
                <div className="form-group full-width">
                  <label>Dirección</label>
                  <input
                    type="text"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleInputChange}
                    placeholder="Ej: Av. 27 de Febrero #123, Santo Domingo"
                  />
                </div>
                <div className="form-group">
                  <label>RNC / Cédula</label>
                  <input
                    type="text"
                    name="rnc"
                    value={formData.rnc}
                    onChange={handleInputChange}
                    placeholder="Ej: 123-45678-9"
                  />
                </div>
                <div className="form-group full-width">
                  <label>Notas</label>
                  <textarea
                    name="notas"
                    value={formData.notas}
                    onChange={handleInputChange}
                    placeholder="Información adicional sobre el proveedor..."
                    rows="3"
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={resetForm}>
                  Cancelar
                </button>
                <button type="submit" className="btn-save">
                  {editingSupplier ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="search-section">
        <input
          type="text"
          className="search-input"
          placeholder="Buscar por nombre, contacto o RNC..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="supplier-stats">
          <span className="stat-badge active">✓ Activos: {activeSuppliers.length}</span>
          <span className="stat-badge inactive">✗ Inactivos: {inactiveSuppliers.length}</span>
        </div>
      </div>

      {activeSuppliers.length > 0 && (
        <div className="suppliers-section">
          <h3>Proveedores Activos</h3>
          <div className="suppliers-grid">
            {activeSuppliers.map(supplier => (
              <div key={supplier.id} className="supplier-card">
                <div className="supplier-card-header">
                  <h4>{supplier.nombre}</h4>
                  <span className="status-badge active">Activo</span>
                </div>
                <div className="supplier-info">
                  <div className="info-row">
                    <span className="info-label">👤 Contacto:</span>
                    <span>{supplier.contacto}</span>
                  </div>
                  {supplier.telefono && (
                    <div className="info-row">
                      <span className="info-label">📞 Teléfono:</span>
                      <span>{supplier.telefono}</span>
                    </div>
                  )}
                  {supplier.email && (
                    <div className="info-row">
                      <span className="info-label">✉️ Email:</span>
                      <span>{supplier.email}</span>
                    </div>
                  )}
                  {supplier.rnc && (
                    <div className="info-row">
                      <span className="info-label">📄 RNC:</span>
                      <span>{supplier.rnc}</span>
                    </div>
                  )}
                  {supplier.direccion && (
                    <div className="info-row">
                      <span className="info-label">📍 Dirección:</span>
                      <span>{supplier.direccion}</span>
                    </div>
                  )}
                  {supplier.notas && (
                    <div className="info-row full">
                      <span className="info-label">📝 Notas:</span>
                      <span className="notas">{supplier.notas}</span>
                    </div>
                  )}
                </div>
                <div className="supplier-actions">
                  <button
                    className="btn-edit"
                    onClick={() => handleEdit(supplier)}
                    title="Editar proveedor"
                  >
                    ✏️
                  </button>
                  <button
                    className="btn-deactivate"
                    onClick={() => handleToggleStatus(supplier)}
                    title="Desactivar proveedor"
                  >
                    🚫
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(supplier)}
                    title="Eliminar proveedor"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {inactiveSuppliers.length > 0 && (
        <div className="suppliers-section">
          <h3>Proveedores Inactivos</h3>
          <div className="suppliers-grid">
            {inactiveSuppliers.map(supplier => (
              <div key={supplier.id} className="supplier-card inactive">
                <div className="supplier-card-header">
                  <h4>{supplier.nombre}</h4>
                  <span className="status-badge inactive">Inactivo</span>
                </div>
                <div className="supplier-info">
                  <div className="info-row">
                    <span className="info-label">👤 Contacto:</span>
                    <span>{supplier.contacto}</span>
                  </div>
                  {supplier.telefono && (
                    <div className="info-row">
                      <span className="info-label">📞 Teléfono:</span>
                      <span>{supplier.telefono}</span>
                    </div>
                  )}
                </div>
                <div className="supplier-actions">
                  <button
                    className="btn-edit"
                    onClick={() => handleEdit(supplier)}
                    title="Editar proveedor"
                  >
                    ✏️
                  </button>
                  <button
                    className="btn-activate"
                    onClick={() => handleToggleStatus(supplier)}
                    title="Reactivar proveedor"
                  >
                    ✓
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(supplier)}
                    title="Eliminar proveedor"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {filteredSuppliers.length === 0 && (
        <div className="no-suppliers">
          {searchTerm ? (
            <>
              <p>🔍 No se encontraron proveedores que coincidan con "{searchTerm}"</p>
            </>
          ) : (
            <>
              <p>📦 No hay proveedores registrados</p>
              <p>Haga clic en "Nuevo Proveedor" para agregar uno</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default SupplierManagement;
