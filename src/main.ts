import 'dotenv/config'
import express from 'express'


const app = express();
app.use(express.json())

app.listen(process.env.PORT || 4000, () => {
    console.log(`Server running on port ${process.env.PORT}`)
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
      
        &::before {
          content: "";
          display: block;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.05) 40%,
            rgba(255, 255, 255, 0) 40%
          );
          pointer-events: none;
        }
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
        argin-bottom: 2em;
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
      }</style>
      </head>
<body>

    <div class="bg">

    <section class="panel">
      <h2>Web Scrapper Asset</h2>
      <div class="card__text">
        <p>Este web scrapper utiliza el modelo experimental basado en probabilidad de MIT Pclean para automatizar la limpieza de datos</p>
      </div>
      <a href="https://assetrealestate.monday.com/boards/6001985151/" class='button'>Monday</a>
    </section>
  
  </div>
  </body>
</html>`)
})

app.get('/ping',(_req,res) => {//_req es un parametro que no se usa y por typescript se marca con _
    console.log(`llego la req!`)
    res.send("pong")
})
