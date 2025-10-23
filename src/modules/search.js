/**
 * Search Module - Handles search and filtering functionality
 * Provides app search and category filtering
 */

/**
 * Filter apps based on search query and category
 * @param {Array} apps - Array of app objects
 * @param {string} searchQuery - Search query string
 * @param {string} category - Category to filter by
 * @returns {Array} Filtered apps
 */
export function filterApps(apps, searchQuery = '', category = 'all') {
  let filtered = apps;

  // Filter by category
  if (category && category !== 'all') {
    filtered = filtered.filter(app => app.category === category);
  }

  // Filter by search query
  if (searchQuery && searchQuery.trim() !== '') {
    const query = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(app => {
      return (
        app.name.toLowerCase().includes(query) ||
        (app.description && app.description.toLowerCase().includes(query)) ||
        (app.category && app.category.toLowerCase().includes(query)) ||
        (app.tags && app.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    });
  }

  return filtered;
}

/**
 * Search apps by query
 * @param {Array} apps - Array of app objects
 * @param {string} query - Search query
 * @returns {Array} Matching apps
 */
export function searchApps(apps, query) {
  if (!query || query.trim() === '') {
    return apps;
  }

  const searchTerm = query.toLowerCase().trim();
  return apps.filter(app => {
    const searchableText = [
      app.name,
      app.description || '',
      app.category || '',
      ...(app.tags || [])
    ].join(' ').toLowerCase();

    return searchableText.includes(searchTerm);
  });
}

/**
 * Get apps by category
 * @param {Array} apps - Array of app objects
 * @param {string} category - Category name
 * @returns {Array} Apps in category
 */
export function getAppsByCategory(apps, category) {
  if (category === 'all') {
    return apps;
  }
  return apps.filter(app => app.category === category);
}

/**
 * Get all unique categories from apps
 * @param {Array} apps - Array of app objects
 * @returns {Array} Unique category names
 */
export function getCategories(apps) {
  const categories = new Set();
  apps.forEach(app => {
    if (app.category) {
      categories.add(app.category);
    }
  });
  return ['all', ...Array.from(categories).sort()];
}

/**
 * Sort apps by various criteria
 * @param {Array} apps - Array of app objects
 * @param {string} sortBy - Sort criteria ('name', 'recent', 'popular')
 * @returns {Array} Sorted apps
 */
export function sortApps(apps, sortBy = 'name') {
  const sorted = [...apps];

  switch (sortBy) {
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    
    case 'recent':
      return sorted.sort((a, b) => {
        const dateA = new Date(a.lastUsed || 0);
        const dateB = new Date(b.lastUsed || 0);
        return dateB - dateA;
      });
    
    case 'popular':
      return sorted.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
    
    default:
      return sorted;
  }
}

/**
 * Highlight search terms in text
 * @param {string} text - Text to highlight
 * @param {string} query - Search query
 * @returns {string} HTML with highlighted terms
 */
export function highlightSearchTerms(text, query) {
  if (!query || !text) return text;
  
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

/**
 * Get search suggestions based on query
 * @param {Array} apps - Array of app objects
 * @param {string} query - Current search query
 * @returns {Array} Suggested apps
 */
export function getSearchSuggestions(apps, query) {
  if (!query || query.length < 2) {
    return [];
  }

  const searchTerm = query.toLowerCase().trim();
  const suggestions = [];

  // Find apps that start with the query
  apps.forEach(app => {
    if (app.name.toLowerCase().startsWith(searchTerm)) {
      suggestions.push({ ...app, relevance: 2 });
    } else if (app.name.toLowerCase().includes(searchTerm)) {
      suggestions.push({ ...app, relevance: 1 });
    }
  });

  // Sort by relevance and limit results
  return suggestions
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 5);
}
