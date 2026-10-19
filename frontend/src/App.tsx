import React from 'react';
import { AppProvider } from './context/AppContext';
import { AppRouter } from './router/AppRouter';

export const App: React.FC = () => {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
};

export default App;
