import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  theme: 'light',
  notifications: [],
  modals: {
    auth: false,
    settings: false,
    share: false,
  },
  loading: {
    global: false,
    stories: false,
    generation: false,
  },
  toast: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    addNotification: (state, action) => {
      const notification = {
        id: Date.now(),
        type: 'info',
        ...action.payload,
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    openModal: (state, action) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action) => {
      state.modals[action.payload] = false;
    },
    setLoading: (state, action) => {
      const { key, value } = action.payload;
      state.loading[key] = value;
    },
    showToast: (state, action) => {
      state.toast = {
        id: Date.now(),
        type: 'info',
        duration: 3000,
        ...action.payload,
      };
    },
    hideToast: (state) => {
      state.toast = null;
    },
  },
});

export const {
  setTheme,
  addNotification,
  removeNotification,
  clearNotifications,
  openModal,
  closeModal,
  setLoading,
  showToast,
  hideToast,
} = uiSlice.actions;

export default uiSlice.reducer;
