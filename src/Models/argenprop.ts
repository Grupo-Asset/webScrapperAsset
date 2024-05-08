import puppeteer from "puppeteer";


let scrap = async ()=> {
try { 
    let link = `https://www.argenprop.com/`
    const chrome = await puppeteer.launch({headless:false})
    const page = await chrome.newPage()
    await page.setViewport({
        width: 1280,
        height:800,
        deviceScaleFactor: 1
    })
    
    await page.goto(link, {waitUntil: 'networkidle2'})
}catch(error) {
    console.log(error)
}}

let scrapLoop = async ()=>{
    await scrap()
}

scrapLoop()

export {scrapLoop}
