let wakeLock = null;

function ping() {
    if (this.socket != null)
        setTimeout(() => socket.send(JSON.stringify({ "action": "ping" })), 60000); // send ping in 60 sec
}

function getWakeLock() {
    try {
        fut = navigator.wakeLock.request("screen");
        fut.then((lock) => {
            wakeLock = lock;
        });
    } catch (err) {
        console.error(err);
     }
}

function releaseWakeLock() {
    if (wakeLock != null) {
        wakeLock.release();
        wakeLock = null;
    }
}