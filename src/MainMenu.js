Ball.MainMenu = function(game) {};
Ball.MainMenu.prototype = {
	create: function() {
		this.add.sprite(0, 0, 'screen-mainmenu');
		this.gameTitle = this.add.sprite(300, 150, 'title');
		this.gameTitle.anchor.set(0,0);
        this.gameDescription = this.add.sprite(140, 300, 'text-mainmenu');
        this.gameDescription.anchor.set(0,0);

		this.startButton = this.add.button(370, 550, 'button-start', this.startGame, this, 2, 0, 1);
		this.startButton.anchor.set(0,0);
		this.startButton.input.useHandCursor = true;

		// button to "read the article"
	},
	startGame: function() {
		this.game.state.start('Howto');
	}
};