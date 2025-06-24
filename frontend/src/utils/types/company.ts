interface CompanyProfile {
  company_name: string;
  country: string;
  industry: string;
  description?: string;
  dynamic_fields?: { [key: string]: any };
  questions_to_user: string[];
}

interface Company {
  id: string;
  login_email: string;
  first_login: boolean;
  profile?: CompanyProfile;
  continuation_token?: string;
}
