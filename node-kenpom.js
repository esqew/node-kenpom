const axios = require('axios');
const cheerio = require('cheerio');

/**
 * getData
 * @description Retrieves the latest KenPom.com ratings and parses them to an Array of Objects for further consumption
 * @returns {Object} An Object containing information about the scrape, as well as the scraped data.
 */
const getData = async () => {
    return new Promise((resolve) => {
        axios.get('https://kenpom.com')
            .then(result => {
                const scrapeTime = new Date();
                const $ = cheerio.load(result.data);
                var teams = [];
                var headerCategoryCells = $("#ratings-table thead tr.thead1")[0].children.filter(_ => _.type === 'tag' && _.name == 'th');
                var headerCategories = [];

                // get the header "categories" (like "Strength of Schedule" and "NCSOS") that are listed in a separate <tr> node
                for (categoryCell of headerCategoryCells) {
                    var numberOfColumns;
                    if (typeof categoryCell.attribs !== 'undefined' && typeof categoryCell.attribs.colspan !== 'undefined') {
                        if (typeof categoryCell.attribs.class !== 'undefined' && categoryCell.attribs.class.includes("divide")) {
                            numberOfColumns = parseInt(categoryCell.attribs.colspan) / 2;
                        } else {
                            numberOfColumns = parseInt(categoryCell.attribs.colspan);
                        }
                    } else {
                        numberOfColumns = 1;
                    }
                    headerCategories.push(...new Array(numberOfColumns).fill().map(_ => $(categoryCell).text().replace('Strength of Schedule', 'SoS')));
                }

                // get the text of the actual header labels and concatenate with the header "categories" (if applicable)
                var headers = $("#ratings-table thead tr.thead2")[0].children.filter(_ => _.type === 'tag').map((header, index) => headerCategories[index] !== "" ? headerCategories[index] + "_" + $(header).text() : $(header).text());

                // loop over each of the team rows' data and generate an Object using the extracted headers
                for (team of $("#ratings-table tbody tr")) {
                    var teamObject = {};
                    var teamData = team.children.filter(element =>
                        element.type == 'tag' &&
                        element.name == 'td' &&
                        (
                            element.attribs.class == undefined ||
                            !element.attribs.class.includes('td-right')
                        )
                    );
                    teamData.map(element => $(element).text()).forEach((value, index) => teamObject[headers[index]] = value)
                    teams.push(teamObject);
                }

                // parse numeric values to their respective types, if possible
                for (team of teams) {
                    for (key of Object.keys(team)) {
                        if (/^(\+|\-)?\d{0,3}\.\d{1,3}$/.test(team[key])) team[key] = parseFloat(team[key]);
                        else if (/^\d{1,3}$/.test(team[key])) team[key] = parseInt(team[key]);
                        else if (/^\d{1,2}\-\d{1,2}$/.test(team[key])) team[key] = new Record(team[key]);
                    }
                }
                resolve({
                    scrapeTime: scrapeTime,
                    asOfString: $("span.update").text(),
                    teams:      teams
                });
                return;
            })
    });
};

class Record {
    constructor(recordString) {
        const pattern = /^(?<wins>\d{1,2})\-(?<losses>\d{1,2})$/;
        if (!recordString instanceof String) throw new TypeError("Record must be constructed using a String representation of a team's record in the format ##-##.");
        else if (!pattern.test(recordString)) throw new Error("Record expects a record string in the format ##-##.");
        else {
            const parseResult = pattern.exec(recordString);
            this.wins = parseResult.groups.wins;
            this.losses = parseResult.groups.losses;
        }
    }

    toString() {
        return `${this.wins}-${this.losses}`;
    }
}

module.exports = {getData, Record};