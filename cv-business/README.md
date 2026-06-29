# CVPro Studio - Backend Implementation

Backend implementation for CVPro Studio website using Node.js, Express, PostgreSQL, and Prisma ORM.

## Tech Stack

- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + bcrypt
- **Validation**: Joi
- **File Upload**: Multer
- **Security**: Helmet, CORS, Rate Limiting

## Project Structure

```
cv-business/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.js                # Seed data
├── src/
│   ├── config/
│   │   └── database.js        # Prisma client
│   ├── controllers/          # Request handlers
│   │   ├── authController.js
│   │   ├── templateController.js
│   │   ├── orderController.js
│   │   ├── reviewController.js
│   │   ├── testimonialController.js
│   │   ├── galleryController.js
│   │   ├── teamController.js
│   │   └── settingsController.js
│   ├── services/             # Business logic
│   │   ├── authService.js
│   │   ├── templateService.js
│   │   ├── orderService.js
│   │   ├── reviewService.js
│   │   ├── testimonialService.js
│   │   ├── galleryService.js
│   │   ├── teamService.js
│   │   └── settingsService.js
│   ├── routes/               # API routes
│   │   ├── authRoutes.js
│   │   ├── templateRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── reviewRoutes.js
│   │   ├── testimonialRoutes.js
│   │   ├── galleryRoutes.js
│   │   ├── teamRoutes.js
│   │   └── settingsRoutes.js
│   ├── middleware/           # Express middleware
│   │   ├── auth.js           # JWT authentication
│   │   ├── errorHandler.js  # Error handling
│   │   └── notFound.js       # 404 handler
│   ├── utils/                # Utility functions
│   │   ├── response.js       # API response formatter
│   │   ├── jwt.js            # JWT utilities
│   │   └── bcrypt.js         # Password hashing
│   ├── validators/           # Input validation
│   │   └── authValidator.js
│   └── constants/            # Constants
│       └── constants.js
├── uploads/                  # File upload directory
├── js/
│   ├── api.js                # Frontend API client
│   └── script-data.js        # Dynamic data loading
├── server.js                 # Express server entry point
├── package.json
└── .env                     # Environment variables
```

## Setup Instructions

### 1. Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/cvpro_studio?schema=public"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV=development

# File Upload
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=5242880
```

### 4. Setup PostgreSQL Database

Create a PostgreSQL database named `cvpro_studio`:

```sql
CREATE DATABASE cvpro_studio;
```

### 5. Run Prisma Migrations

```bash
npm run prisma:migrate
```

Or use db push (for development):

```bash
npm run db:push
```

### 6. Seed Initial Data

```bash
npm run seed
```

This will create:
- Default admin user (email: admin@cvpro.com, password: admin123)
- Payment settings
- Sample templates
- Sample testimonials
- Sample team members
- Sample gallery items

### 7. Start the Server

Development mode with auto-reload:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)

### Templates

- `GET /api/templates` - Get all templates (with filters)
- `GET /api/templates/:id` - Get template by ID
- `POST /api/templates` - Create template (admin only)
- `PUT /api/templates/:id` - Update template (admin only)
- `DELETE /api/templates/:id` - Delete template (admin only)

### Orders

- `GET /api/orders` - Get all orders (admin only)
- `GET /api/orders/stats` - Get order statistics (admin only)
- `GET /api/orders/:id` - Get order by ID (admin only)
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status (admin only)
- `DELETE /api/orders/:id` - Delete order (admin only)

### Reviews

- `GET /api/reviews` - Get all reviews
- `GET /api/reviews/:id` - Get review by ID
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id/approve` - Approve review (admin only)
- `PUT /api/reviews/:id/reject` - Reject review (admin only)
- `DELETE /api/reviews/:id` - Delete review (admin only)

### Testimonials

- `GET /api/testimonials` - Get all testimonials
- `GET /api/testimonials/:id` - Get testimonial by ID
- `POST /api/testimonials` - Create testimonial (admin only)
- `PUT /api/testimonials/:id` - Update testimonial (admin only)
- `DELETE /api/testimonials/:id` - Delete testimonial (admin only)

### Gallery

- `GET /api/gallery` - Get all gallery items
- `GET /api/gallery/:id` - Get gallery item by ID
- `POST /api/gallery` - Create gallery item (admin only)
- `PUT /api/gallery/:id` - Update gallery item (admin only)
- `DELETE /api/gallery/:id` - Delete gallery item (admin only)

### Team Members

- `GET /api/team` - Get all team members
- `GET /api/team/:id` - Get team member by ID
- `POST /api/team` - Create team member (admin only)
- `PUT /api/team/:id` - Update team member (admin only)
- `DELETE /api/team/:id` - Delete team member (admin only)

### Settings

- `GET /api/settings` - Get all settings
- `GET /api/settings/:key` - Get setting by key
- `PUT /api/settings/:key` - Update setting (admin only)
- `DELETE /api/settings/:key` - Delete setting (admin only)

## Authentication

Protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Default Admin Credentials

- **Email**: admin@cvpro.com
- **Password**: admin123

**Important**: Change the default password after first login!

## Frontend Integration

The frontend has been updated to fetch data from the API:

- `js/api.js` - API client for making HTTP requests
- `js/script-data.js` - Dynamic data loading functions
- All HTML pages include the API scripts

## Database Schema

### Models

- **User** - Admin users
- **Template** - CV and portfolio templates
- **Order** - Customer orders
- **Review** - Template reviews
- **Testimonial** - Customer testimonials
- **Gallery** - Portfolio gallery items
- **TeamMember** - Team members
- **Setting** - Application settings

## Development

### Prisma Studio

View and edit database data:

```bash
npm run prisma:studio
```

### Generate Prisma Client

After schema changes:

```bash
npm run prisma:generate
```

### Reset Database

Warning: This will delete all data!

```bash
npm run db:reset
```

## Security Features

- JWT authentication for protected routes
- Password hashing with bcrypt
- Rate limiting (100 requests per 15 minutes)
- CORS enabled
- Helmet for security headers
- Input validation with Joi
- File upload size limits (5MB)
- File type validation

## Important Notes

- The frontend design, layout, colors, and animations remain unchanged
- All hardcoded data has been replaced with API calls
- The frontend falls back to hardcoded data if the API is unavailable
- File uploads are stored in the `uploads` directory
- Payment settings are loaded from the database

## Troubleshooting

### Database Connection Error

Ensure PostgreSQL is running and the DATABASE_URL in `.env` is correct.

### Port Already in Use

Change the PORT in `.env` or stop the process using port 3000.

### Prisma Client Not Generated

Run `npm run prisma:generate` after schema changes.

## License

ISC
