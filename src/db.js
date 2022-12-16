const mysql = require("mysql");
const sql = require("sql-template-strings");
const connection = mysql.createConnection({
host: "localhost",
user: "root",
password: "password",
database: "hsh_schema"
});

//***** CLIENT *****//
async function getClientByEmail(email) {
    return new Promise((resolve, reject) => {
        connection.query(sql`SELECT * FROM client WHERE email = ${email}`, (err, result) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

async function getClientById(clientid){
    return new Promise((resolve, reject) => {
        connection.query(sql`SELECT * FROM client WHERE clientid = ${clientid}`, (err, result) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

async function addNewClient(email, password, firstname, minitial, lastname, phone, address){
    return new Promise((resolve, reject) => {
        connection.query(sql`INSERT INTO client (email, password, fname, minitial, lname, phone_number, address) VALUES (${email}, ${password}, ${firstname}, ${minitial}, ${lastname}, ${phone}, ${address})`, (err, result) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                resolve(result);
            }
        });
    });   
}

async function updateClient(clientId, firstname, minitial, lastname,
    phone, address, birthdate, email, password){
        return new Promise((resolve, reject) => {
            connection.query(sql`UPDATE client SET 
                ${(firstname) ? `firstname = ${firstname},` : ''}
                ${(minitial) ? `minitial = ${minitial},` : ''}
                ${(lastname) ? `lastname = ${lastname},` : ''}
                ${(phone) ? `phone_number = ${phone},` : ''}
                ${(address) ? `address = ${address},` : ''}
                ${(birthdate) ? `birthdate = ${birthdate},` : ''}
                ${(email) ? `email = ${email},` : ''}
                ${(password) ? `password = ${password},` : ''}
                ${(clientId) ? `clientid = ${clientId}` : ''} 
                WHERE clientid = ${clientId}`, (err, result) => {// client id is not changed it's there to fix the problem of the comma at the end of the query
            if (err) {
                console.log(err);
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

async function deleteClient(clientId){
    return new Promise((resolve, reject) => {
        connection.query(sql`DELETE FROM client WHERE clientid = ${clientId}`, (err, result) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

//***** EMPLOYEE *****//
async function getEmployeeByEmail(email){
    return new Promise((resolve, reject) => {
        connection.query(sql`SELECT * FROM employee WHERE email = ${email}`, (err, result) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

async function getEmployeeById(nationalId){
    return new Promise((resolve, reject) => {
        connection.query(sql`SELECT * FROM employee WHERE national_id = ${nationalId}`, (err, result) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

async function addNewEmployee(email, password, firstname, minitial, lastname, phone, address, nationalId, birthdate, salary, centerId){
    return new Promise((resolve, reject) => {
        connection.query(sql`INSERT INTO employee (email, password, fname, minitial, lname, phone_number, address, national_id, birthdate, salary, centerid) VALUES (${email}, ${password}, ${firstname}, ${minitial}, ${lastname}, ${phone}, ${address}, ${nationalId}, ${birthdate}, ${salary}, ${centerId})`, (err, result) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                resolve(result);
            }
        });
    });   
}

//***** CENTER *****//
async function getCenterById(centerId){
    return new Promise((resolve, reject) => {
        connection.query(sql`SELECT * FROM center WHERE centerid = ${centerId}`, (err, result) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

//***** PACKAGE *****//
async function addPackage(weight, width, height, depth, insurance_amount, destination, delivery_date, category, status, value, last_modification, reciver_id, centerId, senderId, national_id){
    return new Promise((resolve, reject) => {
        connection.query(sql`INSERT INTO package (weight, width, height, depth, insurance_amount, destination, delivery_date, category, status, value, last_modification, senderid, centerid, receiverid, employeeid) VALUES (${weight}, ${width}, ${height}, ${depth}, ${insurance_amount}, ${destination}, ${delivery_date}, ${category}, ${status}, ${value}, ${last_modification}, ${reciver_id}, ${centerId}, ${senderId}, ${national_id})`, (err, result) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                resolve(result);
            }
        });
    });   
}

async function getPackageByNumber(packageNo){
    return new Promise((resolve, reject) => {
        connection.query(sql`SELECT * FROM package WHERE packageno = ${packageNo}`, (err, result) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

async function getPackageByClient(clientId){
    return new Promise((resolve, reject) => {
        connection.query(sql`SELECT * FROM package WHERE clientid = ${clientId}`, (err, result) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

async function getAllPackages(){
    return new Promise((resolve, reject) => {
        connection.query(sql`SELECT * FROM package`, (err, result) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

async function getPackageByDate(startingDate, endingDate){
    return new Promise((resolve, reject) => {
        connection.query(sql`SELECT * FROM package WHERE delivery_date BETWEEN ${startingDate} AND ${endingDate}`, (err, result) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

async function deletePackage(packageNo){
    return new Promise((resolve, reject) => {
        connection.query(sql`DELETE FROM package WHERE packageno = ${packageNo}`, (err, result) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

async function updatePackage(packageNo, national_id, weight, width, height, depth, insurance_amount, 
                       destination, delivery_date, category, status, value, last_modification, 
                       reciver_id, centerId, senderId){
    return new Promise((resolve, reject) => {
        connection.query(sql`UPDATE package SET 
        ${(weight)? `weight = ${weight},`: ''}
        ${(width)? `width = ${width},`: ''}
        ${(height)? `height = ${height},`: ''}
        ${(depth)? `depth = ${depth},`: ''}
        ${(insurance_amount)? `insurance_amount = ${insurance_amount},`: ''}
        ${(destination)? `destination = ${destination},`: ''}
        ${(delivery_date)? `delivery_date = ${delivery_date},`: ''}
        ${(category)? `category = ${category},`: ''}
        ${(status)? `status = ${status},`: ''}
        ${(value)? `value = ${value},`: ''}
        ${(last_modification)? `last_modification = ${last_modification},`: ''}
        ${(reciver_id)? `clientid = ${reciver_id},`: ''}
        ${(centerId)? `centerid = ${centerId},`: ''}
        ${(senderId)? `received_clientid = ${senderId},`: ''}
        ${(national_id)? `national_id = ${national_id}`: ''}
        WHERE packageno = ${packageNo}`, (err, result) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                resolve(result);
            }
        });
    });   
}

async function tracePackage(packageNo){
    //TODO
}


module.exports = {
    addNewClient,
    getClientById,
    getClientByEmail,
    addNewEmployee,
    getEmployeeById,
    getEmployeeByEmail,
    getCenterById,
    addPackage,
    getPackageByNumber,
    getPackageByClient,
    getAllPackages,
    getPackageByDate,
    deletePackage,
    updatePackage,
    tracePackage,
    deleteClient,
    updateClient
}