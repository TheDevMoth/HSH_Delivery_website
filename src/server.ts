import {newFirstameSchema, newLastameSchema, newMidinitSchema, newPasswordSchema, emailSchema, sanitizePassword, sanitizeEmail, phoneNumberSchema, newAddressSchema, validate} from './validation';
import session from 'express-session';
import nunjucks from 'nunjucks';
import db from './db';
import bcrypt from 'bcrypt';
import express, {Express, Response, Request} from 'express';
const app : Express = express();
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

declare module 'express-session' {
    export interface SessionData {
        email: string;
        user_id: number;
        employee: boolean;
    }
}

//** ROUTES **//
app.get('/', (req: Request, res: Response) => {
    if (req.session?.employee) {
        res.render('employee.html');
    } else if (req.session?.email) {
        res.render('user.html');
    } else {
        res.redirect('/login');
}});

app.get('/login', (req: Request, res: Response) => {
    if (req.session?.email) {
        res.redirect('/');
    } else {
        res.render('login.html');
    }
});

app.post('/login', sanitizePassword, sanitizeEmail, async (req: Request, res: Response) => {
    const { email, password } = req.body;
    // check if user exists
    const user = await db.getClientByEmail(email);
    if (user) {
        const match = await bcrypt.compare(password, user.password);
        if (match) {
            // initialize session
            req.session.email = user.email;
            req.session.user_id = user.user_id;
            req.session.employee = false;
            res.redirect('/');
            return;
        } else {
            res.status(400).send('Password does not match');
            return;
        }
    }
    // check if user is an employee
    const employee = await db.getEmployeeByEmail(email);
    if (employee) {
        const match = await bcrypt.compare(password, employee.password);
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

app.get('/logout', (req: Request, res: Response) => {
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

app.get('/register', (req: Request, res: Response) => {
    if (req.session?.email) {
        res.redirect('/');
    } else {
        res.render('register.html');
    }
});

app.post('/register', validate([newFirstameSchema, newLastameSchema, newMidinitSchema, newPasswordSchema, emailSchema, phoneNumberSchema, newAddressSchema]), 
        async (req: Request, res: Response) => {
    const {firstname, lastname, middle, email, password, phone, address} = req.body;
    console.log(req.body);
    
    const emailExists = await db.getClientByEmail(email);
    if (emailExists){
        res.render('register.html', {errors: [{msg:'Email already exists'}]});
    } else {
        const hash = await bcrypt.hash(password, 10);
        await db.addNewClient(firstname, lastname, middle, email, hash, phone, address);
        res.redirect('/login');
    }
});

//** employee Functions */
app.get('/employee', (req: Request, res: Response) => {
    if (!req.session?.employee) {
        res.redirect('/');
    }
    res.render('employee.html');
});

// package info
app.get('/employee/package', (req: Request, res: Response) => {
    if (!req.session?.employee) {
        res.redirect('/');
    }
    res.render('package.html');
});

app.get('/employee/package/add', (req: Request, res: Response) => {
    if (!req.session?.employee) {
        res.redirect('/');
    }
    res.render('addPackage.html');
});

app.post('/employee/package/add', async (req: Request, res: Response) => {
    if (!req.session?.employee) {
        res.redirect('/');
    }
    const {email, receiver_email, weight, width, height, depth, insurance_amount, delivery_date, category, value, centerId} = req.body;
    const recInfo = await db.getClientByEmail(receiver_email)["clientid"];
    const destination = recInfo["address"];
    const status = 'in transit';
    const last_modification = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const reciver_id = recInfo["clientid"];
    const senderId = await db.getClientByEmail(email)["clientid"];
    const national_id = req.session.user_id as number;

    await db.addPackage(weight, width, height, depth, insurance_amount, destination, delivery_date, category, status, value, last_modification, reciver_id,  centerId, senderId, national_id);
    res.render('packageAdded.html', {packageId: 1}); //todo somehow pass the package id
});


// listen on port 3000
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});