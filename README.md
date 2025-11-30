# SynerGene Web Application
 A web application for predicting and analyzing drug combination synergy, built with Next.js, PostgreSQL and Clerk authentication. It provides researchers with an interface to predict synergy scores and manage experimental data. The tech stack includes Next.js 14 with TypeScript for the frontend, Clerk for authentication, and Neon PostgreSQL with Prisma ORM for database management.

## Database Schema
The application uses several main models:
- **User**: Authentication and user data
- **Experiment**: Drug combination experiments by user
- **Prediction**: ML model predictions
- **Drug** & **CellLine**: Reference data

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Clerk account for authentication

### Installation
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd synergene
   ```
   
2. **Install dependencies**
   ```bash
   npm install
   ```
   
3. **Environment Configuration**
   Create a `.env` file with:
   ```env
   DATABASE_URL="your_postgresql_connection_string"
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
   CLERK_SECRET_KEY="your_clerk_secret_key"
   NEXT_PUBLIC_SYNERGY_API_URL="https://synergene-api.onrender.com"
   ```
   
4. **Database Setup**
   ```bash
   npx prisma generate
   npx prisma db push
   npm run db:seed
   ```

5. **Load Synergy Data** 
   ```bash
   npm run load:synergy-data
   ```

6. **Run Development Server**
   ```bash
   npm run dev
   ```
   

