import React from 'react';
import GenPostPage from './GenPostPage';

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 bg-[var(--color-crisp-white)] selection:bg-[var(--color-warm-blush)]/50 selection:text-[var(--color-deep-forest)]">
      <GenPostPage />
    </div>
  );
};

export default App;