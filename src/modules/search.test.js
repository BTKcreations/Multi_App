import { filterApps } from './search';

describe('search module - filterApps', () => {
  const mockApps = [
    {
      id: 1,
      name: 'Calculator',
      description: 'A simple math calculator',
      category: 'Utilities',
      tags: ['math', 'tools', 'calculate']
    },
    {
      id: 2,
      name: 'Notes',
      description: 'Take notes and organize your thoughts',
      category: 'Productivity',
      tags: ['writing', 'text']
    },
    {
      id: 3,
      name: 'Weather',
      description: 'Current weather and forecasts',
      category: 'Utilities',
      tags: ['forecast', 'rain', 'sun']
    },
    {
      id: 4,
      name: 'Minimal App',
      // Missing description, category, and tags
    }
  ];

  test('returns all apps when no search query and category is "all"', () => {
    const result = filterApps(mockApps);
    expect(result).toHaveLength(4);
    expect(result).toEqual(mockApps);
  });

  test('returns all apps when searchQuery is whitespace', () => {
    const result = filterApps(mockApps, '   ', 'all');
    expect(result).toHaveLength(4);
  });

  test('filters by category correctly', () => {
    const result = filterApps(mockApps, '', 'Utilities');
    expect(result).toHaveLength(2);
    expect(result.map(app => app.name)).toEqual(['Calculator', 'Weather']);
  });

  test('filters by search query matching name', () => {
    const result = filterApps(mockApps, 'calc', 'all');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Calculator');
  });

  test('filters by search query matching description', () => {
    const result = filterApps(mockApps, 'forecast', 'all');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Weather');
  });

  test('filters by search query matching category', () => {
    const result = filterApps(mockApps, 'product', 'all');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Notes');
  });

  test('filters by search query matching tags', () => {
    const result = filterApps(mockApps, 'math', 'all');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Calculator');
  });

  test('search query is case-insensitive', () => {
    const result = filterApps(mockApps, 'CALCULATOR', 'all');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Calculator');
  });

  test('combines search query and category filters', () => {
    const result = filterApps(mockApps, 'math', 'Utilities');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Calculator');

    const resultEmpty = filterApps(mockApps, 'math', 'Productivity');
    expect(resultEmpty).toHaveLength(0);
  });

  test('handles apps with missing optional properties smoothly', () => {
    const result = filterApps(mockApps, 'minimal', 'all');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Minimal App');
  });

  test('handles empty apps array', () => {
    const result = filterApps([], 'test', 'all');
    expect(result).toEqual([]);
  });

  test('ignores extra whitespace in search query', () => {
    const result = filterApps(mockApps, '   calc   ', 'all');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Calculator');
  });
});
