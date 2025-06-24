import axiosMain from 'axios';
import { LocalStorageHelper } from './LocalStorageHelper';
import { toast } from 'sonner';
import { BASE_HTTPS } from '../environment_var';

const axios = axiosMain.create({
  baseURL: BASE_HTTPS,
});

axios.interceptors.request.use(
  async (config) => {
    const token = LocalStorageHelper.getAccessToken();
    if (token) {
      config.headers.Authorization = 'Bearer ' + token;
    }
    config.headers.Accept = 'application/json';

    const llmConfigsString = LocalStorageHelper.getLLMConfigs();
    if (llmConfigsString) {
      const llmConfigs = JSON.parse(llmConfigsString);
      config.headers['X-LLM-Type'] = llmConfigs.type;
      config.headers['X-LLM-Model'] = llmConfigs.model;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const response = error.response;

    if (response) {
      switch (response.status) {
        case 400:
          toast.error(
            response.data?.message || 'Bad request. Please check your input.'
          );
          break;

        case 401:
          toast.error(
            response.data?.message || 'Unauthorized. Please log in again.'
          );
          LocalStorageHelper.removeAccessToken();
          break;

        case 403:
          toast.error(
            response.data?.message || 'Forbidden. You do not have access.'
          );
          break;

        case 404:
          toast.info(response.data?.message || 'Resource not found.');
          break;

        case 422:
          toast.error(
            'Validation error. Please check your input and try again.'
          );
          break;

        default:
          toast.error(
            response.data?.message || 'An unexpected error occurred.'
          );
          break;
      }
    } else {
      toast.error('Network error. Please check your connection.');
    }

    return Promise.resolve({
      data: null,
      status: response?.status || 500,
      error: response?.data?.message || 'Error occurred',
    });
  }
);

export { axios };
