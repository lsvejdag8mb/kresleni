const http = require("http");
const fs = require("fs");

const PORT = 8080;

function main(req,res) {
    if (req.url == "/") {
        res.writeHead(200, {"Content-type":"text/html"});
        res.end(fs.readFileSync("index.html"));
    } else {
        res.writeHead(404);
        res.end();
    }
}

let srv = http.createServer(main);
srv.listen(PORT);

console.log("Server bezi na http://localhost:"+PORT);

//websockety
const WebSocket = require("ws");
const wss = new WebSocket.Server({ server: srv });

//prijem zprav od klientu
wss.on('connection', ws => {
    ws.on('message', message => { //prijem zprav
        console.log(`Přijatá zpráva: ${message}`);
    });
});

//rozeslani zprav klientum
let counter = 0;
function broadcast() {
    counter++;
    //odeslani zpravy vsem pripojenym klientum
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send("Webserver spuštěn " + counter + "s.");
        }
    });
}
setInterval(broadcast, 1000);
