;(function() {

  // URL do JavaScript do API do YouTube
  var tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";

  // Inserir script da API do YouTube
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  var player;
  var interval;
  var currentVid = 0;
  var started = false;

  var doneList = false;
  var doneYT = false;

  // URL da planilha
  var sheetId = '1vnzlSBVUoT9aARJzQPNosx3eTPhFJNKr3G_G3XDV-w8';

  // URL da planilha convertida em JSON
  var sheetUrl = 'https://spreadsheets.google.com/feeds/list/' + sheetId + '/od6/public/values?alt=json';

  // Lista de videos
  var videoList = new Array();

  $.getJSON(sheetUrl, function(data) {
    var entry = data.feed.entry;

    $(entry).each(function() {

      videoList.push({
        'id': this.gsx$videoid.$t,
        'start': parseInt(this.gsx$start.$t),
        'end': parseInt(this.gsx$end.$t)
      });
    });

    doneList = true;
    setup();
  });

  window.onYouTubeIframeAPIReady = function() {
    player = new YT.Player('player', {
      videoId: '',
      playerVars: {
        controls: 0,
        disablekb: 1,
        showinfo: 0,
        start: 0
      },
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onStatChange
      }
    });
  }

  function onPlayerReady() {
    doneYT = true;
    setup();
  }

  function onStatChange() {
    if (player.getPlayerState() == 1) {
      interval = setInterval(playVid, 500);
    } else {
      clearInterval(interval);
    }
  }

  function playVid() {
    var currentTime = parseInt(player.getCurrentTime());

    if (currentTime >= videoList[currentVid].end) {
      currentVid = (currentVid < videoList.length - 1) ? currentVid + 1 : 0;
      loadVid(videoList[currentVid].id, videoList[currentVid].start);
    }
  }

  function loadVid(id, start) {
    player.loadVideoById({
      videoId: id,
      startSeconds: start
    }).playVideo().mute();
  }

  function setup() {
    // Se o player do YouTube e lista do Google Drive foram criadas, play nos vídeos
    if (doneYT && doneList && !started) {
      loadVid(videoList[currentVid].id, videoList[currentVid].start);
      started = true;
    }
  }

})();
