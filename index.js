const express = require("express")
var cors = require("cors")
const amazonScraper = require('./scrapers/amazonScraper')
const walmartScraper = require('./scrapers/walmartScraper')
const ebayScraper = require('./scrapers/ebayScraper')
const targetScraper = require('./scrapers/targetScraper')

const app = express()

app.use(cors())

// Add scrapers
app.use('/amazonScraper', amazonScraper)
app.use('/walmartScraper', walmartScraper)
app.use('/ebayScraper', ebayScraper)
app.use('/targetScraper', targetScraper)




// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('../web/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'web', 'build', 'index.html'));
  });
}




const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server started on port ${port}`));