# Boka Business

A modern, full-featured business management platform for salons and barbershops. Built with React, TypeScript, and Supabase, Boka Business provides an intuitive interface for managing appointments, staff schedules, and customer bookings.

## Features

### 📅 Appointment Management
- **Upcoming & Past Views**: Organize appointments into upcoming and historical tabs with intelligent time-based categorization
- **Real-time Updates**: Live appointment tracking with automatic status updates
- **Smart Filtering**: Appointments automatically move to "Past" once their time has elapsed
- **Read-only History**: Past appointments are visually distinguished and protected from accidental deletion

### 👥 Staff Management
- **Working Hours**: Configure weekly schedules with flexible time slots
- **Annual Leave**: Track and manage staff vacation time with date range selection
- **Multi-staff Support**: Manage multiple staff members with role-based permissions

### 🎨 Modern UI/UX
- **Responsive Design**: Fully responsive interface that works seamlessly on desktop and mobile
- **Dark Mode Support**: Built-in dark mode with system preference detection
- **Accessible Components**: WCAG-compliant UI components built with Radix UI
- **Visual Feedback**: Clear status indicators, badges, and interactive elements

### 🔐 Authentication & Security
- **Supabase Auth**: Secure authentication with email/password and social providers
- **Protected Routes**: Role-based access control for different user types
- **Password Reset**: Self-service password recovery flow

### 💳 Payment Integration
- **Stripe Integration**: Secure online payment processing
- **Pay in Store**: Flexible payment options for customers
- **Payment Status Tracking**: Clear indicators for paid and pending payments

### 📧 Notifications
- **Email Confirmations**: Automated booking confirmations via Nodemailer

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Stripe account (for payment processing)
- Netlify account (for serverless functions)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/JahanU/boka-business.git
   cd boka-businesses
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory with the following variables:
    ```env
    # Supabase
    VITE_SUPABASE_URL=
    VITE_SUPABASE_ANON_KEY=

    # Email (GMAIL)
    GMAIL_USER=
    GMAIL_APP_PASSWORD=
    ```

4. **Set up the database**
   
   Run the migration script in your Supabase SQL editor:
   ```bash
   cat supabase-migration.sql
   ```

5. **Configure Supabase Auth**
   
   In Supabase Auth URL Configuration, set the Site URL to your deployed app origin and add the password reset redirect URL (e.g., `https://boka-business.netlify.app/reset-password`).

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Run Netlify functions locally** (in a separate terminal)
   ```bash
   npx netlify dev
   ```

### Available Scripts

- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Built With

### Core Technologies
- **[React 19](https://react.dev/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Vite](https://vite.dev/)** - Build tool and dev server
- **[React Router](https://reactrouter.com/)** - Client-side routing

### Backend & Services
- **[Supabase](https://supabase.com/)** - Database and authentication
- **[Netlify Functions](https://www.netlify.com/products/functions/)** - Serverless backend
- **[Stripe](https://stripe.com/)** - Payment processing
- **[Nodemailer](https://nodemailer.com/)** - Email notifications

### UI & Styling
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives
- **[Lucide React](https://lucide.dev/)** - Icon library
- **[date-fns](https://date-fns.org/)** - Date manipulation
- **[react-day-picker](https://react-day-picker.js.org/)** - Date picker component

### Testing
- **[Vitest](https://vitest.dev/)** - Unit testing framework
- **[Testing Library](https://testing-library.com/)** - Component testing utilities
- **[jsdom](https://github.com/jsdom/jsdom)** - DOM implementation for testing

## Design System

### Color Palette
The application uses a semantic color system with CSS variables for theming:
- **Primary**: Brand colors for CTAs and highlights
- **Secondary**: Supporting colors for less prominent elements
- **Muted**: Subtle backgrounds and borders
- **Accent**: Special highlights and notifications
- **Destructive**: Error states and dangerous actions

### Typography
- **Font Family**: System font stack for optimal performance
- **Font Sizes**: Responsive scale from `text-xs` to `text-3xl`
- **Font Weights**: Regular (400), Medium (500), Semibold (600), Bold (700)

### Components
All UI components follow a consistent design pattern:
- **Variants**: Multiple visual styles (default, outline, ghost, etc.)
- **Sizes**: Small, medium, and large options
- **States**: Hover, active, disabled, and focus states
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support

### Spacing & Layout
- **Container Max Width**: 5xl (1024px) for optimal readability
- **Spacing Scale**: Consistent 4px-based spacing system
- **Responsive Breakpoints**: Mobile-first approach with sm, md, lg, xl breakpoints

## Configuration

### Supabase Schema
The database includes the following main tables:
- `businesses` - Business information
- `staff` - Staff members and their roles
- `staff_availability` - Working hours and annual leave
- `appointments` - Customer bookings and appointments
- `services` - Available services and pricing

### Netlify Functions
Serverless functions are located in `/netlify/functions/`:
- `save-appointment.ts` - Create new appointments
- `create-checkout-session.ts` - Initialize Stripe payment
- `verify-payment.ts` - Confirm payment and finalize booking
- `send-confirmation-email.ts` - Send booking confirmations

### Testing Configuration
Tests are configured with:
- **Coverage Threshold**: Aiming for high coverage across the codebase
- **Test Environment**: jsdom for DOM testing
- **Setup Files**: `setupTests.ts` for global test configuration

## Project Structure

```
boka-businesses/
├── src/
│   ├── components/       # Reusable UI components
│   ├── contexts/         # React context providers
│   ├── layouts/          # Page layout components
│   ├── pages/            # Route pages
│   ├── services/         # API service layers
│   ├── types/            # TypeScript type definitions
│   └── lib/              # Utility functions
├── netlify/
│   └── functions/        # Serverless backend functions
├── public/               # Static assets
└── tests/                # Test files
```

## Contributing

Contributions are welcome! Please follow these guidelines:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Acknowledgments

- Built with modern web technologies and best practices
- Inspired by the needs of small business owners in the beauty industry
- Designed for simplicity, efficiency, and user experience
