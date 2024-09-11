  // Chuyển URL tài liệu thành ID
  function extractDocumentId(url) {
    let id = '';

    // Google Drive URL format: https://drive.google.com/file/d/FILE_ID/view
    if (url.includes("drive.google.com")) {
      id = url.split("/d/")[1]?.split("/")[0];
      return { platform: 'google', id: id };

    // OneDrive URL format: https://onedrive.live.com/embed?cid=XYZ&resid=ABC&authkey=DEF
    } else if (url.includes("onedrive.live.com")) {
      const params = new URLSearchParams(url.split('?')[1]);
      id = params.get('resid');
      return { platform: 'onedrive', id: id };

    // Dropbox URL format: https://www.dropbox.com/s/FILE_ID?dl=0
    } else if (url.includes("dropbox.com")) {
      id = url.split('/s/')[1]?.split('?')[0];
      return { platform: 'dropbox', id: id };

    } else {
      return { platform: 'unknown', id: null };
    }
  }

  // Chuyển ID thành URL để nhúng vào iframe
  function createEmbedUrl(platform, id) {
    let embedUrl = '';

    if (platform === 'google') {
      embedUrl = `https://drive.google.com/file/d/${id}/preview`;
    } else if (platform === 'onedrive') {
      embedUrl = `https://onedrive.live.com/embed?resid=${id}`;
    } else if (platform === 'dropbox') {
      embedUrl = `https://www.dropbox.com/s/${id}?raw=1`;
    } else {
      embedUrl = 'about:blank'; // Nếu không nhận diện được URL, trả về trang trống
    }

    return embedUrl;
  }

  module.exports = {
    extractDocumentId: extractDocumentId,
    createEmbedUrl: createEmbedUrl,
  };