# Blueprintic - README

## Project Overview

Blueprintic is a GenAI-powered web application for envisioning and drawing architecture to generating infrastructure as code. It enables users to architect, design, and implement Azure infrastructure services through a drag-and-drop interface. The application processes natural language prompts to generate infrastructure blueprints, which users can then customize and export as deployment templates.

## Key Features

- **Natural Language Processing**: Describe your infrastructure needs in plain English, and the AI will generate a visual blueprint
- **Drag-and-Drop Interface**: Easily customize your infrastructure design with an intuitive canvas
- **Azure Service Components**: Library of Azure services with visual representations and properties
- **Export Options**: Generate ARM templates, Terraform configurations, or Bicep files from your designs
- **Project Management**: Save and load your infrastructure designs (backend implementation)

## Project Structure

```
azure-infra-designer/
├── frontend/                 # React TypeScript frontend
│   ├── src/
│   │   ├── components/       # UI components
│   │   │   ├── Canvas/       # Drag-and-drop canvas components
│   │   │   └── Prompt/       # Prompt input components
│   │   ├── contexts/         # React contexts for state management
│   │   ├── pages/            # Application pages
│   │   └── App.tsx           # Main application component
│   └── package.json          # Frontend dependencies
├── backend/                  # Flask backend
│   ├── src/
│   │   ├── models/           # Database models
│   │   ├── routes/           # API endpoints
│   │   └── main.py           # Main Flask application
│   └── requirements.txt      # Backend dependencies
├── architecture.md           # Detailed architecture documentation
├── testing_report.md         # Testing and validation report
└── todo.md                   # Project task list
```

## Technology Stack

### Frontend
- React with TypeScript
- ReactFlow for the drag-and-drop canvas
- Tailwind CSS for styling
- Context API for state management

### Backend
- Flask for the API server
- SQLAlchemy for database ORM
- MySQL for data storage

## Getting Started

### Running the Frontend

```bash
cd frontend
pnpm install
pnpm run dev
```

### Running the Backend

```bash
cd backend
source venv/bin/activate
python src/main.py
```

## Usage Guide

1. **Enter a Prompt**: Describe your infrastructure needs in the prompt input area
   - Example: "I need a web application with a SQL database and blob storage for user uploads"

2. **Review Generated Blueprint**: The AI will generate a visual representation of your infrastructure on the canvas

3. **Customize Design**: Drag additional components onto the canvas or modify the generated design

4. **Export Template**: Choose an export format (ARM, Terraform, Bicep) to generate deployment templates

## Implementation Details

### GenAI Integration

The application currently uses a mock GenAI implementation that demonstrates the concept of translating natural language prompts into infrastructure blueprints. In a production environment, this would be replaced with a real GenAI service integration.

### Azure Service Components

The application includes a library of common Azure services, each with:
- Visual representation
- Service type categorization
- Basic properties
- Connection points

### Canvas Implementation

The drag-and-drop canvas is implemented using ReactFlow, providing:
- Component placement and connection
- Zoom and pan functionality
- Visual feedback
- Customizable node types

## Future Enhancements

1. **Real GenAI Integration**: Replace the mock implementation with a real GenAI service
2. **User Authentication**: Add user login and project management
3. **Detailed Property Editing**: Add UI for editing component properties
4. **Collaborative Editing**: Allow multiple users to work on the same design
5. **Cost Estimation**: Provide real-time cost estimates for the designed infrastructure

## Deployment

The application can be deployed as:
- Frontend: Static website hosting (e.g., Azure Static Web Apps)
- Backend: Containerized service (e.g., Azure App Service, AKS)
- Database: Managed database service (e.g., Azure Database for MySQL)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
