# node-kenpom
Abstracts the scraping of the team ratings from the KenPom.com homepage into a convenient module.

-----

## Important information
Use this package **AT YOUR OWN RISK**. The creator nor the maintainers of this package make any guarantee as to the package's functionality, and you are solely responsible for what you use this package for. Please use this scraper responsibly and ensure any scripts in which you leverage this module that there is appropriate caching and rate-limiting.

-----

## Installation
Install the module from NPM by running the following command in your project directory:

    npm install --save node-kenpom

Alternatively, you can also add the module from the GitHub `master` branch like so:

    npm install git+https://github.com/esqew/node-kenpom.git

## Usage
Once installed, import the module in your code, then call the `getData()` method:

    const kenpom = require('node-kenpom');
    const ratings = await kenpom.getData();

### Return object
The module packages up the extracted data into a neat Object for further consumption. Most fields are named as they appear on the KenPom.com page, with some exceptions:

    ratings.scrapeTime; // a Date object representing the time the scrape completed
    ratings.asOfString; // the string displayed above the ratings table at the time of the scrape (useful to know if all the data from the day is reflected in the result set)

    ratings.teams[0].AdjEM; // gets the AdjEM metric for the first team in the list (#1 rank)
    ratings.teams[1].NCSoS_AdjEM; // gets the NCSOS AdjEM metric for the second team in the list (#2 rank)