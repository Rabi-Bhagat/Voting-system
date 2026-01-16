require('dotenv').config();
const uri = process.env.MONGODB_URI;
console.log('Loaded URI:', uri);
console.log('Type:', typeof uri);
console.log('Length:', uri ? uri.length : 0);
