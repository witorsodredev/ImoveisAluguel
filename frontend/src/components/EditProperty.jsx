import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, Upload, Image as ImageIcon, Loader } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const EditProperty = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Pega o ID da URL

  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    type: 'Apartamento',
    amenities: '',
    contactName: '',
    contactPhone: '',
    contactEmail: ''
  });

  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [accessToken, setAccessToken] = useState('');

  // Verifica autenticação ao montar o componente
  useEffect(() => {
    const savedToken = localStorage.getItem("accessToken");
    if (savedToken) {
      setAccessToken(savedToken);
    } else {
      const token = prompt("Digite o token de acesso:");
      if (!token) {
        navigate('/dashboard');
        return;
      }
      localStorage.setItem("accessToken", token);
      setAccessToken(token);
    }

    // Verifica se o usuário está autenticado
    const authUser = localStorage.getItem("authUser");
    if (!authUser) {
      navigate("/");
      return;
    }
  }, [navigate]);

  // Carrega os dados do imóvel ao montar o componente
  useEffect(() => {
    if (accessToken) {
      fetchProperty();
    }
  }, [id, accessToken]);

  const fetchProperty = async () => {
    try {
      const res = await fetch(`${API_URL}/api/properties/${id}`);
      if (!res.ok) {
        throw new Error('Imóvel não encontrado');
      }
      const property = await res.json();

      // Preenche o formulário com os dados existentes
      setFormData({
        title: property.title || '',
        description: property.description || '',
        price: property.price || '',
        location: property.location || '',
        bedrooms: property.bedrooms || '',
        bathrooms: property.bathrooms || '',
        area: property.area || '',
        type: property.type || 'Apartamento',
        amenities: property.amenities ? property.amenities.join(', ') : '',
        contactName: property.contact?.name || '',
        contactPhone: property.contact?.phone || '',
        contactEmail: property.contact?.email || ''
      });

      // Carrega as imagens existentes
      setUploadedImages(property.images || []);

    } catch (error) {
      console.error('Erro ao carregar imóvel:', error);
      alert('Erro ao carregar dados do imóvel');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);

    if (uploadedImages.length + files.length > 5) {
      alert('Máximo de 5 imagens permitidas');
      e.target.value = '';
      return;
    }

    const validFiles = [];
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} não é uma imagem válida`);
        continue;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        alert(`${file.name} é muito grande. Máximo 5MB`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) {
      e.target.value = '';
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      validFiles.forEach(file => {
        formData.append('images', file);
      });

      // Adiciona o token de acesso
      formData.append('accessToken', accessToken);

      const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao fazer upload');
      }

      const data = await response.json();
      setUploadedImages(prev => [...prev, ...data.images]);
      setUploadProgress(100);

    } catch (error) {
      console.error('Erro no upload:', error);
      alert(`Erro ao fazer upload: ${error.message}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      e.target.value = '';
    }
  };

  const removeImage = async (index, imageUrl) => {
    const filename = imageUrl.split('/').pop();

    try {
      const response = await fetch(`${API_URL}/api/upload/${filename}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao remover imagem do servidor');
      }

      setUploadedImages(prev => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error('Erro ao remover imagem:', error);
      alert('Erro ao remover imagem. Tente novamente.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (uploadedImages.length === 0) {
      alert('Adicione pelo menos uma imagem do imóvel');
      return;
    }

    const updatedProperty = {
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price),
      location: formData.location,
      bedrooms: parseInt(formData.bedrooms),
      bathrooms: parseInt(formData.bathrooms),
      area: parseFloat(formData.area),
      type: formData.type,
      images: uploadedImages,
      amenities: formData.amenities.split(',').map(a => a.trim()).filter(a => a),
      contact: {
        name: formData.contactName,
        phone: formData.contactPhone,
        email: formData.contactEmail
      }
    };

    try {
      // Envia o token de acesso no cabeçalho
      const response = await fetch(`${API_URL}/api/properties/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(updatedProperty)
      });

      if (!response.ok) {
        const error = await response.json();

        if (response.status === 401) {
          localStorage.removeItem("accessToken");
          alert("Token de acesso inválido. Por favor, faça login novamente.");
          navigate('/dashboard');
          return;
        }

        throw new Error(error.error || 'Erro ao atualizar imóvel');
      }

      alert('Imóvel atualizado com sucesso!');
      navigate('/dashboard');

    } catch (error) {
      console.error('Erro ao atualizar imóvel:', error);
      alert(`Erro ao atualizar imóvel: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingBox}>
        <div style={styles.loader}></div>
        <p>Carregando dados do imóvel...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Editar Imóvel</h1>

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* SEÇÃO DE IMAGENS */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Imagens do Imóvel *</h2>
          <p style={styles.helperText}>
            Adicione de 1 a 5 imagens (máximo 5MB cada). As imagens serão armazenadas no servidor.
          </p>

          {uploadedImages.length > 0 && (
            <div style={styles.previewGrid}>
              {uploadedImages.map((imageUrl, index) => (
                <div key={index} style={styles.previewItem}>
                  <img
                    src={imageUrl}
                    alt={`Imagem ${index + 1}`}
                    style={styles.previewImage}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index, imageUrl)}
                    style={styles.removeButton}
                    title="Remover imagem"
                  >
                    <X size={16} />
                  </button>
                  <div style={styles.imageBadge}>
                    {index === 0 ? 'Principal' : `${index + 1}`}
                  </div>
                </div>
              ))}
            </div>
          )}

          {uploadedImages.length === 0 && !uploading && (
            <div style={styles.emptyState}>
              <ImageIcon size={48} style={{ color: '#9ca3af' }} />
              <p style={styles.emptyText}>
                Nenhuma imagem adicionada ainda
              </p>
              <p style={styles.emptySubtext}>
                A primeira imagem será a principal do anúncio
              </p>
            </div>
          )}

          <div style={styles.uploadArea}>
            <label
              htmlFor="imageUpload"
              style={{
                ...styles.uploadLabel,
                ...(uploading || uploadedImages.length >= 5 ? styles.uploadLabelDisabled : {})
              }}
            >
              {uploading ? (
                <>
                  <Loader size={24} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <Upload size={24} />
                  <span>Selecionar Imagens</span>
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
              style={{ display: 'none' }}
            />
          </div>

          {uploading && (
            <div style={styles.progressBar}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${uploadProgress}%`
                }}
              />
            </div>
          )}
        </div>

        {/* INFORMAÇÕES BÁSICAS */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Informações Básicas</h2>

          <div style={styles.formGroup}>
            <label style={styles.label}>Título do Anúncio *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Ex: Apartamento Moderno no Centro"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Descrição *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="5"
              style={styles.textarea}
              placeholder="Descreva as características do imóvel..."
            />
          </div>

          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Tipo de Imóvel *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                style={styles.select}
              >
                <option>Apartamento</option>
                <option>Casa</option>
                <option>Studio</option>
                <option>Kitnet</option>
                <option>Cobertura</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Valor do Aluguel (R$) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                style={styles.input}
                placeholder="2500"
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Localização *</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Bairro, Cidade - Estado"
            />
          </div>
        </div>

        {/* CARACTERÍSTICAS */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Características</h2>

          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Quartos *</label>
              <input
                type="number"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleChange}
                required
                min="0"
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Banheiros *</label>
              <input
                type="number"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleChange}
                required
                min="0"
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Área (m²) *</label>
              <input
                type="number"
                name="area"
                value={formData.area}
                onChange={handleChange}
                required
                min="0"
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Comodidades</label>
            <input
              type="text"
              name="amenities"
              value={formData.amenities}
              onChange={handleChange}
              style={styles.input}
              placeholder="Garagem, Elevador, Piscina (separados por vírgula)"
            />
          </div>
        </div>

        {/* CONTATO */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Informações de Contato</h2>

          <div style={styles.formGroup}>
            <label style={styles.label}>Nome *</label>
            <input
              type="text"
              name="contactName"
              value={formData.contactName}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Telefone *</label>
              <input
                type="tel"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                required
                style={styles.input}
                placeholder="(11) 98765-4321"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>E-mail *</label>
              <input
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>
          </div>
        </div>

        <div style={styles.buttonGroup}>
          <button type="button" onClick={() => navigate('/dashboard')} style={styles.cancelButton}>
            Cancelar
          </button>
          <button type="submit" style={styles.submitButton}>
            Salvar Alterações
          </button>
        </div>
      </form>
    </div>
  );
};

