import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Database, RotateCcw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface MermaidViewerProps {
  script: string;
  isRendering: boolean;
  onRenderComplete: () => void;
  renderKey: number;
}

interface ERRelationship {
  from: string;
  to: string;
  label: string;
  type: string;
}

export function MermaidViewer({ script, isRendering, onRenderComplete, renderKey }: MermaidViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [relationships, setRelationships] = useState<ERRelationship[]>([]);
  const [entities, setEntities] = useState<string[]>([]);
  const [isHighlightMode, setIsHighlightMode] = useState(false);
  const { toast } = useToast();

  // Initialize Mermaid
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'neutral',
    });
  }, []);

  // Parse ER relationships from script
  const parseRelationships = (script: string): { relationships: ERRelationship[], entities: string[] } => {
    const relationships: ERRelationship[] = [];
    const entities: string[] = [];
    const lines = script.split('\n');

    // Extract entities
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.includes('{') && !trimmed.includes('||') && !trimmed.includes('}|')) {
        const entityName = trimmed.split(' ')[0];
        if (entityName && !entities.includes(entityName)) {
          entities.push(entityName);
        }
      }
    }

    // Extract relationships
    for (const line of lines) {
      const trimmed = line.trim();
      const relationshipPattern = /(\w+)\s+(\|\|--o\{|\|\|--o\||\|\|--\|\||}\|--\|\||}\|--o\{|o\|--\|\||o\|--o\{)\s+(\w+)\s*:\s*"([^"]+)"/;
      const match = trimmed.match(relationshipPattern);

      if (match) {
        const [, from, type, to, label] = match;
        relationships.push({ from, to, label, type });
      }
    }

    return { relationships, entities };
  };

  // Generate a filtered Mermaid script for the selected table and its direct relationships
  const getFilteredScript = () => {
    if (!selectedTable || !script.trim()) return script;
    // Parse entities and relationships from the original script
    const { relationships: allRelationships, entities: allEntities } = parseRelationships(script);
    // Find relationships involving the selected table
    const filteredRelationships = allRelationships.filter(rel => rel.from === selectedTable || rel.to === selectedTable);
    // Find all directly connected tables (including the selected table)
    const connectedEntities = new Set([selectedTable]);
    filteredRelationships.forEach(rel => {
      connectedEntities.add(rel.from);
      connectedEntities.add(rel.to);
    });
    // Only include relationships where both sides are in connectedEntities
    const strictRelationships = filteredRelationships.filter(rel => connectedEntities.has(rel.from) && connectedEntities.has(rel.to));
    // Extract entity definitions from the script for only connectedEntities
    const lines = script.split('\n');
    const entityDefs = [];
    let currentEntity = null;
    let buffer = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.endsWith('{') && !trimmed.includes('||') && !trimmed.includes('}|')) {
        currentEntity = trimmed.split(' ')[0];
        buffer = [line];
      } else if (currentEntity) {
        buffer.push(line);
        if (trimmed === '}') {
          if (connectedEntities.has(currentEntity)) {
            entityDefs.push(buffer.join('\n'));
          }
          currentEntity = null;
          buffer = [];
        }
      }
    }
    // Build the filtered script
    const filteredScript = [
      'erDiagram',
      ...entityDefs,
      ...strictRelationships.map(rel => `${rel.from} ${rel.type} ${rel.to} : \"${rel.label}\"`)
    ].join('\n');
    return filteredScript;
  };

  // Render the Mermaid diagram
  const renderDiagram = async () => {
    if (!containerRef.current || !script.trim()) {
      onRenderComplete();
      return;
    }

    try {
      const { relationships: parsedRelationships, entities: parsedEntities } = parseRelationships(script);
      setRelationships(parsedRelationships);
      setEntities(parsedEntities);

      // Clear previous diagram
      containerRef.current.innerHTML = '';

      // Generate unique ID for this render
      const id = `mermaid-${Date.now()}`;

      // Use filtered script if a table is selected
      const scriptToRender = getFilteredScript();
      const { svg } = await mermaid.render(id, scriptToRender);
      containerRef.current.innerHTML = svg;

      // Add click handlers to entities
      addClickHandlers();

      toast({
        title: "Diagram rendered successfully",
        description: `Found ${parsedEntities.length} entities and ${parsedRelationships.length} relationships.`,
      });
    } catch (error) {
      console.error('Mermaid rendering error:', error);
      toast({
        title: "Rendering error",
        description: "Please check your Mermaid script syntax.",
        variant: "destructive",
      });
    } finally {
      onRenderComplete();
    }
  };

  // Add click handlers to SVG elements
  const addClickHandlers = () => {
    if (!containerRef.current) return;
    const svg = containerRef.current.querySelector('svg');
    if (!svg) return;

    // Remove any previous click handlers and data-entity attributes
    svg.querySelectorAll('[data-entity]').forEach(el => {
      el.replaceWith(el.cloneNode(true));
      el.removeAttribute('data-entity');
    });

    // For each entity, find the text node with the entity name, then attach click to its parent group/rect
    entities.forEach(entityName => {
      // Find all text elements with this entity name
      const textNodes = Array.from(svg.querySelectorAll('text')).filter(t => t.textContent?.trim() === entityName);
      textNodes.forEach(textNode => {
        // Try to find the parent group or rect
        let clickableElement = textNode.parentElement;
        // Sometimes the text is nested, so go up until we find a <g> or <rect>
        while (clickableElement && clickableElement.tagName !== 'g' && clickableElement.tagName !== 'rect' && clickableElement.tagName !== 'svg') {
          clickableElement = clickableElement.parentElement;
        }
        if (clickableElement && clickableElement.tagName !== 'svg') {
          clickableElement.setAttribute('data-entity', entityName);
          clickableElement.style.cursor = 'pointer';
          clickableElement.addEventListener('click', () => handleEntityClick(entityName));
          clickableElement.addEventListener('mouseenter', () => {
            clickableElement.style.outline = '2px solid #3b82f6';
          });
          clickableElement.addEventListener('mouseleave', () => {
            if (selectedTable !== entityName) {
              clickableElement.style.outline = '2px solid transparent';
            }
          });
        }
      });
    });
  };

  // Handle entity selection
  const handleEntityClick = (entityName: string) => {
    if (selectedTable === entityName) {
      setSelectedTable(null);
      setIsHighlightMode(false);
      resetHighlighting();
    } else {
      setSelectedTable(entityName);
      setIsHighlightMode(true);
      highlightConnectedEntities(entityName);
    }
  };

  // Highlight connected entities
  const highlightConnectedEntities = (selectedEntity: string) => {
    if (!containerRef.current) return;

    const svg = containerRef.current.querySelector('svg');
    if (!svg) return;

    // Get connected entities
    const connectedEntities = new Set<string>();
    connectedEntities.add(selectedEntity);

    relationships.forEach((rel) => {
      if (rel.from === selectedEntity) {
        connectedEntities.add(rel.to);
      }
      if (rel.to === selectedEntity) {
        connectedEntities.add(rel.from);
      }
    });

    // Apply highlighting to all elements with data-entity attributes
    const allEntityElements = svg.querySelectorAll('[data-entity]');

    allEntityElements.forEach((element) => {
      const entityName = element.getAttribute('data-entity');
      if (!entityName) return;

      if (entityName === selectedEntity) {
        element.setAttribute('stroke', '#22c55e');
        element.setAttribute('stroke-width', '3');
        element.setAttribute('fill', '#dcfce7');
        (element as HTMLElement).style.outline = '3px solid #22c55e';
      } else if (connectedEntities.has(entityName)) {
        element.setAttribute('stroke', '#3b82f6');
        element.setAttribute('stroke-width', '2');
        element.setAttribute('fill', '#dbeafe');
        (element as HTMLElement).style.outline = '2px solid #3b82f6';
      } else {
        element.setAttribute('opacity', '0.3');
        (element as HTMLElement).style.outline = '1px solid #e5e7eb';
      }
    });

    // Also try the original approach as fallback
    const entityRects = svg.querySelectorAll('.er.entityBox, .entityBox, rect');
    entityRects.forEach((rect) => {
      const entity = rect.querySelector('.er.entityLabel, text') ||
                    rect.parentElement?.querySelector('text');
      if (entity && entity.textContent) {
        const entityName = entity.textContent.trim();

        if (entityName === selectedEntity) {
          rect.setAttribute('stroke', '#22c55e');
          rect.setAttribute('stroke-width', '3');
          rect.setAttribute('fill', '#dcfce7');
        } else if (connectedEntities.has(entityName)) {
          rect.setAttribute('stroke', '#3b82f6');
          rect.setAttribute('stroke-width', '2');
          rect.setAttribute('fill', '#dbeafe');
        } else {
          rect.setAttribute('opacity', '0.3');
        }
      }
    });
  };

  // Reset highlighting
  const resetHighlighting = () => {
    if (!containerRef.current) return;

    const svg = containerRef.current.querySelector('svg');
    if (!svg) return;

    // Reset all elements with data-entity attributes
    const allEntityElements = svg.querySelectorAll('[data-entity]');
    allEntityElements.forEach((element) => {
      element.removeAttribute('stroke');
      element.removeAttribute('stroke-width');
      element.removeAttribute('fill');
      element.removeAttribute('opacity');
      (element as HTMLElement).style.outline = '2px solid transparent';
    });

    // Also reset using original selectors as fallback
    const entityRects = svg.querySelectorAll('.er.entityBox, .entityBox, rect');
    entityRects.forEach((rect) => {
      rect.removeAttribute('stroke');
      rect.removeAttribute('stroke-width');
      rect.removeAttribute('fill');
      rect.removeAttribute('opacity');
    });
  };

  // Get filtered relationships for selected table
  const getSelectedTableRelationships = () => {
    if (!selectedTable) return [];
    return relationships.filter(rel => rel.from === selectedTable || rel.to === selectedTable);
  };

  // Render diagram when script changes, selectedTable changes, or renderKey changes
  useEffect(() => {
    if (script.trim()) {
      renderDiagram();
    }
  }, [script, selectedTable, renderKey]);

  const handleClearSelection = () => {
    setSelectedTable(null);
    setIsHighlightMode(false);
    resetHighlighting();
  };

  // Export the rendered diagram as SVG
  const handleExportImage = async () => {
    if (!containerRef.current) return;
    const svg = containerRef.current.querySelector('svg');
    if (!svg) return;

    try {
      // Create a copy of the SVG to modify
      const svgCopy = svg.cloneNode(true) as SVGSVGElement;

      // Add white background
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('width', '100%');
      rect.setAttribute('height', '100%');
      rect.setAttribute('fill', 'white');
      svgCopy.insertBefore(rect, svgCopy.firstChild);

      // Add needed attributes for standalone SVG
      svgCopy.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

      // Convert to data URL
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgCopy);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });

      // Create download link
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const dateStr = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
      const focus = selectedTable ? selectedTable.toLowerCase() : 'all';
      const filename = `er-diagram-${focus}-${dateStr}.svg`;

      const url = URL.createObjectURL(svgBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Export successful",
        description: `Diagram exported as ${filename}`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export failed',
        description: 'Could not export diagram as SVG.',
        variant: 'destructive'
      });
    }
  };

  const selectedRelationships = getSelectedTableRelationships();

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            ER Diagram
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportImage}
              className="text-xs"
            >
              Export as Image
            </Button>
            {selectedTable && (
              <Badge variant="outline" className="text-xs">
                Selected: {selectedTable}
              </Badge>
            )}
            {isHighlightMode && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearSelection}
                className="text-xs"
              >
                <RotateCcw className="mr-1 h-3 w-3" />
                Clear Selection
              </Button>
            )}
          </div>
        </div>
        {/* Dropdown for selecting table/entity */}
        {entities.length > 0 && (
          <div className="mt-4 flex items-center gap-2">
            <label htmlFor="entity-select" className="text-sm font-medium">Select Table:</label>
            <select
              id="entity-select"
              className="border rounded px-2 py-1 text-sm"
              value={selectedTable || ''}
              onChange={e => {
                const value = e.target.value;
                if (value === '') {
                  handleClearSelection();
                } else {
                  handleEntityClick(value);
                }
              }}
            >
              <option value="">-- Clear Selection --</option>
              {entities.map(entity => (
                <option key={entity} value={entity}>{entity}</option>
              ))}
            </select>
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div
            ref={containerRef}
            className="w-full min-h-96 bg-white border border-border rounded-lg p-4 overflow-auto"
            style={{
              minHeight: '400px',
              maxHeight: '70vh'
            }}
          >
            {!script.trim() && (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Database className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Enter a Mermaid ER script to see the diagram</p>
                  <p className="text-xs mt-1">Click tables to highlight relationships</p>
                </div>
              </div>
            )}
          </div>
          {selectedTable && selectedRelationships.length > 0 && (
            <Card className="bg-muted/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Relationships for {selectedTable}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-1">
                  {selectedRelationships.map((rel, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Badge variant="secondary" className="text-xs">
                        {rel.from === selectedTable ? rel.to : rel.from}
                      </Badge>
                      <span className="text-muted-foreground text-xs">
                        {rel.label}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
