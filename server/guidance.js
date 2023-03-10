import { WebSocketServer } from 'ws';
import { parse } from 'querystring';

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin";

const wss = new WebSocketServer({ port: 8080 });

const students = {};
const admins = []

function sendNewToAdmins(pc) {
    admins.forEach((admin) => {
        admin.send(JSON.stringify({ "action": "new", "pc": pc }));
    });
}

function sendAllStudents(ws) {
    ws.send(JSON.stringify({ "action": "news", "pcs": Object.keys(students) }));
}

function sendRemoveToAdmins(pc) {
    admins.forEach((admin) => {
        admin.send(JSON.stringify({ "action": "remove", "pc": pc }));
    });
}

function studentConnection(ws, query) {
    let pc = query["pc"];
    if (pc in students)
        pc = pc + "_bis";
    students[pc] = ws;

    ws.on('close', () => {
        sendRemoveToAdmins(pc);
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
            Object.values(students).forEach((student) => {
                student.close();
            });

        } else if (msg["action"] == "take") { // close specific student conn
            students[msg["pc"]].close(3000, "choosed");

        } else if (msg["action"] == "ping") { // respond pong
            ws.send(JSON.stringify({ action: "pong" }));
        }
    });

    ws.on('close', () => {
        admins.splice(admins.indexOf(ws), 1);
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
