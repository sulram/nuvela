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
    var currentId;
    var currentStart;
    var currentEnd;
    var rEx = /^\d+:[0-5]\d$/;
    var qtyResults;

    $(entry).each(function() {
      currentId = this.gsx$videoid.$t;
      currentStart = this.gsx$start.$t;
      currentEnd = this.gsx$end.$t;

      // Verifica se o ID do vídeo do YouTube não é 'null' e nem string vazia
      if (currentId != null && currentId != '') {

        // Verifica se o tempo inicial não é 'null', nem string vazia e não respeita o formato ...MM:SS
        if (currentStart != null && currentStart != '' && rEx.test(currentStart)) {
          currentStart = changeToSecond(currentStart);

          // Verifica se o tempo final não é 'null', nem string vazia e não respeita o formato ...MM:SS
          if (currentEnd != null && currentEnd != '' && rEx.test(currentEnd)) {
            currentEnd = changeToSecond(currentEnd);

            videoList.push({
              'id': currentId,
              'start': currentStart,
              'end': currentEnd
            });
          }
        }
      }
    });

    // Conta quantos ID do YouTube tem no Google Drive
    qtyResults = videoList.length;

    while (qtyResults > 0) {
      var i = Math.floor(Math.random() * qtyResults);

      qtyResults--;

      // Troca o último elmento por esse
      var shuffled = videoList[qtyResults];
      videoList[qtyResults] = videoList[i]
      videoList[i] = shuffled;
    }

    doneList = true;
    setup();
  });

  // Quando a API for carregada, cria o player de vídeo
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
    if (player.getPlayerState() == YT.PlayerState.PLAYING) {
      interval = setInterval(playVid, 500);

      // Remover o load quando o vídeo for carregado
      $('.nuvela-load').addClass('hide');
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
    // Mostar o load toda vez que um video for carregado
    $('.nuvela-load').removeClass('hide');

    player.loadVideoById({
      videoId: id,
      startSeconds: start
    }).playVideo();//.mute();
  }

  function setup() {
    // Se o player do YouTube e lista do Google Drive foram criadas, play nos vídeos
    if (doneYT && doneList && !started) {
      loadVid(videoList[currentVid].id, videoList[currentVid].start);
      started = true;
    }
  }

  // Converte o tempo no formato ...MM:SS em inteiro e tempo equivalente em segundos
  function changeToSecond(time) {
    var str = time.split(':')

    return (parseInt(str[0]) * 60) + parseInt(str[1]);
  }

})();
