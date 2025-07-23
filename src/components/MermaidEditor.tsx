import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Code } from 'lucide-react';

interface MermaidEditorProps {
  value: string;
  onChange: (value: string) => void;
  onRender: () => void;
  isRendering?: boolean;
}

const defaultScript = `erDiagram
    User {
        int id PK
        string username
        string email
        string password_hash
        datetime created_at
        datetime updated_at
    }
    
    Profile {
        int id PK
        int user_id FK
        string first_name
        string last_name
        string bio
        string avatar_url
        datetime created_at
    }
    
    Post {
        int id PK
        int user_id FK
        string title
        text content
        string status
        datetime published_at
        datetime created_at
        datetime updated_at
    }
    
    Comment {
        int id PK
        int post_id FK
        int user_id FK
        text content
        datetime created_at
        datetime updated_at
    }
    
    Category {
        int id PK
        string name
        string slug
        text description
        datetime created_at
    }
    
    PostCategory {
        int post_id FK
        int category_id FK
        datetime created_at
    }
    
    User ||--o| Profile : "has one"
    User ||--o{ Post : "creates"
    User ||--o{ Comment : "writes"
    Post ||--o{ Comment : "has"
    Post }|--|| PostCategory : "belongs to"
    Category ||--o{ PostCategory : "contains"`;

export function MermaidEditor({ value, onChange, onRender, isRendering }: MermaidEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleLoadDefault = () => {
    onChange(defaultScript);
  };

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" />
            Mermaid ER Script
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLoadDefault}
              className="text-xs"
            >
              Load Example
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs"
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
            <Button
              onClick={onRender}
              disabled={isRendering}
              size="sm"
              className="text-xs"
            >
              {isRendering ? (
                <>
                  <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                  Rendering...
                </>
              ) : (
                'Render Diagram'
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter your Mermaid ER diagram script here..."
          className={`font-mono text-sm bg-code-bg text-code-text border-border resize-none transition-all duration-200 ${
            isExpanded ? 'min-h-96' : 'min-h-32'
          }`}
          style={{
            fontSize: '13px',
            lineHeight: '1.4',
          }}
        />
        <div className="mt-2 text-xs text-muted-foreground">
          Start with <code className="bg-muted px-1 rounded">erDiagram</code> and define your entities and relationships
        </div>
      </CardContent>
    </Card>
  );
}