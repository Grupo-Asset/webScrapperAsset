import 'dotenv/config'
import express from 'express'


const app = express();
app.use(express.json())

app.listen(process.env.PORT || 4000, () => {
    console.log(`Server running on port ${process.env.PORT}`)
})

app.get('/ping',(_req,res) => {//_req es un parametro que no se usa y por typescript se marca con _
    console.log(`llego la req!`)
    res.send("pong")
})
