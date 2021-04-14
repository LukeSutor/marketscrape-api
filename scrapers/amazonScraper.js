const express = require('express')
const puppeteer = require('puppeteer')

const router = express.Router()

router.get('/', async function (req, res) {
  try {
    if (req.query.search == undefined) {
      res.send("Error: the query param \"search\" is required ex: /amazonScraper?search=yourSearchTerm")
    } else {
      // Launch puppeteer and go to amazon.com
      const browser = await puppeteer.launch();
      const page = (await browser.pages())[0]
      await page.goto(`https://www.amazon.com/s?k=${req.query.search}`)

      //turns request interceptor on
      await page.setRequestInterception(true)

      //if the page makes a request to a resource type of image or stylesheet then abort that request
      page.on('request', request => {
        if (request.resourceType() === 'image' || request.resourceType() === 'stylesheet')
          request.abort()
        else
          request.continue()
      });

      // Wait for the listings to be on the page
      await page.waitForSelector(".sg-col-inner")

      var amazon = await page.evaluate(evaluate)

      await browser.close()
      res.json(amazon)
    }
  } catch (err) {
    res.send(err.toString())
  }
})


async function evaluate() {
  try {
    var listings = await document.getElementsByClassName("template=SEARCH_RESULTS")

    // Use reg expressions to check if html scraped is actually listings or just other junk
    const checkImpressionLoggerRegX = new RegExp("s-impression-logger")
    const checkBestSellerLabelRegX = new RegExp("best-seller-label")

    var listingInfo = []

    // Track which position in the listings array you are
    var position = 0

    while (listingInfo.length < 9) {
      // Listing HTML
      var innerHTML = listings[position].innerHTML

      // If the listing is junk like an ad, skip over it entirely
      if (checkImpressionLoggerRegX.test(innerHTML) ||
        checkBestSellerLabelRegX.test(innerHTML)) {
        position++
        continue
      }

      // Get listing name and link to photo from the src and alt text of the image
      var listingName = listings[position].querySelector("img").getAttribute("alt")
      var listingImage = listings[position].querySelector("img").getAttribute("src")

      // Get the price of the listing
      try {
        var listingPriceDollars = listings[position].querySelector("span.a-price-whole")
        var listingPriceCents = listings[position].querySelector("span.a-price-fraction")
        var dot = "."
        var dollar = "$"
        var listingPrice = dollar + listingPriceDollars.innerText.match(/\d+\,\d+|\d+/) + dot + listingPriceCents.innerText
      } catch (err) {
        var listingPrice = undefined
      }

      // Get link from listing
      var listingLink = listings[position].querySelector("a[href]").getAttribute("href")
      // listingLink.getAttribute("href")

      listingInfo[listingInfo.length] = {
        name: listingName,
        price: listingPrice,
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