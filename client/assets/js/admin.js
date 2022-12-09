let socket = null;
const queue = document.getElementById('queue');

if ('Notification' in window && Notification.permission === 'default') 
    Notification.requestPermission();

function notifyNoMoreEmptyQueue(){  
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

function ping() {
    if (socket != null) 
        setTimeout(() => socket.send(JSON.stringify({"action": "ping"})), 60000); // send ping in 60 sec
}

function admin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (socket != null) socket.close();
    socket  = new WebSocket('wss://guidance.emixam.be/server?username=' + username + "&password=" + password);
    
    socket.onopen = (e) => {
        document.getElementById('login').classList.add("d-none");
        document.getElementById('panel').classList.remove("d-none");
        ping(); // start ping-pong
    }
   
    socket.onclose = (e) => {
        socket = null;
        queue.innerHTML = "";
        document.getElementById('panel').classList.add("d-none");
        document.getElementById('login').classList.remove("d-none");
    }
    
    socket.onmessage = (e) => {
        msg = JSON.parse(e.data);
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
        } else if (msg["action"] == "pong") {
            ping();
        }
    }
    
    socket.onerror = (e) => {
        socket.close();
        socket = null;
        queue.innerHTML = "";
        alert("Erreur de connexion avec le serveur");
    }
}

function flush() {
    if (socket != null)
        socket.send(JSON.stringify({"action": "flush"}));
}

function take(pc) {
    if (socket != null)
        socket.send(JSON.stringify({"action": "take", "pc": pc}));
}