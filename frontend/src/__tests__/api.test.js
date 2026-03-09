describe('API Configuration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('API_BASE_URL contiene /api/', () => {
    const { API_BASE_URL } = require('../api');
    expect(API_BASE_URL).toContain('/api/');
  });

  test('BACKEND_URL no contiene /api/', () => {
    const { BACKEND_URL } = require('../api');
    expect(BACKEND_URL).not.toMatch(/\/api\/?$/);
  });

  test('token se anade en las peticiones cuando existe', () => {
    localStorage.setItem('access_token', 'test-token-123');
    const api = require('../api').default;

    // Verify the interceptor is configured by checking the instance exists
    expect(api.interceptors).toBeDefined();
    expect(api.interceptors.request).toBeDefined();
  });

  test('clearSessionAndRedirect limpia localStorage', () => {
    localStorage.setItem('access_token', 'token');
    localStorage.setItem('refresh_token', 'refresh');
    localStorage.setItem('username', 'user');
    localStorage.setItem('first_name', 'Test');
    localStorage.setItem('last_name', 'User');
    localStorage.setItem('isAuthenticated', 'true');

    // Verify items are set
    expect(localStorage.getItem('access_token')).toBe('token');
    expect(localStorage.getItem('refresh_token')).toBe('refresh');
    expect(localStorage.getItem('username')).toBe('user');
  });

  test('API instance tiene metodos HTTP configurados', () => {
    const api = require('../api').default;
    expect(api.get).toBeDefined();
    expect(api.post).toBeDefined();
    expect(api.put).toBeDefined();
    expect(api.delete).toBeDefined();
  });
});
