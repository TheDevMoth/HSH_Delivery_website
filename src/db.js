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
    phone, address, email, password){
    if (!password){
        return new Promise((resolve, reject) => {
            connection.query(sql`UPDATE client SET 
                fname = ${firstname},
                minitial = ${minitial},
                lname = ${lastname},
                phone_number = ${phone},
                address = ${address},
                email = ${email}
                WHERE clientid = ${Number(clientId)}`, (err, result) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                resolve(result);
            }
        });    
    });
    } else {
        return new Promise((resolve, reject) => {
            connection.query(sql`UPDATE client SET 
                fname = ${firstname},
                minitial = ${minitial},
                lname = ${lastname},
                phone_number = ${phone},
                address = ${address},
                email = ${email},
                password = ${password}
                WHERE clientid = ${Number(clientId)}`, (err, result) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve(result);
                }
            });    
        });
    }
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
        connection.query(sql`SELECT * FROM retail_center WHERE centerid = ${centerId}`, (err, result) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

async function createCenter(type, address){
    return new Promise((resolve, reject) => {
        connection.query(sql`INSERT INTO location(location_type) VALUES ('station'); 
        INSERT INTO station(locationid, address) VALUES ((SELECT max(locationid) FROM location), ${address});`, (err, result) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                connection.query(sql`INSERT INTO retail_center (center_type, address) VALUES (${type}, ${address})`, (err, result) => {
                    if (err) {
                        console.log(err);
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            }
        });
    });   
}

//***** PACKAGE *****//
async function addPackage(packageNo, weight, width, height, depth, insurance_amount, destination, delivery_date, category, status, value, last_modification, reciver_id, centerId, senderId, national_id){
    return new Promise((resolve, reject) => {
        connection.query(sql`INSERT INTO package (packageno, weight, width, height, depth, insurance_amount, destination, delivery_date, category, status, value, last_modification, senderid, centerid, receiverid, employeeid) VALUES (${Number(packageNo)}, ${weight}, ${width}, ${height}, ${depth}, ${insurance_amount}, ${destination}, ${delivery_date}, ${category}, ${status}, ${value}, ${last_modification}, ${reciver_id}, ${centerId}, ${senderId}, ${national_id})`, (err, result) => {
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
        connection.query(sql`SELECT * FROM package WHERE packageno = ${Number(packageNo)}`, (err, result) => {
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
        connection.query(sql`DELETE FROM package WHERE packageno = ${Number(packageNo)}`, (err, result) => {
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
        weight = ${weight}, 
        width = ${width}, 
        height = ${height}, 
        depth = ${depth}, 
        insurance_amount = ${insurance_amount}, 
        destination = ${destination}, 
        delivery_date = ${delivery_date}, 
        category = ${category}, 
        status = ${status}, 
        value = ${value}, 
        last_modification = ${last_modification}, 
        senderid = ${reciver_id}, 
        centerid = ${centerId},
        receiverid = ${senderId},
        employeeid = ${national_id}
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

//** add transport event **//
async function addTransportEvent(scheduleNo){
    return new Promise((resolve, reject) => {
        connection.query(sql`INSERT INTO location (location_type) VALUES ("transport_event")`, (err, result) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                connection.query(sql`INSERT INTO transport_event (locationid, scheduleno) VALUES (LAST_INSERT_ID(), ${scheduleNo})`, (err, result) => {
                    if (err) {
                        console.log(err);
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            }
        });
    });
}

async function getIsInHistory(packageNo){
    return new Promise((resolve, reject) => {
        connection.query(sql`SELECT * FROM is_in WHERE packageno = ${Number(packageNo)}`, (err, result) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

async function getLocations(locationids){
    return new Promise((resolve, reject) => {
        connection.query(sql`SELECT * FROM location WHERE locationid IN (${locationids})`, (err, result) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

async function getTransportEvents(locationids){
    return new Promise((resolve, reject) => {
        connection.query(sql`SELECT * FROM transport_event WHERE locationid IN (${locationids})`, (err, result) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

async function getStations(locationids){
    return new Promise((resolve, reject) => {
        connection.query(sql`SELECT * FROM station WHERE locationid IN (${locationids})`, (err, result) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

//* Report Queries *//
async function getPackagesBetweenTwoDates(startingDate, endingDate, status){
    return new Promise((resolve, reject) => {
        connection.query(sql`SELECT * FROM package WHERE delivery_date BETWEEN ${startingDate} AND ${endingDate} AND status = ${status}`, (err, result) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

async function getNoOfTypesBetweenTwoDates(startingDate, endingDate){
    return new Promise((resolve, reject) => {
        connection.query(sql`SELECT category, COUNT(*) AS count FROM package WHERE delivery_date BETWEEN ${startingDate} AND ${endingDate} GROUP BY category`, (err, result) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

async function searchPackages(category, location, status){
    location = `%${location}%`;
    if (category && status){
        return new Promise((resolve, reject) => {
            connection.query(sql`SELECT p.*, l.location_type FROM package p NATURAL JOIN is_in i
                                    NATURAL JOIN location l 
                                    WHERE p.category = ${category}
                                    AND p.status = ${status}
                                    AND l.location_type LIKE ${location}`, (err, result) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    } else if (category){
        return new Promise((resolve, reject) => {
            connection.query(sql`SELECT * FROM package p NATURAL JOIN is_in i
                                    NATURAL JOIN location l 
                                    WHERE p.category = ${category}
                                    AND l.location_type LIKE ${location}`, (err, result) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    } else if (status){
        return new Promise((resolve, reject) => {
            connection.query(sql`SELECT * FROM package p NATURAL JOIN is_in i
                                    NATURAL JOIN location l 
                                    WHERE p.status = ${status}
                                    AND l.location_type LIKE ${location}`, (err, result) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    } else {
        return new Promise((resolve, reject) => {
            connection.query(sql`SELECT * FROM package p NATURAL JOIN is_in i
                                    NATURAL JOIN location l 
                                    WHERE l.location_type LIKE ${location}`, (err, result) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }
}

async function getPackagesSentOrReceivedByClient(clientid){
    return new Promise((resolve, reject) => {
        connection.query(sql`SELECT * FROM package WHERE senderid = ${clientid} OR receiverid = ${clientid}`, (err, result) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

async function deliverPackage(packageNo){
    const date = new Date().toISOString().slice(0, 19).replace('T', ' ');
    return new Promise((resolve, reject) => {
        connection.query(sql`UPDATE package SET status = 'delivered', delivery_date = ${date}, last_modification = ${date} WHERE packageno = ${packageNo}`, (err, result) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
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
    getIsInHistory,
    deleteClient,
    updateClient,
    createCenter,
    addTransportEvent,
    getLocations,
    getTransportEvents,
    getStations,
    getPackagesBetweenTwoDates,
    getNoOfTypesBetweenTwoDates,
    searchPackages,
    getPackagesSentOrReceivedByClient,
    deliverPackage

}