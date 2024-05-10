import puppeteer from "puppeteer";
// import { Terreno } from "./terreno";


let scrap = async (req: {propertyType:string, transactionType:string})=> {
    let {propertyType,transactionType} = req

    try { 
    
    let link = `https://www.argenprop.com/${propertyType}/${transactionType}`
    const browser = await puppeteer.launch({headless:false})
    const page = await browser.newPage()
    await page.goto(link)
    await page.waitForSelector('.listing__items')
    const rawElements = await page.evaluate(()=> {
        const products = Array.from(document.querySelectorAll('.listing__item'))
        return products.map((p: any)=> ({
            link: p.querySelector('a').getAttribute('href')
        })
        
        )
    })
    console.log("raw",rawElements)
    
    // const products :Array<Terreno> = []
    for(var i= 0 ; rawElements; i++){
        await page.goto(`https://www.argenprop.com${rawElements[i].link}`)
        const titleSelector = await page.waitForSelector('.titlebar__address');
        const titulo = await titleSelector?.evaluate(el => el.textContent);
        const precioSelector = await page.waitForSelector(".titlebar__price-mobile p")
        const precio = await precioSelector?.evaluate(el => el.textContent?.replace(/[A-Z , \.]+/g,""))
        const moneda = await precioSelector?.evaluate(el => el.textContent?.replace(/[0-9 , \.]+/g,""))
        const m2Selector = await page.$('li[title="Superficie Total"] .strong')
        const m2 = await m2Selector?.evaluate(el => el.textContent?.replace(/\D/g,''))

        console.log("precio",precio? parseFloat(precio): 0,"Moneda",moneda,"titulo",titulo,"m2",m2?Number(m2):1)
        await page.goBack()
        // let moneda = document.querySelector("all")?.getAttribute("href")
        // let m2 = document.querySelector("all")?.getAttribute("href")
        // let ubicaicon = document.querySelector("all")?.getAttribute("href")
        // let adicional =document.querySelector("all")?.getAttribute("href")
        // let descripcion =document.querySelector("all")?.getAttribute("href")
        // let alternativo = document.querySelector("all")?.getAttribute("href")
        // let url =document.querySelector("all")?.getAttribute("href")
        // let servicios =document.querySelector("all")?.getAttribute("href")
        // let precioPorM2 = document.querySelector("all")?.getAttribute("href")
        // let validacion = document.querySelector("all")?.getAttribute("href")
        // let fechaDePublicacion = document.querySelector("all")?.getAttribute("href")
        // let publicador = document.querySelector("all")?.getAttribute("href")
        // let terreno = new Terreno()
        // terreno.setTitulo(titulo? titulo : null)
        // products.push(
        // )
    }
    // await browser.close()
}catch(error) {
    console.log(error)
}}


scrap({propertyType:"terrenos",transactionType:"venta"})

export {scrap}
