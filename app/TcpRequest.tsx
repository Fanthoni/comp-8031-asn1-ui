interface HttpResponse {
  headers: string;
  body: string;
}

export const makeHttpGetRequest = (
  host: string,
  port: number,
  path: string
) => {
  return new Promise<HttpResponse>((resolve, reject) => {
    resolve({ headers: "HTTP/1.1 200 OK", body: "Hello World" });
  });
};
