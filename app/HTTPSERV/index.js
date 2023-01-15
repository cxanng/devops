const http = require("http");
const fs = require("fs");

const filePath = "./db/log.txt";

// create an http server listening to port 8080 that write the
// content of the log file or shut down the service
http.createServer(function (req, res) {
    if (req.url === "/shutdown") {
        res.writeHead(200);
        res.end();
        process.exit(0);
    } else {
        let data = "";
        try {
            data = fs.readFileSync(filePath, "utf8");
        } catch (err) {
            // eslint-disable-next-line
            console.log(err);
        }
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.write(data);
        res.end();
    }
}).listen(8081);
