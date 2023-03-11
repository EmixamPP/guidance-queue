var socket = null;
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

function openTicket() {
    const pc = document.getElementById('pc').value;
    if (pc != "") {
        if (socket != null) socket.close();
        socket = new WebSocket('wss://guidance.emixam.be/server?pc=' + pc);

        socket.onopen = (e) => {
            getWakeLock();
            showWait();
            ping(); // start ping-pong
        }

        socket.onmessage = (event) => {
            msg = JSON.parse(event.data);

            if (msg["action"] == "pong")
                ping();
        }

        socket.onclose = (event) => {
            releaseWakeLock();
            socket = null;
            if (event.code === 3000) // choosed 
                showEnd();
            else // close for other reason
                showAdd();
        }

        socket.onerror = (err) => {
            console.log(err);
            alert("Une erreur est survenue");
            socket.close();
        }
    }
}

function closeTicket() {
    socket.close();
}

function needTicket() {
    showAdd();
}