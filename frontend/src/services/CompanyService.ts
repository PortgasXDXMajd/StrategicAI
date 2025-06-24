import { axios } from '@/utils/helpers/AxiosHelper';

class CompanyService {
  static async enrichProfile(
    text: string | null,
    files: File[] | null
  ): Promise<Company | null> {
    const formData = new FormData();

    if (text) {
      formData.append('text', text);
    }

    if (files) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }

    const response = await axios.put('/company/enrich', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.status === 200) {
      return response.data.body;
    }
    return null;
  }
}

export default CompanyService;
