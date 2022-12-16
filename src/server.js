const { newFirstameSchema, newLastameSchema, newMidinitSchema, newPasswordSchema, emailSchema, sanitizePassword, sanitizeEmail, phoneNumberSchema, newAddressSchema, validate } = require('./validation');
const session = require('express-session');
const nunjucks = require('nunjucks');
const db = require('./db');
const bcrypt = require('bcrypt');
const express = require('express');
const app = express();
const port = 3000;

// configure nunjucks templates
nunjucks.configure('views', {express: app, autoescape: true});

// middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(session({
	secret: '89u7564hr4yt6bv43nejc46dwsx',
	resave: false,
	saveUninitialized: false,
	cookie: {
		maxAge: 1000 * 60 * 60 // 1 hour
	}
}));


//** ROUTES **//
app.get('/', async ( req, res) => {
    if (req.session?.employee) {
        res.render('employee.html');
    } else if (req.session?.email) {
        res.render('user.html');
    } else {
        res.redirect('/login');
}});

app.get('/login', ( req, res) => {
    if (req.session?.email) {
        res.redirect('/');
    } else {
        res.render('login.html');
    }
});

app.post('/login', sanitizePassword, sanitizeEmail, async ( req, res) => {
    const { email, password } = req.body;
    // check if user exists
    let user = await db.getClientByEmail(email);
    user = user[0];
    console.log(user);
    
    if (user) {
        const match = bcrypt.compareSync(password, user.password);
        if (match) {
            // initialize session
            req.session.email = user.email;
            req.session.user_id = user.user_id;
            req.session.employee = false;
            res.redirect('/');
            return;
        } else {
            res.status(400).render('login.html', { errors: ['Password does not match'], body: req.body });
            return;
        }
    }
    // check if user is an employee
    let employee = await db.getEmployeeByEmail(email);
    employee = employee[0];
    if (employee) {
        const match = bcrypt.compareSync(password, employee.password);
        if (match) {
            // initialize session
            req.session.email = employee.email;
            req.session.user_id = employee.user_id;
            req.session.employee = true;
            res.redirect('/');
        } else {
            res.status(400).render('login.html', { errors: ['Password does not match'], body: req.body });
            return;
        }
    }
    
    res.status(400).render('login.html', { errors: ['User does not exist'], body: req.body });
});

app.get('/logout', ( req, res) => {
    if (!req.session?.email) {
        res.redirect('/');
    }
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/login');
        }
    });
});

app.get('/register', ( req, res) => {
    if (req.session?.email) {
        res.redirect('/');
    } else {
        res.render('register.html');
    }
});

app.post('/register', validate([newFirstameSchema, newLastameSchema, newMidinitSchema, newPasswordSchema, emailSchema, phoneNumberSchema, newAddressSchema]), 
        async ( req, res) => {
    const {firstname, lastname, middle, email, password, phone, address} = req.body;
    console.log(req.body);
    
    const emailExists = await db.getClientByEmail(email, connection);
    if (emailExists){
        res.render('register.html', {errors: [{msg:'Email already exists'}]});
    } else {
        const hash = bcrypt.hashSync(password, 10);
        db.addNewClient(email, hash, firstname, middle, lastname, phone, address);
        res.redirect('/login');
    }
});

//** employee Functions */
app.get('/employee', ( req, res) => {
    if (!req.session?.employee) {
        res.redirect('/');
    }
    res.render('employee.html');
});

// package info
app.get('/employee/package', ( req, res) => {
    if (!req.session?.employee) {
        res.redirect('/');
    }
    res.render('package.html');
});

app.get('/employee/package/add', ( req, res) => {
    if (!req.session?.employee) {
        res.redirect('/');
    }
    res.render('addPackage.html');
});

app.post('/employee/package/add', async ( req, res) => {
    if (!req.session?.employee) {
        res.redirect('/');
    }
    const {email, receiver_email, weight, width, height, depth, insurance_amount, delivery_date, category, value, centerId} = req.body;
    const recInfo = await db.getClientByEmail(receiver_email, connection);
    console.log(recInfo);
    
    const destination = recInfo["address"];
    const status = 'in transit';
    const last_modification = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const receiver_id = recInfo["clientid"];
    const senderId = await db.getClientByEmail(email, connection);
    const national_id = req.session.user_id;

    db.addPackage(weight, width, height, depth, insurance_amount, destination, delivery_date, category, status, value, last_modification, receiver_id,  centerId, senderId, national_id);
    res.render('packageAdded.html', {packageId: 1}); //todo somehow pass the package id
});


// listen on port 3000
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});




