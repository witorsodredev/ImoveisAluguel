import React from 'react';
import { MapPin, Bed, Bath, Maximize } from 'lucide-react';
import { Link } from 'react-router-dom';

const PropertyCard = ({ property }) => {
  return (
    <div style={styles.card}>
      <div style={styles.imageContainer}>
        <img 
          src={property.images[0]} 
          alt={property.title}
          style={styles.image}
        />
        <div style={styles.badge}>{property.type}</div>
      </div>

      <div style={styles.content}>
        <h3 style={styles.title}>{property.title}</h3>

        <div style={styles.location}>
          <MapPin size={16} />
          <span>{property.location}</span>
        </div>

        <p style={styles.description}>
          {property.description.substring(0, 100)}...
        </p>

        <div style={styles.features}>
          <div style={styles.feature}>
            <Bed size={18} />
            <span>{property.bedrooms} quartos</span>
          </div>
          <div style={styles.feature}>
            <Bath size={18} />
            <span>{property.bathrooms} banheiros</span>
          </div>
          <div style={styles.feature}>
            <Maximize size={18} />
            <span>{property.area}m²</span>
          </div>
        </div>

        <div style={styles.footer}>
          <div style={styles.price}>
            R¨D {property.price.toLocaleString('pt-BR')}/mês
          </div>
          <Link to={`/imovel/${property.id}`} style={styles.button}>
            Ver Detalhes
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'transform 0.3s, box-shadow 0.3s',
    cursor: 'pointer'
  },
  imageContainer: {
    position: 'relative',
    height: '200px',
    overflow: 'hidden'
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  badge: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    backgroundColor: '#2563eb',
    color: 'white',
    padding: '0.25rem 0.75rem',
    borderRadius: '4px',
    fontSize: '0.875rem',
    fontWeight: 'bold'
  },
  content: {
    padding: '1.5rem'
  },
  title: {
    margin: '0 0 0.5rem 0',
    fontSize: '1.25rem',
    color: '#1f2937'
  },
  location: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#6b7280',
    fontSize: '0.875rem',
    marginBottom: '1rem'
  },
  description: {
    color: '#4b5563',
    fontSize: '0.875rem',
    lineHeight: '1.5',
    marginBottom: '1rem'
  },
  features: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #e5e7eb'
  },
  feature: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    color: '#6b7280',
    fontSize: '0.875rem'
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  price: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#2563eb'
  },
  button: {
    backgroundColor: '#2563eb',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: '500',
    transition: 'background-color 0.3s'
  }
};

export default PropertyCard;
