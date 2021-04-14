const express = require('express')
const puppeteer = require('puppeteer-extra')

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

const router = express.Router()

router.get('/', async function (req, res) {
  try {
    if (req.query.search == undefined) {
      res.send("Error: the search param \"search\" is required ex: /walmartScraper?search=yourSearchTerm")
    } else {
      // Launch puppeteer and go to walmart website
      const browser = await puppeteer.launch({ headless: true })
      const page = await browser.newPage()

      // Get current cookies from the page for certain URL
      const cookies = await page.cookies(`https://www.walmart.com/search/?query=${req.query.search}`);
      // And remove them
      await page.deleteCookie(...cookies);

      await page.goto(`https://www.walmart.com/search/?query=${req.query.search}`)

      await page.setRequestInterception(true);

      page.on('request', (request) => {
        const url = request.url();
        if (url.endsWith('init.js')) request.abort()
        else request.continue();
      });

      //turns request interceptor on
      await page.setRequestInterception(true);

      //if the page makes a request to a resource type of image or stylesheet then abort that request
      page.on('request', request => {
        if (request.resourceType() === 'image' || request.resourceType() === 'stylesheet')
          request.abort();
        else
          request.continue();
      });

      var walmart = await page.evaluate(evaluate)

      await browser.close()
      res.json(walmart)
    }
  } catch (err) {
    res.send(err.toString())
  }
})

async function evaluate() {
  var listings = await document.getElementsByClassName("search-result-gridview-item-wrapper")

  var listingInfo = []

  // If the grid view is undefined, the listings must be in list view, so change the listings to the list view HTML
  if (!listings[0]) listings = await document.getElementsByClassName("search-result-listview-item")

  for (var i = 0; i < 9; i++) {
    // Get the name and image from the listing
    var listingName = listings[i].querySelector("img").getAttribute("alt")
    var listingImage = listings[i].querySelector("img").getAttribute("src")

    // Get the listing price
    var listingPriceHTML = listings[i].querySelector("span.price-main")
    var listingPrice = listingPriceHTML.querySelector("span.visuallyhidden").innerText

    // Get the listing link
    var listingLink = listings[i].querySelector("a[href]").getAttribute("href")

    listingInfo[i] = {
      name: listingName,
      price: listingPrice,
      link: listingLink,
      image: listingImage
    }
  }

  return listingInfo
}

module.exports = router