import 'dotenv/config'
import express from 'express'
import ScrapController from './Controllers/scrapper'

const app = express();
app.use(express.json())
const port = process.env.PORT || 4000
app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})
app.get('/', (_,res)=>{
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>WebScrapper Asset/ MIT Plcean implementation</title>
        <style>
        body {
            font-family: "Space Grotesk", Helvetica, Arial, sans-serif;
            color: rgba(9, 19, 60, 1);
          }
          
          .bg {
            background-image: url(https://img.freepik.com/foto-gratis/fondo-oscuro-abstracto-lineas-moradas-ia-generativa_169016-30667.jpg?t=st=1714763644~exp=1714767244~hmac=889f249c6a927e29559d548def15b5a4e9f2e24fcf8e9c700c9004b69e1af6dd&w=1060);
            background-position: center;
            background-size: cover;
            min-height: 100vh;
            width: 100vw;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .panel {
            background-image: linear-gradient(
              to bottom right,
              rgba(255, 255, 255, 0.3) 0%,
              rgba(255, 255, 255, 0.1) 100%
            );
            backdrop-filter: blur(6px);
            border-radius: 12px;
            width: 320px;
            border-top: 1px solid rgba(255, 255, 255, 0.5);
            border-left: 1px solid rgba(255, 255, 255, 0.5);
            padding: 60px;
            box-shadow: rgba(255, 255, 255, 0.5) -20px -20px 45px inset,
              rgba(0, 0, 0, 0.1) 10px 10px 20px, rgba(0, 0, 0, 0.06) 5px 5px 10px;
            position: relative;
          }
          
          h2 {
            font-size: 2em;
            font-weight: 1000;
            margin-top: 0;
          }
          
          .card__text {
            font-size: 14px;
            line-height: 1.45;
            opacity: 0.8;
            margin-bottom: 2em;
          }
          
          .button {
            display: inline-block;
            padding: 1.5em 3em;
            background-image: linear-gradient(
              -45deg,
              rgba(9, 28, 60, 1) 0%,
              rgba(67, 46, 103, 1) 100%
            );
            text-decoration: none;
            font-weight: 900;
            text-transform: uppercase;
            font-size: 14px;
            letter-spacing: 0.2em;
            border-radius: 10em;
            color: white;
            cursor: pointer;
          }
        </style>
    </head>
    <body>
        <div class="bg">
            <section class="panel">
                <h2>Web Scrapper Asset</h2>
                <div class="card__text">
                    <form id="scrapeForm">
                        <label for="tipos_de_propiedad">Tipos de Propiedad:</label><br>
                        <input type="text" id="tipos_de_propiedad" name="tipos_de_propiedad" value="casa,lote"><br>
                        <label for="tipos_de_transaccion">Tipos de Transacción:</label><br>
                        <input type="text" id="tipos_de_transaccion" name="tipos_de_transaccion" value="alquiler,venta"><br>
                        <label for="m2_minimos">M2 Mínimos:</label><br>
                        <input type="number" id="m2_minimos" name="m2_minimos" value="0"><br>
                        <label for="m2_maximos">M2 Máximos:</label><br>
                        <input type="number" id="m2_maximos" name="m2_maximos" value="0"><br>
                        <label for="lista_de_barrios">Lista de Barrios:</label><br>
                        <input type="text" id="lista_de_barrios" name="lista_de_barrios" value="villa Elisa"><br>
                        <label for="tipo_de_busqueda">Tipo de Búsqueda:</label><br>
                        <input type="text" id="tipo_de_busqueda" name="tipo_de_busqueda" value="comercial"><br><br>
                        <button type="button" class="button" onclick="submitForm()">Iniciar Scrapeo</button>
                    </form>
                </div>
                <a href="https://assetrealestate.monday.com/boards/6001985151/" class="button">Monday</a>
            </section>
        </div>
    
        <script>
            function submitForm() {
                const formData = {
                    tipos_de_propiedad: document.getElementById('tipos_de_propiedad').value.split(','),
                    tipos_de_transaccion: document.getElementById('tipos_de_transaccion').value.split(','),
                    m2_minimos: parseInt(document.getElementById('m2_minimos').value),
                    m2_maximos: parseInt(document.getElementById('m2_maximos').value),
                    lista_de_barrios: document.getElementById('lista_de_barrios').value.split(','),
                    tipo_de_busqueda: document.getElementById('tipo_de_busqueda').value
                };
    
                fetch('http://localhost:4000/scrap', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Success:', data);
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
            }
        </script>
    </body>
    </html>
    
`)
})

app.get('/ping',(_req,res) => {//_req es un parametro que no se usa y por typescript se marca con _
    console.log(`llego la req!`)
    res.send("pong")
})

app.post('/scrap',ScrapController.modelAsigment)
