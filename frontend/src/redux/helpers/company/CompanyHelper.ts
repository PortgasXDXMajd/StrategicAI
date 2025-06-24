import { setCompanyInfo } from '@/redux/company/companySlice';
import store from '@/redux/store';
import CompanyService from '@/services/CompanyService';

class CompanyHelper {
  static async enrichProfile(text: string | null, files: File[] | null) {
    const company: Company | null = await CompanyService.enrichProfile(
      text,
      files
    );
    if (company != null) {
      store.dispatch(setCompanyInfo(company));
    }
  }
}

export default CompanyHelper;
