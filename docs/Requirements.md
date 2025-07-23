# ER Diagram Focused Mermaid Viewer Requirements

Develop an **interactive Mermaid diagram viewer** focused exclusively on **Entity Relationship (ER) diagrams**. The application should feature:

## Features

- **Initial Mermaid Script Input:**
  - Upon loading, the application should provide an interface for users to input their Mermaid ER diagram script.

- **Dynamic Rendering:**
  - The application should render the Mermaid script into an interactive diagram.

- **Selective Highlighting:**
  - When a user selects a specific table within the diagram, only the tables directly connected to the selected table should be highlighted.
  - All other tables should appear de-emphasized or grayed out.

- **Focused Relationship Display:**
  - Upon selecting a table, the viewer should exclusively display the relationships of the selected table, derived from the complete Mermaid script input by the user.