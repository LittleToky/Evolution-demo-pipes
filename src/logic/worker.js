let worker;

export const terminateWorker = () => {
  if (worker) worker.terminate();
  worker = null;
};

export const launchWorker = (onMessage, level) => {
  // onMessage is func from React app
  if (worker) terminateWorker();
  worker = new Worker("/socketWorker.js");

  worker.onmessageerror = (err) => {
    launchWorker(onMessage);
  };

  worker.onmessage = (e) => onMessage(e.data); // incomming message fom server -> worker to React app
};

export const sendMessage = (message) => worker.postMessage(message); // React app calls sendMessage to send message to worker or worker -> server
// message should be {message: 'string'}
