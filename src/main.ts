import 'dotenv/config'
import express from 'express'
import ScrapController from './Controllers/scrapper'

const app = express();
app.use(express.json())
const port = process.env.PORT || 4000
app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})
app.get('/', (_, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WebScrapper Asset/ MIT Plcean implementation</title>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: "Montserrat", sans-serif;
            background-color: #EBECF0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        
        .panel {
            padding: 20px;
            background-color: #EBECF0;
            box-shadow: 8px 8px 12px -2px rgba(72, 79, 96, 0.4), -6px -6px 12px -1px rgba(255, 255, 255, 1);
            border-radius: 20px;
        }
        
        h2 {
            text-align: center;
            font-size: 24px;
            font-weight: 500;
            margin: 0 0 20px 0;
            color: #6C7587;
        }
        
        input, select, .button {
            width: calc(100% - 20px);
            height: 54px;
            padding: 0 8px;
            margin-bottom: 10px;
            border: none;
            border-radius: 10px;
            background-color: #EBECF0;
            box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.1), -5px -5px 10px rgba(255, 255, 255, 1);
            font-family: "Montserrat", sans-serif;
            font-size: 18px;
            color: #6C7587;
            transition: all 0.3s ease;
            outline: none;
            cursor: pointer;
        }

        label {
            display: flex;
            justify-content: left;
        }
        
        input:focus, .button:focus {
            border: none;
            box-shadow: inset 5px 5px 10px rgba(0, 0, 0, 0.1), inset -5px -5px 10px rgba(255, 255, 255, 1);
        }
        
        .button:hover {
            box-shadow: none;
            border: 3px solid rgba(255, 255, 255, 0.5);
        }
        
        .button:active {
            box-shadow: inset 8px 8px 12px -2px rgba(72, 79, 96, 0.4), inset -6px -6px 12px -1px rgba(255, 255, 255, 1);
            border: 3px solid rgba(255, 255, 255, 0);
        }
        
        form {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }

        #scrapingMessage {
            display: none;
            text-align: center;
            margin-bottom: 10px;
        }

        #responseMessage {
            display: none;
            text-align: center;
            margin-top: 10px;
            font-size: 18px;
        }
    </style>
    </head>
    <body>
    <div class="bg">
        <h2>Web Scrapper Asset</h2>
        <div id="scrapingMessage">Scrapeando...</div>
        <div id="responseMessage"></div>
        <section class="panel">
            <form id="scrapeForm">
                <div class="column">
                    <label for="tipo_de_busqueda">Tipo de Búsqueda:</label>
                    <select id="tipo_de_busqueda" name="tipo_de_busqueda">
                        <option value="Comercial">Comercial</option>
                        <option value="Residencial">Residencial</option>
                        <option value="Landfinder">Landfinder</option>
                    </select>
                </div>
                <div class="column">
                    <label for="meli">Mercado Libre:</label>
                    <input type="text" id="meli" name="meli" required>
                </div>
                <div class="column">
                    <label for="argenprop">Argenprop:</label>
                    <input type="text" id="argenprop" name="argenprop" required>
                </div>
                <div class="column">
                    <label for="zonaprop">Zonaprop:</label>
                    <input type="text" id="zonaprop" name="zonaprop" required>
                </div>
                <div class="column">
                    <button type="button" class="button" onclick="submitForm()">Iniciar Scrapeo</button>
                </div>
                <div class="column">
                    <a href="https://assetrealestate.monday.com/boards/6001985151/" class="button">Monday</a>
                </div>
            </form>
        </section>
    </div>

    <script>
        function submitForm() {
            const formData = {
                meli: document.getElementById('meli').value,
                argenprop: document.getElementById('argenprop').value,
                zonaprop: document.getElementById('zonaprop').value,
                tipo_de_busqueda: document.getElementById('tipo_de_busqueda').value
            };
            document.getElementById('scrapingMessage').style.display = 'block';
            document.getElementById('responseMessage').style.display = 'none';
        
            fetch('/scrap', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })
            .then(response => response.json())
            .then(data => {
                document.getElementById('scrapingMessage').style.display = 'none';
                const responseMessage = document.getElementById('responseMessage');
                if (data.success) {
                    responseMessage.textContent = 'Scrapeo exitoso: ' + JSON.stringify(data.data);
                    responseMessage.style.color = 'green';
                } else {
                    responseMessage.textContent = 'Error en el scrapeo: ' + data.error;
                    responseMessage.style.color = 'red';
                }
                responseMessage.style.display = 'block';
            })
            .catch((error) => {
                document.getElementById('scrapingMessage').style.display = 'none';
                const responseMessage = document.getElementById('responseMessage');
                responseMessage.textContent = 'Error en el scrapeo: ' + error.message;
                responseMessage.style.color = 'red';
                responseMessage.style.display = 'block';
            });
        }
    </script>
    </body>
    </html>
    `);
});


app.get('/ping',(_req,res) => {//_req es un parametro que no se usa y por typescript se marca con _
    console.log(`llego la req!`)
    res.send("pong")
})

app.post('/scrap',ScrapController.modelAsigment)
