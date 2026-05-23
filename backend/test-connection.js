// Quick test script to check MySQL connection
require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('🔍 Testing MySQL connection...\n');
  console.log('Configuration:');
  console.log(`  Host: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`  User: ${process.env.DB_USER || 'root'}`);
  console.log(`  Database: ${process.env.DB_NAME || 'perfume_paradise'}`);
  console.log(`  Password: ${process.env.DB_PASSWORD ? '***' : 'NOT SET'}\n`);

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'perfume_paradise'
    });

    console.log('✅ Successfully connected to MySQL!');
    
    // Test query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Database query successful!');
    
    await connection.end();
    console.log('\n🎉 Everything is working! You can start the server with: npm run dev');
  } catch (error) {
    console.error('\n❌ Connection failed!\n');
    console.error('Error details:', error.message);
    console.error('\n💡 Common issues:');
    console.error('  1. MySQL is not running');
    console.error('  2. Wrong password in .env file');
    console.error('  3. Database "perfume_paradise" does not exist');
    console.error('  4. .env file is missing or incorrect');
    console.error('\n📖 See MYSQL_SETUP_GUIDE.md for help');
    process.exit(1);
  }
}

testConnection();

