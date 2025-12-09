import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Maximize, Phone, Mail, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';

const PropertyDetail = ({ properties }) => {
  const { id } = useParams();
  const property = properties.find(p => p.id === parseInt(id));
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!property) {
    return <div style={styles.notFound}>Imóvel não encontrado</div>;
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  return (
    <div style={styles.container}>
      <Link to="/" style={styles.backButton}>
        <ArrowLeft size={20} />
        Voltar
      </Link>

      <div style={styles.imageGallery}>
        <img 
          src={property.images[currentImageIndex]} 
          alt={property.title}
          style={styles.mainImage}
        />
        {property.images.length > 1 && (
          <>
            <button onClick={prevImage} style={{...styles.navButton, left: '1rem'}}>
              <ChevronLeft size={24} />
            </button>
            <button onClick={nextImage} style={{...styles.navButton, right: '1rem'}}>
              <ChevronRight size={24} />
            </button>
            <div style={styles.imageIndicator}>
              {currentImageIndex + 1} / {property.images.length}
            </div>
          </>
        )}
      </div>

      <div style={styles.content}>
        <div style={styles.mainInfo}>
          <div style={styles.header}>
            <div>
              <h1 style={styles.title}>{property.title}</h1>
              <div style={styles.location}>
                <MapPin size={20} />
                <span>{property.location}</span>
              </div>
            </div>
            <div style={styles.price}>
               {property.price.toLocaleString('pt-BR')}<span style={styles.period}>/mês</span>
            </div>
          </div>

          <div style={styles.features}>
            <div style={styles.feature}>
              <Bed size={24} />
              <div>
                <div style={styles.featureValue}>{property.bedrooms}</div>
                <div style={styles.featureLabel}>Quartos</div>
              </div>
            </div>
            <div style={styles.feature}>
              <Bath size={24} />
              <div>
                <div style={styles.featureValue}>{property.bathrooms}</div>
                <div style={styles.featureLabel}>Banheiros</div>
              </div>
            </div>
            <div style={styles.feature}>
              <Maximize size={24} />
              <div>
                <div style={styles.featureValue}>{property.area}m²</div>
                <div style={styles.featureLabel}>Área</div>
              </div>
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Descrição</h2>
            <p style={styles.description}>{property.description}</p>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Comodidades</h2>
            <div style={styles.amenities}>
              {property.amenities.map((amenity, index) => (
                <span key={index} style={styles.amenity}>{amenity}</span>
              ))}
            </div>
          </div>
        </div>

        <div style={styles.contactCard}>
          <h3 style={styles.contactTitle}>Informações de Contato</h3>
          <div style={styles.contactInfo}>
            <div style={styles.contactItem}>
              <strong>{property.contact.name}</strong>
            </div>
            <div style={styles.contactItem}>
              <Phone size={18} />
              <a href={`tel:${property.contact.phone}`} style={styles.contactLink}>
                {property.contact.phone}
              </a>
            </div>
            <div style={styles.contactItem}>
              <Mail size={18} />
              <a href={`mailto:${property.contact.email}`} style={styles.contactLink}>
                {property.contact.email}
              </a>
            </div>
          </div>
          <button style={styles.contactButton}>
            Entrar em Contato
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1rem'
  },
  backButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#2563eb',
    textDecoration: 'none',
    marginBottom: '1rem',
    fontSize: '0.875rem'
  },
  imageGallery: {
    position: 'relative',
    height: '500px',
    borderRadius: '8px',
    overflow: 'hidden',
    marginBottom: '2rem'
  },
  mainImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: 'rgba(255,255,255,0.9)',
    border: 'none',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background-color 0.3s'
  },
  imageIndicator: {
    position: 'absolute',
    bottom: '1rem',
    right: '1rem',
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    fontSize: '0.875rem'
  },
  content: {
    display: 'grid',
    gridTemplateColumns: '1fr 350px',
    gap: '2rem'
  },
  mainInfo: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem',
    paddingBottom: '2rem',
    borderBottom: '1px solid #e5e7eb'
  },
  title: {
    margin: '0 0 0.5rem 0',
    fontSize: '2rem',
    color: '#1f2937'
  },
  location: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#6b7280'
  },
  price: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#2563eb'
  },
  period: {
    fontSize: '1rem',
    color: '#6b7280'
  },
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '2rem',
    marginBottom: '2rem',
    paddingBottom: '2rem',
    borderBottom: '1px solid #e5e7eb'
  },
  feature: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    color: '#2563eb'
  },
  featureValue: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#1f2937'
  },
  featureLabel: {
    fontSize: '0.875rem',
    color: '#6b7280'
  },
  section: {
    marginBottom: '2rem'
  },
  sectionTitle: {
    fontSize: '1.5rem',
    marginBottom: '1rem',
    color: '#1f2937'
  },
  description: {
    color: '#4b5563',
    lineHeight: '1.6'
  },
  amenities: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem'
  },
  amenity: {
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    fontSize: '0.875rem'
  },
  contactCard: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    height: 'fit-content',
    position: 'sticky',
    top: '2rem'
  },
  contactTitle: {
    fontSize: '1.25rem',
    marginBottom: '1rem',
    color: '#1f2937'
  },
  contactInfo: {
    marginBottom: '1.5rem'
  },
  contactItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.75rem',
    color: '#4b5563'
  },
  contactLink: {
    color: '#2563eb',
    textDecoration: 'none'
  },
  contactButton: {
    width: '100%',
    backgroundColor: '#2563eb',
    color: 'white',
    padding: '1rem',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.3s'
  },
  notFound: {
    textAlign: 'center',
    padding: '3rem',
    fontSize: '1.5rem',
    color: '#6b7280'
  }
};

export default PropertyDetail;
