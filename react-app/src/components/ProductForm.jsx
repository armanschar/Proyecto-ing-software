import { useState, useEffect } from 'react';
import './ProductForm.css';

const ProductForm = ({ product, onSave, onCancel }) => {
  const isEditing = !!product;

  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    fabricante: '',
    costo: '',
    precioVenta: '',
    modelo: '',
    presentacion: '',
    estado: 'Activo',
    utilidad: '',
    stock: '0',
    stockMinimo: '10',
    imagen: '',
    fechaVencimiento: '',
  });

  useEffect(() => {
    if (product) {
      setFormData({
        codigo: product.codigo || '',
        nombre: product.nombre || '',
        descripcion: product.descripcion || '',
        fabricante: product.fabricante || '',
        costo: product.costo || '',
        precioVenta: product.precioVenta || '',
        modelo: product.modelo || '',
        presentacion: product.presentacion || '',
        estado: product.estado || 'Activo',
        utilidad: product.utilidad || '',
        stock: product.stock || '0',
        stockMinimo: product.stockMinimo || '10',
        imagen: product.imagen || '',
        fechaVencimiento: product.fechaVencimiento || '',
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Calcular utilidad automáticamente si cambia costo o precio
    if (name === 'costo' || name === 'precioVenta') {
      const costo = name === 'costo' ? parseFloat(value) || 0 : parseFloat(formData.costo) || 0;
      const precioVenta = name === 'precioVenta' ? parseFloat(value) || 0 : parseFloat(formData.precioVenta) || 0;
      if (costo > 0) {
        const utilidad = ((precioVenta - costo) / costo) * 100;
        setFormData((prev) => ({
          ...prev,
          utilidad: utilidad.toFixed(2),
        }));
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          imagen: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validación básica
    if (!formData.codigo || !formData.nombre) {
      alert('Por favor, completa al menos el código y el nombre del producto');
      return;
    }

    const productData = {
      ...formData,
      costo: parseFloat(formData.costo) || 0,
      precioVenta: parseFloat(formData.precioVenta) || 0,
      stock: parseInt(formData.stock) || 0,
      stockMinimo: parseInt(formData.stockMinimo) || 10,
      utilidad: parseFloat(formData.utilidad) || 0,
    };

    if (isEditing) {
      productData.id = product.id;
      productData.fechaCreacion = product.fechaCreacion;
    }

    onSave(productData);
  };

  return (
    <div className="product-form-container">
      <div className="form-header">
        <h2 className="view-title">{isEditing ? 'Editar Producto' : 'Agregar Producto'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-layout">
          {/* Left Column - Image */}
          <div className="form-left">
            <div className="image-section">
              <div className="image-preview">
                {formData.imagen ? (
                  <img src={formData.imagen} alt="Preview" />
                ) : (
                  <div className="image-placeholder">
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                    <p>Imagen del producto</p>
                  </div>
                )}
              </div>
              <div className="image-upload">
                <label htmlFor="image-upload" className="file-upload-label">
                  Seleccionar archivo
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="file-upload-input"
                />
                <span className="file-name">
                  {formData.imagen ? 'Archivo seleccionado' : 'Ningún archivo seleccionado'}
                </span>
              </div>
            </div>

            {/* Barcode placeholder */}
            <div className="barcode-section">
              <div className="barcode-placeholder">
                <div className="barcode-lines">
                  {[...Array(30)].map((_, i) => (
                    <div
                      key={i}
                      className="barcode-line"
                      style={{
                        height: `${Math.random() * 40 + 20}px`,
                        width: `${Math.random() * 3 + 1}px`,
                      }}
                    />
                  ))}
                </div>
                <div className="barcode-number">{formData.codigo || '000000000'}</div>
              </div>
            </div>
          </div>

          {/* Right Column - Form Fields */}
          <div className="form-right">
            <div className="form-section">
              <h3 className="form-section-title">Detalles del producto</h3>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="codigo">Código *</label>
                  <input
                    type="text"
                    id="codigo"
                    name="codigo"
                    value={formData.codigo}
                    onChange={handleChange}
                    required
                    placeholder="312312312"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="nombre">Nombre *</label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    placeholder="MONITOR"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="descripcion">Descripción</label>
                  <textarea
                    id="descripcion"
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Descripción del producto"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="fabricante">Fabricante</label>
                  <input
                    type="text"
                    id="fabricante"
                    name="fabricante"
                    value={formData.fabricante}
                    onChange={handleChange}
                    placeholder="AITEG"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="costo">Costo</label>
                  <input
                    type="number"
                    id="costo"
                    name="costo"
                    value={formData.costo}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="precioVenta">Precio de venta</label>
                  <input
                    type="number"
                    id="precioVenta"
                    name="precioVenta"
                    value={formData.precioVenta}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="modelo">Modelo</label>
                  <input
                    type="text"
                    id="modelo"
                    name="modelo"
                    value={formData.modelo}
                    onChange={handleChange}
                    placeholder="23321-SM"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="presentacion">Presentación</label>
                  <input
                    type="text"
                    id="presentacion"
                    name="presentacion"
                    value={formData.presentacion}
                    onChange={handleChange}
                    placeholder="CAJA"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="estado">Estado</label>
                  <select
                    id="estado"
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="utilidad">Utilidad</label>
                  <input
                    type="number"
                    id="utilidad"
                    name="utilidad"
                    value={formData.utilidad}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="stock">Stock</label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    min="0"
                    placeholder="0"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="stockMinimo">Nivel Mínimo de Stock</label>
                  <input
                    type="number"
                    id="stockMinimo"
                    name="stockMinimo"
                    value={formData.stockMinimo}
                    onChange={handleChange}
                    min="10"
                    placeholder="10"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="fechaVencimiento">Fecha de Vencimiento</label>
                  <input
                    type="date"
                    id="fechaVencimiento"
                    name="fechaVencimiento"
                    value={formData.fechaVencimiento}
                    onChange={handleChange}
                  />
                  <small className="help-text">Opcional - para productos perecederos</small>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={onCancel}>
                  Cancelar
                </button>
                <button type="submit" className="btn-save">
                  Guardar datos
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;

