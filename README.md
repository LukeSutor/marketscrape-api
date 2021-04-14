# marketscrape-api

This is the api for the marketscrape website that scrapes data from amazon, walmart, and ebay based on a search term.

It scrapes a total of 9 listings with each api call that arrive as a json including the name, link, image, and price of each listing.

# To call the api:

Three working paths: amazonScraper, walmartScraper, and ebayScraper.

You need to include a search query in your api call ex. amazonScraper?search=basketball will scrape amazon with the search term "basketball"
