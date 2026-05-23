import {
  filterApps,
  searchApps,
  getAppsByCategory,
  getCategories,
  sortApps,
  highlightSearchTerms,
  getSearchSuggestions
} from './search.js';

describe('Search Module', () => {
  const mockApps = [
    { id: '1', name: 'Fake News Detection', category: 'Productivity', description: 'Detect fake news', tags: ['news', 'ai'], lastUsed: 1600000000000, usageCount: 5 },
    { id: '2', name: 'PDF Extractor', category: 'Productivity', description: 'Extract text from PDF', tags: ['pdf', 'text'], lastUsed: 1610000000000, usageCount: 20 },
    { id: '3', name: 'Math Solver', category: 'Education', description: 'Solve math equations', tags: ['math'], lastUsed: 1590000000000, usageCount: 50 },
    { id: '4', name: 'Tap Dash', category: 'Games', description: 'A fun game', tags: ['game', 'fun'], lastUsed: 1620000000000, usageCount: 100 },
    { id: '5', name: 'AskAI', category: 'AI', description: 'AI assistant', tags: ['ai', 'chat'], lastUsed: 1605000000000, usageCount: 10 },
    { id: '6', name: 'No Stats App', category: 'Utilities', description: 'Has no usage stats' }
  ];

  describe('filterApps', () => {
    it('should return all apps if no query and category is all', () => {
      const result = filterApps(mockApps);
      expect(result).toHaveLength(6);
    });

    it('should filter by specific category', () => {
      const result = filterApps(mockApps, '', 'Productivity');
      expect(result).toHaveLength(2);
      expect(result.map(a => a.name)).toEqual(['Fake News Detection', 'PDF Extractor']);
    });

    it('should filter by search query matching name', () => {
      const result = filterApps(mockApps, 'math');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Math Solver');
    });

    it('should filter by search query matching description', () => {
      const result = filterApps(mockApps, 'assistant');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('AskAI');
    });

    it('should filter by search query matching category', () => {
      const result = filterApps(mockApps, 'education');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Math Solver');
    });

    it('should filter by search query matching tags', () => {
      const result = filterApps(mockApps, 'fun');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Tap Dash');
    });

    it('should filter by both category and search query', () => {
      const result = filterApps(mockApps, 'ai', 'Productivity');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Fake News Detection');
    });

    it('should trim and case-insensitively match search query', () => {
      const result = filterApps(mockApps, '   PDF   ');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('PDF Extractor');
    });
  });

  describe('searchApps', () => {
    it('should return all apps if query is empty', () => {
      const result = searchApps(mockApps, '');
      expect(result).toHaveLength(6);
    });

    it('should match multiple fields in app object', () => {
      // "news" is in name and description for id 1
      const result = searchApps(mockApps, 'news');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('should return empty array if no match', () => {
      const result = searchApps(mockApps, 'nonexistentxyz');
      expect(result).toHaveLength(0);
    });
  });

  describe('getAppsByCategory', () => {
    it('should return all apps if category is "all"', () => {
      const result = getAppsByCategory(mockApps, 'all');
      expect(result).toHaveLength(6);
    });

    it('should return apps belonging to a specific category', () => {
      const result = getAppsByCategory(mockApps, 'Games');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Tap Dash');
    });
  });

  describe('getCategories', () => {
    it('should return unique categories sorted alphabetically, with "all" first', () => {
      const result = getCategories(mockApps);
      expect(result).toEqual(['all', 'AI', 'Education', 'Games', 'Productivity', 'Utilities']);
    });

    it('should ignore apps without a category', () => {
      const appsWithMissingCategory = [...mockApps, { id: '7', name: 'Ghost App' }];
      const result = getCategories(appsWithMissingCategory);
      expect(result).toEqual(['all', 'AI', 'Education', 'Games', 'Productivity', 'Utilities']);
    });
  });

  describe('sortApps', () => {
    it('should sort by name alphabetically by default', () => {
      const result = sortApps(mockApps);
      expect(result[0].name).toBe('AskAI');
      expect(result[1].name).toBe('Fake News Detection');
      expect(result[2].name).toBe('Math Solver');
    });

    it('should sort by name explicitly', () => {
      const result = sortApps(mockApps, 'name');
      expect(result[0].name).toBe('AskAI');
      expect(result[1].name).toBe('Fake News Detection');
    });

    it('should sort by recent usage (lastUsed)', () => {
      const result = sortApps(mockApps, 'recent');
      expect(result[0].name).toBe('Tap Dash'); // 1620000000000
      expect(result[1].name).toBe('PDF Extractor'); // 1610000000000
      expect(result[result.length - 1].name).toBe('No Stats App'); // 0 or undefined
    });

    it('should sort by popularity (usageCount)', () => {
      const result = sortApps(mockApps, 'popular');
      expect(result[0].name).toBe('Tap Dash'); // 100
      expect(result[1].name).toBe('Math Solver'); // 50
      expect(result[result.length - 1].name).toBe('No Stats App'); // 0 or undefined
    });

    it('should return original array if sort criteria is unknown', () => {
      const result = sortApps(mockApps, 'unknown');
      // Just check if it returns same elements, doesn't throw
      expect(result).toHaveLength(6);
      expect(result[0].id).toBe('1');
    });
  });

  describe('highlightSearchTerms', () => {
    it('should wrap matching term in <mark> tags', () => {
      const text = 'Hello world';
      const result = highlightSearchTerms(text, 'world');
      expect(result).toBe('Hello <mark>world</mark>');
    });

    it('should be case-insensitive but preserve original case', () => {
      const text = 'Hello World';
      const result = highlightSearchTerms(text, 'world');
      expect(result).toBe('Hello <mark>World</mark>');
    });

    it('should highlight multiple occurrences', () => {
      const text = 'test one, test two';
      const result = highlightSearchTerms(text, 'test');
      expect(result).toBe('<mark>test</mark> one, <mark>test</mark> two');
    });

    it('should return original text if query is empty or undefined', () => {
      expect(highlightSearchTerms('Hello', '')).toBe('Hello');
      expect(highlightSearchTerms('Hello', null)).toBe('Hello');
    });

    it('should return undefined/null if text is empty', () => {
      expect(highlightSearchTerms(undefined, 'query')).toBe(undefined);
      expect(highlightSearchTerms(null, 'query')).toBe(null);
    });
  });

  describe('getSearchSuggestions', () => {
    it('should return empty array if query length is less than 2', () => {
      const result = getSearchSuggestions(mockApps, 'a');
      expect(result).toEqual([]);
    });

    it('should return suggestions that start with query with relevance 2', () => {
      const result = getSearchSuggestions(mockApps, 'fake');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Fake News Detection');
      expect(result[0].relevance).toBe(2);
    });

    it('should return suggestions that include query with relevance 1', () => {
      const result = getSearchSuggestions(mockApps, 'news');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Fake News Detection');
      expect(result[0].relevance).toBe(1);
    });

    it('should prioritize starting match over including match', () => {
      const apps = [
        ...mockApps,
        { id: '10', name: 'My fake app' } // includes "fake"
      ];
      const result = getSearchSuggestions(apps, 'fake');
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Fake News Detection'); // Starts with, relevance 2
      expect(result[1].name).toBe('My fake app'); // Includes, relevance 1
    });

    it('should limit results to 5', () => {
      const manyApps = [
        { name: 'App 1' }, { name: 'App 2' }, { name: 'App 3' },
        { name: 'App 4' }, { name: 'App 5' }, { name: 'App 6' }
      ];
      const result = getSearchSuggestions(manyApps, 'app');
      expect(result).toHaveLength(5);
    });
  });
});
