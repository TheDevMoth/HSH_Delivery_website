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

function calculateCost(weight, height, width, length) {
    return Math.max((weight * 0.005), 5) + Math.max(height * 2, 2) + Math.max(width * 2, 2) + Math.max(length * 2, 2);
}

async function tracePackage(packageNo) {
    let packageHistory = await db.getIsInHistory(packageNo);
    let locationids = [];
    for (let i = 0; i < packageHistory.length; i++) {
        locationids.push(packageHistory[i]["locationid"]);
    }
    let locations = await db.getLocations(locationids);
    let transportEvents = await db.getTransportEvents(locationids);
    let stations = await db.getStations(locationids);
    let trace = [];
    for (let i = 0; i < packageHistory.length; i++) {
        let locationInfo = {}
        if (locations[i]["location_type"] == "Warehouse" || locations[i]["location_type"] == "Airport") {
            //for station in stations
            for (let j = 0; j < stations.length; j++) {
                if (stations[j]["locationid"] == locations[i]["locationid"]) {
                    locationInfo = stations[j]['address'];
                    break;
                }
            }
        } else { // for transport event
            for (let j = 0; j < transportEvents.length; j++) {
                if (transportEvents[j]["locationid"] == locations[i]["locationid"]) {
                    locationInfo = transportEvents[j]['scheduleno'];
                    break;
                }
            }
        }

        trace.push({
            locationid: packageHistory[i]["locationid"],
            date: packageHistory[i]["arrival_date"],
            location_type: locations[i]["location_type"],
            locationInfo: locationInfo
        });
    }
    return trace;
}

//** ROUTES **//
app.get('/', async (req, res) => {
    if (req.session?.employee) {
        res.render('employee.html');
    } else if (req.session?.email) {
        res.render('user.html');
    } else {
        res.redirect('/login');
}});

//** Login **//
app.get('/login', (req, res) => {
    if (req.session?.email) {
        res.redirect('/'); return;
    } else {
        res.render('login.html');
    }
});

app.post('/login', sanitizePassword, sanitizeEmail, async (req, res) => {
    const { email, password } = req.body;
    // check if user exists
    let user = await db.getClientByEmail(email);
    user = user[0];    
    if (user) {
        const match = bcrypt.compareSync(password, user.password);
        if (match) {
            // initialize session
            req.session.email = user.email;
            req.session.user_id = user.clientid;
            req.session.employee = false;
            res.redirect('/'); return;
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
            req.session.user_id = employee.national_id;
            req.session.employee = true;
            req.session.centerid = employee.centerid;
            res.redirect('/'); return;
            return;
        } else {
            res.status(400).render('login.html', { errors: ['Password does not match'], body: req.body });
            return;
        }
    }
    
    res.status(400).render('login.html', { errors: ['User does not exist'], body: req.body });
});

app.get('/logout', (req, res) => {
    if (!req.session?.email) {
        res.redirect('/'); return;
    }
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/login');
        }
    });
});

//** Register **//
app.get('/register', (req, res) => {
    if (req.session?.email) {
        res.redirect('/'); return;
    } else {
        res.render('register.html');
    }
});

app.post('/register', validate([newFirstameSchema, newLastameSchema, newMidinitSchema, newPasswordSchema, emailSchema, phoneNumberSchema, newAddressSchema]), 
        async (req, res) => {
    const {firstname, lastname, minitial, email, password, phone, address} = req.body;
    
    const emailExists = await db.getClientByEmail(email);
    
    if (emailExists[0]?.clientid){
        res.render('register.html', {errors: [{msg:'Email already exists'}]});
    } else {
        const hash = bcrypt.hashSync(password, 10);
        db.addNewClient(email, hash, firstname, minitial, lastname, phone, address);
        res.redirect('/login');
    }
});

//** employee Functions **//
app.get('/employee', (req, res) => {
    if (!req.session?.employee) {
        res.redirect('/'); return;
    }
    res.render('employee.html');
});

//* Add transport events and stations *//
app.get('/employee/transport', (req, res) => {
    if (!req.session?.employee) {
        res.redirect('/'); return;
    }
    res.render('transport.html');
});

//* Package add/edit/remove *//
// get package options
app.get('/employee/package', (req, res) => {
    if (!req.session?.employee) {
        res.redirect('/'); return;
    }
    res.render('package.html');
});

// add package form
app.get('/employee/package/add', (req, res) => {
    if (!req.session?.employee) {
        res.redirect('/'); return;
    }
    res.render('package_add.html');
});

