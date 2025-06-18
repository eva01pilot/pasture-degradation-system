import http from "k6/http";

export let options = {
  vus: 100,
  duration: "10s",
};

export default function () {
  const res = http.post("http://localhost/api/polygons/analyze", {
    headers: {
      Authorization: __ENV.TOKEN,
    },
  });
}
