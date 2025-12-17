import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Upload, Image as ImageIcon, Loader } from 'lucide-react';
import "./PropertyForm.css";
import { usePageTitle } from '../../hooks/usePageTitle';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const PropertyForm = ({ onSubmit }) => {
  usePageTitle("Cadastro");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    type: 'Apartamento',
    post: '',
    amenities: '',
    contactName: '',
    contactPhone: '',
    contactEmail: ''
  });

  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);

    if (uploadedImages.length + files.length > 5) {
      alert("Máximo de 5 imagens");
      e.target.value = "";
      return;
    }

    const validFiles = [];
    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 5 * 1024 * 1024) continue;
      validFiles.push(file);
    }

    if (!validFiles.length) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const form = new FormData();
      validFiles.forEach(f => form.append("images", f));

      const res = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        body: form
      });

      if (!res.ok) throw new Error("Erro ao enviar imagens");

      const data = await res.json();
      setUploadedImages(prev => [...prev, ...data.images]);
      setUploadProgress(100);

    } catch (err) {
      alert("Erro no upload");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      e.target.value = "";
    }
  };

  const removeImage = async (index, url) => {
    const filename = url.split("/").pop();
    try {
      await fetch(`${API_URL}/api/upload/${filename}`, { method: "DELETE" });
      setUploadedImages(prev => prev.filter((_, i) => i !== index));
    } catch (err) {
      alert("Erro ao remover imagem");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!uploadedImages.length) {
      alert("Adicione pelo menos uma imagem");
      return;
    }

    const newProperty = {
      ...formData,
      price: parseFloat(formData.price),
      bedrooms: parseInt(formData.bedrooms),
      bathrooms: parseInt(formData.bathrooms),
      area: parseFloat(formData.area),
      type: formData.type,
      post: formData.post,
      images: uploadedImages,
      amenities: formData.amenities.split(',').map(a => a.trim()).filter(Boolean),
      contact: {
        name: formData.contactName,
        phone: formData.contactPhone,
        email: formData.contactEmail
      }
    };

    try {
      const res = await fetch(`${API_URL}/api/properties`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProperty)
      });

      if (!res.ok) throw new Error("Erro ao salvar");

      const data = await res.json();

      if (onSubmit) onSubmit(data.property);
      alert("Imóvel publicado!");
      navigate("/");

    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="propertyForm-container">
      <h1 className="propertyForm-title">Publicar Novo Imóvel</h1>

      <form onSubmit={handleSubmit} className="propertyForm-form">

        {/* ============================= IMAGENS ============================= */}
        <div className="propertyForm-section">
          <h2 className="propertyForm-sectionTitle">Imagens *</h2>
          <p className="propertyForm-helperText">
            Envie até 5 imagens (máx. 5MB cada).
          </p>

          {uploadedImages.length > 0 && (
            <div className="propertyForm-previewGrid">
              {uploadedImages.map((url, i) => (
                <div key={i} className="propertyForm-previewItem">
                  <img src={url} className="propertyForm-previewImage" alt="" />
                  <button
                    type="button"
                    className="propertyForm-removeButton"
                    onClick={() => removeImage(i, url)}
                  >
                    <X size={16} />
                  </button>
                  <div className="propertyForm-imageBadge">
                    {i === 0 ? "Principal" : i + 1}
                  </div>
                </div>
              ))}
            </div>
          )}

          {uploadedImages.length === 0 && !uploading && (
            <div className="propertyForm-emptyState">
              <ImageIcon size={48} color="#9ca3af" />
              <p className="propertyForm-emptyText">Nenhuma imagem enviada</p>
              <p className="propertyForm-emptySubtext">
                A primeira imagem será a principal
              </p>
            </div>
          )}

          <div className="propertyForm-uploadArea">
            <label
              htmlFor="imageUpload"
              className={
                uploading || uploadedImages.length >= 5
                  ? "propertyForm-uploadLabel propertyForm-uploadLabelDisabled"
                  : "propertyForm-uploadLabel"
              }
            >
              {uploading ? (
                <>
                  <Loader className="spin" size={22} />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload size={22} />
                  Selecionar Imagens
                </>
              )}
            </label>

            <input
              id="imageUpload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              disabled={uploading || uploadedImages.length >= 5}
              style={{ display: "none" }}
            />
          </div>

          {uploading && (
            <div className="propertyForm-progressBar">
              <div
                className="propertyForm-progressFill"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>

        {/* =========================== INFORMAÇÕES ========================== */}
        <div className="propertyForm-section">
          <h2 className="propertyForm-sectionTitle">Informações</h2>

          <div className="propertyForm-formGroup">
            <label className="propertyForm-label">Título *</label>
            <input
              className="propertyForm-input"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder='Ex: Apartamento Moderno no Centro'
              required
            />
          </div>

          <div className="propertyForm-formGroup">
            <label className="propertyForm-label">Descrição *</label>
            <textarea
              className="propertyForm-textarea"
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder='Descreva as características do imóvel...'
            />
          </div>

          <div className="propertyForm-row">
            <div className="propertyForm-formGroup">
              <label className="propertyForm-label">Tipo</label>
              <select
                className="propertyForm-select"
                name="type"
                value={formData.type}
                onChange={handleChange}
              >
                <option>Apartamento</option>
                <option>Casa</option>
                <option>Studio</option>
                <option>Kitnet</option>
                <option>Cobertura</option>
              </select>
            </div>
            
            <div className="propertyForm-formGroup">
              <label className="propertyForm-label">Tipo de postagem</label>
              <select
                className="propertyForm-select"
                name="post"
                value={formData.post}
                onChange={handleChange}
              >
                <option>Aluguel</option>
                <option>Venda</option>
              </select>

            </div>

              <div className="propertyForm-formGroup">
                <label className="propertyForm-label">CEP</label>
                  <input
                  className="propertyForm-input"
                  type="text"
                  inputMode="numeric"
                  name="cep"
                  pattern="[0-9]{8}"
                  maxLength="8"
                  value={formData.cep}
                  onChange={handleChange}
                  placeholder="00000000"
                  required
                />

            </div>
            
            <div className="propertyForm-formGroup">
              <label className="propertyForm-label">Preço (R$) *</label>
              <input
                className="propertyForm-input"
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder='2500'
                required
              />
            </div>
          </div>

          <div className="propertyForm-formGroup">
            <label className="propertyForm-label">Localização *</label>
            <input
              className="propertyForm-input"
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Bairro, Cidade - Estado"
              required
            />
          </div>

        </div>

        {/* ============================ CARACTERÍSTICAS ========================= */}
        <div className="propertyForm-section">
          <h2 className="propertyForm-sectionTitle">Características</h2>

          <div className="propertyForm-row">
            <div className="propertyForm-formGroup">
              <label className="propertyForm-label">Quartos *</label>
              <input
                className="propertyForm-input"
                type="number"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleChange}
                min="0"
                required
              />
            </div>

            <div className="propertyForm-formGroup">
              <label className="propertyForm-label">Banheiros *</label>
              <input
                className="propertyForm-input"
                type="number"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleChange}
                min="0"
                required
              />
            </div>

            <div className="propertyForm-formGroup">
              <label className="propertyForm-label">Área (m²) *</label>
              <input
                className="propertyForm-input"
                type="number"
                name="area"
                value={formData.area}
                onChange={handleChange}
                min="0"
                required
              />
            </div>
          </div>

          <div className="propertyForm-formGroup">
            <label className="propertyForm-label">Comodidades</label>
            <input
              className="propertyForm-input"
              type="text"
              name="amenities"
              placeholder="Garagem, Piscina, etc."
              value={formData.amenities}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* ============================== CONTATO ============================== */}
        <div className="propertyForm-section">
          <h2 className="propertyForm-sectionTitle">Contato</h2>

          <div className="propertyForm-formGroup">
            <label className="propertyForm-label">Nome *</label>
            <input
              className="propertyForm-input"
              type="text"
              name="contactName"
              value={formData.contactName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="propertyForm-row">
            <div className="propertyForm-formGroup">
              <label className="propertyForm-label">Telefone *</label>
              <input
                className="propertyForm-input"
                type="tel"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                placeholder="(11) 98765-4321"
                required
              />
            </div>

            <div className="propertyForm-formGroup">
              <label className="propertyForm-label">E-mail *</label>
              <input
                className="propertyForm-input"
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        {/* BOTÕES */}
        <div className="propertyForm-buttonGroup">
          <button
            type="button"
            className="propertyForm-cancelButton"
            onClick={() => navigate("/")}
          >
            Cancelar
          </button>

          <button type="submit" className="propertyForm-submitButton">
            Publicar Imóvel
          </button>
        </div>
      </form>
    </div>
  );
};

export default PropertyForm;
