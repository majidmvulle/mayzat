Ball.Preloader = function(game) {};
Ball.Preloader.prototype = {
	preload: function() {
		this.preloadBg = this.add.sprite(500, (Ball._HEIGHT-145)*0.5*2, 'preloaderBg');
		this.preloadBar = this.add.sprite(570, (Ball._HEIGHT-50)*0.5*1.78, 'preloaderBar');
		this.load.setPreloadSprite(this.preloadBar);

		this.load.image('ball', 'img/head.png');
		this.load.image('hole', 'img/hole.png');
		this.load.image('element-w', 'img/element-w.png');
		this.load.image('element-h', 'img/element-h.png');
		this.load.image('panel', 'img/panel.png');
		this.load.image('title', 'img/title.png');
		this.load.image('button-pause', 'img/button-pause.png');
		this.load.image('screen-bg', 'img/screen-bg.png');
		this.load.image('screen-mainmenu', 'img/screen-mainmenu.png');
		this.load.image('screen-howtoplay', 'img/screen-howtoplay.png');
		this.load.image('border-horizontal', 'img/border-horizontal.png');
		this.load.image('border-vertical', 'img/border-vertical.png');
        this.load.image('text-mainmenu', 'img/text-mainmenu.png');
        this.load.image('start-button', 'img/start-button.png');

        this.load.image('wall-tall', 'img/wall-tall.png');
		this.load.image('wall-wide', 'img/wall-wide.png');

        this.load.image('obstacle-1', 'img/obstacles-01.png');
        this.load.image('obstacle-2', 'img/obstacles-02.png');
        this.load.image('obstacle-3', 'img/obstacles-03.png');
        this.load.image('obstacle-4', 'img/obstacles-04.png');

		this.load.spritesheet('button-audio', 'img/button-audio.png', 35, 35);
		this.load.spritesheet('button-start', 'img/button-start.png', 291, 76);

		this.load.audio('audio-bounce', ['audio/bounce.ogg', 'audio/bounce.mp3', 'audio/bounce.m4a']);
        this.load.audio('audio-ouch', ['audio/ouch.m4a', 'audio/ouch.mp3', 'audio/ouch.ogg']);
        this.load.audio('audio-hah', ['audio/hah.m4a', 'audio/hah.mp3', 'audio/hah.ogg']);
	},
	create: function() {
		this.game.state.start('MainMenu');
	}
};
