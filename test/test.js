import http from "k6/http";
import { sleep } from "k6";

export const options = {
  stages: [
    { duration: "20s", target: 5000 },
    { duration: "30s", target: 5000 },
    { duration: "10s", target: 0 },
  ]
}

// const HOST = __ENV.CLIENT_SERVER_HOST;
// const PORT = __ENV.CLIENT_SERVER_PORT;

export default () => {
  http.get(`http://192.168.137.1:3000`)
  sleep(1);
};
