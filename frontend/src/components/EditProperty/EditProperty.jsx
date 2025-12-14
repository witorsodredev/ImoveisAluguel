import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, Upload, Image as ImageIcon, Loader } from 'lucide-react';
import "../PropertyForm/PropertyForm.css";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const EditProperty = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState("");

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

  /* --------------------------------------------------
     Autenticação
  ----------------------------------------------------- */
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      const t = prompt("Digite seu token de acesso:");
      if (!t) {
        navigate("/dashboard");
        return;
      }
      localStorage.setItem("accessToken", t);
      setAccessToken(t);
    } else {
      setAccessToken(token);
    }

    const authUser = localStorage.getItem("authUser");
    if (!authUser) {
      navigate("/");
      return;
    }
  }, [navigate]);

  /* --------------------------------------------------
     Carregar imóvel
  ----------------------------------------------------- */
  useEffect(() => {
    if (!accessToken) return;

    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/api/properties/${id}`);
        if (!res.ok) throw new Error("Imóvel não encontrado");

        const property = await res.json();

        setFormData({
          title: property.title,
          description: property.description,
          price: property.price,
          location: property.location,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          area: property.area,
          type: property.type,
          post: property.post,
          amenities: property.amenities.join(', '),
          contactName: property.contact?.name,
          contactPhone: property.contact?.phone,
          contactEmail: property.contact?.email
        });

        setUploadedImages(property.images || []);

      } catch (err) {
        console.error(err);
        alert("Erro ao carregar imóvel");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [accessToken, id, navigate]);

  /* --------------------------------------------------
     Inputs
  ----------------------------------------------------- */
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /* --------------------------------------------------
     Upload
  ----------------------------------------------------- */
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);

    if (uploadedImages.length + files.length > 5) {
      alert("Máximo de 5 imagens");
      e.target.value = "";
      return;
    }

    const validFiles = files.filter(f =>
      f.type.startsWith("image/") && f.size <= 5 * 1024 * 1024
    );

    if (!validFiles.length) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const form = new FormData();
      validFiles.forEach(f => form.append("images", f));
      form.append("accessToken", accessToken);

      const res = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        body: form
      });

      if (!res.ok) throw new Error("Erro no upload");

      const data = await res.json();
      setUploadedImages(prev => [...prev, ...data.images]);

      setUploadProgress(100);

    } catch (err) {
      alert("Erro ao enviar imagens");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      e.target.value = "";
    }
  };

  const removeImage = async (index, url) => {
    const name = url.split('/').pop();

    try {
      await fetch(`${API_URL}/api/upload/${name}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      setUploadedImages(prev => prev.filter((_, i) => i !== index));

    } catch (err) {
      alert("Erro ao remover imagem");
    }
  };

  /* --------------------------------------------------
     Submit
  ----------------------------------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const updated = {
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price),
      location: formData.location,
      bedrooms: parseInt(formData.bedrooms),
      bathrooms: parseInt(formData.bathrooms),
      area: parseFloat(formData.area),
      type: formData.type,
      post: formData.post,
      images: uploadedImages,
      amenities: formData.amenities.split(',').map(a => a.trim()),
      contact: {
        name: formData.contactName,
        phone: formData.contactPhone,
        email: formData.contactEmail
      }
    };

    try {
      const res = await fetch(`${API_URL}/api/properties/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify(updated)
      });

      if (!res.ok) {
        if (res.status === 401) {
          alert("Token inválido");
          localStorage.removeItem("accessToken");
          navigate("/dashboard");
          return;
        }
        throw new Error("Erro ao atualizar");
      }

      alert("Imóvel atualizado!");
      navigate("/dashboard");

    } catch (err) {
      alert(err.message);
    }
  };

  /* --------------------------------------------------
     Loading
  ----------------------------------------------------- */
  if (loading) {
    return (
      <div className="propertyForm-loadingBox">
        <div className="propertyForm-loader"></div>
        <p>Carregando dados...</p>
      </div>
    );
  }

  /* --------------------------------------------------
     FORM HTML
  ----------------------------------------------------- */
  return (
    <div className="propertyForm-container">
      <h1 className="propertyForm-title">Editar Imóvel</h1>

      <form className="propertyForm-form" onSubmit={handleSubmit}>

        {/* ---------------- IMAGENS ---------------- */}
        <div className="propertyForm-section">
          <h2 className="propertyForm-sectionTitle">Imagens *</h2>
          <p className="propertyForm-helperText">
            Envie de 1 a 5 imagens.
          </p>

          {/* Grid de imagens */}
          {uploadedImages.length > 0 && (
            <div className="propertyForm-previewGrid">
              {uploadedImages.map((url, i) => (
                <div key={i} className="propertyForm-previewItem">
                  <img src={url} className="propertyForm-previewImage" />

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

          {/* Estado vazio */}
          {uploadedImages.length === 0 && !uploading && (
            <div className="propertyForm-emptyState">
              <ImageIcon size={48} color="#9ca3af" />
              <p className="propertyForm-emptyText">Nenhuma imagem enviada</p>
              <p className="propertyForm-emptySubtext">
                A primeira será a principal
              </p>
            </div>
          )}

          {/* Upload */}
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
                  <Loader className="spin" size={24} />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload size={24} />
                  Selecionar Imagens
                </>
              )}
            </label>

            <input
              id="imageUpload"
              type="file"
              multiple
              accept="image/*"
              disabled={uploading || uploadedImages.length >= 5}
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />
          </div>

          {uploading && (
            <div className="propertyForm-progressBar">
              <div
                className="propertyForm-progressFill"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}
        </div>

        {/* ---------------- INFORMAÇÕES ---------------- */}
        <div className="propertyForm-section">
          <h2 className="propertyForm-sectionTitle">Informações</h2>

          <div className="propertyForm-formGroup">
            <label className="propertyForm-label">Título *</label>
            <input
              className="propertyForm-input"
              name="title"
              value={formData.title}
              onChange={handleChange}
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
            />
          </div>

          <div className="propertyForm-row">
            <div className="propertyForm-formGroup">
              <label className="propertyForm-label">Tipo *</label>
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
              <label className="propertyForm-label">Preço (R$) *</label>
              <input
                className="propertyForm-input"
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="propertyForm-formGroup">
            <label className="propertyForm-label">Localização *</label>
            <input
              className="propertyForm-input"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* ---------------- CARACTERÍSTICAS ---------------- */}
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
                required
              />
            </div>
          </div>

          <div className="propertyForm-formGroup">
            <label className="propertyForm-label">Comodidades</label>
            <input
              className="propertyForm-input"
              name="amenities"
              value={formData.amenities}
              onChange={handleChange}
              placeholder="Garagem, Piscina, etc."
            />
          </div>
        </div>

        {/* ---------------- CONTATO ---------------- */}
        <div className="propertyForm-section">
          <h2 className="propertyForm-sectionTitle">Contato</h2>

          <div className="propertyForm-formGroup">
            <label className="propertyForm-label">Nome *</label>
            <input
              className="propertyForm-input"
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
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="propertyForm-formGroup">
              <label className="propertyForm-label">E-mail *</label>
              <input
                className="propertyForm-input"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        {/* ---------------- BOTÕES ---------------- */}
        <div className="propertyForm-buttonGroup">
          <button
            type="button"
            className="propertyForm-cancelButton"
            onClick={() => navigate("/dashboard")}
          >
            Cancelar
          </button>

          <button type="submit" className="propertyForm-submitButton">
            Salvar Alterações
          </button>
        </div>

      </form>
    </div>
  );
};

export default EditProperty;
