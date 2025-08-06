// Test setup for AI Content Generator

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock fetch
global.fetch = jest.fn();

// Mock Bootstrap
global.bootstrap = {
  Toast: jest.fn().mockImplementation(() => ({
    show: jest.fn(),
    hide: jest.fn(),
  })),
  Modal: {
    getInstance: jest.fn(),
  },
};

// Mock service worker
global.navigator.serviceWorker = {
  register: jest.fn(),
  addEventListener: jest.fn(),
};

// Mock IndexedDB
global.indexedDB = {
  open: jest.fn(),
};

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
    readText: jest.fn(),
  },
});

// Mock speech recognition
global.SpeechRecognition = jest.fn();
global.webkitSpeechRecognition = jest.fn();

// Setup test environment
beforeEach(() => {
  // Clear all mocks
  jest.clearAllMocks();
  
  // Reset DOM
  document.body.innerHTML = '';
  
  // Setup basic DOM structure
  document.body.innerHTML = `
    <div id="app">
      <div id="dashboard" class="page-section"></div>
      <div id="generator" class="page-section" style="display: none;"></div>
      <div id="templates" class="page-section" style="display: none;"></div>
      <div id="saved" class="page-section" style="display: none;"></div>
      <div id="scheduled" class="page-section" style="display: none;"></div>
      <div id="analytics" class="page-section" style="display: none;"></div>
    </div>
  `;
});

// Helper functions for testing
global.testHelpers = {
  // Create mock content
  createMockContent: () => ({
    threads: [
      {
        hook: 'Test hook content',
        prompts: ['Test prompt 1', 'Test prompt 2', 'Test prompt 3']
      }
    ],
    topic: 'test',
    generatedAt: new Date().toISOString()
  }),

  // Create mock template
  createMockTemplate: () => ({
    id: 'test-template',
    name: 'Test Template',
    description: 'Test template description',
    platform: 'facebook',
    category: 'business',
    content: {
      hook: 'Test template hook',
      prompts: ['Template prompt 1', 'Template prompt 2'],
      cta: 'Test CTA'
    }
  }),

  // Create mock scheduled post
  createMockScheduledPost: () => ({
    id: Date.now(),
    title: 'Test Scheduled Post',
    content: 'Test post content',
    platform: 'facebook',
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    status: 'scheduled'
  }),

  // Mock API response
  mockApiResponse: (data) => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(data)
    });
  },

  // Mock API error
  mockApiError: (error) => {
    global.fetch.mockRejectedValue(new Error(error));
  },

  // Wait for async operations
  waitFor: (ms = 100) => new Promise(resolve => setTimeout(resolve, ms)),

  // Trigger event
  triggerEvent: (element, eventType) => {
    const event = new Event(eventType, { bubbles: true });
    element.dispatchEvent(event);
  },

  // Mock clipboard
  mockClipboard: {
    writeText: jest.fn().mockResolvedValue(undefined),
    readText: jest.fn().mockResolvedValue('test content')
  }
};

// Export for use in tests
module.exports = {
  localStorageMock,
  testHelpers: global.testHelpers
}; 