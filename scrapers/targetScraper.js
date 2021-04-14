const express = require('express')
const puppeteer = require('puppeteer-extra')

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

const router = express.Router()

router.get('/', async function (req, res) {
  try {
    if (req.query.search == undefined) {
      res.send("Error: the search param \"search\" is required ex: /targetScraper?search=yourSearchTerm")
    } else {
      // Launch puppeteer and go to amazon.com
      const browser = await puppeteer.launch();
      const page = (await browser.pages())[0]
      await page.goto(`https://www.target.com/s?searchTerm=${req.query.search}`)

      //turns request interceptor on
      await page.setRequestInterception(true);

      //if the page makes a request to a resource type of image or stylesheet then abort that request
      page.on('request', request => {
        if (request.resourceType() === 'image' || request.resourceType() === 'stylesheet')
          request.abort();
        else
          request.continue();
      });

      // Wait for the listings to be on the page
      await page.waitForSelector(".jDKgFl") //  sc-jSgupP

      var target = await page.evaluate(evaluate)

      await browser.close()
      res.send(target)
    }
  } catch (err) {
    res.send(err.toString())
  }
})

async function evaluate() {
  var listings = await document.getElementsByTagName("body")

  var listingInfo = []

  for(var i = 0; i < listings.length; i++) {
    listingInfo[i] = {
      name: listings[i].innerHTML,
      price: '$0.00',
      link: 'something',
      image: 'test'
    }
  }

  return listingInfo
}

module.exports = router