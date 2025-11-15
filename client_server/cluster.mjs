import cluster from 'cluster';
import { cpus } from 'os';
import http from 'http';
import next from 'next';

const numCPUs = cpus().length;
const basePort = parseInt(process.env.CLIENT_SERVER_PORT || "3000", 10);
const ports = Array.from({ length: numCPUs }, (_, _i) => basePort);

const app = next({ dev: false });
const handle = app.getRequestHandler();

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);
  console.log("Port list:", ports);
  ports.forEach(port => {
    cluster.fork({ WORKER_PORT: port });
  });
  cluster.on('exit', (worker) => {
    const port = worker.process.env.WORKER_PORT;
    console.log(`Worker ${worker.process.pid} on port ${port} died. Restarting...`);
    cluster.fork({ WORKER_PORT: port });
  });
} else {
  const port = process.env.WORKER_PORT;
  app.prepare().then(() => {
    http.createServer((req, res) => handle(req, res)).listen(port, () => {
      console.log(`Worker ${process.pid} started on port ${port}`);
    });
  });
}
