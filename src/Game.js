Ball.Level = function(maze, obstacles, collectibles, exit) {
    this.maze = maze;
    this.obstacles = obstacles;
    this.collectibles = collectibles;
    this.exit = exit;
}

Ball.Level.prototype.show = function() {
    this.maze.visible = true;
    this.obstacles.visible = true;
    this.collectibles.visible = true;
}

Ball.Level.prototype.hide = function() {
    this.maze.visible = false;
    this.obstacles.visible = false;
    this.collectibles.visible = false;
}

Ball.OBSTACLES = {
    'syringe' : 'obstacle-1',
    'bill': 'obstacle-2',
    'fence': 'obstacle-3',
    'cone': 'obstacle-4'
};

Ball.QUESTIONS = [
    {
        'title': "Didn't get pre-authorization",
        'body': 'The plan you selected requires pre-authorization for dental benefits and the fancy pancy place\n'
            + 'you want to go to did not get pre-authorized. You get so bummed you decide to sit and sulk.',
        'button' : 'Continue'
    },
    {
        'title': "Treatment not covered by policy",
        'body': 'What is this rash you got i all bad places? Better get that checked out. As you get to the\n'
            + 'hospital they present you with a list of all the deseases that your plan do not cover - and this is one of them!\n'
            + 'Bummer, you should have considered your health insurance plan more thoughtfully.',
        'button' : 'Pay full price for treatment'
    },
    {
        'title': "Drug is excluded from your plan",
        'body': 'The creams for that nasty rash of yours is sadly excluded from your plan. You didn\'t even\n'
                + 'consider asking about which medicines are included or not in your plan when you first bought it.'
                + 'It\'s ok. Shit happens.',
        'button' : 'Consider using home remedies'
    },
    {
        'title': "Wrong doctor",
        'body': 'What?? The the general practitioner you visited can\'t help you with your nasty rash. \nYou get referred to a dermatologist. You\'ll have to spend both more time and money.',
        'button' : 'Schedule a new visit'
    },
]

