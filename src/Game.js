Ball.Level = function(maze, obstacles) {
    this.maze = maze;
    this.obstacles = obstacles;
}

Ball.Level.prototype.show = function() {
    this.maze.visible = true;
    this.obstacles.visible = true;
}

Ball.Level.prototype.hide = function() {
    this.maze.visible = false;
    this.obstacles.visible = false;
}

Ball.OBSTACLES = {
    'syringe' : 'obstacle-1',
    'bill': 'obstacle-2',
    'fence': 'obstacle-3',
    'cone': 'obstacle-4'
}

Ball.Game = function(game) {};
Ball.Game.prototype = {
	create: function() {
		this.add.sprite(0, 0, 'screen-bg');
		this.add.sprite(0, 0, 'panel');

        this.panelHeight = 52;

		this.physics.startSystem(Phaser.Physics.ARCADE);
		this.fontSmall = { font: "16px Arial", fill: "#e4beef" };
		this.fontBig = { font: "24px Arial", fill: "#e4beef" };
		this.fontMessage = { font: "24px Arial", fill: "#e4beef",  align: "center", stroke: "#320C3E", strokeThickness: 4 };
		this.audioStatus = true;
		this.timer = 0;
		this.totalTimer = 0;
		this.level = 1;
		this.maxLevels = 3;
		this.movementForce = 10;
		this.ballStartPos = { x: Ball._WIDTH*0.5, y: 450 };

		this.pauseButton = this.add.button(Ball._WIDTH-8, 8, 'button-pause', this.managePause, this);
		this.pauseButton.anchor.set(1,0);
		this.pauseButton.input.useHandCursor = true;
		this.audioButton = this.add.button(Ball._WIDTH-this.pauseButton.width-8*2, 8, 'button-audio', this.manageAudio, this);
		this.audioButton.anchor.set(1,0);
		this.audioButton.input.useHandCursor = true;
		this.audioButton.animations.add('true', [0], 10, true);
		this.audioButton.animations.add('false', [1], 10, true);
		this.audioButton.animations.play(this.audioStatus);
		this.timerText = this.game.add.text(15, 15, "Time: "+this.timer, this.fontBig);
		this.levelText = this.game.add.text(120, 10, "Level: "+this.level+" / "+this.maxLevels, this.fontSmall);
		this.totalTimeText = this.game.add.text(120, 30, "Total time: "+this.totalTimer, this.fontSmall);

		this.hole = this.add.sprite(Ball._WIDTH*0.5, 90, 'hole');
		this.physics.enable(this.hole, Phaser.Physics.ARCADE);
		this.hole.anchor.set(0.5);
		this.hole.body.setSize(2, 2);

		this.ball = this.add.sprite(this.ballStartPos.x, this.ballStartPos.y, 'ball');
		this.ball.anchor.set(0.5);
		this.physics.enable(this.ball, Phaser.Physics.ARCADE);
		this.ball.body.setSize(18, 18);
		this.ball.body.bounce.set(0.3, 0.3);

		this.initLevels();
		this.showLevel(1);
		this.keys = this.game.input.keyboard.createCursorKeys();

		Ball._player = this.ball;
		window.addEventListener("deviceorientation", this.handleOrientation, true);

		this.time.events.loop(Phaser.Timer.SECOND, this.updateCounter, this);

		this.borderGroup = this.add.group();
		this.borderGroup.enableBody = true;
		this.borderGroup.physicsBodyType = Phaser.Physics.ARCADE;
		this.borderGroup.create(0, 50, 'border-horizontal');
		this.borderGroup.create(0, Ball._HEIGHT-2, 'border-horizontal');
		this.borderGroup.create(0, 0, 'border-vertical');
		this.borderGroup.create(Ball._WIDTH-2, 0, 'border-vertical');
		this.borderGroup.setAll('body.immovable', true);
		this.bounceSound = this.game.add.audio('audio-ouch');
        this.hahSound = this.game.add.audio('audio-hah');

	},
	initLevels: function() {
		this.levels = [];
		this.levelData = [
			[
				{ x: 305, y: 450, t: 'wall-tall', s: '700' },
				{ x: 580, y: 0, t: 'wall-tall', s: '250' },
				{ x: 100, y: 325, t: 'wall-wide', s: '250' },
				{ x: 451, y: 325, t: 'wall-wide', s: '450' },
				{ x: 550, y: 525, t: 'wall-wide', s: '300' },
				{ x: 705, y: 120, t: 'wall-tall', s: '225' },
				{ x: 851, y: 125, t: 'wall-wide', s: '450' },
                { x: 0, y: 100, t: 'syringe', q: 0 },
                { x: 0, y: 200, t: 'bill', q:1 },
                { x: 0, y: 300, t: 'fence', q:2 },
                { x: 0, y: 400, t: 'cone',  q: 3}
			],
			[
				{ x: 100, y: 100, t: 'wall-wide', s: '1050' },
				{ x: 0, y: 200, t: 'wall-wide', s: '600' },
				{ x: 600, y: 170, t: 'wall-tall', s: '100' },
				{ x: 700, y: 170, t: 'wall-tall', s: '100' },
				{ x: 725, y: 200, t: 'wall-wide', s: '600' },
				{ x: 725, y: 325, t: 'wall-wide', s: '450' },
				{ x: 125, y: 325, t: 'wall-wide', s: '450' },
				{ x: 305, y: 450, t: 'wall-wide', s: '700' },
				{ x: 100, y: 325, t: 'wall-tall', s: '250' },
				{ x: 1151, y: 325, t: 'wall-tall', s: '250' },
				{ x: 550, y: 525, t: 'wall-tall', s: '100' },
				{ x: 700, y: 525, t: 'wall-tall', s: '100' }
			],
			[
				{ x: 0, y: 325, t: 'wall-wide', s: '300' },
				{ x: 0, y: 105, t: 'wall-wide', s: '300' },
				{ x: 90, y: 220, t: 'wall-wide', s: '334' },
				{ x: 1000, y: 250, t: 'wall-wide', s: '300' },
				{ x: 705, y: 390, t: 'wall-wide', s: '400' },
				{ x: 400, y: 250, t: 'wall-wide', s: '400' },
				{ x: 505, y: 500, t: 'wall-wide', s: '400' },
				{ x: 1005, y: 500, t: 'wall-wide', s: '400' },
				{ x: 405, y: 410, t: 'wall-wide', s: '200' },
				{ x: 90, y: 325, t: 'wall-tall', s: '250' },
				{ x: 1070, y: 75, t: 'wall-tall', s: '200' },
				{ x: 570, y: 0, t: 'wall-tall', s: '200' },
				{ x: 1170, y: 165, t: 'wall-tall', s: '250' },
				{ x: 870, y: 165, t: 'wall-tall', s: '250' },
				{ x: 605, y: 334, t: 'wall-tall', s: '100' },
				{ x: 400, y: 225, t: 'wall-tall', s: '300' },
				{ x: 300, y: 425, t: 'wall-tall', s: '150' },
				{ x: 200, y: 425, t: 'wall-tall', s: '400' }
			]
		];
		for(var i=0; i<this.maxLevels; i++) {
			var maze = this.add.group(),
                obstacles = this.add.group();

            // maze body
			maze.enableBody = true;
			maze.physicsBodyType = Phaser.Physics.ARCADE;

            //obstacles
            obstacles.enableBody = true;
            obstacles.physicsBodyType = Phaser.Physics.ARCADE;

			for(var e=0; e<this.levelData[i].length; e++) {
				var item = this.levelData[i][e];
                switch (item.t) {
                    case 'wall-wide': {
                        var wall = maze.create(item.x, item.y + this.panelHeight, 'wall-wide');
                        wall.scale.setTo(Number(item.s) / 1000, 1);
                        wall.data = item
                        break;
                    }

                    case 'wall-tall': {
                        var wall = maze.create(item.x, item.y + this.panelHeight, 'wall-tall');
                        wall.scale.setTo(1, Number(item.s) / 1000);
                        wall.data = item
                        break;
                    }

                    case 'syringe':
                    case 'bill':
                    case 'fence':
                    case 'cone': {
                        var obstacle = obstacles.create(item.x, item.y + this.panelHeight, Ball.OBSTACLES[item.t])
                        obstacle.scale.setTo(0.5, 0.5);
                        obstacle.data = item
                        break;
                    }

                    default: {
                        maze.create(item.x, item.y, 'element-'+item.t);
                        break;
                    }
                }
			}

			maze.setAll('body.immovable', true);
            obstacles.setAll('body.immovable', true)

            var level = new Ball.Level(maze, obstacles)
            level.hide()
			this.levels.push(level);
		}
	},
	showLevel: function(level) {
		var lvl = level | this.level;
		if(this.levels[lvl-2]) {
			this.levels[lvl-2].hide();
		}
		this.levels[lvl-1].show();
	},
	updateCounter: function() {
		this.timer++;
		this.timerText.setText("Time: "+this.timer);
		this.totalTimeText.setText("Total time: "+(this.totalTimer+this.timer));
	},
	managePause: function() {
		this.game.paused = true;
		var pausedText = this.add.text(Ball._WIDTH*0.5, 250, "Game paused,\ntap anywhere to continue.", this.fontMessage);
		pausedText.anchor.set(0.5);
		this.input.onDown.add(function(){
			pausedText.destroy();
			this.game.paused = false;
		}, this);
	},
	manageAudio: function() {
		this.audioStatus =! this.audioStatus;
		this.audioButton.animations.play(this.audioStatus);
	},
	update: function() {
		if(this.keys.left.isDown) {
			this.ball.body.velocity.x -= this.movementForce;
		}
		else if(this.keys.right.isDown) {
			this.ball.body.velocity.x += this.movementForce;
		}
		if(this.keys.up.isDown) {
			this.ball.body.velocity.y -= this.movementForce;
		}
		else if(this.keys.down.isDown) {
			this.ball.body.velocity.y += this.movementForce;
		}
		this.physics.arcade.collide(this.ball, this.borderGroup, this.wallCollision, null, this);
		this.physics.arcade.collide(this.ball, this.levels[this.level-1].maze, this.wallCollision, null, this);
        this.physics.arcade.collide(this.ball, this.levels[this.level-1].obstacles, this.obstacleCollision, null, this);
		this.physics.arcade.overlap(this.ball, this.hole, this.finishLevel, null, this);
	},
	wallCollision: function(ball, wall) {
		if(this.audioStatus) {
			this.bounceSound.play();
		}
		// Vibration API
		if("vibrate" in window.navigator) {
			window.navigator.vibrate(100);
		}

        if (wall.data.t) {
            // hit element with data
            // console.log('You have hit', obstacle.data.t)
        }
	},

    obstacleCollision: function(ball, obstacle) {
        if(this.audioStatus) {
			this.hahSound.play();
		}
		// Vibration API
		if("vibrate" in window.navigator) {
			window.navigator.vibrate(100);
		}

        if (obstacle.data.t) {
            // console.log('You have hit', obstacle.data.t, 'question', obstacle.data.q)
        }
    },

	handleOrientation: function(e) {
		// Device Orientation API
		var x = e.gamma; // range [-90,90], left-right
		var y = e.beta;  // range [-180,180], top-bottom
		var z = e.alpha; // range [0,360], up-down
		Ball._player.body.velocity.x += x;
		Ball._player.body.velocity.y += y*0.5;
	},
	finishLevel: function() {
		if(this.level >= this.maxLevels) {
			this.totalTimer += this.timer;
			alert('Congratulations, game completed!\nTotal time of play: '+this.totalTimer+' seconds!');
			this.game.state.start('MainMenu');
		}
		else {
			alert('Congratulations, level '+this.level+' completed!');
			this.totalTimer += this.timer;
			this.timer = 0;
			this.level++;
			this.timerText.setText("Time: "+this.timer);
			this.totalTimeText.setText("Total time: "+this.totalTimer);
			this.levelText.setText("Level: "+this.level+" / "+this.maxLevels);
			this.ball.body.x = this.ballStartPos.x;
			this.ball.body.y = this.ballStartPos.y;
			this.ball.body.velocity.x = 0;
			this.ball.body.velocity.y = 0;
			this.showLevel();
		}
	},
	render: function() {
		// this.game.debug.body(this.ball);
		// this.game.debug.body(this.hole);
	}
};
