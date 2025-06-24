import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: Company = {
  id: '',
  login_email: '',
  first_login: true,
  profile: undefined,
  continuation_token: '',
};

export const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {
    setCompanyInfo: (state, action: PayloadAction<Company>) => {
      state.id = action.payload.id;
      state.login_email = action.payload.login_email;
      state.first_login = action.payload.first_login;
      state.profile = action.payload.profile;
    },
    setCompanyProfile: (state, action: PayloadAction<CompanyProfile>) => {
      state.profile = action.payload;
    },
    setCompanyContinuationToken: (state, action: PayloadAction<string>) => {
      state.continuation_token = action.payload;
    },
    resetCompanyInfo: (state) => {
      state.login_email = '';
      state.first_login = true;
      state.profile = undefined;
      state.continuation_token = '';
    },
    companyLogout: () => initialState,
  },
});

export const {
  setCompanyInfo,
  setCompanyProfile,
  setCompanyContinuationToken,
  resetCompanyInfo,
  companyLogout,
} = companySlice.actions;
export default companySlice.reducer;
