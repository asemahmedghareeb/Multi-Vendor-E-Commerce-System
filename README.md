# Multi-Vendor E-commerce System

A full-featured, scalable e-commerce platform built with NestJS, GraphQL, and TypeORM. This system supports multiple vendors, product management, order processing, payments, and more.

## 🚀 Features

- **Multi-vendor Support**: Vendors can manage their own stores and products
- **Product Management**: Categories, inventory, and product variations
- **Shopping Cart**: Persistent cart functionality
- **Order Processing**: Complete order lifecycle management
- **Payment Integration**: Secure payment processing
- **User Authentication**: JWT-based authentication with role-based access
- **Reviews & Ratings**: Product reviews and vendor ratings
- **Wishlists**: Save favorite products
- **Notifications**: Email notifications
- **Analytics**: Sales and performance metrics
- **Multi-language Support**: Internationalization ready

## 🛠 Tech Stack

- **Backend**: NestJS
- **API**: GraphQL
- **Database**: PostgreSQL (with TypeORM)
- **Authentication**: JWT, Passport.js
- **Caching**: Redis
- **Background Jobs**: BullMQ
- **Containerization**: Docker
- **Testing**: Jest

## 📦 Prerequisites

- Node.js (v18+)
- npm or yarn
- Docker and Docker Compose
- PostgreSQL
- Redis

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone [https://github.com/yourusername/multi-vendor-ecommerce.git](https://github.com/yourusername/multi-vendor-ecommerce.git)
   cd multi-vendor-ecommerce



npm install
# or
yarn



# Development
npm run up:dev

# Production
npm run up:prod

# Migrations
npm run migration:run

# Development
npm run start:dev

# Production
npm run start:prod

src/
├── analytics/        # Analytics and reporting
├── auth/             # Authentication and authorization
├── cart/             # Shopping cart functionality
├── categories/       # Product categories
├── common/           # Shared modules and utilities
├── dataLoaders/      # GraphQL data loaders
├── emails/           # Email templates and services
├── notifications/    # Notification system
├── orders/           # Order management
├── payments/         # Payment processing
├── products/         # Product management
├── reviews/          # Product and vendor reviews
├── users/            # User management
├── vendors/          # Vendor management
└── wallet/           # Wallet and transactions
