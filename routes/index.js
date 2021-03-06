var express = require('express');
var router = express.Router();
var ytdl = require('youtube-dl');
var request = require('request');
var cors = require('cors');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'HomePage - The Youtube Downloader' });
});

// convert to human readable format
function bytesToSize(bytes) {
   var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
   if (bytes == 0) return '0 Byte';
   var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
   return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};

const isUrl = string => {
      try { return Boolean(new URL(string)); }
      catch(e){ return false; }
  }


router.post('/video', function(req, res, next) {
    var url = req.body.url,
        formats = [],
        pattern = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/;

    request.get(url, function (err, resp, body) {
        // check if it is valid url
        if(pattern.test(resp.request.uri.href)) {
            ytdl.getInfo(url, ['--youtube-skip-dash-manifest'], function(err, info) {
                if(err) return res.render('listvideo', {error: 'The link you provided either not a valid url or it is not acceptable'});

                // push all video formats for download (skipping audio)
                info.formats.forEach(function(item) {
                    if(item.format_note !== 'DASH audio' && item.filesize) {
                        item.filesize = item.filesize ? bytesToSize(item.filesize): 'unknown';
                        formats.push(item);
                    }
                });
                res.render('listvideo', {meta: {id: info.id, formats: formats}, title: 'Video List - The Youtube Downloader'});
            })
        }
        else {
            res.render('listvideo', {error: 'The link you provided either not a valid url or it is not acceptable', title: 'Oops - The Youtube Downloader'});
        }
    });



})

var downloadCors = {
  "origin": "*",
  "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
  "preflightContinue": false,
  "optionsSuccessStatus": 204
}

router.get('/download', cors(downloadCors), function(req, res){
  var request = decodeURIComponent(req.query.url),
      pattern = /\.googlevideo\.com\/videoplayback/;
  if (request && isUrl(request) && pattern.test(request)) {
      res.render('download', {url: request, title: 'Download - The Youtube Downloader'});
  } else {
      res.send('The link you provided either not a valid url or it is not a valid YouTube download url');
  }
});


module.exports = router;
