const http = require("http");
const fs = require("fs");
const url = require("url");
const uniqid = require("uniqid");

const PORT = 8080;

let hraci = new Array();

function main(req,res) {
    if (req.url == "/") {
        res.writeHead(200, {"Content-type":"text/html"});
        res.end(fs.readFileSync("index.html"));
    } else if (req.url.startsWith("/novyhrac")) {
        let q = url.parse(req.url, true); //zpracuje parametry z url
        let obj = {};
        obj.uid = uniqid(); //do prohlizece se vrati identifikace hrace
        res.writeHead(200, {"Content-type":"application/json"});
        res.end(JSON.stringify(obj));
        let hrac = {};
        hrac.uid = obj.uid;
        hrac.x = 100;
        hrac.y = 100;
        hrac.r = 10;
        console.log(q.query);
        hrac.jmeno = q.query.j; //podle parametru j
        hrac.barva = "#" + q.query.b; //podle parametru b s pridanou mrizi
        hraci.push(hrac);
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
        //console.log(`Přijatá zpráva: ${message}`);
        let posunuti = JSON.parse(message);
        for (let hrac of hraci) {
            if (posunuti.uid == hrac.uid) { //vyhleda prislusneho hrace
                if (posunuti.left) {
                    hrac.x = hrac.x - 1;
                }
                if (posunuti.right) {
                    hrac.x = hrac.x + 1;
                }
                if (posunuti.up) {
                    hrac.y = hrac.y - 1;
                }
                if (posunuti.down) {
                    hrac.y = hrac.y + 1;
                }
                break;
            }
        }

    });
});

//rozeslani zprav klientum
function broadcast() {
    let json = JSON.stringify(hraci);
    //odeslani zpravy vsem pripojenym klientum
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(json);
        }
    });
}
setInterval(broadcast, 10);
