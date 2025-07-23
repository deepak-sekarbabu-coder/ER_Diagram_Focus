// This file contains a basic test for the ER diagram viewer requirements using the default Mermaid script.
// It is not a full automated test, but a manual test plan/checklist for validation.

/**
 * Test Plan: ER Diagram Viewer Requirements
 *
 * 1. Open the application. Confirm the Mermaid script input interface is visible.
 * 2. Paste the following Mermaid ER script (from the default example):
 *
 * erDiagram
 *     User {
 *         int id PK
 *         string username
 *         string email
 *         string password_hash
 *         datetime created_at
 *         datetime updated_at
 *     }
 *     Profile {
 *         int id PK
 *         int user_id FK
 *         string first_name
 *         string last_name
 *         string bio
 *         string avatar_url
 *         datetime created_at
 *     }
 *     Post {
 *         int id PK
 *         int user_id FK
 *         string title
 *         text content
 *         string status
 *         datetime published_at
 *         datetime created_at
 *         datetime updated_at
 *     }
 *     Comment {
 *         int id PK
 *         int post_id FK
 *         int user_id FK
 *         text content
 *         datetime created_at
 *         datetime updated_at
 *     }
 *     Category {
 *         int id PK
 *         string name
 *         string slug
 *         text description
 *         datetime created_at
 *     }
 *     PostCategory {
 *         int post_id FK
 *         int category_id FK
 *         datetime created_at
 *     }
 *     User ||--o| Profile : "has one"
 *     User ||--o{ Post : "creates"
 *     User ||--o{ Comment : "writes"
 *     Post ||--o{ Comment : "has"
 *     Post }|--|| PostCategory : "belongs to"
 *     Category ||--o{ PostCategory : "contains"
 *
 * 3. Click the "Render Diagram" button. Confirm the diagram appears.
 * 4. Click on the "User" table. Confirm only User and its directly connected tables (Profile, Post, Comment) are highlighted; others are de-emphasized.
 * 5. Confirm that only the relationships for "User" are displayed below the diagram.
 * 6. Click another table (e.g., Post). Confirm highlighting and relationship display update accordingly.
 * 7. Click "Clear Selection". Confirm all tables return to normal and all relationships are visible.
 * 8. Try with an edge-case script (e.g., a table with no relationships) and confirm correct behavior.
 */
