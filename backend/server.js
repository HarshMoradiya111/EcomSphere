require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

// Connect to Database
connectDB();

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`🚀 EcomSphere Enterprise running on http://localhost:${PORT}`);
  console.log(`📊 Admin Panel: http://localhost:${PORT}/admin/login`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`❌ Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});
