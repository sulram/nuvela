;(function() {

  // URL do JavaScript do API do YouTube
  var tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';

  // Inserir script da API do YouTube
  var firstScriptTag = document.getElementsByTagName( 'script' )[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  var player;
  var interval;
  var currentVid = 0;
  var started = false;
  var showMenuFirstTime = true;
  var mute = false;
  var doneList = false;
  var doneYT = false;

  // URL da planilha
  var sheetId = '1vnzlSBVUoT9aARJzQPNosx3eTPhFJNKr3G_G3XDV-w8';

  // URL da planilha convertida em JSON
  var sheetUrl = 'https://spreadsheets.google.com/feeds/list/' + sheetId + '/od6/public/values?alt=json';

  // Lista de videos
  var videoList = new Array();

  $.getJSON( sheetUrl, function( data ) {
    var entry = data.feed.entry;
    var currentId;
    var currentStart;
    var currentEnd;
    
    var qtyResults;

    $( entry ).each(function() {
      currentId = this.gsx$videoid.$t;
      currentStart = this.gsx$start.$t;
      currentEnd = this.gsx$end.$t;

      // Verifica se o ID do vídeo do YouTube não é 'null' e nem string vazia
      if ( currentId.length == 11 ) {

        // Verifica se o Tempo Inicial não é 'null', nem string vazia e não respeita o formato ...MM:SS
        if ( currentStart && checkRegExp( currentStart ) ) {
          currentStart = toSecond( currentStart );

          // Verifica se o Tempo Final não é 'null', nem string vazia e não respeita o formato ...MM:SS
          if ( currentEnd && checkRegExp(currentEnd ) ) {
            currentEnd = toSecond(currentEnd);

            // Verifica se o Tempo Final é maior que o Tempo Inicial
            if ( currentEnd > currentStart ) {
              videoList.push({
                'id': currentId,
                'start': currentStart,
                'end': currentEnd
              });
            }
          }
        }
      }
    });

    // Embaralha a lista de vídeos validados vinda do Google Drive
    shuffleList( videoList );

    doneList = true;
    setup();
  });

  // Quando a API for carregada, cria o player de vídeo
  window.onYouTubeIframeAPIReady = function() {
    player = new YT.Player(
      'player',
      {
        videoId: '',
        playerVars: {
          controls: 0,
          disablekb: 1,
          showinfo: 0,
          start: 0
      },
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onStatChange,
        'onError': nextVideo
      }
    });
  }

  function onPlayerReady() {
    doneYT = true;
    setup();
  }

  function onStatChange() {
    if ( player.getPlayerState() == YT.PlayerState.PLAYING ) {
      interval = setInterval( playVid, 500 );

      setDataVideo();

      // Remover o load quando o vídeo for carregado
      $( '.nuvela-load' ).addClass( 'hide' );
      $( '#menu .title' ).removeClass( 'hidden' );
    } else {
      clearInterval( interval );
    }
  }

  function playVid() {
    var currentTime = parseInt( player.getCurrentTime() );

    if ( currentTime >= videoList[currentVid].end ) {
      nextVideo();
    }
  }

  function nextVideo() {
    currentVid = ( currentVid < videoList.length - 1 ) ? currentVid + 1 : 0;
    loadVid( videoList[currentVid].id, videoList[currentVid].start );
    //$('#menu .title .name').text();
  }

  function loadVid( id, start ) {
    // Mostar o load toda vez que um video for carregado
    $( '.nuvela-load' ).removeClass( 'hide' );
    $( '#menu .title' ).addClass( 'hidden' );

    player.loadVideoById({
      videoId: id,
      startSeconds: start
    }).playVideo();
  }

  function setup() {
    // Se o player do YouTube e lista do Google Drive foram criadas, play nos vídeos
    if ( doneYT && doneList && !started ) {
      loadVid( videoList[currentVid].id, videoList[currentVid].start );
      started = true;
    }
  }

  // Converte o tempo no formato ...MM:SS em inteiro e tempo equivalente em segundos
  function toSecond( time ) {
    var str = time.split( ':' )

    return ( parseInt(str[0]) * 60) + parseInt(str[1] );
  }

  function checkRegExp( time ) {
    var rEx = /^\d+:[0-5]\d$/;

    return rEx.test( time );
  }

  function shuffleList(list) {
    // Conta quantos ID do YouTube tem no Google Drive
    var qtyResults = list.length;

    while ( qtyResults ) {
      var i = Math.floor( Math.random() * qtyResults );

      qtyResults--;

      // Troca o último elmento por esse
      var shuffled = list[qtyResults];
      list[qtyResults] = list[i]
      list[i] = shuffled;
    }
  }

  // Inseri o Título e URL pra link externo do Vídeo
  function setDataVideo() {
    var title = player.getVideoData().title;
    var videoUrl = 'https://www.youtube.com/embed/' + videoList[currentVid].id + '?autohide=1&autoplay=1&cc_load_policy=0&color=white&controls=2&h1=por&iv_load_policy=3&rel=0';

    $( '#menu .title .name' ).text( title );
    $( '#menu .nav .watch' ).attr( 'href', videoUrl );
  }

  // Evento de click no botão Menu
  $( '#menu-btn' ).click(function() {
    var menu = $( '#menu' );
    var menuButton = $( '#menu-btn' );
    var logo = $( '#logo' );

    if ( showMenuFirstTime ) {
      menu.addClass( 'active' );
      menuButton.addClass( 'close' );
      logo.addClass( 'opaque' );
      showMenuFirstTime = false;
      return;
    }

    menu.toggleClass( 'active inactive' );
    menuButton.toggleClass( 'close more' );
    logo.toggleClass( 'opaque' );
  });

  // Evento de click Mute
  $( '.mute' ).click(function() {
    if ( !$( '.nuvela-load' ).hasClass( 'hide' ) ) {
      return;
    }

    var $this = $( this );

    mute = !mute;

    if ( mute ) {
      player.mute();
      $this.removeClass( 'sound-icon' );
      $this.addClass( 'mute-icon' );
    } else {
      player.unMute();
      $this.removeClass( 'mute-icon' );
      $this.addClass( 'sound-icon' );
    }
  });

})();
