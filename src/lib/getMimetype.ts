export function getMimeType(fileName: string) {
  const fileExtension = fileName.split('.').pop();

  if (!fileExtension) {
    return 'application/vnd.google-apps.folder';
  }

  const mimeTypes: { [key: string]: string } = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    pps: 'application/vnd.ms-powerpoint',
    ppsx: 'application/vnd.openxmlformats-officedocument.presentationml.slideshow',
    odt: 'application/vnd.oasis.opendocument.text',
    ods: 'application/vnd.oasis.opendocument.spreadsheet',
    odp: 'application/vnd.oasis.opendocument.presentation',
    txt: 'text/plain',
    rtf: 'application/rtf',
    html: 'text/html',
    htm: 'text/html',
    mht: 'message/rfc822',
    mhtml: 'message/rfc822',
    csv: 'text/csv',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    jpe: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    bmp: 'image/bmp',
    tif: 'image/tiff',
    tiff: 'image/tiff',
    ico: 'image/x-icon',
    svg: 'image/svg+xml',
    svgz: 'image/svg+xml',
    zip: 'application/zip',
    rar: 'application/x-rar-compressed',
    exe: 'application/x-msdownload',
    msi: 'application/x-msdownload',
    cab: 'application/vnd.ms-cab-compressed',
    mp3: 'audio/mpeg',
    qt: 'video/quicktime',
    mov: 'video/quicktime',
    wmv: 'video/x-ms-wmv',
    mp4: 'video/mp4',
    ogg: 'application/ogg',
    ogv: 'video/ogg',
    oga: 'audio/ogg',
    webm: 'video/webm',
    flv: 'video/x-flv',
    avi: 'video/x-msvideo',
    mkv: 'video/x-matroska',
    '3gp': 'video/3gpp',
    wav: 'audio/x-wav',
    mp4a: 'audio/mp4',
    m4a: 'audio/mp4',
  };

  return mimeTypes[fileExtension] || 'application/octet-stream';
}
