// ==UserScript==
// @name         Agar.io bots
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  agar.bio bots
// @author       NuclearC & Neon
// @match        http://agar.bio/
// @grant        none
// @run-at document-start
// ==/UserScript==

/*
    Agar.bio bot feeder script
    Written by NuclearC for Neon
    Copyright(c) 2018 Neon
*/

// hook websocket
WebSocket.prototype._send = WebSocket.prototype.send;
WebSocket.prototype.send = function (data) {
    this._send(data);
    this.send = function (data) {
        this._send(data);
        let dv = new DataView(data);

        if (dv.getUint8(0) == 16 && window.bioHooks) {
            window.bioHooks.x = dv.getFloat64(1, true);
            window.bioHooks.y = dv.getFloat64(9, true);
            window.bioHooks.packet = dv;
            window.bioHooks.server = this.url;
        }
    };
};

window.botWS = null;

window.bioHooks = {
    x: 0,
    y: 0,
    packet: 0,
    server: null,
    timer: null,
    botAmount: 200,
    botName: "NuclearC",
    botStop: function () {
        if (botWS) {
            let ab = new ArrayBuffer(1);
            let dv = new DataView(ab);
            dv.setUint8(0, 0xfe);
            botWS.send(ab);
        }
    },
    botStart: function () {
        if (botWS && this.server) {
            let ab = new ArrayBuffer(5 + this.server.length * 2);
            let dv = new DataView(ab);
            dv.setUint8(0, 0xff);
            dv.setUint16(1, this.botAmount, true);

            for (let i = 0; i < this.server.length; i++) {
                dv.setUint16(3 + i * 2, this.server.charCodeAt(i), true);
            }
            dv.setUint16(3 + this.server.length * 2, 0, true);

            botWS.send(ab);
        }
    }
};

function connectBotWS() {
    botWS = new WebSocket("ws://localhost:8081");

    botWS.onclose = onCloseBotWS;

    botWS.onopen = () => {
        window.bioHooks.timer = setInterval(() => {
            if (botWS && window.bioHooks.packet)
                botWS.send(window.bioHooks.packet);
            else
                clearInterval(window.bioHooks.timer);
        }, 250);
    };
}

function onCloseBotWS() {
    clearInterval(window.bioHooks.timer);

    console.log("[!] Failed to connect to botserver... reconnecting in 5 seconds");
    setTimeout(connectBotWS, 5000);
}

document.addEventListener("keydown", (keyEvent) => {
    let key = String.fromCharCode(keyEvent.keyCode);
    if (key == 'X') {
        if (botWS) {
            let ab = new ArrayBuffer(1);
            let dv = new DataView(ab);
            dv.setUint8(0, 0x20);
            botWS.send(ab);
        }
    }
    else if (key == 'C') {
        if (botWS) {
            let ab = new ArrayBuffer(1);
            let dv = new DataView(ab);
            dv.setUint8(0, 0x21);
            botWS.send(ab);
        }
    }
    else if (key == 'P') {
        if (botWS) {
            let ab = new ArrayBuffer(1);
            let dv = new DataView(ab);
            dv.setUint8(0, 0x22);
            botWS.send(ab);
        }
    }
    else if (key == 'S') {
        if (window.bioHooks) {
            window.bioHooks.botStart();
        }
    }
});

connectBotWS();
