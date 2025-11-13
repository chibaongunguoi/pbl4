import cluster from 'cluster';
// import { cpus } from 'os';
import http from 'http';
import next from 'next';

// const numCPUs = Math.floor(cpus().length / 2);
const numCPUs = 8;
const port = process.env.PORT || 3000;
const app = next({ dev: false });
const handle = app.getRequestHandler();

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);

  // Fork workers for each CPU core
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, _, __) => {
    console.log(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });

} else {
  app.prepare().then(() => {
    http.createServer((req, res) => handle(req, res)).listen(port, () => {
      console.log(`Worker ${process.pid} started on port ${port}`);
    });
  });
}
