//;(function() {

  var tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";

  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  var player;
  var interval;
  var currentVid = 0;
  var list = [
    {
      id: "wV6rwIrAMCk",
      start: 30,
      end: 33
    },{
      id: "BqY89j-hGPw",
      start: 60,
      end: 63
    },{
      id: "SbufgqXoSgU",
      start: 90,
      end: 93
    }
  ];

  function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
      videoId: list[currentVid].id,
      playerVars: {
        controls: 0,
        disablekb: 1,
        showinfo: 0,
        start: list[currentVid].start
      },
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onStatChange
      }
    });
  }

  function onPlayerReady() {
    player.playVideo().mute();
  }

  function onStatChange() {
    if (player.getPlayerState() == 1) {
      interval = setInterval(playVid, 1000);
    } else {
      clearInterval(interval);
    }
  }

  function playVid() {
    var currentTime = parseInt(player.getCurrentTime());

    if (currentTime >= list[currentVid].end) {
      currentVid = (currentVid < list.length - 1) ? currentVid + 1 : 0;
      loadVid(list[currentVid].id, list[currentVid].start);
    }
  }

  function loadVid(id, start) {
    player.loadVideoById({
      videoId: id,
      startSeconds: start
    }).playVideo().mute();
  }

//})();