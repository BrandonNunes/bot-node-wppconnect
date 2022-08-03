const express = require('express');
const wppconnect = require('@wppconnect-team/wppconnect');

const app = express();
const port = process.env.PORT || 3030;
app.use(express.json())

let wpp;
let qr;
function start(client) {
    client.onMessage((message) => {
        if (message.body === 'Hello') {
            client
                .sendText(message.from, 'Olá, em que posso ajudar?')
                .then((result) => {
                    console.log('Result: ', result); //return object success
                })
                .catch((erro) => {
                    console.error('Error when sending: ', erro); //return object error
                });
        }
    });
}

app.get('/novasessao', (req, res) => {
        wppconnect
            .create(
                {
                    session: 'sessionName',
                    catchQR: (base64Qr, asciiQR) => {
                        console.log(asciiQR);// Optional to log the QR in the terminal
                        qr = base64Qr
                        // return res.json({qrcode: qr})
                        return res.send(`<img src="${qr}" />`)
                        var matches = base64Qr.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
                            response = {};

                        if (matches.length !== 3) {
                            return new Error('Invalid input string');
                        }
                        response.type = matches[1];
                        response.data = new Buffer.from(matches[2], 'base64');

                        var imageBuffer = response;
                        require('fs').writeFile(
                            'out.png',
                            imageBuffer['data'],
                            'binary',
                            function (err) {
                                if (err != null) {
                                    console.log(err);
                                }
                            }
                        );

                    },
                    logQR: false,
                }
            )
            .then((client) => {
                start(client)
                console.log('Client iniciado')
                wpp = client
            })
            .catch((error) => console.log(error));
})
app.post('/', async (req, res) => {
    const { phone_number, message } = req.body
    if(phone_number.length === 13){
        let newNumber = phone_number.split('')
        newNumber.splice(4, 1)
        await wpp
            .sendText(newNumber.join('')+'@c.us', message)
            .then((result) => {
                console.log('Result: ', result); //return object success
                return res.json({ mensagem: 'mensagem enviada!', para: result.to })
            })
            .catch((erro) => {
                console.error('Error when sending: ', erro); //return object error
                return res.status(400).json(erro)
            });
    }
    await wpp
        .sendText(phone_number+'@c.us', message)
        .then((result) => {
            console.log('Result: ', result); //return object success
        })
        .catch((erro) => {
            console.error('Error when sending: ', erro); //return object error
        });
})
app.post('/getqrcode', async (req, res) => {
    await wpp.logout()
    await wpp.getQrCode().then((data) => {
        console.log(data)
        return res.send(data)
    }).catch((e)=> {
        console.log(e)
        return res.status(400).json({erro: e})
    })
})
const server = app.listen(port, () => { console.log( `servidor on na porta ${port}` ) })
    process.on("SIGINT", () => {
    server.close()
    console.log('servidor encerrado')
    })
