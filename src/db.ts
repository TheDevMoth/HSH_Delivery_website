import mysql from "mysql";
import sql from "sql-template-strings"

function connection() {
  return mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "hsh_schema"
    });
}

//***** CLIENT *****//
function getClientByEmail(email: string): any {
    const connect = connection();
    connect.query(sql`SELECT * FROM client WHERE email = '${email}'`, (err, result) => {
        if (err) {
            console.log(err);
            return;
        } else {
            return result;
        }
    });
    
}

function getClientById(clientid: number): any {
    const connect = connection();
    connect.query(sql`SELECT * FROM client WHERE clientid = '${clientid}'`, (err, result) => {
        if (err) {
            console.log(err);
            return;
        } else {
            return result;
        }
    });
}

function addNewClient(email: string, password: string, firstname: string, minitial:string, lastname: string, phone: string, address: string): any {
    const connect = connection();
    connect.query(sql`INSERT INTO client (email, password, firstname, minitial, lastname, phone_number, address) VALUES ('${email}', '${password}', '${firstname}', '${minitial}', '${lastname}', '${phone}', '${address}')`, (err, result) => {
        if (err) {
            console.log(err);
            return;
        } else {
            return result;
        }
    });   
}

function updateClient(clientId: number, firstname?: string, minitial?: string, lastname?: string,
    phone?: string, address?: string, birthdate?: string, email?: string, password?: string): any {
    const connect = connection();
    connect.query(sql`UPDATE client SET 
            ${(firstname) ? `firstname = ${firstname},` : ''}
            ${(minitial) ? `minitial = ${minitial},` : ''}
            ${(lastname) ? `lastname = ${lastname},` : ''}
            ${(phone) ? `phone_number = ${phone},` : ''}
            ${(address) ? `address = ${address},` : ''}
            ${(birthdate) ? `birthdate = ${birthdate},` : ''}
            ${(email) ? `email = ${email},` : ''}
            ${(password) ? `password = ${password},` : ''}
            ${(clientId) ? `clientid = ${clientId}` : ''} 
            WHERE clientid = '${clientId}'`, (err, result) => {// client id is not changed it's there to fix the problem of the comma at the end of the query
        if (err) {
            console.log(err);
            return;
        } else {
            return result;
        }
    });
}

function deleteClient(clientId: number): any {
    const connect = connection();
    connect.query(sql`DELETE FROM client WHERE clientid = '${clientId}'`, (err, result) => {
        if (err) {
            console.log(err);
            return;
        } else {
            return result;
        }
    });
}

//***** EMPLOYEE *****//
function getEmployeeByEmail(email: string): any {
    const connect = connection();
    connect.query(sql`SELECT * FROM employee WHERE email = '${email}'`, (err, result) => {
        if (err) {
            console.log(err);
            return;
        } else {
            return result;
        }
    });
}

function getEmployeeById(nationalId: number): any {
    const connect = connection();
    connect.query(sql`SELECT * FROM employee WHERE national_id = '${nationalId}'`, (err, result) => {
        if (err) {
            console.log(err);
            return;
        } else {
            return result;
        }
    });
}

function addNewEmployee(email: string, password: string, firstname: string, minitial:string, lastname: string, phone: string, address: string, nationalId: number, birthdate: string, salary: number, centerId: number): any {
    const connect = connection();
    connect.query(sql`INSERT INTO employee (email, password, firstname, minitial, lastname, phone_number, address, national_id, birthdate, salary, centerid) VALUES ('${email}', '${password}', '${firstname}', '${minitial}', '${lastname}', '${phone}', '${address}', '${nationalId}', '${birthdate}', '${salary}', '${centerId}')`, (err, result) => {
        if (err) {
            console.log(err);
            return;
        } else {
            return result;
        }
    });   
}

//***** CENTER *****//
function getCenterById(centerId: number): any {
    const connect = connection();
    connect.query(sql`SELECT * FROM center WHERE centerid = '${centerId}'`, (err, result) => {
        if (err) {
            console.log(err);
            return;
        } else {
            return result;
        }
    });
}

//***** PACKAGE *****//
function addPackage(weight:number, width:number, height:number, depth:number, insurance_amount:number, destination:string, delivery_date:string, category:string, status:string, value:number, last_modification:string, reciver_id:number, centerId:number, senderId:number, national_id:number): any {
    const connect = connection();
    connect.query(sql`INSERT INTO package (weight, width, height, depth, insurance_amount, destination, delivery_date, category, status, value, last_modification, clientid, centerid, received_clientid, national_id) VALUES ('${weight}', '${width}', '${height}', '${depth}', '${insurance_amount}', '${destination}', '${delivery_date}', '${category}', '${status}', '${value}', '${last_modification}', '${reciver_id}', '${centerId}', '${senderId}', '${national_id}')`, (err, result) => {
        if (err) {
            console.log(err);
            return;
        } else {
            return result;
        }
    });   
}

function getPackageByNumber(packageNo: number): any {
    const connect = connection();
    connect.query(sql`SELECT * FROM package WHERE packageno = '${packageNo}'`, (err, result) => {
        if (err) {
            console.log(err);
            return;
        } else {
            return result;
        }
    });
}

function getPackageByClient(clientId: number): any {
    const connect = connection();
    connect.query(sql`SELECT * FROM package WHERE clientid = '${clientId}'`, (err, result) => {
        if (err) {
            console.log(err);
            return;
        } else {
            return result;
        }
    });
}

function getAllPackages(): any {
    const connect = connection();
    connect.query(sql`SELECT * FROM package`, (err, result) => {
        if (err) {
            console.log(err);
            return;
        } else {
            return result;
        }
    });
}

function getPackageByDate(startingDate: string, endingDate: string): any {
    const connect = connection();
    connect.query(sql`SELECT * FROM package WHERE delivery_date BETWEEN '${startingDate}' AND '${endingDate}'`, (err, result) => {
        if (err) {
            console.log(err);
            return;
        } else {
            return result;
        }
    });
}

function deletePackage(packageNo: number): any {
    const connect = connection();
    connect.query(sql`DELETE FROM package WHERE packageno = '${packageNo}'`, (err, result) => {
        if (err) {
            console.log(err);
            return;
        } else {
            return result;
        }
    });
}

function updatePackage(packageNo: number, national_id:number, weight?:number, width?:number, height?:number, depth?:number, insurance_amount?:number, 
                       destination?:string, delivery_date?:string, category?:string, status?:string, value?:number, last_modification?:string, 
                       reciver_id?:number, centerId?:number, senderId?:number): any {
    const connect = connection();
    connect.query(sql`UPDATE package SET 
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
    WHERE packageno = '${packageNo}'`, (err, result) => {
        if (err) {
            console.log(err);
            return;
        } else {
            return result;
        }
    });   
}

function tracePackage(packageNo: number): any {
    //TODO
}


export default {
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