app.post('/employee/package/add', async (req, res) => {
    if (!req.session?.employee) {
        res.redirect('/'); return;
    }
    const {email, receiver_email, weight, width, height, depth, insurance_amount, delivery_date, category, value} = req.body;
    let recInfo = await db.getClientByEmail(receiver_email);
    recInfo = recInfo[0];
        
    const destination = recInfo["address"];
    const status = 'in transit';
    const last_modification = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const receiver_id = recInfo["clientid"];
    let senderId = await db.getClientByEmail(email);
    senderId = senderId[0]["clientid"];
    const national_id = req.session.user_id;

    //generate unique package id that is a long number
    let packageId = 0;
    while (packageId == 0) {
        console.log("generating package id");
        packageId = Math.floor(Math.random() * 1000000000);
        try {
            await db.addPackage(packageId, weight, width, height, depth, insurance_amount, destination, delivery_date, category, status, value, last_modification, receiver_id,  req.session.centerid, senderId, req.session.user_id);
            console.log("package added");
        } catch (error) {
            console.log(error);
            packageId = 0;
        }
    }
    let cost = calculateCost(weight, height, width, depth);
    res.render('success.html', {header:"Package added succussfully", body:`The package number is ${packageId}\nThe package delivery cost is $${cost}`}); 
});

// edit package form
app.get('/employee/package/edit/:packageNo', async (req, res) => {
    if (!req.session?.employee) {
        res.redirect('/'); return;
    }
    let packageInfo = await db.getPackageByNumber(req.params.packageNo);
    packageInfo = packageInfo[0];
    res.render('package_add.html', {editForm:true, packageInfo: packageInfo});
});

// edit package
app.post('/employee/package/edit/:packageNo', async (req, res) => {
    if (!req.session?.employee) {
        res.redirect('/'); return;
    }
    const {email, receiver_email, weight, width, height, depth, insurance_amount, destination, delivery_date, category, value, status} = req.body;
    const packageNo = req.params.packageNo;
    
    let recInfo = await db.getClientByEmail(receiver_email);
    recInfo = recInfo[0];
    const last_modification = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const receiver_id = recInfo["clientid"];
    let senderId = await db.getClientByEmail(email);
    senderId = senderId[0]["clientid"];
    await db.updatePackage(packageNo, req.session.user_id, weight, width, height, depth, insurance_amount, destination, delivery_date, category, status, value, last_modification, receiver_id, req.session.centerid, senderId);
    let cost = calculateCost(weight, height, width, depth);
    res.render('success.html', {header:"Package added succussfully", body:`The new package delivery cost is $${cost}`});
});

// remove package
app.get('/employee/package/remove/:packageNo', async (req, res) => {
    if (!req.session?.employee) {
        res.redirect('/'); return;
    }
    const packageNo = req.params.packageNo;
    try {
        await db.deletePackage(packageNo);
        res.render('success.html', {header:"Package removed succussfully", body:''});
    } catch (error) {
        res.render('success.html', {header:"Package not removed", body:'Package does not exist'}); // "success" (these are not ment as string quotes they- you know what nvm)
    }
});

// package find
app.get('/employee/package/find', (req, res) => {
    if (!req.session?.employee) {
        res.redirect('/'); return;
    }
    res.render('package_find.html');
});

app.post('/employee/package/find', async (req, res) => {
    if (!req.session?.employee) {
        res.redirect('/'); return;
    }
    const {packageID} = req.body;
    let packageInfo = await db.getPackageByNumber(packageID);
    packageInfo = packageInfo[0];

    let center = await db.getCenterById(packageInfo["centerid"]);
    let receiver = await db.getClientById(packageInfo["receiverid"]);
    let sender = await db.getClientById(packageInfo["senderid"]);
    packageInfo.pickupAddress = center[0]["address"];
    packageInfo.centerType = center[0]["center_type"];
    packageInfo.deliveryAddress = receiver[0]["address"];
    packageInfo.deliveryCost = calculateCost(packageInfo["weight"], packageInfo["height"], packageInfo["width"], packageInfo["depth"]);

    let emailtemplate = `mailto:${receiver[0]["email"]}, ${sender[0]["email"]}?subject=Package%20${packageID}&body=Hello%20${receiver[0]["fname"]}%20${receiver[0]["lname"]},%0D%0A%0D%0AYour%20package%20${packageID}%20is%20in%20our%20${center[0]["center_type"]}%20center%20at%20${center[0]["address"]}.%20It%20will%20be%20delivered%20to%20you%20at%20${receiver[0]["address"]}%20on%20${packageInfo["delivery_date"]}.%20The%20delivery%20cost%20is%20$${packageInfo["deliveryCost"]}.%20%0D%0A%0D%0AWith%20regards%20from%0D%0A${sender[0]["firstname"]}%20${sender[0]["lastname"]}`;

    res.render('package_find.html', {package: packageInfo, emailtemplate: emailtemplate});
});

// package deliver
app.get('/employee/package/delivered/:packageNo', async (req, res) => {
    if (!req.session?.employee) {
        res.redirect('/'); return;
    }
    const packageNo = req.params.packageNo;
    await db.deliverPackage(packageNo);
    res.render('success.html', {header:"Package delivered succussfully", body:''});
});

app.get('/employee/package/trace/:packageNo', async (req, res) => {
    if (!req.session?.employee) {
        res.redirect('/'); return;
    }
    const packageNo = req.params.packageNo;
    
    const trace = await tracePackage(packageNo);
    console.log(trace);
    res.render('package_trace_employee.html', {traces: trace, packageNo: packageNo});
});

