const { google } = require('googleapis');
const youtube = google.youtube('v3');

// Hàm để chuyển đổi thời gian ISO 8601 thành giây
function parseDuration(duration) {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    const hours = parseInt(match[1] || 0, 10);
    const minutes = parseInt(match[2] || 0, 10);
    const seconds = parseInt(match[3] || 0, 10);
    return (hours * 3600) + (minutes * 60) + seconds;
}

// Hàm để lấy thông tin video từ YouTube Data API
async function getVideoDurations(videoIds, apiKey) {
    const response = await youtube.videos.list({
        key: apiKey,
        part: 'contentDetails',
        id: videoIds.join(',')
    });

    return response.data.items.map(item => parseDuration(item.contentDetails.duration));
}
function extractIds(details) {
    if (!Array.isArray(details)) {
        throw new TypeError('Expected an array of details');
    }
    return details.map(detail => detail.link).filter(id => id !== undefined && id !== null);
}
// Hàm để tính tổng thời lượng
async function calculateTotalDuration(videoIds, apiKey) {
    const durations = await getVideoDurations(videoIds, apiKey);
    const totalDuration = durations.reduce((total, duration) => total + duration, 0);
    return totalDuration;
}
module.exports = {
    calculateTotalDuration: async(videoIds, apiKey)=>{
        console.log('videoIds',extractIds(videoIds));
        try {
            totalDuration= await calculateTotalDuration(extractIds (videoIds), apiKey)
            console.log('Total duration:', (totalDuration));
            return totalDuration;
        }
        catch{
            console.error('Error calculating total duration:', error);
        }
    },
    extractIds,
};