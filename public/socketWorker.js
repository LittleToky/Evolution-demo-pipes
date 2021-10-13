let ws, port;
const isOpen = (ws) => ws && ws.readyState === ws.OPEN;
let isConnecting = false;
// postMessage({ action: "askPort" });


const connect = () => {
  ws = new WebSocket(`wss://hometask.eg1236.com/game-pipes/`);
  ws.onerror = (e) => {
    //postMessage({ error: "game server not connected" });
    setTimeout(connect, 250);
  };

  ws.onopen = () => {
    isConnecting = false;
    console.log("game server connected");
    ws.send('new 1');
    //postMessage({ action: "gameConnected", isDemo: false });
  };

  ws.onmessage = (e) => {
    if (e && e.data === 'new: OK') {
        ws.send('map');
    } else if (e.data.startsWith('map:')) {
        postMessage(e.data);
    } else {
        debugger
    }
  };
};

connect();

const ping = () => {
  if (!isConnecting && !isOpen(ws) && port) {
    connect();
  }
};

setInterval(ping, 500);

self.onmessage = (e) => {
  // outcoming message (to server)
  // check if message is for worker
  const data = e.data;
  console.log('###')
  debugger
  if (data.forWorker) {
    if (data.gamePort) {
      port = data.gamePort;
      connect(data);
    }

    return; // do not send anywhere if it's for worker
  }

  if (ws && ws.readyState === ws.OPEN) {
    debugger
    postMessage({ error: "not connected!!!" });
    // ws.send(e.data);
  } else {
    debugger
    postMessage({ error: "not connected!!!" });
    // connect({ port, userId });
  }
};
