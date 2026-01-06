# Inventory Management System (IMS)

A full-stack inventory management system with role-based access control, barcode scanning, low stock alerts, and comprehensive reporting features.

## Features

### Admin Features

- **Product Management**: Add, edit, delete, and track products
- **Inventory Logs**: View detailed logs of all inventory actions (sale, restock, update, added)
- **User Management**: Create and manage staff/admin users
- **Reports & Analytics**:
  - Stock distribution by category
  - Low stock trends with status badges
  - Activity over time tracking
  - Export data (Excel/PDF)
- **Low Stock Alerts**: Email notifications and in-app toast alerts when stock falls below reorder levels

### Staff Features

- **Barcode Scanner**: Real-time camera-based barcode scanning with manual entry fallback
- **Quick Inventory Updates**: Add/remove stock directly from scanner interface
- **Recent Scans History**: Track last 5 scanned items

### Shared Features

- **Authentication**: Secure JWT-based authentication with persistent sessions
- **Role-Based Access**: Different permissions for admin and staff
- **Real-time Notifications**: Toast notifications for operations and alerts
- **Responsive Design**: Modern, clean UI with consistent black gradient theme

## Tech Stack

### Frontend

- **React** 19.1.0 - UI framework
- **React Router** - Client-side routing
- **React Toastify** - Toast notifications
- **@zxing/browser** - Barcode scanning
- **Chart.js** & **react-chartjs-2** - Data visualization

### Backend

- **Node.js** with **Express.js** - REST API server
- **PostgreSQL** - Relational database
- **JWT** - Authentication tokens
- **Nodemailer** - Email notifications
- **Cookie-based sessions** - Persistent authentication

### Additional Tools

- **bwip-js** - Barcode generation
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment configuration

## Prerequisites

- **Node.js** (v14 or higher)
- **PostgreSQL** (v12 or higher)
- **npm** or **yarn**

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd inventory-management-system
```

### 2. Database Setup

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE ims;

# Exit psql
\q

# Run database schema with sample data
psql -U postgres -d ims -f db/dbtables.sql
```

**Note:** The `dbtables.sql` file includes sample products (iPhones, Samsung phones, laptops, etc.). After running the schema, you'll need to generate barcodes for these products and add them to the database. There is a "generateSampleBarcodes.js" file for the given database so the user can generate sample barcodes if needed.

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

**Required .env variables:**

```env
PORT=port_number

DB_USER=user
DB_PASSWORD=password
DB_HOST=host
DB_PORT=port
DB_NAME=nameofdb

JWT_SECRET=secret_jwt_key

EMAIL_USER=email_for_smtp
EMAIL_PASS=password_for_email
SMTP_HOST=host_for_smtp
SMTP_PORT=port_for_smtp

COOKIE_NAME=tokeen_name

BARCODE_DIR=where_barcodes_are_saved/
```

### 4. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file (optional)
echo "REACT_APP_API_BASE_URL=http://localhost:8000/api" > .env
```

## Running the Application

### Generate Barcodes for Sample Products

Before starting the application, generate barcode images for the sample products:
You MUST configure your .env file to include a path for where the images need to be saved.

```bash
cd backend

# Generate barcodes for products that don't have them
node generateSampleBarcodes.js

# Or force regenerate for all products
node generateSampleBarcodes.js --force

# To see what would happen without making changes
node generateSampleBarcodes.js --dry-run
```

This will:

- Create barcode values in format `INV-{SKU}` (e.g., `INV-AP-PH-IP16`)
- Generate PNG barcode images in the `backend/barcodes/` directory
- Update the database with barcode values

**Example barcodes generated:**

- `INV-AP-PH-IP16` - Apple iPhone 16
- `INV-AP-LP-MBA-M4` - Apple Macbook Air M4
- `INV-SS-PH-S25ULT` - Samsung Galaxy S25 Ultra

### Start Backend Server

```bash
cd backend
node server.js
```

Server runs on **http://localhost:8000**

### Start Frontend Development Server

```bash
cd frontend
npm start
```

App runs on **http://localhost:3000**

## Default Login Credentials

**Admin Users:**

- Email: `admin1@imsasar.com` / Password: `Admin@123`
- Email: `admin2@imsasar.com` / Password: `Admin@123`

**Staff User:**

- Email: `staff1@imsasar.com` / Password: `staff01`

_Note: Update these in production!_

## Project Structure

```
inventory-management-system/
├── backend/
│   ├── app.js                 # Express app configuration
│   ├── server.js              # Server entry point
│   ├── controllers/           # Business logic
│   │   ├── authControllers.js
│   │   ├── productControllers.js
│   │   ├── logControllers.js
│   │   ├── reportControllers.js
│   │   └── userController.js
│   ├── routes/                # API routes
│   ├── middleware/            # Auth & role middleware
│   ├── utils/                 # Utilities (mailer, barcode)
│   └── db/                    # Database connection
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/        # React components
│       │   ├── ProductsPage.js
│       │   ├── AdminInventoryLogsView.js
│       │   ├── ReportsPage.js
│       │   ├── StaffBarcodeScannerView.js
│       │   └── Modals/
│       ├── utils/             # API utilities
│       └── App.js             # Main app component
└── db/
    └── dbtables.sql           # Database schema
