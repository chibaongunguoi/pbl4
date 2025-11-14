import http from "k6/http";
import { sleep } from "k6";

export const options = {
  stages: [
    { duration: "10s", target: 2500 },
    { duration: "10s", target: 5000 },
    { duration: "10s", target: 10000 },
    { duration: "20s", target: 10000 },
    { duration: "10s", target: 0 },
  ]
}

export default () => {
  http.get("http://localhost:3000")
  sleep(1);
};
