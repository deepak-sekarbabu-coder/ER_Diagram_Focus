import { useState } from 'react';
import { MermaidEditor } from '@/components/MermaidEditor';
import { MermaidViewer } from '@/components/MermaidViewer';

const Index = () => {
  const [mermaidScript, setMermaidScript] = useState('');
  const [isRendering, setIsRendering] = useState(false);
  const [renderKey, setRenderKey] = useState(0);

  const handleRender = () => {
    setIsRendering(true);
    setRenderKey((k) => k + 1);
  };

  const handleRenderComplete = () => {
    setIsRendering(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Interactive ER Diagram Viewer
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
            Create and explore Entity Relationship diagrams with selective highlighting.
            Click on any table to focus on its relationships and see connected entities highlighted.
          </p>
        </div>

        {/* Main content */}
        <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
          {/* Editor Panel */}
          <div className="space-y-4">
            <MermaidEditor
              value={mermaidScript}
              onChange={setMermaidScript}
              onRender={handleRender}
              isRendering={isRendering}
            />
          </div>

          {/* Viewer Panel */}
          <div className="space-y-4">
            <MermaidViewer
              script={mermaidScript}
              isRendering={isRendering}
              onRenderComplete={handleRenderComplete}
              renderKey={renderKey}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
