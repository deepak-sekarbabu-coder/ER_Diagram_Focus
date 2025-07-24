// Fullscreen toggle implementation for MermaidViewer
// This is a simplified version focusing on the fullscreen functionality

import { useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';

// Add these styles to your global CSS or component
const fullscreenStyles = `
  .mermaid-viewer-fullscreen {
    position: fixed !important;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 50;
    margin: 0 !important;
    border-radius: 0 !important;
    max-width: 100vw !important;
    max-height: 100vh !important;
  }
  
  .mermaid-viewer-fullscreen .mermaid-container {
    height: calc(100vh - 80px) !important;
  }
`;

// Add this component to your MermaidViewer
const FullscreenToggle = ({ isFullscreen, toggleFullscreen }: { isFullscreen: boolean; toggleFullscreen: () => void }) => (
  <button
    onClick={toggleFullscreen}
    className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
    title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
  >
    {isFullscreen ? (
      <Minimize2 className="h-4 w-4" />
    ) : (
      <Maximize2 className="h-4 w-4" />
    )}
  </button>
);

// Add this hook to your component
const useFullscreen = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    setIsFullscreen(!isFullscreen);
  };

  return { isFullscreen, toggleFullscreen };
};

// In your MermaidViewer component, add:
// 1. The fullscreen state and toggle function:
//    const { isFullscreen, toggleFullscreen } = useFullscreen();
//
// 2. The FullscreenToggle component in your header:
//    <div className="flex items-center gap-2">
//      <FullscreenToggle 
//        isFullscreen={isFullscreen} 
//        toggleFullscreen={toggleFullscreen} 
//      />
//      {/* other buttons */}
//    </div>
//
// 3. Add the fullscreen class conditionally to your main container:
//    className={`your-existing-classes ${isFullscreen ? 'mermaid-viewer-fullscreen' : ''}`}
//
// 4. Add the styles to your component or global CSS:
//    <style jsx global>{fullscreenStyles}</style>

export { FullscreenToggle, useFullscreen, fullscreenStyles };