// Estilos
const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px'
  },
  loadingBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px'
  },
  loader: {
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite'
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#1f2937'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px'
  },
  section: {
    backgroundColor: '#fff',
    padding: '24px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '16px',
    color: '#374151'
  },
  helperText: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '16px'
  },
  previewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '12px',
    marginBottom: '16px'
  },
  previewItem: {
    position: 'relative',
    aspectRatio: '1',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '2px solid #e5e7eb'
  },
  previewImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  removeButton: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  imageBadge: {
    position: 'absolute',
    bottom: '8px',
    left: '8px',
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: '#fff',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500'
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    marginBottom: '16px'
  },
  emptyText: {
    fontSize: '16px',
    color: '#6b7280',
    margin: '12px 0 4px'
  },
  emptySubtext: {
    fontSize: '14px',
    color: '#9ca3af'
  },
  uploadArea: {
    marginTop: '16px'
  },
  uploadLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    backgroundColor: '#3b82f6',
    color: '#fff',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
    transition: 'background-color 0.2s'
  },
  uploadLabelDisabled: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed'
  },
  progressBar: {
    width: '100%',
    height: '8px',
    backgroundColor: '#e5e7eb',
    borderRadius: '4px',
    overflow: 'hidden',
    marginTop: '16px'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    transition: 'width 0.3s'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151'
  },
  input: {
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  textarea: {
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '16px',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit'
  },
  select: {
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '16px',
    outline: 'none',
    backgroundColor: '#fff'
  },
  row: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px'
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '20px'
  },
  cancelButton: {
    padding: '12px 24px',
    backgroundColor: '#6b7280',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  submitButton: {
    padding: '12px 24px',
    backgroundColor: '#10b981',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  }
};

export default EditProperty;
