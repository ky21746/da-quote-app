import { useState, useEffect } from 'react';
import { pricebookRepository } from '../app/config/dependencies';
import { CatalogOption } from '../types/catalog';

export const useCatalog = (category: string) => {
  const [items, setItems] = useState<CatalogOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        setLoading(true);
        const pricebook = await pricebookRepository.getCurrent();
        
        // Filter items by category and map to CatalogOption format
        const filteredItems = pricebook.items
          .filter((item) => item.category === category)
          .map((item): CatalogOption => {
            const base = {
              id: item.id,
              name: item.name,
              category: item.category as any,
            };

            // Add location-specific fields if available
            if (item.location) {
              return {
                ...base,
                location: item.location,
              } as CatalogOption;
            }

            return base;
          });

        setItems(filteredItems);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load catalog');
      } finally {
        setLoading(false);
      }
    };

    loadCatalog();
  }, [category]);

  return { items, loading, error };
};



