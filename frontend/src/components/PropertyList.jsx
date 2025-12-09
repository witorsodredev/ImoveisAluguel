import React, { useState } from 'react';
import PropertyCard from './PropertyCard';
import { Search, Filter } from 'lucide-react';

const PropertyList = ({ properties, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Todos');
  const [maxPrice, setMaxPrice] = useState(10000);

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'Todos' || property.type === filterType;
    const matchesPrice = property.price <= maxPrice;

    return matchesSearch && matchesType && matchesPrice;
  });

  return (
    <div style={styles.container}>
      <div style={styles.filters}>
        <div style={styles.searchBox}>
          <Search size={20} />
          <input
            type="text"
            placeholder="Buscar por título ou localização..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.filterGroup}>
          <Filter size={20} />
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            style={styles.select}
          >
            <option>Todos</option>
            <option>Apartamento</option>
            <option>Casa</option>
            <option>Studio</option>
          </select>

          <div style={styles.priceFilter}>
            <label style={styles.label}>
              Até {maxPrice.toLocaleString('pt-BR')}
            </label>
            <input
              type="range"
              min="500"
              max="10000"
              step="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              style={styles.slider}
            />
          </div>
        </div>
      </div>

      <div style={styles.results}>
        <p style={styles.resultCount}>
          {filteredProperties.length} imóveis encontrados
        </p>
      </div>

      <div style={styles.grid}>
        {filteredProperties.map(property => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>

      {filteredProperties.length === 0 && (
        <div style={styles.noResults}>
          <p>Nenhum imóvel encontrado com os filtros selecionados.</p>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1rem'
  },
  filters: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    marginBottom: '2rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1rem',
    padding: '0.75rem',
    border: '1px solid #e5e7eb',
    borderRadius: '4px'
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '1rem'
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap'
  },
  select: {
    padding: '0.5rem',
    border: '1px solid #e5e7eb',
    borderRadius: '4px',
    fontSize: '0.875rem'
  },
  priceFilter: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    flex: 1,
    minWidth: '200px'
  },
  label: {
    fontSize: '0.875rem',
    color: '#6b7280'
  },
  slider: {
    width: '100%'
  },
  results: {
    marginBottom: '1rem'
  },
  resultCount: {
    color: '#6b7280',
    fontSize: '0.875rem'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '2rem'
  },
  noResults: {
    textAlign: 'center',
    padding: '3rem',
    color: '#6b7280'
  }
};

export default PropertyList;
