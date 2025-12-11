import React from 'react';
import { MapPin, Bed, Bath, Maximize } from 'lucide-react';
import { Link } from 'react-router-dom';
import "../styles/PropertyCard.css";

const PropertyCard = ({ property }) => {
  return (
    <div className="property-card">

      <div className="property-card-image-container">
        <img
          src={property.images[0]}
          alt={property.title}
          className="property-card-image"
        />

        <div className="property-card-badge">
          {property.type}
        </div>
      </div>

      <div className="property-card-content">
        <h3 className="property-card-title">{property.title}</h3>

        <div className="property-card-location">
          <MapPin size={16} />
          <span>{property.location}</span>
        </div>

        <p className="property-card-description">
          {property.description.substring(0, 100)}...
        </p>

        <div className="property-card-features">
          <div className="property-card-feature">
            <Bed size={18} />
            <span>{property.bedrooms} quartos</span>
          </div>

          <div className="property-card-feature">
            <Bath size={18} />
            <span>{property.bathrooms} banheiros</span>
          </div>

          <div className="property-card-feature">
            <Maximize size={18} />
            <span>{property.area}m²</span>
          </div>
        </div>

        <div className="property-card-footer">
          <div className="property-card-price">
            {property.price.toLocaleString('pt-BR')}/mês
          </div>

          <Link to={`/imovel/${property.id}`} className="property-card-button">
            Ver Detalhes
          </Link>
        </div>
      </div>

    </div>
  );
};

export default PropertyCard;
