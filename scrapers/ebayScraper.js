const express = require('express')
const puppeteer = require('puppeteer')

const router = express.Router()

router.get('/', async function (req, res) {
  try {
    if (req.query.search == undefined) {
      res.send("Error: the query param \"search\" is required ex: /ebayScraper?search=yourSearchTerm")
    } else {
      // Launch puppeteer and go to ebay.com
      const browser = await puppeteer.launch({ args: ['--no-sandbox'] })
      const page = (await browser.pages())[0]
      await page.goto(`https://www.ebay.com/sch/i.html?_nkw=${req.query.search}`)

      //turns request interceptor on
      await page.setRequestInterception(true)

      //if the page makes a request to a resource type of image or stylesheet then abort that request
      page.on('request', request => {
        if (request.resourceType() === 'image' || request.resourceType() === 'stylesheet')
          request.abort();
        else
          request.continue();
      });

      var ebay = await page.evaluate(evaluate)

      await browser.close()
      res.json(ebay)
    }
  } catch (err) {
    res.send(err.toString())
  }
})


async function evaluate() {
  try {
    var listings = await document.getElementsByClassName("s-item__wrapper")

    listingInfo = []

    // Track which position in the listings array you are
    var position = 0

    while (listingInfo.length < 9) {
      if (listings[position].querySelector("img") == null) {
        position++
        continue
      }

      // Get listing name and link to photo from the src and alt text of the image
      var listingName = listings[position].querySelector("img").getAttribute("alt")
      var listingImage = listings[position].querySelector("img").getAttribute("src")

      // Get listing price
      var listingPrice = listings[position].querySelector(".s-item__price").innerText

      // Get listing link
      var listingLink = listings[position].querySelector("a").getAttribute("href")

      listingInfo[listingInfo.length] = {
        name: listingName,
        price: listingPrice + " ",
        link: listingLink,
        image: listingImage
      }

      position++
    }


    return listingInfo
  } catch (err) {
    return err.toString()
  }
}

module.exports = router