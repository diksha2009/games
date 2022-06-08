class Game {
  constructor() {
    this.resetTitle = createElement("h2");
    this.resetButton = createButton("");

    this.leadrboard = createElement("h2")
    this.leader1 = createElement("h2")
    this.leader2 = createElement("h2")
    this.playermoving=false
    this.leftKeyActive=false
    this.blast=false
  }

  getState() {
    var gameStateRef = database.ref("gameState");
    gameStateRef.on("value", function (data) {
      gameState = data.val();
    });
  }
  update(state) {
    database.ref("/").update({
      gameState: state
    });
  }

  start() {
    player = new Player();
    playerCount = player.getCount();

    form = new Form();
    form.display();

    car1 = createSprite(width / 2 - 50, height - 100);
    car1.addImage("car1", car1_img);
    car1.scale = 0.07;
    car1.addImage("blast",blastImage)

    car2 = createSprite(width / 2 + 100, height - 100);
    car2.addImage("car2", car2_img);
    car2.scale = 0.07;
    car2.addImage("blast",blastImage)

    cars = [car1, car2];

    // C38 TA
    fuels = new Group();
    powerCoins = new Group();
    obstacle1Group = new Group();
    obstacle2Group = new Group()


    // Adding fuel sprite in the game
    this.addSprites(fuels, 4, fuelImage, 0.02);

    // Adding coin sprite in the game
    this.addSprites(powerCoins, 18, powerCoinImage, 0.09);

    this.addSprites(obstacle1Group,4,obstacle1Image,0.03 )
    this.addSprites(obstacle2Group,4,obstacle2Image,0.03 )
  }

  // C38 TA1
  addSprites(spriteGroup, numberOfSprites, spriteImage, scale) {
    for (var i = 0; i < numberOfSprites; i++) {
      var x, y;

      x = random(width / 2 + 150, width / 2 - 150);
      y = random(-height * 4.5, height - 400);

      var sprite = createSprite(x, y);
      sprite.addImage("sprite", spriteImage);

      sprite.scale = scale;
      spriteGroup.add(sprite);
    }
  }

  handleElements() {
    form.hide();
    form.titleImg.position(40, 50);
    form.titleImg.class("gameTitleAfterEffect");
    this.resetTitle.html("Reset Game");
    this.resetTitle.class("resetText");
    this.resetTitle.position(width / 2 + 200, 40);

    this.resetButton.class("resetButton");
    this.resetButton.position(width / 2 + 230, 100);

    this.leadrboard.html("LeaderBoard")
    this.leadrboard.class("resetText")
    this.leadrboard.position(width / 3 - 60, 40)

    this.leader1.class("leadersText")
    this.leader2.class("leadersText")

    this.leader1.position(width / 3 - 50, 80)
    this.leader1.position(width / 3 - 50, 130)


  }

  play() {
    this.handleElements();
    this.handleResetButton();
    Player.getPlayersInfo();
    player.getCarsAtEnd()

    if (allPlayers !== undefined) {
      image(track, 0, -height * 5, width, height * 6);
      this.showleaderBoard()
      this.showlife()
      this.showfuelBar()
      //index of the array
      var index = 0;
      for (var plr in allPlayers) {
        //add 1 to the index for every loop
        index = index + 1;

        //use data form the database to display the cars in x and y direction
        var x = allPlayers[plr].positionX;
        var y = height - allPlayers[plr].positionY;

        var currentLife=allPlayers[plr].life
        if(currentLife<=0){
          cars[index-1].changeImage("blast")
          cars[index-1].scale=0.3
        }
        cars[index - 1].position.x = x;
        cars[index - 1].position.y = y;


        // C38  SA
        if (index === player.index) {
          stroke(10);
          fill("red");
          ellipse(x, y, 60, 60);

          this.handleFuel(index);
          this.handlePowerCoins(index);
          this.handleObstacles1(index)
          this.handleObstacles2(index)
          if(player.life<=0){
            this.blast=true
            this.playermoving=false
          }
          // Changing camera position in y direction
          // camera.position.x = cars[index - 1].position.x;
          camera.position.y = cars[index - 1].position.y;

        }
      }

      // handling keyboard events
      if (keyIsDown(UP_ARROW)) {
        player.positionY += 10;
        player.update();
      }
      this.handlePlayerControls();
      const finishLine = height * 6 - 100
      if (player.positionY > finishLine) {
        gameState = 2
        player.rank += 1
        Player.updateCarsAtEnd(player.rank)
        player.update()
        this.showRank()
      }
      drawSprites();
    }
  }

  handleFuel(index) {
    // Adding fuel
    cars[index - 1].overlap(fuels, function (collector, collected) {
      player.fuel = 185;
      //collected is the sprite in the group collectibles that triggered
      //the event
      collected.remove();
     
    });
    if(player.fuel>0 && this.playermoving){
      player.fuel-=0.3 
     }
     if(player.fuel<=0){
      // gameState=2
      // this.gameOver()
    }
  }

  handlePowerCoins(index) {
    cars[index - 1].overlap(powerCoins, function (collector, collected) {
      player.score += 20;
      player.life+=20
      player.update();

      //collected is the sprite in the group collectibles that triggered
      //the event
      collected.remove();
    });
    if(player.life>0 && this.playermoving){
       player.life-=0.3 
      }
      if(player.life<=0){
        // gameState=2
          // this.gameOver()
      }
  }

  handleResetButton() {
    this.resetButton.mousePressed(() => {
      database.ref("/").set({
        playerCount: 0,
        gameState: 0,
        CarsAtEnd:0,
        players: {}
      });
      window.location.reload();
    });
  }
  handlePlayerControls() {
    if(!this.blast){

    
    if (keyIsDown(UP_ARROW)) {
      this.playermoving=true
      player.positionY += 10;
      player.update();
    }

    if (keyIsDown(LEFT_ARROW) && player.positionX > width / 3 - 50) {
      this.playermoving=true
      this.leftzkeyActive=true
      player.positionX -= 5;
      player.update();
    }

    if (keyIsDown(RIGHT_ARROW) && player.positionX < width / 2 + 300) {
      this.playermoving=true
      this.leftzkeyActive=false
      player.positionX += 5;
      player.update();
    }
  }
  }

  showleaderBoard() {
    var leader1, leader2
    var players = Object.values(allPlayers)

    // players[0]=leader1   players[1]=leader2
    // its for when player1 is rank 0 and 1
    if (players[0].rank === 0 && players[1].rank === 0 || players[0].rank === 1) {
      leader1 =
        players[0].rank + "&emsp;" + players[0].name + "&emsp;" + players[0].score
      leader2 =
        players[1].rank + "&emsp;" + players[1].name + "&emsp;" + players[1].score
    }

    // when player2 is rank1
    if (players[1].rank === 1) {
      leader1 =
        players[1].rank + "&emsp;" + players[1].name + "&emsp;" + players[1].score
      leader2 =
        players[0].rank + "&emsp;" + players[0].name + "&emsp;" + players[0].score
    }
    this.leader1.html(leader1)
    this.leader2.html(leader2)

  }

    showRank(){
      swal({
        title:`Awesome ${"\n"} Rank${"\n"} ${player.rank} ${"\n"} Score${player.score}`,
        text: "You clicked the button!",
        imageUr1:"https://raw.githubusercontent.com/vishalgaddam873/p5-multiplayer-car-race-game/master/assets/cup.png",
        imagSize:"100x100",
        confirmButtonText:"Ok",
        icon: "success",
        button: "Aww yiss!",
      });
    }

    gameOver(){
      swal({
        title:`Score${player.score}`,
        text:"You lost the game, better luck next time",
        imageUr1:"https://cdn.shopify.com/s/files/1/1061/1924/products/Thumbs_Down_Sign_Emoji_Icon_ios10_grande.png",
        imagSize:"100x100",
        confirmButtonText:"Ok",
        icon: "success",
        button:"Aww yiss!"
      })
      window.location.reload()
    }
    showlife(){
      push()
      image(lifeImage,width/2-130,height-player.positionY-300,20,20)
      fill("white")
      rect(width/2-100,height-player.positionY-300,180,20)
      fill("yellow")
      rect(width/2-100,height-player.positionY-300,player.life,20)
      
      pop()
    }
    showfuelBar(){
      push()
      image(lifeImage,width/2-130,height-player.positionY-200,20,20)
      fill("white")
      rect(width/2-100,height-player.positionY-200,180,20)
      fill("green")
      rect(width/2-100,height-player.positionY-200,player.fuel,20)
      pop()
    }
    handleObstacles1(index){
      if(cars[index-1].collide(obstacle1Group)){
       if(this.leftKeyActive){
         player.positionX+=100

       }
       else{
         player.positionX-=100
       }
        if(player.life>0){
          player.life-=180/4
        }
        player.update()
      }

    }
    handleObstacles2(index){
      if(cars[index-1].collide(obstacle1Group)){
        if(this.leftKeyActive){
          player.positionX+=100
        }
        else{
          player.positionX-=100
        }
        
        if(player.life>0){
          player.life-=180/4
        }
        player.update()
      }

    }
}