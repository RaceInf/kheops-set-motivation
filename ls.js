const fs = require('fs');
console.log('PUBLIC:', fs.readdirSync('public'));
console.log('ROOT:', fs.readdirSync('.'));
