//Might reuse this in later projects

function time24(){
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

function log(message){
    console.log(`[LOG ${time24()}] ${message}`);
}

function status(message){
    console.log(`[STATUS ${time24()}] ${message}`);
}

function fatalError(message){
    throw new Error(`[FATAL ERROR ${time24()}] ${message}`);
}
function error(message){
    console.error(`[ERROR ${time24()}] ${message}`);
}

function warn(message){
    console.warn(`[WARNING ${time24()}] ${message}`)
}

module.exports = { log, status, error, fatalError, warn };