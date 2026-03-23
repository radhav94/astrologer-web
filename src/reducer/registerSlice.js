import { createSlice } from "@reduxjs/toolkit";

const registerSlice = createSlice({
  name: "register",
  initialState: {
    registerData: null,
    currentStep: 1,
    astrologerId: null,
    astrologerDetails: null,
  },
  reducers: {
    setRegisterData: (state, action) => {
      state.registerData = action.payload;
    },
    updateRegisterData: (state, action) => {
      state.registerData = { ...state.registerData, ...action.payload };
    },
    setCurrentStep: (state, action) => {
      state.currentStep = action.payload;
    },
    clearRegisterData: (state) => {
      state.registerData = null;
      state.currentStep = 1;
    },
    setAstrologerId: (state, action) => {
      state.astrologerId = action.payload;
    },
    setAstrologerDetails: (state, action) => {
      state.astrologerDetails = action.payload;
    },
    setLogout: (state) => {
      state.registerData = null;
      state.registerData = null;
      state.currentStep = 1;
      state.astrologerId = null;
      state.astrologerDetails = null;
    },
  },
});

export const { setRegisterData, updateRegisterData, setCurrentStep, clearRegisterData,setLogout,setAstrologerId,setAstrologerDetails } = registerSlice.actions;
export default registerSlice.reducer;
