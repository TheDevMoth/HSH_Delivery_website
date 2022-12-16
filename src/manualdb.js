const db = require('./db');
const bcrypt = require('bcrypt');
// createCenter('Main center', 'Riyadh, alrajhi st').then((result) => {
//     console.log(result);
// }).catch((err) => {
//     console.log(err);
// });

// addNewEmployee('mohammed@gmail.com', bcrypt.hashSync('1234qwer%', 10), 'Mohammed', 'A', 'Abushwarib', '0555283943', '1234 Main St', '123456789', '1999-01-01', '100000', '1').then((result) => {
//     console.log(result);
// }).catch((err) => {
//     console.log(err);
// });

db.addTransportEvent(111).then((result) => {
    console.log(result);
}).catch((err) => {
    console.log(err);
});