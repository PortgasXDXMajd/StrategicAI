const TOKEN_KEY = 'access_token';
const SESSION_KEY = 'session_data';
const LLM_CONFIGS_KEY = 'LLM_configs';

export const LocalStorageHelper = {
  setAccessToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  getAccessToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  removeAccessToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  setSession(session: any) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  },

  getSession() {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  },

  removeSession() {
    localStorage.removeItem(SESSION_KEY);
  },

  setLLMConfigs(configs: any) {
    localStorage.setItem(LLM_CONFIGS_KEY, configs);
  },

  getLLMConfigs() {
    return localStorage.getItem(LLM_CONFIGS_KEY);
  },

  removeLLMConfigs() {
    localStorage.removeItem(LLM_CONFIGS_KEY);
  },
};
