const { formatSize } = require("./utils");

class Torrent {
    constructor({
        author = null,
        category = null,
        categoryId = null,
        id = null,
        leeches = null,
        seeds = null,
        size = null,
        state = null,
        title = null,
        downloads = null,
        registered = null,
        host = null
    }) {
        this.author = author;
        this.category = category;
        this.categoryId = categoryId
        this.id = id;
        this.leeches = leeches;
        this.seeds = seeds;
        this.size = size;
        this.state = state;
        this.title = title;
        this.downloads = downloads;
        this.registered = registered;
        this.host = host;
        this.formattedSize = formatSize(size);
        this.url = `${host}/forum/viewtopic.php?t=${id}`;
    }
}

Torrent.APPROVED = "проверено";
Torrent.NOT_APPROVED = "не проверено";
Torrent.NEED_EDIT = "недооформлено";
Torrent.DUBIOUSLY = "сомнительно";
Torrent.CONSUMED = "поглощено";
Torrent.TEMPORARY = "временная";

module.exports = Torrent;
