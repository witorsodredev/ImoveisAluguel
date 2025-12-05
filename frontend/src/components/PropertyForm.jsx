import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Upload, Image as ImageIcon, Loader } from 'lucide-react';

/**
 * URL base da API
 * 
 * Em desenvolvimento: http://localhost:5000
 * Em produção: Usar variável de ambiente
 */
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const PropertyForm = ({ onSubmit }) => {
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
    amenities: '',
    contactName: '',
    contactPhone: '',
    contactEmail: ''
  });

  /**
   * Estados para gerenciamento de imagens
   * 
   * uploadedImages: URLs das imagens já no servidor
   * uploading: Estado de carregamento
   * uploadProgress: Progresso do upload (0-100)
   */
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Handler para upload de imagens
   * 
   * FLUXO:
   * 1. Usuário seleciona arquivos
   * 2. Valida localmente (tipo, tamanho, quantidade)
   * 3. Cria FormData
   * 4. Envia para backend via fetch
   * 5. Backend salva e retorna URLs
   * 6. Atualiza estado com URLs
   * 
   * @param {Event} e - Evento do input file
   */
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);

    /**
     * VALIDAÇÃO 1: Limite de quantidade
     * 
     * Máximo 5 imagens total
     * Considera imagens já enviadas
     */
    if (uploadedImages.length + files.length > 5) {
      alert('Máximo de 5 imagens permitidas');
      e.target.value = ''; // Limpa input
      return;
    }

    /**
     * VALIDAÇÃO 2: Tipo e tamanho
     * 
     * Valida ANTES de enviar ao servidor
     * Economiza banda e tempo
     */
    const validFiles = [];
    for (const file of files) {
      // Verifica tipo
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} não é uma imagem válida`);
        continue;
      }

      // Verifica tamanho (5MB)
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

    /**
     * UPLOAD PARA SERVIDOR
     */

    // Ativa estado de carregamento
    setUploading(true);
    setUploadProgress(0);

    try {
      /**
       * Cria FormData para envio
       * 
       * FormData:
       * - Formato multipart/form-data
       * - Suporta arquivos binários
       * - Compatível com Multer
       * 
       * append('images', file):
       * - 'images': Nome do campo (deve corresponder ao backend)
       * - file: Arquivo File do input
       * - Pode adicionar múltiplos com mesmo nome
       */
      const formData = new FormData();
      validFiles.forEach(file => {
        formData.append('images', file);
      });

      /**
       * Envia para backend
       * 
       * fetch:
       * - API nativa do browser
       * - Retorna Promise
       * - Suporta upload de arquivos
       * 
       * POST /api/upload:
       * - Rota definida no backend
       * - Multer processa FormData
       * - Retorna URLs das imagens
       * 
       * IMPORTANTE:
       * - NÃO definir Content-Type
       * - Browser define automaticamente com boundary
       * - Multer precisa do boundary correto
       */
      const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData
        // NÃO adicionar headers: { 'Content-Type': ... }
      });

      /**
       * Processa resposta
       */
      if (!response.ok) {
        // Erro HTTP (4xx, 5xx)
        const error = await response.json();
        throw new Error(error.error || 'Erro ao fazer upload');
      }

      /**
       * Sucesso - extrai URLs
       * 
       * response.json():
       * - Parse do JSON retornado
       * - { message, images: [...], count }
       */
      const data = await response.json();

      /**
       * Atualiza estado com novas URLs
       * 
       * Spread operator:
       * - Mantém imagens anteriores
       * - Adiciona novas ao final
       */
      setUploadedImages(prev => [...prev, ...data.images]);

      // Feedback de sucesso
      setUploadProgress(100);

    } catch (error) {
      /**
       * Tratamento de erro
       * 
       * Possíveis erros:
       * - Rede offline
       * - Servidor fora do ar
       * - Validação falhou
       * - Erro de permissão
       */
      console.error('Erro no upload:', error);
      alert(`Erro ao fazer upload: ${error.message}`);
    } finally {
      /**
       * Limpeza
       * 
       * finally:
       * - Executa sempre (sucesso ou erro)
       * - Reseta estados de carregamento
       */
      setUploading(false);
      setUploadProgress(0);
      e.target.value = ''; // Limpa input
    }
  };

  /**
   * Remove imagem do servidor e do estado
   * 
   * FLUXO:
   * 1. Extrai nome do arquivo da URL
   * 2. Chama API DELETE
   * 3. Remove do estado local
   * 
   * @param {number} index - Índice da imagem
   * @param {string} imageUrl - URL completa da imagem
   */
  const removeImage = async (index, imageUrl) => {
    /**
     * Extrai nome do arquivo da URL
     * 
     * URL: http://localhost:5000/uploads/1234567890-foto.jpg
     * Split por '/': [..., 'uploads', '1234567890-foto.jpg']
     * pop(): Pega último elemento
     * Resultado: '1234567890-foto.jpg'
     */
    const filename = imageUrl.split('/').pop();

    try {
      /**
       * Chama API para deletar arquivo
       * 
       * DELETE /api/upload/:filename
       * - Remove arquivo do disco
       * - Retorna confirmação
       */
      const response = await fetch(`${API_URL}/api/upload/${filename}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Erro ao remover imagem do servidor');
      }

      /**
       * Remove do estado local
       * 
       * filter:
       * - Cria novo array sem o item removido
       * - (_, i) => i !== index: Mantém todos exceto o índice
       */
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

  /**
   * Cria objeto do imóvel
   * 
   * NÃO inclui o ID - será gerado pelo backend
   */
  const newProperty = {
    title: formData.title,
    description: formData.description,
    price: parseFloat(formData.price),
    location: formData.location,
    bedrooms: parseInt(formData.bedrooms),
    bathrooms: parseInt(formData.bathrooms),
    area: parseFloat(formData.area),
    type: formData.type,
    images: uploadedImages, // URLs do servidor
    amenities: formData.amenities.split(',').map(a => a.trim()).filter(a => a),
    contact: {
      name: formData.contactName,
      phone: formData.contactPhone,
      email: formData.contactEmail
    }
  };

  try {
    /**
     * Envia para API do backend
     * 
     * POST /api/properties
     * - Salva no arquivo JSON
     * - Retorna imóvel criado com ID
     */
    const response = await fetch(`${API_URL}/api/properties`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newProperty)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao cadastrar imóvel');
    }

    const data = await response.json();

    /**
     * Chama callback do componente pai (se existir)
     */
    if (onSubmit) {
      onSubmit(data.property);
    }

    alert('Imóvel publicado com sucesso!');
    navigate('/');

  } catch (error) {
    console.error('Erro ao cadastrar imóvel:', error);
    alert(`Erro ao publicar imóvel: ${error.message}`);
  }
};

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Publicar Novo Imóvel</h1>

      <form onSubmit={handleSubmit} style={styles.form}>

        {/* ========================================
            SEÇÃO DE IMAGENS
            ======================================== */}

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Imagens do Imóvel *</h2>

          <p style={styles.helperText}>
            Adicione de 1 a 5 imagens (máximo 5MB cada). As imagens serão armazenadas no servidor.
          </p>

          {/**
           * Botão de upload
           * 
           * Desabilitado durante upload ou se já tem 5 imagens
           */}
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

          {/**
           * Barra de progresso (durante upload)
           */}
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

          {/**
           * Grid de imagens enviadas
           */}
          {uploadedImages.length > 0 && (
            <div style={styles.previewGrid}>
              {uploadedImages.map((imageUrl, index) => (
                <div key={index} style={styles.previewItem}>
                  {/**
                   * Imagem do servidor
                   * 
                   * src={imageUrl}:
                   * - URL completa do servidor
                   * - Exemplo: http://localhost:5000/uploads/1234-foto.jpg
                   */}
                  <img 
                    src={imageUrl} 
                    alt={`Imagem ${index + 1}`}
                    style={styles.previewImage}
                  />

                  {/**
                   * Botão de remover
                   * 
                   * onClick: Remove do servidor E do estado
                   */}
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

          {/**
           * Estado vazio
           */}
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
        </div>

        {/* Resto do formulário (igual ao anterior) */}

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
              <label style={styles.label}>Valor do Aluguel (R¨D) *</label>
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
          <button type="button" onClick={() => navigate('/')} style={styles.cancelButton}>
            Cancelar
          </button>
          <button type="submit" style={styles.submitButton}>
            Publicar Imóvel
          </button>
        </div>
      </form>
    </div>
  );
};

// Estilos (adicione aos existentes)
const styles = {
  // ... estilos anteriores ...

  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2rem 1rem'
  },
  title: {
    fontSize: '2rem',
    marginBottom: '2rem',
    color: '#1f2937'
  },
  form: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  section: {
    marginBottom: '2rem',
    paddingBottom: '2rem',
    borderBottom: '1px solid #e5e7eb'
  },
  sectionTitle: {
    fontSize: '1.25rem',
    marginBottom: '1rem',
    color: '#1f2937'
  },
  formGroup: {
    marginBottom: '1rem',
    flex: 1
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    color: '#374151',
    fontSize: '0.875rem',
    fontWeight: '500'
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '1rem',
    boxSizing: 'border-box'
  },
  textarea: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '1rem',
    resize: 'vertical',
    boxSizing: 'border-box'
  },
  select: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '1rem',
    boxSizing: 'border-box'
  },
  row: {
    display: 'flex',
    gap: '1rem'
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end'
  },
  cancelButton: {
    padding: '0.75rem 2rem',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    backgroundColor: 'white',
    color: '#374151',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'background-color 0.3s'
  },
  submitButton: {
    padding: '0.75rem 2rem',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: '#2563eb',
    color: 'white',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.3s'
  },

  // Estilos de upload
  helperText: {
    color: '#6b7280',
    fontSize: '0.875rem',
    marginBottom: '1rem'
  },
  uploadArea: {
    marginBottom: '1.5rem'
  },
  uploadLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#2563eb',
    color: 'white',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
    transition: 'background-color 0.3s'
  },
  uploadLabelDisabled: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed',
    opacity: 0.6
  },
  progressBar: {
    width: '100%',
    height: '8px',
    backgroundColor: '#e5e7eb',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '1rem'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    transition: 'width 0.3s ease'
  },
  previewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '1rem',
    marginTop: '1rem'
  },
  previewItem: {
    position: 'relative',
    aspectRatio: '1',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '2px solid #e5e7eb',
    backgroundColor: '#f9fafb'
  },
  previewImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  removeButton: {
    position: 'absolute',
    top: '0.5rem',
    right: '0.5rem',
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background-color 0.3s'
  },
  imageBadge: {
    position: 'absolute',
    bottom: '0.5rem',
    left: '0.5rem',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: '500'
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem 1rem',
    border: '2px dashed #d1d5db',
    borderRadius: '8px',
    backgroundColor: '#f9fafb'
  },
  emptyText: {
    color: '#6b7280',
    fontSize: '1rem',
    marginTop: '1rem',
    marginBottom: '0.5rem'
  },
  emptySubtext: {
    color: '#9ca3af',
    fontSize: '0.875rem'
  }
};

export default PropertyForm;
