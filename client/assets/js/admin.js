var socket = null;
const queue = document.getElementById('queue');

if ('Notification' in window && Notification.permission === 'default')
    Notification.requestPermission();

function showLogin() {
    document.getElementById('panel').classList.add("d-none");
    document.getElementById('login').classList.remove("d-none");
}

function showPanel() {
    document.getElementById('login').classList.add("d-none");
    document.getElementById('panel').classList.remove("d-none");
}

function notifyNoMoreEmptyQueue() {
    if (Notification.permission === 'granted') {
        const notif = new Notification("Le file n'est plus vide !", {
            icon: '/assets/img/favicon-32x32.png',
            tag: 'notifyNoMoreEmptyQueue',
            renotify: true,
            requireInteraction: true
        });
    }
}

function createTicketCard(pc) {
    const col = document.createElement('div');
    col.className = 'col justify-center col-12';
    col.setAttribute('id', pc);
    queue.appendChild(col);

    const card = document.createElement('div');
    card.className = 'card ticket-card';
    col.appendChild(card);

    const body = document.createElement('div');
    body.className = 'card-body children-margin-bottom';
    card.appendChild(body);

    const title = document.createElement('p');
    title.innerHTML = pc;
    body.appendChild(title);

    const div = document.createElement('div');
    div.className = 'justify-end';
    body.appendChild(div);

    const button = document.createElement('button');
    button.className = 'btn btn-primary';
    button.setAttribute('onclick', 'take("' + pc + '")');
    button.innerHTML = "Prendre";
    div.appendChild(button);
}

function admin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (socket != null) socket.close();
    socket = new WebSocket('wss://guidance.domain.be/server?username=' + username + "&password=" + password);

    socket.onopen = (e) => {
        getWakeLock();
        showPanel();
        ping(); // start ping-pong
    }

    socket.onclose = (e) => {
        releaseWakeLock();
        socket = null;
        queue.innerHTML = "";
        showLogin();
    }

    socket.onmessage = (event) => {
        msg = JSON.parse(event.data);
        const queue = document.getElementById('queue');

        if (msg["action"] == "remove") {
            const pc = document.getElementById(msg["pc"]);
            document.getElementById("queue").removeChild(pc);
            document.getElementById('waiting').innerHTML = queue.childElementCount;
        } else if (msg["action"] == "new") {
            if (queue.children.length == 0)
                notifyNoMoreEmptyQueue();
            const pc = msg["pc"];
            createTicketCard(pc);
            document.getElementById('waiting').innerHTML = queue.childElementCount;
        } else if (msg["action"] == "news") {
            const pcs = msg["pcs"];
            pcs.forEach((pc) => createTicketCard(pc));
            document.getElementById('waiting').innerHTML = queue.childElementCount;
        } else if (msg["action"] == "pong") {
            ping();
        }
    }

    socket.onerror = (err) => {
        console.error(err);
        alert("Erreur de connexion avec le serveur");
        socket.close();
    }
}

function flush() {
    if (socket != null)
        socket.send(JSON.stringify({ "action": "flush" }));
}

function take(pc) {
    if (socket != null)
        socket.send(JSON.stringify({ "action": "take", "pc": pc }));
}