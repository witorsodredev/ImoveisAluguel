import React, { useState } from 'react';
import PropertyCard from '../PropertyCard/PropertyCard';
import { Search, Filter } from 'lucide-react';
import "./PropertyList.css";

const PropertyList = ({ properties }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Todos');
  const [filterPost, setFilterPost] = useState('Todos');
  const [maxPrice, setMaxPrice] = useState(10000);

  const filteredProperties = properties.filter(property => {
    const matchesSearch =
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      filterType === 'Todos' || property.type === filterType;

    const matchesPrice = property.price <= maxPrice;

    const matchesPost  = 
      filterPost === 'Todos' || property.post === filterPost;

    return matchesSearch && matchesType && matchesPost && matchesPrice;
  });

  return (
    <div className="propertyList-container">

      {/* FILTROS */}
      <div className="propertyList-filters">

        <div className="propertyList-searchBox">
          <Search size={20} />
          <input
            type="text"
            className="propertyList-searchInput"
            placeholder="Buscar por título ou localização..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="propertyList-filterGroup">
          <Filter size={20} />

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="propertyList-select"
          >
            <option>Todos</option>
            <option>Apartamento</option>
            <option>Casa</option>
            <option>Studio</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterPost(e.target.value)}
            className="propertyList-select"
          >
            <option>Todos</option>
            <option>Aluguel</option>
            <option>Venda</option>
          </select>

          <div className="propertyList-priceFilter">
            <label className="propertyList-label">
              Até R$ {maxPrice.toLocaleString('pt-BR')}
            </label>
            <input
              type="range"
              min="500"
              max="10000"
              step="100"
              className="propertyList-slider"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
            />
          </div>
        </div>

      </div>

      {/* RESULTADOS */}
      <div className="propertyList-results">
        <p className="propertyList-resultCount">
          {filteredProperties.length} imóveis encontrados
        </p>
      </div>

      {/* GRID */}
      <div className="propertyList-grid">
        {filteredProperties.map(property => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>

      {/* SEM RESULTADOS */}
      {filteredProperties.length === 0 && (
        <div className="propertyList-noResults">
          <p>Nenhum imóvel encontrado com os filtros selecionados.</p>
        </div>
      )}
    </div>
  );
};

export default PropertyList;
