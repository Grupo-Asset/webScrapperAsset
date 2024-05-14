import puppeteer from "puppeteer";
// import { Terreno } from "./terreno";


let scrap = async (req: {propertyType:string, transactionType:string})=> {
    let {propertyType,transactionType} = req

    try { 
    
    let link = `https://www.argenprop.com/${propertyType}/${transactionType}/villa-elisa?hasta-40000-dolares`
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
    while(!await page.$("pagination__page-next pagination__page pagination__page--disable")){
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
        const ubicaiconSelector = await page.$('li[title="Superficie Total"] .strong')
        const ubicaicon = await ubicaiconSelector?.evaluate(el => el.textContent?.replace(/\D/g,''))
        const adicionalSelector = await page.$('li[title="Superficie Total"] .strong')
        const adicional = await adicionalSelector?.evaluate(el => el.textContent?.replace(/\D/g,''))
        const descripcionSelector = await page.$('li[title="Superficie Total"] .strong')
        const descripcion = await descripcionSelector?.evaluate(el => el.textContent?.replace(/\D/g,''))
        const alternativoSelector = await page.$('li[title="Superficie Total"] .strong')
        const alternativo = await alternativoSelector?.evaluate(el => el.textContent?.replace(/\D/g,''))
        const urlSelector = await page.$('li[title="Superficie Total"] .strong')
        const url = await urlSelector?.evaluate(el => el.textContent?.replace(/\D/g,''))
        const serviciosSelector = await page.$('li[title="Superficie Total"] .strong')
        const servicios = await serviciosSelector?.evaluate(el => el.textContent?.replace(/\D/g,''))
        const fechaDePublicacionSelector = await page.$('li[title="Superficie Total"] .strong')
        const fechaDePublicacion = await fechaDePublicacionSelector?.evaluate(el => el.textContent?.replace(/\D/g,''))
        const publicadorSelector = await page.$('li[title="Superficie Total"] .strong')
        const publicador = await publicadorSelector?.evaluate(el => el.textContent?.replace(/\D/g,''))
        
        console.log(
            "precio",precio? parseFloat(precio): 0,
            "Moneda",moneda,
            "titulo",titulo,
            "m2",m2?Number(m2):1,
            "ubicacion",ubicaicon,
            "adicional",adicional,
            "descripcion",descripcion,
            "alternativo",alternativo,
            "url",url,
            "servicios",servicios,
            "fechaDePublicacion",fechaDePublicacion,
            "publicador",publicador)
        await page.goBack()
 
        // let terreno = new Terreno()
        // terreno.setTitulo(titulo? titulo : null)
        // products.push(
        // )
    }
    await page.waitForSelector('.pagination__page-next');
    await page.click(".pagination__page-next")
    
    }//while end
    await browser.close()
}catch(error) {
    console.log(error)
}}


scrap({propertyType:"terrenos",transactionType:"venta"})

export {scrap}
