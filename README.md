# Sprout Track

A Next.js application for tracking baby activities, milestones, and development.

## Tech Stack

- Next.js with App Router
- TypeScript
- Prisma with SQLite (`/prisma`)
- TailwindCSS for styling
- React Query for data fetching
- React Hook Form for form handling

## Getting Started

### Prerequisites

- Git (to clone the repository)
- Bash shell (for running the setup script)

### Quick Setup (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/Oak-and-Sprout/sprout-track.git
cd sprout-track
```

2. Give execute permissions to the scripts folder:
```bash
chmod +x scripts/*.sh
```

3. Run the setup script:
```bash
./scripts/setup.sh
```

This setup script will:
- Check if Node.js is installed and install it if needed
- Install all dependencies
- Generate the Prisma client
- Run database migrations
- Seed the database with initial data (default PIN: 111222)
- Build the Next.js application

After setup completes, you can run the application in development or production mode as instructed in the setup output.

### Manual Setup (Alternative)

If you prefer to set up manually or the setup script doesn't work for your environment:

1. Ensure Node.js is installed (v22 recommended)

2. Install dependencies:
```bash
npm install
```

3. Generate Prisma client:
```bash
npm run prisma:generate
```

4. Run database migrations:
```bash
npm run prisma:migrate
```

5. Seed the database:
```bash
npm run prisma:seed
```

6. Build the application:
```bash
npm run build
```

7. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Default Security PIN

The default security PIN after setup is: **111222**

## Initial Application Setup

After installation, when you first access the application, you'll be guided through a setup wizard that helps you configure the essential settings for your Sprout Track instance.

### Setup Wizard

The application includes a built-in Setup Wizard (`src/components/SetupWizard`) that walks you through the following steps:

1. **Family Setup**
   - Enter your family name

2. **Security Setup**
   - Choose between a system-wide PIN or individual caretaker PINs
   - For system-wide PIN: Set a 6-10 digit PIN
   - For individual caretakers: Add caretakers with their own login IDs and PINs
     - First caretaker must be an admin
     - Each caretaker needs a 2-character login ID and 6-10 digit PIN

3. **Baby Setup**
   - Enter baby's information (first name, last name, birth date, gender)
   - Configure warning times for feeding and diaper changes
   - Default warning times: Feed (3 hours), Diaper (2 hours)

The Setup Wizard ensures your application is properly configured with the necessary security settings and initial data before you start tracking your baby's activities.

## Project Structure

- `/app` - Next.js app router pages and components
- `/prisma` - SQLite database and Prisma schema
- `/src/components` - Reusable UI components
- `/src/lib` - Utility functions and shared logic
- `/scripts` - Utility scripts for setup, deployment, and maintenance

## Available Scripts

### Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Database Scripts

- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:seed` - Seed the database with initial data
- `npm run prisma:studio` - Open Prisma Studio to view/edit database

### Utility Scripts

- `./scripts/setup.sh` - Complete setup process (Node.js check, dependencies, database, build)
- `./scripts/backup.sh` - Create a backup of the application
- `./scripts/update.sh` - Update application (git pull, prisma operations, build)
- `./scripts/deployment.sh` - Full deployment process (backup + update)
- `./scripts/service.sh {start|stop|restart|status}` - Manage the application service

## Deployment

### Prerequisites

1. Configure the service name in `.env`:
```bash
SERVICE_NAME="baby-tracker"
```

2. Create and configure the systemd service
3. Ensure user has sudo privileges for service management
4. Make deployment scripts executable:
```bash
chmod +x Scripts/*.sh
```

### Deployment Scripts

The following deployment scripts are available in the `Scripts` directory:

- `service.sh {start|stop|restart|status}` - Manage the application service
- `backup.sh` - Create a backup of the application
- `update.sh` - Update application (git pull, prisma operations, build)
- `deployment.sh` - Full deployment process (backup + update)

### Running a Deployment

For a full deployment process:
```bash
./scripts/deployment.sh
```

This will:
1. Create a backup of the current application
2. Pull latest changes from git
3. Run Prisma operations
4. Build the application
5. Manage service stop/start as needed

Each script can also be run independently for specific operations.
