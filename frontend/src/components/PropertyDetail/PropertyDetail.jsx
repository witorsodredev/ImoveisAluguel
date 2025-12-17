import "./PropertyDetail.css";
import { usePageTitle } from '../../hooks/usePageTitle';
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin, Bed, Bath, Maximize,
  Phone, Mail, ArrowLeft,
  ChevronLeft, ChevronRight
} from 'lucide-react';

const PropertyDetail = ({ properties }) => {
  usePageTitle("Detalhes Post");
  const { id } = useParams();
  const property = properties.find(p => p.id === parseInt(id));
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!property) {
    return <div className="property-detail-not-found">Imóvel não encontrado</div>;
  }

  const nextImage = () => {
    setCurrentImageIndex(prev =>
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex(prev =>
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  return (
    <div className="property-detail-container">

      <Link to="/" className="property-detail-back-button">
        <ArrowLeft size={20} />
        Voltar
      </Link>

      <div className="property-detail-gallery">
        <img
          src={property.images[currentImageIndex]}
          alt={property.title}
          className="property-detail-main-image"
        />

        {property.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="property-detail-gallery-nav"
              style={{ left: "1rem" }}
            >
              <ChevronLeft size={24} />
            </button>

            <button
              onClick={nextImage}
              className="property-detail-gallery-nav"
              style={{ right: "1rem" }}
            >
              <ChevronRight size={24} />
            </button>

            <div className="property-detail-gallery-indicator">
              {currentImageIndex + 1} / {property.images.length}
            </div>
          </>
        )}
      </div>

      <div className="property-detail-content">

        {/* LADO ESQUERDO */}
        <div className="property-detail-main-image">

          <div className="property-detail-header">
            <div>
              <h1 className="property-detail-title">{property.title}</h1>

              <div className="property-detail-location">
                <MapPin size={20} />
                <span>{property.location}</span>
              </div>
            </div>

            <div className="property-detail-price">
              {property.price.toLocaleString("pt-BR")}
              <span className="property-detail-period">/mês</span>
            </div>
          </div>

          <div className="property-detail-features">
            <div className="property-detail-feature">
              <Bed size={24} />
              <div>
                <div className="property-detail-feature-value">{property.bedrooms}</div>
                <div className="property-detail-feature-label">Quartos</div>
              </div>
            </div>

            <div className="property-detail-feature">
              <Bath size={24} />
              <div>
                <div className="property-detail-feature-value">{property.bathrooms}</div>
                <div className="property-detail-feature-label">Banheiros</div>
              </div>
            </div>

            <div className="property-detail-feature">
              <Maximize size={24} />
              <div>
                <div className="property-detail-feature-value">{property.area}m²</div>
                <div className="property-detail-feature-label">Área</div>
              </div>
            </div>
          </div>

          <div className="property-detail-section">
            <h2 className="property-detail-section-title">Descrição</h2>
            <p className="property-detail-description">{property.description}</p>
          </div>

          <div className="property-detail-section">
            <h2 className="property-detail-section-title">Comodidades</h2>

            <div className="property-detail-amenities">
              {property.amenities.map((amenity, index) => (
                <span key={index} className="property-detail-amenity ">
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* LADO DIREITO (Card de contato) */}
        <div className="property-detail-contact-card">
          <h3 className="property-detail-contact-title ">Informações de Contato</h3>

          <div className="property-detail-contact-info">

            <div className="property-detail-contact-item">
              <strong>{property.contact.name}</strong>
            </div>

            <div className="property-detail-contact-item">
              <Phone size={18} />
              <a
                href={`tel:${property.contact.phone}`}
                className="property-detail-contact-link"
              >
                {property.contact.phone}
              </a>
            </div>

            <div className="property-detail-contact-item">
              <Mail size={18} />
              <a
                href={`mailto:${property.contact.email}`}
                className="property-detail-contact-link"
              >
                {property.contact.email}
              </a>
            </div>

          </div>

          <button className="property-detail-contact-button">
            Entrar em Contato
          </button>
        </div>

      </div>
    </div>
  );
};

export default PropertyDetail;
