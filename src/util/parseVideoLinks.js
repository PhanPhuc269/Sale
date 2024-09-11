function parseVideoLink(link){
        const regex = /(?:https:\/\/www\.youtube\.com\/watch\?v=|https:\/\/youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = link.match(regex);
        if(match){
            return match[1];
        }
        return link;
    }
function convertIdToUrl(id) {
    return `https://www.youtube.com/watch?v=${id}`;
}    
module.exports= {
    parseVideoLink: function(link){
        return parseVideoLink(link);
    },
    convertLinksToIds: function(links) {
        if (!Array.isArray(links)) {
            throw new TypeError('Expected an array of links');
        }
        return links.map(link => parseVideoLink(link)).filter(id => id !== null);
    },
}