var musicStarted = false;
playMusic();

function playMusic() {
    if (musicStarted == false) {
        //play('1');
        //musicStarted = true;
    }

}

function play(songNumber) {
    var song;
    song = new Howl({
        src: ['assets/pump-songs/' + songNumber + '.ogg'],
        //src: ['assets/pump-songs/1test.mp3'],
        html5: true, // Force to HTML5 so that the audio can stream in (best for large files).
        autoplay: true,
        onend: function () {
            songNumber++;
            if (songNumber == 6) {
                songNumber = 1;
            }
            play(songNumber);
        },
        onplayerror: function () {
            musicStarted = false;
        }
    });

    song.play();
    musicStarted = true;

}