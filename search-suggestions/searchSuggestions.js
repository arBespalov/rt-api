const logger = require('../logger').logger
const db = require('./searchSuggestionsDb')
const config = require('../config').config

let trendingSuggestions

module.exports.findSuggestions = async function (query) {
    const result = await db.findText(query, config.SEARCH_SUGGESTIONS_PER_QUERY)
    return result.map(suggestion => {
        return suggestion.title
    })
}

module.exports.createNewSearchSuggestion = async function (_query) {
    let query = _query
    while (query.includes("  ")) {
        query = query.replace("  ", " ")
    }
    query = query.trim()
    query = query.toLowerCase()
    const dbSuggestion = await db.getByTitle(query)
    if (dbSuggestion) {
        dbSuggestion.requests.push(new SearchRequest())
        await db.updateOne(dbSuggestion)
        logger.debug(`suggestion ${query} updated, requests count: ${dbSuggestion.requests.length}`)
    } else {
        await db.insertOne({
            title: query,
            tokens: createEdgeNGrams(query),
            requests: [new SearchRequest()]
        })
        logger.debug(`new suggestion ${query} created`)
    }
}

module.exports.getTrendingSuggestions = async function () {
    if (!trendingSuggestions) {
        await updateTrendingSuggestions()
    }
    return trendingSuggestions
}

async function updateTrendingSuggestions() {
    const cursor = await db.getCursor()
    logger.verbose(`updateTrendingSuggestions started, found ${await cursor.count()} search suggestions`)
    const currentTimestamp = Date.now()
    const trends = []

    while (await cursor.hasNext()) {
        const sugg = await cursor.next()
        let counter = 0
        for (const request of sugg.requests) {
            // todo: add some logic to remove old timestamps, otherwise db will grow in size infinitely 
            if (currentTimestamp - request.timestamp < config.TRENDS_OBSERVING_DAYS_COUNT * 1000 * 60 * 60 * 24) {
                counter++
            }
        }
        if (counter > 0) {
            trends.push({
                title: sugg.title,
                counter: counter
            })
        }
    }
    trends.sort((a, b) => b.counter - a.counter)
    trends.slice(0, 20).forEach(trend => logger.verbose(`${trend.title}: ${trend.counter}`))
    trendingSuggestions = trends
        .slice(0, 5)
        .map(trend => trend.title)
}

module.exports.updateTrendingSuggestions = async function () {
    return updateTrendingSuggestions()
}


// collecting data for implementing trend searches on main screen in future
class SearchRequest {
    constructor() {
        this.timestamp = Date.now()
    }
}

function createEdgeNGrams(str) {
    const minGram = 2
    if (str && str.length > minGram) {      
        const maxGram = str.length
        return str.split(" ").reduce((ngrams, token) => {
            if (token.length > minGram) {
                for (let i = minGram; i <= maxGram && i <= token.length; ++i) {
                    ngrams = [...ngrams, token.substr(0, i)]
                }
            } else { ngrams = [...ngrams, token] }
            return ngrams
        }, []).join(" ")
    }
    return str
}