//* user control functions *//
app.get('/employee/customers', (req, res) => {
    if (!req.session?.employee) {
        res.redirect('/'); return;
    }
    res.render('customers.html');
});

app.post('/employee/customers', async (req, res) => {
    if (!req.session?.employee) {
        res.redirect('/'); return;
    }
    const {email} = req.body;
    let clientInfo = await db.getClientByEmail(email);
    clientInfo = clientInfo[0];
    res.render('customers.html', {client: clientInfo});
});

app.get('/employee/customers/edit/:clientid', async (req, res) => {
    if (!req.session?.employee) {
        res.redirect('/'); return;
    }
    const clientid = req.params.clientid;
    let clientInfo = await db.getClientById(clientid);
    clientInfo = clientInfo[0];
    res.render('update_info.html', {client: clientInfo});
});

app.post('/employee/customers/edit/:clientid', async (req, res) => {
    if (!req.session?.employee) {
        res.redirect('/'); return;
    }
    const clientid = req.params.clientid;
    const {fname, lname, minitial, email, address, phone} = req.body;
    await db.updateClient(clientid, fname, minitial, lname, phone, address, email);
    res.render('success.html', {header:"Client info updated succussfully", body:''});
});

app.get('/employee/customers/remove/:clientid', async (req, res) => {
    if (!req.session?.employee) {
        res.redirect('/'); return;
    }
    const clientid = req.params.clientid;
    await db.deleteClient(clientid);
    res.render('success.html', {header:"Client removed succussfully", body:''});
});

//* Reports *//
app.get('/employee/reports', (req, res) => {
    if (!req.session?.employee) {
        res.redirect('/'); return;
    }
    res.render('reports.html');
});

app.get('/employee/reports/payments', async (req, res) => {
    if (!req.session?.employee) {
        res.redirect('/'); return;
    }
    let packages = await db.getAllPackages();
    for (let i = 0; i < packages.length; i++) {
        packages[i]["cost"] = calculateCost(packages[i]["weight"], packages[i]["height"], packages[i]["width"], packages[i]["depth"]);        
    }
    res.render('reports_payments.html', {packages: packages});
});

app.get('/employee/reports/betweendates', (req, res) => {
    if (!req.session?.employee) {
        res.redirect('/'); return;
    }
    res.render('reports_betweendates.html');
});

app.post('/employee/reports/betweendates', async (req, res) => {
    if (!req.session?.employee) {
        res.redirect('/'); return;
    }
    const {start_date, end_date, status} = req.body;
    let packages = await db.getPackagesBetweenTwoDates(start_date, end_date, status);
    for (let i = 0; i < packages.length; i++) {
        packages[i]["cost"] = calculateCost(packages[i]["weight"], packages[i]["height"], packages[i]["width"], packages[i]["depth"]);
    }
    res.render('reports_betweendates.html', {packages: packages});
});

app.get('/employee/reports/types', (req, res) => {
    if (!req.session?.employee) {
        res.redirect('/'); return;
    }
    res.render('reports_types.html');
});

app.post('/employee/reports/types', async (req, res) => {
    if (!req.session?.employee) {
        res.redirect('/'); return;
    }
    const {start_date, end_date} = req.body;
    let packages = await db.getNoOfTypesBetweenTwoDates(start_date, end_date);
    res.render('reports_types.html', {packages: packages});
});

app.get('/employee/reports/info', (req, res) => {
    if (!req.session?.employee) {
        res.redirect('/'); return;
    }
    res.render('reports_info.html');
});

app.post('/employee/reports/info', async (req, res) => {
    if (!req.session?.employee) {
        res.redirect('/'); return;
    }
    const {category, location, status} = req.body;
    let packages = await db.searchPackages(category, location, status);
    for (let i = 0; i < packages.length; i++) {
        packages[i]["cost"] = calculateCost(packages[i]["weight"], packages[i]["height"], packages[i]["width"], packages[i]["depth"]);
    }
    console.log(packages);
    res.render('reports_info.html', {packages: packages});
});

app.get('/employee/reports/client', (req, res) => {
    if (!req.session?.employee) {
        res.redirect('/'); return;
    }
    res.render('reports_client.html');
});

app.post('/employee/reports/client', async (req, res) => {
    if (!req.session?.employee) {
        res.redirect('/'); return;
    }
    const {email} = req.body;
    let clientInfo = await db.getClientByEmail(email);
    clientInfo = clientInfo[0];
    clientid = clientInfo["clientid"];
    let packages = await db.getPackagesSentOrReceivedByClient(clientid);
    for (let i = 0; i < packages.length; i++) {
        packages[i]["cost"] = calculateCost(packages[i]["weight"], packages[i]["height"], packages[i]["width"], packages[i]["depth"]);
    }
    res.render('reports_client.html', {packages: packages});
});




//** client Functions **//


// listen on port 3000
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});




