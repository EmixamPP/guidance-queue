import { WebSocketServer } from 'ws';
import { parse } from 'querystring';


const ADMIN_USERNAME = process.env.DB_USERNAME;
const ADMIN_PASSWORD = process.env.DB_PASSWORD;


const wss = new WebSocketServer({ port: 8080 });

const students = {};
let students_pc_queue = []; // to keep in fifo the ticket when they are all sent
let admins = [];

function sendNewToAdmins(pc) {
    admins.forEach((admin) => {
        admin.send(JSON.stringify({ "action": "new", "pc": pc }));
    });
}

function sendAllStudents(ws) {
    ws.send(JSON.stringify({ "action": "news", "pcs": students_pc_queue }));
}

function sendRemoveToAdmins(pc) {
    admins.forEach((admin) => {
        admin.send(JSON.stringify({ "action": "remove", "pc": pc }));
    });
}

function studentConnection(ws, query) {
    let pc = query["pc"];
    if (students_pc_queue.includes(pc))
        pc = pc + "_bis";
    students_pc_queue.push(pc);
    students[pc] = ws;

    ws.on('close', () => {
        sendRemoveToAdmins(pc);
        students_pc_queue = students_pc_queue.filter(e => e !== pc);
        delete students[pc];
    });

    ws.on('message', (data) => {
        const msg = JSON.parse(data);

        if (msg["action"] == "ping") { // respond pong
            ws.send(JSON.stringify({ action: "pong" }));
        }
    });

    sendNewToAdmins(pc);
}

function adminConnection(ws) {
    admins.push(ws);

    ws.on('message', (data) => {
        const msg = JSON.parse(data);
        if (msg["action"] == "flush") { // close all students conn
            students_pc_queue.forEach((pc) => {
                students[pc].close();
            });

        } else if (msg["action"] == "take") { // close specific student conn
            students[msg["pc"]].close(3000, "choosed");

        } else if (msg["action"] == "ping") { // respond pong
            ws.send(JSON.stringify({ action: "pong" }));
        }
    });

    ws.on('close', () => {
        admins = admins.filter(e => e !== ws);
    });

    sendAllStudents(ws);
}

wss.on('connection', (ws, request) => {
    const query = parse(request["url"].substring(8));

    if (query["pc"] !== undefined) {
        studentConnection(ws, query);
    } else if (query["username"] === ADMIN_USERNAME && query["password"] === ADMIN_PASSWORD) {
        adminConnection(ws);
    } else {
        // reject connection
        ws.close();
        return;
    }

    ws.on('error', () => {
        ws.close();
    });
});
