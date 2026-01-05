const bcrypt = require('bcryptjs');
const pool = require('./config/')
bcrypt.hash('staff01', 10).then(console.log);
bcrypt.hash('staff02', 10).then(console.log);
bcrypt.hash('staff03', 10).then(console.log);
bcrypt.hash('admin01', 10).then(console.log);
bcrypt.hash('admin02', 10).then(console.log);

