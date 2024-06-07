import puppeteer from "puppeteer";


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
                title: p.querySelector('.card__title').innerText? p.querySelector('.card__title--primary').innerText : "nothing",
                price: p.querySelector('.card__price').innerText
            })
            
            )     
    })
    console.log("raw",rawElements)
    await browser.close()
}catch(error) {
    console.log(error)
}}


scrap({propertyType:"terrenos",transactionType:"venta"})

export {scrap}
