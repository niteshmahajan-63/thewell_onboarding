# The Well - Onboarding Application

A React + Vite application for client onboarding with PandaDoc integration for document signing.

## Features

- Multi-step onboarding flow
- PandaDoc integration for document signing
- Responsive design with Tailwind CSS
- Modern UI components

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Configure PandaDoc integration (see below)
4. Run the development server: `npm run dev`

## PandaDoc Integration Setup

The application integrates with PandaDoc for document signing. To set up:

### 1. PandaDoc Account Setup
- Sign up at [PandaDoc](https://www.pandadoc.com/)
- Create a workspace
- Generate an API key from Settings > Integrations > API

### 2. Document Template
- Create a document template in PandaDoc
- Include template variables: `{{client_name}}`, `{{client_email}}`, `{{agreement_date}}`
- Note the template ID

### 3. Environment Configuration
Copy `.env.example` to `.env.development` and fill in your PandaDoc credentials:

```bash
VITE_PANDADOC_API_KEY=your_api_key_here
VITE_PANDADOC_SANDBOX_MODE=true
```

### 4. Features
- ✅ Document creation from templates
- ✅ Popup signing flow
- ✅ Embedded document preview
- ✅ Real-time signing status updates
- ✅ Error handling and validation
- ✅ Sandbox/Production mode support

## Development

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