```

## Key Functionalities

### Product Management

- **Add Product**: Admin can add products with SKU, name, category, quantity, brand, reorder level
- **Update Product**: Edit product details or update quantities
- **Delete Product**: Remove products (cascades to logs)
- **Custom Categories**: Create custom categories on-the-fly

### Inventory Tracking

- **Action Logging**: Tracks sale, restock, update, and added actions
- **User Attribution**: Links all actions to specific users
- **Timestamp Tracking**: Records exact time of each action
- **Filter & Search**: Filter logs by action type, limit display, delete logs

### Low Stock Alerts

- **Email Notifications**: Sent to all admin users when stock drops below reorder level
- **Toast Notifications**: In-app orange warning toasts with product details
- **Suggested Order Quantity**: Calculated based on 30-day average sales × 5-day lead time
- **Cooldown Protection**: 60-minute cooldown prevents duplicate emails

### Barcode Scanner (Staff)

- **Camera Scanning**: Real-time barcode detection using device camera
- **Manual Entry**: Fallback option to type barcodes manually
- **Quick Actions**: Add/remove inventory directly from scan results
- **Recent Activity**: Shows last 5 scanned items with timestamps

### Reports & Analytics

- **Stock Distribution**: View products by category
- **Low Stock Trends**: Products at or below reorder level with status badges
- **Activity Over Time**: Daily log counts with date filtering (7/30/90 days)
- **Data Export**: Export products and logs to Excel or PDF

## Testing

### Test Low Stock Email Alerts

1. **Ensure backend is running** with correct .env configuration
2. **Login as admin**
3. **Find or create a product** with quantity below reorder level
4. **Make a sale** that triggers low stock:
   ```
   - Click "Update Quantity"
   - Select "Sale"
   - Enter amount to drop below reorder level
   ```
5. **Check backend console** for:
   ```
   [MAIL:SENT] Message sent to admin@example.com: <message-id>
   Low stock email queued for: admin@example.com
   ```
6. **Check admin email inbox** for alert with product details

### Test Toast Notifications

- **Add/Edit Product**: Should show no success toast (only errors)
- **Low Stock**: Orange warning toast appears when quantity drops below reorder level
- **Error Operations**: Red error toasts with descriptive messages

### Test Barcode Scanner

1. **Login as staff**
2. **Navigate to Barcode Scanner**
3. **Grant camera permissions** when prompted
4. **Scan a barcode** or enter manually (format: INV-SKU001)
5. **Verify product details** appear
6. **Test quantity updates** (Add/Remove buttons)

## Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt with salt rounds
- **Role-Based Access Control**: Middleware enforces admin/staff permissions
- **HTTP-Only Cookies**: Prevents XSS attacks
- **CORS Protection**: Configured for specific origins
- **SQL Injection Prevention**: Parameterized queries

## Email Configuration

### Using Gmail SMTP

1. **Enable 2FA** on your Gmail account
2. **Generate App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Create new app password
   - Use this in `.env` as `EMAIL_PASS`
3. **Update .env**:
   ```env
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_16_char_app_password
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   ```

### Using Other Email Providers

Update SMTP settings in `.env` accordingly:

- **Outlook**: smtp-mail.outlook.com:587
- **Yahoo**: smtp.mail.yahoo.com:587
- **Custom SMTP**: Your provider's settings

## Troubleshooting

### Backend won't start

```bash
# Check if port 8000 is in use
lsof -ti:8000 | xargs kill -9

# Check database connection
psql -U postgres -d ims -c "SELECT 1;"
```

### Frontend compilation errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Email not sending

- Verify Gmail App Password is correct (not regular password)
- Check firewall isn't blocking port 465
- View backend console for `[MAIL:ERROR]` messages
- Test credentials:
  ```bash
  node -e "const nodemailer=require('nodemailer');nodemailer.createTransport({host:'smtp.gmail.com',port:465,secure:true,auth:{user:'your@gmail.com',pass:'app_password'}}).verify().then(console.log).catch(console.error);"
  ```

### Barcode scanner not working

- Grant camera permissions in browser
- Use HTTPS in production (required for camera access)
- Use manual entry as fallback
- Check browser console for errors

## Database Schema Highlights

### Products Table

- `sku` (PK): Unique product identifier
- `name`, `category`, `brand`: Product details
- `quantity`: Current stock level
- `reorder_level`: Threshold for low stock alerts
- `barcode`: For scanner integration
- `imageURL`, `expiry`: Additional metadata

### Inventory Logs Table

- `id` (PK): Auto-increment log ID
- `sku` (FK): References products table (ON DELETE CASCADE)
- `action`: sale | restock | update | added
- `amount`: Quantity changed
- `user_id` (FK): User who performed action
- `created_at`: Timestamp

### Users Table

- `user_id` (PK): Auto-increment user ID
- `username`, `email`: User credentials
- `password_hashed`: Bcrypt hashed password
- `user_role`: admin | staff

## Design System

- **Primary Color**: Black gradient (#1a1a1a to #000000)
- **Accent Colors**:
  - Success: Green (#51cf66)
  - Warning: Orange (#ffa500)
  - Error: Red (#ff6b6b)
- **Typography**: System fonts with -0.5px letter spacing for headers
- **Border Radius**: 12px for cards, 10px for buttons
- **Shadows**: Multi-layered with rgba(0,0,0) for depth

## License

This project is licensed under the MIT License.

## 👥 Contributors

- Sanjhanaa Anantharaman
- Aditi Thakre
- Gampala Aishwarya
- Ruchira Patil

## Future Enhancements

- [ ] Multi-warehouse support
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Bulk import/export via CSV
- [ ] Automated reordering system
- [ ] Supplier management
- [ ] QR code generation
- [ ] Audit trail reports
- [ ] Real-time collaboration features
