# Diamond Business Management ERP

A professional, full-stack Enterprise Resource Planning (ERP) system designed specifically for diamond business operations. This system streamlines everything from rough purchase and planning to polished inventory management and sales.

## 💎 Core Features

- **Dashboard**: Real-time analytics and business overview.
- **Rough Purchase & Inventory**: Track rough diamond inward entries and manage stock.
- **Planning & Production**: Manage the lifecycle of diamond manufacturing.
- **Yield & Loss Analysis**: Monitor production efficiency and weight loss.
- **Polished Inventory**: Manage your finished goods with detailed attributes.
- **Sales & CRM**: Handle customer inquiries, quotations, and transactions.
- **User Management**: 
  - **Signup & Authentication**: Secure JWT-based login and registration.
  - **Admin Panel**: Role-based access control (RBAC) to manage users (Add/Delete/Roles).
  - **Dynamic Headers**: User-specific profile information displayed across the app.

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend
- **Framework**: [Django 5.0+](https://www.djangoproject.com/)
- **API**: [Django Rest Framework (DRF)](https://www.django-rest-framework.org/)
- **Authentication**: [Simple JWT](https://django-rest-framework-simplejwt.readthedocs.io/)
- **Database**: SQLite (Development)

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.10+
- Node.js 18+
- npm or yarn

### 2. Backend Setup
```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate venv
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start server
python manage.py runserver
```

### 3. Frontend Setup
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`.

## 🔒 Security & Roles
The system implements strict **Role-Based Access Control (RBAC)**:
- **ADMIN**: Full access to the Admin Panel, user management, and all business data.
- **OFFICE/SALES/WORKER**: Restricted access based on department-specific needs.

## 📄 License
This project is for internal business management.
