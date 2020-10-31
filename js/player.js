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
  var currentVidChapter = 0;
  var started = false;
  var showMenuFirstTime = true;
  var mute = false;
  var doneList = false;
  var doneYT = false;
  var endOpening = false;

  // URL da planilha
  // var sheetId = '1vnzlSBVUoT9aARJzQPNosx3eTPhFJNKr3G_G3XDV-w8';
  var sheetId = '1I2LKnw0Uq275VA21y0SWKEb8EkcokYLoHkEze5plRo8';

  // URL da planilha convertida em JSON
  var sheetUrl = 'https://spreadsheets.google.com/feeds/list/' + sheetId + '/1/public/values?alt=json';

  // Lista de videos
  var videoList = new Array();

  // Quando carregada a página, começa a abertura
  $(window).ready(function() {
    $('#opening').addClass('start');

    // Quando terminar o CSS Animation remove o elemento;
    $('#opening').bind('animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd', function() {
      $('#opening').remove();

      endOpening = true;
      setup();
    });
  });

  $.getJSON( sheetUrl, function( data ) {
    var entry = data.feed.entry;
    var currentId;
    var currentStart;
    var currentEnd;
    var currentChapter;
    var qtyResults;

    $( entry ).each(function() {
      currentId = this.gsx$videoid.$t;
      currentStart = this.gsx$start.$t;
      currentEnd = this.gsx$end.$t;
      currentChapter = this.gsx$chapter.$t;

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
                'end': currentEnd,
                'chapter': Number(currentChapter)
              });
            }
          }
        }
      }
    });

    // Embaralha a lista de vídeos validados vinda do Google Drive
    // shuffleList( videoList );

    console.log('videoList',videoList)

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
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          enablejsapi: 1,
          fs: 0,
          hl: 'pt',
          iv_load_policy: 3,
          origin: 'http://www.upac.com.br/nuvela',
          rel: 0,
          showinfo: 0
      },
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onStatChange,
        'onError': nextVideo
      }
    });

    resizeAndRepositionVideo();
  }

  // Redimencionar e reposicionar o player quando redimencionar o browser
  $( window ).resize( resizeAndRepositionVideo );

  // Evento de click no botão Menu
  $( '#menu-btn' ).click(function() {
    var main = $( '#main' );
    var menu = $( '#menu' );
    var menuButton = $( '#menu-btn' );
    var logo = $( '#logo' );

    if ( showMenuFirstTime ) {
      menu.addClass( 'active' );
      menuButton.addClass( 'close' );
      logo.addClass( 'opaque' );
      main.addClass( 'menu-open' );
      showMenuFirstTime = false;
      return;
    }

    menu.toggleClass( 'active inactive' );
    menuButton.toggleClass( 'close more' );
    logo.toggleClass( 'opaque' );
    main.toggleClass( 'menu-open' );
  });

  $('.controls,#menu-btn').hide()

  $( '.big-play' ).click(function(e) {
    firstPlay()
  })

  $( '.controls .play' ).click(function(e) {
    player.playVideo()
  })

  $( '.controls .pause' ).click(function(e) {
    player.pauseVideo()
  })

  $( '.controls .next-chapter' ).click(function(e) {
    e.preventDefault()
    nextChapter()
  })

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

  // Play no vídeo quando for focus na tela
  function onFocus() {
    player.playVideo();
  }

  // Pause no vídeo quando for blur na tela
  function onBlur() {
    player.pauseVideo();
  }

  function onPlayerReady() {
    doneYT = true;
    setup();
  }

  function firstPlay() {
    player.playVideo()
    $( '.big-play' ).fadeOut(1000).remove()
    $('.controls,#menu-btn').fadeIn(1000)
  }

  function onStatChange() {
    /*
      Retorna o estado do player. Os valores possíveis são:
      -1 – não iniciado
      0 – encerrado
      1 – em reprodução
      2 – em pausa
      3 – armazenando em buffer
      5 – vídeo indicado
    */
    if ( player.getPlayerState() == YT.PlayerState.PLAYING ) {
      
      $('.big-play').length && firstPlay()

      interval = setInterval( playVid, 500 );
      setDataVideo();

      // Remover o load quando o vídeo for carregado
      $( '.nuvela-load' ).addClass( 'hide' );
      $( '#menu .title' ).removeClass( 'hidden' );
      $( '#main' ).addClass('playing')

      console.log('onStatChange','PLAYING')

    } else if ( player.getPlayerState() == YT.PlayerState.ENDED ) {
      // Chamar o próximo vídeo caso o vídeo atual chegue no fim
      nextVideo();
      console.log('onStatChange','ENDED')
    } else if ( player.getPlayerState() == 2 ) {
      $( '#main' ).removeClass('playing')
      console.log('onStatChange','PAUSED')
    } else if ( player.getPlayerState() == 3 ) {
      console.log('onStatChange','BUFFER')
    } else {
      clearInterval( interval );
      console.log('onStatChange', 'ELSE', player.getPlayerState() )
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
  }

  function nextChapter() {
    // busca no array de videos
    // o index do primeiro video do proximo capitulo
    const index = R.findIndex(R.propEq('chapter', currentVidChapter+1), videoList)
    console.log('nextChapter', currentVidChapter, currentVid, index)
    if(index !== -1){
      // proximo capitulo
      currentVid = index
      loadVid( videoList[index].id, videoList[index].start )
    } else {
      // volta pro primeiro video
      currentVid = 0
      loadVid( videoList[0].id, videoList[0].start )
    }
  }

  function loadVid( id, start ) {
    // Mostar o load toda vez que um video for carregado
    $( '.nuvela-load' ).removeClass( 'hide' );
    $( '#menu .title' ).addClass( 'hidden' );

    currentVidChapter = videoList[currentVid].chapter
    console.log('loadVid', currentVidChapter, currentVid)

    player.loadVideoById({
      videoId: id,
      startSeconds: start
    }).playVideo();
  }

  function setup() {
    // Se o player do YouTube, lista do Google Drive foram criadas e a Abertura acabou, play nos vídeos
    if ( doneYT && doneList && endOpening && !started ) {
      loadVid( videoList[currentVid].id, videoList[currentVid].start );
      
      $(window).blur(onBlur);
      $(window).focus(onFocus);

      started = true;
    }
  }

  // Converte o tempo no formato ...MM:SS em inteiro e tempo equivalente em segundos
  function toSecond( time ) {
    var timeList = time.split( ':' );
    var totalTime = 0;
    var t = 0;

    for ( var i = timeList.length - 1; i >= 0; i-- ) {
      totalTime += parseInt( timeList[i] ) * Math.pow( 60, t );

      t++;
    }

    return totalTime;
  }

  function checkRegExp( time ) {
    var timeList = time.split(':');

    if ( timeList.length < 2 || timeList.length > 3 ) {
      return false;
    }

    for ( var i = 0; i < timeList.length; i++ ) {
      if ( parseInt( timeList[i] ) > 59 ) {
        return false;
      }
    }

    return true;
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
    var videoUrl = 'https://www.youtube.com/watch?v=' + videoList[currentVid].id;

    $( '#menu .title .name' ).text( title );
    $( '#menu .nav .watch' ).attr( 'href', videoUrl );
  }

  // Redimencionar e reposicionar o player para ocupar a tela toda
  function resizeAndRepositionVideo() {
    var winH = $( window ).height();
    var winW = $( window ).width();
    var vidH = winH * ( 16 / 9 );
    var vidW = winW * ( 9 / 16 );
    var vidL = ( winW - vidH ) / 2;
    var vidT = ( winH - vidW ) / 2;

    if ( winW < vidH ) {
      $( '#player' ).css( 'width', vidH );
      $( '#player' ).css( 'height', winH );
      $( '#player' ).css( 'left', vidL );
      $( '#player' ).css( 'top', '' );
    } else {
      $( '#player' ).css('width', winW);
      $( '#player' ).css('height', vidW);
      $( '#player' ).css('top',vidT);
      $( '#player' ).css( 'left', '' );
    }
  }

})();
