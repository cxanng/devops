const http = require("http");
const { exec } = require("child_process");

http.createServer(function (req, res) {
    if (req.url === "/shutdown") {
        res.writeHead(200);
        res.end();
        exec("rabbitmqctl shutdown", (err, stdout, stderr) => {
            if (err) {
                // eslint-disable-next-line
                console.error(`Error while shutdown rabbitmq: ${err}`);
                return;
            }
            // eslint-disable-next-line
            console.log(`stdout: ${stdout}`);
            // eslint-disable-next-line
            console.error(`stderr: ${stderr}`);
        });
        process.exit(0);
    } else {
        res.writeHead(200);
        res.end();
    }
}).listen(8888);
