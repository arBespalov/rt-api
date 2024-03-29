const Parser = require("./lib/parser");
const PageProvider = require("./lib/page-provider");

class RutrackerApi {
    constructor(host) {
        this.parser = new Parser(host);
        this.pageProvider = new PageProvider(host);
    }

    login({ username, password }) {
        return this.pageProvider.login(username, password);
    }

    search({ query, sort, order, feeds }) {
        return this.pageProvider
            .search({ query, sort, order, feeds })
            .then(html => this.parser.parseSearch(html));
    }

    feeds() {
        return this.pageProvider
            .feeds()
            .then(html => this.parser.parseFeeds(html))
    }

    thread(id) {
        return this.pageProvider.thread(id)
    }

    download(id) {
        return this.pageProvider.torrentFile(id);
    }

    getMagnetLink(id) {
        return this.pageProvider
            .thread(id)
            .then(html => this.parser.parseMagnetLink(html));
    }
}

module.exports = RutrackerApi;
