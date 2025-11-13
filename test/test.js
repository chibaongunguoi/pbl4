import http from "k6/http";
import { sleep } from "k6";

export const options = {
  stages: [
    { duration: "10s", target: 25 },
    { duration: "10s", target: 50 },
    { duration: "10s", target: 100 },
    { duration: "20s", target: 100 },
    { duration: "10s", target: 0 },
  ]
}

export default () => {
  http.get("http://localhost:3000")
  sleep(1);
};
