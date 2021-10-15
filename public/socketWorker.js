let ws;
const isOpen = (ws) => ws && ws.readyState === ws.OPEN;
let isConnecting = false;

const connect = () => {
  ws = new WebSocket(`wss://hometask.eg1236.com/game-pipes/`);
  ws.onerror = (e) => {
    setTimeout(connect, 250);
  };

  ws.onopen = () => {
    isConnecting = false;
    ws.send('new 1');
  };

  ws.onmessage = (e) => {
    if (e && e.data === 'new: OK') { // response to server
        ws.send('map');
    } else if (e && e.data === 'rotate: OK') { // response to server 
        ws.send('map');
        // may be there will be some different logic
    } else {
        postMessage(e.data); // send it to the React app
    }
  };
};

connect();

const ping = () => {
  if (!isConnecting && !isOpen(ws)) {
    connect();
  }
};

setInterval(ping, 500);

self.onmessage = (e) => {
  // outcoming message (to server)
  const {data} = e;

  if (ws && ws.readyState === ws.OPEN) {
    ws.send(data.message);
  } else {
    postMessage({ error: "not connected!!!" });
    connect();
  }
};