Ball.Game = function(game) {};
Ball.Game.prototype = {
    create: function() {
        var horizontalScale = 4;
        var screenWidth = 1280;

        var screenBg = this.add.sprite(0, 0, 'screen-bg');
        screenBg.scale.setTo(horizontalScale, 2);
        var panelSprite = this.add.sprite(0, 0, 'panel');
        panelSprite.scale.setTo(horizontalScale, 1);

        this.panelHeight = 52;

		this.physics.startSystem(Phaser.Physics.ARCADE);
        this.fontQuestionTitle = { font: "24px Tahoma", fill: "#fff",  align: "center" };
        this.fontQuestionBody = { font: "16px Tahoma", fill: "#fff",  align: "center"  };
        this.fontQuestionButton = { font: "16px Tahoma", fill: "#fff" };
		this.fontSmall = { font: "16px Tahoma", fill: "#ffffff" };
		this.fontBig = { font: "24px Tahoma", fill: "#ffffff" };
		this.fontMessage = { font: "24px Tahoma", fill: "#ffffff",  align: "center", stroke: "#000000", strokeThickness: 2 };

		this.audioStatus = true;
		this.timer = 0;
		this.totalTimer = 0;
		this.level = 1;
		this.maxLevels = 3;
		this.movementForce = 10;
		this.ballStartPos = { x: Ball._WIDTH*0.5, y: 450 };

		this.pauseButton = this.add.button(screenWidth - 15, 8, 'button-pause', this.managePause, this);
		this.pauseButton.anchor.set(1,0);
		this.pauseButton.input.useHandCursor = true;
        this.pauseButton.animations.add('true', [0], 10, true);
        this.pauseButton.animations.add('false', [1], 10, true);
		this.audioButton = this.add.button(screenWidth - 60, 8, 'button-audio', this.manageAudio, this);
		this.audioButton.anchor.set(1,0);
		this.audioButton.input.useHandCursor = true;
		this.audioButton.animations.add('true', [0], 10, true);
		this.audioButton.animations.add('false', [1], 10, true);
		this.audioButton.animations.play(this.audioStatus);
		this.timerText = this.game.add.text(15, 8, "Time: "+this.timer, this.fontBig);
		this.totalTimeText = this.game.add.text(120, 15, "Total time: "+this.totalTimer, this.fontSmall);
        this.levelText = this.game.add.text(250, 14, "Level: " + this.level + " / " + this.maxLevels, this.fontSmall);

        this.hole = this.add.sprite(Ball._WIDTH*0.5, 90, 'hole');
		this.physics.enable(this.hole, Phaser.Physics.ARCADE);
		this.hole.anchor.set(0.5);
		this.hole.body.setSize(2, 2);

		this.ball = this.add.sprite(this.ballStartPos.x, this.ballStartPos.y, 'ball');
		this.ball.anchor.set(0.5);
		this.physics.enable(this.ball, Phaser.Physics.ARCADE);
		this.ball.body.setSize(30, 30);
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

        var horizontalGroup1 = this.borderGroup.create(0, 50, 'border-horizontal');
        horizontalGroup1.scale.setTo(horizontalScale, 1);

        var horizontalGroup2 = this.borderGroup.create(0, 710, 'border-horizontal');
        horizontalGroup2.scale.setTo(horizontalScale, 1);

        var verticalGroup1 = this.borderGroup.create(0, 0, 'border-vertical');
        verticalGroup1.scale.setTo(1, 1.48);

        var verticalGroup2 = this.borderGroup.create(screenWidth - 2, 0, 'border-vertical');
        verticalGroup2.scale.setTo(1, 1.48);

		this.borderGroup.setAll('body.immovable', true);

		this.bounceSound = this.game.add.audio('audio-ouch');
        this.hahSound = this.game.add.audio('audio-hah');

	},
	initLevels: function() {
		this.levels = [];
		this.levelData = [
			[
				{ x: 305, y: 450, t: 'wall-tall', s: '210' },
				{ x: 580, y: 0, t: 'wall-tall', s: '250' },
				{ x: 100, y: 325, t: 'wall-wide', s: '250' },
				{ x: 451, y: 325, t: 'wall-wide', s: '450' },
				{ x: 550, y: 525, t: 'wall-wide', s: '300' },
				{ x: 705, y: 120, t: 'wall-tall', s: '225' },
				{ x: 851, y: 125, t: 'wall-wide', s: '450' },
				{ x: 900, y: 50, t: 'syringe', q: 0 },
				{ x: 550, y: 250, t: 'bill', q: 1 },
				{ x: 800, y: 200, t: 'fence', q: 2 },
				{ x: 600, y: 400, t: 'cone',  q: 3 },
				{ x: 1100, y: 100, t: 'exit' },
                { x: 100, y: 100, t: 'bayzat' }
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
				{ x: 700, y: 525, t: 'wall-tall', s: '100' },
				{ x: 1200, y: 50, t: 'syringe', q: 0 },
				{ x: 450, y: 120, t: 'bill', q:1 },
				{ x: 1100, y: 250, t: 'fence', q:2 },
				{ x: 600, y: 400, t: 'cone',  q: 3},
				{ x: 660, y: 100, t: 'exit' },
                { x: 200, y: 200, t: 'bayzat' }
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
				{ x: 200, y: 425, t: 'wall-tall', s: '233' },
				{ x: 300, y: 120, t: 'syringe', q: 0 },
				{ x: 750, y: 120, t: 'bill', q:1 },
				{ x: 1100, y: 350, t: 'fence', q:2 },
				{ x: 330, y: 400, t: 'cone',  q: 3},
				{ x: 100, y: 100, t: 'exit' },
                { x: 0, y: 0, t: 'bayzat' }
			]
		];
		for(var i=0; i<this.maxLevels; i++) {
			var maze = this.add.group(),
                obstacles = this.add.group(),
                collectibles = this.add.group(),
                exit = {}

            // maze body
            this.makePhysicsBody(maze);
            this.makePhysicsBody(obstacles);
            this.makePhysicsBody(collectibles);

			for(var e = 0; e<this.levelData[i].length; e++) {
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

                    case 'exit': {
                        exit.x = item.x;
                        exit.y = item.y;
                        break;
                    }

                    case 'bayzat': {
                        var collectible = collectibles.create(item.x, item.y + this.panelHeight, 'bayzat')
                        collectible.scale.setTo(0.5, 0.5);
                        collectible.data = item
                        break;
                    }

                    default: {
                        maze.create(item.x, item.y, item.t);
                        break;
                    }
                }
			}

			maze.setAll('body.immovable', true);
            obstacles.setAll('body.immovable', true)
            collectibles.setAll('body.immovable', true)

            var level = new Ball.Level(maze, obstacles, collectibles, exit)
            level.hide()
			this.levels.push(level);
		}
	},
    makePhysicsBody: function(item) {
        item.enableBody = true;
        item.physicsBodyType = Phaser.Physics.ARCADE;
    },
	showLevel: function(level) {
		var lvl = level | this.level;
		if(this.levels[lvl-2]) {
			this.levels[lvl-2].hide();
		}
        this.hole.x = this.levels[lvl-1].exit.x;
        this.hole.y = this.levels[lvl-1].exit.y;
		this.levels[lvl-1].show();
	},
	updateCounter: function(seconds) {
	    if(seconds) {
	        this.timer+=seconds;
        } else {
          this.timer++;
        }
		this.timerText.setText("Time: "+this.timer);
		this.totalTimeText.setText("Total time: "+(this.totalTimer+this.timer));
	},

	managePause: function() {
		this.game.paused = true;
		var pausedText = this.add.text(630, 250, "Game paused,\ntap anywhere to continue.", this.fontMessage);
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
        this.physics.arcade.collide(this.ball, this.levels[this.level-1].collectibles, this.collectibleCollision, null, this);
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
             console.log('You have hit', obstacle.data.t, 'question', obstacle.data.q, Ball.QUESTIONS[obstacle.data.q])
            this.showQuestion(Ball.QUESTIONS[obstacle.data.q]);
        }
    },

    collectibleCollision: function(ball, collectible) {
        // if(this.audioStatus) {
        //     this.hahSound.play();
        // }
        // // Vibration API
        // if("vibrate" in window.navigator) {
        //     window.navigator.vibrate(100);
        // }

        if (collectible.data.t) {
            this.levels[this.level-1].collectibles.remove(collectible)
            this.levels[this.level-1].obstacles.destroy()
        }
    },


    showQuestion: function (question) {
        this.game.paused = true;
        this.questionBg = this.add.sprite(Ball._WIDTH*0.3, 200, 'panel')
        this.questionBg.scale.setTo(3, 5)
        this.questionTitle = this.add.text(Ball._WIDTH*0.5, 250, question.title, this.fontQuestionTitle);
        this.questionBody = this.add.text(Ball._WIDTH*0.5, 320, question.body, this.fontQuestionBody);
        this.questionButton = this.add.text(Ball._WIDTH*0.5, 400, question.button, this.fontQuestionButton);
        this.questionButton.anchor.set(0, 0.5);
        this.questionTitle.anchor.set(0, 0.5);
        this.questionBody.anchor.set(0, 0.5);
        this.input.onDown.add(function(){
            this.hideQuestion();
        }, this);
    },

    hideQuestion: function() {
        this.questionTitle.destroy();
        this.questionBody.destroy();
        this.questionButton.destroy();
        this.questionBg.destroy();
        this.updateCounter(3);
        this.game.paused = false;
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
