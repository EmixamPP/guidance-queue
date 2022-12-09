let socket = null;
let current = document.getElementById('add');

function showWait() {
    current.classList.add("d-none");
    current = document.getElementById('wait');
    current.classList.remove("d-none");
}

function showEnd() {
    current.classList.add("d-none");
    current = document.getElementById('end');
    current.classList.remove("d-none");
}

function showAdd() {
    current.classList.add("d-none");
    current = document.getElementById('add');
    current.classList.remove("d-none");
}

function ping() {
    if (socket != null) 
        setTimeout(() => socket.send(JSON.stringify({"action": "ping"})), 60000); // send ping in 60 sec
}

function openTicket() {
    const pc = document.getElementById('pc').value;
    if (pc != "") {
        if (socket != null) socket.close();
    
        socket = new WebSocket('wss://guidance.emixam.be/server?pc=' + pc);

        socket.onopen = (e) => {
            showWait();
            ping(); // start ping-pong
        }
        
        socket.onmessage = (e) => {
        msg = JSON.parse(e.data);
        
        if (msg["action"] == "pong") {
            ping();
        }
    }

        socket.onclose = (e) => {
            if (e.code === 3000) // choosed 
                showEnd();
            else // close for other reason
                showAdd();
            socket = null;
        }
        
        socket.onerror = (e) => {
            socket.close();
            socket = null;
            alert("Une erreur est survenue");
        }
    }
}

function closeTicket() {
    socket.close();
}

function needTicket() {
    showAdd();
}