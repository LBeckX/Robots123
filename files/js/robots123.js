var version = '0.1.5';
console.log("Game version:",version);
var is_playing = false;
var player;
var hit = 0;
var playerName = '';
var ajaxRequest = false;
var sendTrue = 0;
var play = false;
var bgaudio;
var shotaudio;
var ismute = true;
var soundVol = 0;
init();
function init() {
	background_canvas = document.getElementById('background_canvas');
	background_ctx = background_canvas.getContext('2d');
	main_canvas = document.getElementById('main_canvas');
	main_ctx = main_canvas.getContext('2d');
	
	document.addEventListener("keydown",key_down, false);
	document.addEventListener("keyup",key_up, false);
	requestframe = (function(){
		return window.requestAnimationFrame ||
			window.webkidRequestAnimationFrame ||
			window.mozRequestAnimationFrame	||
			window.oRequestAnimationFrame ||
			window.msRequestAnimationFrame ||
			function(callback) {
				window.setTimeout(callback,1000/60)
			};
	})();
	load_media();
	buttons_drawX = [];
	buttons_drawY = [];
	buttons_width = [];
	buttons_height = [];
	buttons_status = [];
	is_menu = true;
	menu_status = 'main';
	menu_sprite.addEventListener("load",start_loop,false);
	media('bgsong');
}

function load_media() {
	button_press_sprite = new Image();
	button_press_sprite.src = 'files/img/button_press.png';
	button_sprite = new Image();
	button_sprite.src = 'files/img/button.png';
	bg_sprite = new Image();
	bg_sprite.src = 'files/img/game_background.png';
	bg2_sprite = new Image();
	bg2_sprite.src = 'files/img/game_background2.jpg';
	bg3_sprite = new Image();
	bg3_sprite.src = 'files/img/game_background3.jpg';
	bg4_sprite = new Image();
	bg4_sprite.src = 'files/img/game_background4.jpg';
	main_sprite = new Image();
	main_sprite.src = 'files/img/robot.png';
	fluzeug_sprite = new Image();
	fluzeug_sprite.src = 'files/img/flieger.png';
	bullet_sprite = new Image();
	bullet_sprite.src = 'files/img/bombe.png';
	explosion_sprite = new Image();
	explosion_sprite.src = 'files/img/explosion.png';
	gun_sprite = new Image();
	gun_sprite.src = 'files/img/gun.png';
	laser_sprite = new Image();
	laser_sprite.src = 'files/img/laser.png';
	menu_sprite = new Image();
	menu_sprite.src = 'files/img/menue.png';
	
	bgaudio = new Audio('files/media/background-music.MP3');
	shotaudio = new Audio('files/media/lasergun_cut.mp3');
	explosionaudio = new Audio('files/media/explosion-flight.mp3');
}

function menu() {
	main_menu_buttons = new Array("New Game");
	pause_menu_buttons = ["Return","New Game"];
	game_over_menu_buttons = main_menu_buttons;

    var menu_buttons="";
	if(menu_status === "main"){
		menu_buttons = main_menu_buttons;
	}
	else if(menu_status === "pause"){
		menu_buttons = pause_menu_buttons;
	}
	else if(menu_status === "game_over"){
		menu_buttons = game_over_menu_buttons;
	}
	if(menu_status === "game_over"){
		main_ctx.textBaseline = "middle";
		main_ctx.textAlign = "center";
		main_ctx.font = "70px Arial";
		main_ctx.fillStyle = "red";
		main_ctx.fillText("Game Over", 800 / 2, 220);
		
		main_ctx.textBaseline = "middle";
		main_ctx.textAlign = "center";
		main_ctx.font = "50px Arial";
		main_ctx.fillStyle = "red";
		main_ctx.fillText("Wave: " + wave + " Score: " + score, 800 / 2, 290);
	}

	background_ctx.drawImage(menu_sprite,0,0,800,600);
	
	for(var i = 0; i < menu_buttons.length; i++){
		var drawX = 600 / 2;
		var drawY = 350 + i * 60;
		var width = 200;
		var height = 50;
		
		if(buttons_status[i] === undefined){
			buttons_status[i] = "normal";
			buttons_drawX[i] = drawX;
			buttons_drawY[i] = drawY;
			buttons_width[i] = width;
			buttons_height[i] = height;
		}
		
		if(buttons_status[i] === "click"){
			if(i === 0 && menu_status === "main" || i === 1 && menu_status === "pause" || i === 0 && menu_status === "game_over"){
				new_game();
			}
			if(i === 0 && menu_status === "pause"){
				is_menu = false;
			}
			buttons_status[i] = "hover";
		}
		
		if(buttons_status[i] === "hover"){
			main_ctx.drawImage(button_press_sprite,drawX,drawY,width,height);
		}
		if(buttons_status[i] === "normal"){
			main_ctx.drawImage(button_sprite,drawX,drawY,width,height);
		}
		
		
		main_ctx.fillStyle = "white";
		main_ctx.font = "30px Arial";
		main_ctx.textBaseline = 'middle';
		main_ctx.textAlign = "center";
		main_ctx.fillText(menu_buttons[i],drawX + width / 2,drawY+height/2);
		
		var userNameCookie = Cookie.get('username');
		
		if(userNameCookie === null){
			if(playerName === ''){
				setCookie();
			}
		}
		else{
			playerName = userNameCookie;
		}
	}
}

function mouse(type,evt) {
	var rect = main_canvas.getBoundingClientRect();
    var x = evt.clientX - rect.left;
    var y = evt.clientY - rect.top;
	
	for(var i = 0; i < buttons_status.length; i++){
		if(x <= buttons_drawX[i] + buttons_width[i] && x >= buttons_drawX[i] && 
		   y <= buttons_drawY[i] + buttons_height[i] && y >= buttons_drawY[i]){
  			if (type === 'move' && buttons_status[i] !== "click")
				buttons_status[i] = "hover";
			else
				buttons_status[i]="click";
		}
		else{
			buttons_status[i] = "normal";
		}
	}
}

function Player() {
	this.life = 100;
	this.drawX = 200;
	this.drawY = 450;
	this.speed = 15;
	this.is_downkey = false;
	this.is_upkey = false;
	this.is_leftkey = false;
	this.is_rightkey = false;
	this.shoot_wait = 0;
	this.is_dead = false;
}

Player.prototype.draw = function() {
	if(this.is_dead === false){
		this.check_keys();
		main_ctx.drawImage(main_sprite,this.drawX,this.drawY);
		main_ctx.drawImage(gun_sprite,this.drawX + 60,this.drawY - 20,30,100);
		
		if(sendTrue === 1){
			sendTrue = 0;
		}
		
		if(this.life <= 0){
			this.is_dead = true;
			this.explode_wait = 50;
		}
		if(score > (wave*13) + (hit+20) || this.life > 100){
			score = 0;
			this.life=0;
		}
	}
	else if(this.explode_wait > 0){
		main_ctx.drawImage(explosion_sprite,this.drawX,this.drawY,120,120);
		this.explode_wait--;
	}
	else{
		is_menu = true;
		menu_status = "game_over";
		
		if(score >= 0 && score <= 4000){
				try{
					ajaxFunction(playerName,score);
				}
				catch(e){alert('Da war ein Fehler')}
			}
	}
};

Player.prototype.check_keys = function() {
	if(this.is_leftkey === true){
		this.drawX -= this.speed;
		if(this.drawX <= -20){
			this.drawX = -20;
		}
	}
	if(this.is_rightkey === true){
		this.drawX += this.speed;
		if(this.drawX >= 750){
			this.drawX = 750;
		}
	}
	if(this.is_space === true && this.shoot_wait <= 0){
		bullets[bullets.length] = new Bullet(this.drawX + 68,this.drawY - 30,true);
		this.shoot_wait = 20;
	} else if(this.is_space === false && this.shoot_wait > 7){
        player.shoot_wait = 7;
	}
	else{
		if(this.shoot_wait >=0){
            this.shoot_wait--;
		}
	}
};

function Enemy() {
	this.drawX = -500 + Math.round(Math.random()*300);
	this.drawY = 20 + Math.round(Math.random()*170);
	this.speed = 3 + Math.random() * 4;
	this.width = 180;
	this.height = 80;
	this.life = 30;
	this.is_dead = false;
	this.explode_wait = 0;
}

Enemy.prototype.draw = function() {
	if(this.is_dead === false){
		this.ai();
		main_ctx.drawImage(fluzeug_sprite,this.drawX,this.drawY);
		
		main_ctx.fillStyle = "black";
		main_ctx.fillRect(this.drawX,this.drawY - 10,100,10);
		
		main_ctx.fillStyle = "red";
		main_ctx.fillRect(this.drawX,this.drawY  - 10 + 1,this.life / 30 * 98,8);
		
		
		if(this.life <= 0){
			try {explosionaudio.currentTime = 0;} catch(e){}
			explosionaudio.volume = soundVol;
			explosionaudio.play();
			
			dead_enemies++;
			this.is_dead = true;
			this.explode_wait = 50;
			score += 10;
			hit += 10;
		}
	}
	else if(this.explode_wait > 0){
		main_ctx.drawImage(explosion_sprite,this.drawX,this.drawY,120,120);
		this.explode_wait--;
	}
};

Enemy.prototype.ai = function() {
	this.drawX += this.speed;
	
	if(this.drawX >= 800){
		this.drawX = -200;
		this.drawY = 30 + Math.round(Math.random()*170);
		this.speed = 3 + Math.random() * 5;
	}
	
	if(Math.round(Math.random()*100) === 50){
		bullets[bullets.length] = new Bullet(this.drawX+60,this.drawY + 40);
	}
};

function Bullet(x,y,is_Player) {
	if(is_Player === true){
		try {shotaudio.currentTime = 0;} catch(e){}
		shotaudio.volume = soundVol;
		shotaudio.play();
		this.is_Player = true;
	}
	else{
		this.is_Player = false;
	}
	this.drawX = x;
	this.drawY = y;
	this.width = 10;
	this.height = 20;
	this.speed = 10;
	this.explodet = false;
	this.wait = 0;
}

Bullet.prototype.draw = function() {
	if(this.explodet === false && this.is_Player === false){
		main_ctx.drawImage(bullet_sprite,this.drawX,this.drawY);
	}
	if(this.explodet === false && this.is_Player === true){
		main_ctx.drawImage(laser_sprite,this.drawX,this.drawY);
	}
	
	if(this.explodet === false){
		if(this.is_Player === true){
			this.drawY -= this.speed;
		}
		else{
			this.drawY += this.speed;
		}
	}
	
	if(this.is_Player === false && this.drawX <= player.drawX + 90 && this.drawX + this.width >= player.drawX
	&& this.drawY <= player.drawY + 80 && this.drawY + this.height >= player.drawY && this.explodet === false){
		player.life -= 10;
		this.explodet = true;
		this.wait = 50;
	}
	
	if(this.is_Player === true){
		for(var i=0; i < enemies.length; i++){
			if(this.drawX <= enemies[i].drawX + 120 && this.drawX + this.width >= enemies[i].drawX 
			&& this.drawY <= enemies[i].drawY + 50 && this.drawY + this.height >= enemies[i].drawY && this.explodet === false
			&& enemies[i].is_dead === false){
				this.explodet = true;
				this.wait = 50;
				enemies[i].life -= 10;
				score++;
				hit++;
			}
		}
	}

	if(this.explodet === true && this.wait > 0){
		main_ctx.drawImage(explosion_sprite,this.drawX,this.drawY,50,50);
		this.wait--;
	}
};

function check_wave() {
	if(spawned_enemies === dead_enemies){
		if(is_timeout){
			main_ctx.fillStyle = "black";
			main_ctx.globalAlpha = 0.7;
			main_ctx.fillRect(800/2 -300 / 2,600 / 2 - 100 / 2,300,100);
			main_ctx.globalAlpha = 1;
			
			main_ctx.fillStyle = "white";
			main_ctx.textAlign = "center";
			main_ctx.textBaseline = "middle";
			main_ctx.font = "50px Arial";
			main_ctx.fillText("Next Wave!", 800 / 2, 600 / 2);
		}
		else{
			is_timeout = true;
			if(spawned_enemies === 0){
				wave ++;
				spawn_enemy(wave);
				is_timeout = false;
			}
			else{
				window.setTimeout(function(){wave ++; spawn_enemy(wave);is_timeout = false;},2000);
			}
			
		}
	}
}

function spawn_enemy(n){
	spawned_enemies += n;
	for(var i=0;i< n;i++){
		enemies[i] = new Enemy();
	}
}

function loop(){
	main_ctx.clearRect(0,0,800,600);
	
	if(is_menu === false){
		if(wave <= 3){
			background_ctx.drawImage(bg_sprite,0,0);
		}
		else if (wave >= 4 && wave <= 7){
			background_ctx.drawImage(bg2_sprite,0,0);
		}
		else if (wave >= 8 && wave <= 11){
			background_ctx.drawImage(bg3_sprite,0,0);
		}
		else{
			background_ctx.drawImage(bg4_sprite,0,0);
		}

		player.draw();
		
		for(i=0; i < enemies.length; i++){
			enemies[i].draw();
		}
		
		for(i=0; i < bullets.length; i++){
			bullets[i].draw();
		}
		
		main_ctx.fillStyle = "gray";
		main_ctx.font = "40px Arial";
		main_ctx.textAlign = "left";
		main_ctx.textBaseline = 'top';
		main_ctx.fillText("Life: " + player.life,0,0);
		
		main_ctx.fillStyle = "black";
		main_ctx.font = "40px Arial";
		main_ctx.textAlign = "right";
		main_ctx.textBaseline = 'top';
		main_ctx.fillText("Wave: " + wave,800,0);
		
		main_ctx.fillStyle = "white";
		main_ctx.font = "40px Arial";
		main_ctx.textAlign = "left";
		main_ctx.textBaseline = 'bottom';
		main_ctx.fillText("Score: " + score,0,600);
		
		check_wave();
		}
	else{
		menu();
	}
	
	
	if(is_playing){
		requestframe(loop);
	}
	
	
}

function new_game(){
	player = new Player();
	enemies = [];
	bullets = [];
	dead_enemies = 0;
	spawned_enemies = 0;
	wave = 0;
	score = 0;
	is_menu = false;
	is_timeout = false;
}

function start_loop(){
	is_playing = true;
	loop();
}

function stop_loop(){
	is_playing = false;
}

function key_down(e){
	var key_id = e.keyCode || e.which;
	if(key_id === 40 ){ // downkey
		player.is_downkey = true;
		e.preventDefault();
	}
	if(key_id === 38 ){ // upkey
		player.is_upkey = true;
		e.preventDefault();
	}
	if(key_id === 37 ) // leftkey
	{
		player.is_leftkey = true;
		e.preventDefault();
	}
	if(key_id === 39 ){ // rightkey
		player.is_rightkey = true;
		e.preventDefault();
	}
	if(key_id === 32){ // Leertaste
		player.is_space = true;
		e.preventDefault();
	}
	
	if(key_id === 27 || key_id === 80) { // esc or p
		is_menu = true;
		menu_status = 'pause';
	}
	
}

function key_up(e){
	var key_id = e.keyCode || e.which;
	if(key_id === 40 ) { // downkey
		player.is_downkey = false;
		e.preventDefault();
	}
	if(key_id === 38 ) {  // upkey
		player.is_upkey = false;
		e.preventDefault();
	}
	if(key_id === 37 ){ // leftkey
		player.is_leftkey = false;
		e.preventDefault();
	}
	if(key_id === 39 ){ // rightkey
		player.is_rightkey = false;
		e.preventDefault();
	}
	if(key_id === 32 ){ // spacebar
		player.is_space = false;
		e.preventDefault();
	}
	
}

function ajaxFunction(playerName20,score10){
	if (window.XMLHttpRequest) {
		ajaxRequest = new XMLHttpRequest(); // Mozilla, Safari, Opera
	} else if (window.ActiveXObject) {
		try {
			ajaxRequest = new ActiveXObject('Msxml2.XMLHTTP'); // IE 5
		} catch (e) {
			try {
				ajaxRequest = new ActiveXObject('Microsoft.XMLHTTP'); // IE 6
			} catch (e) {
				console.error('ajax error:',e);
			}
		}
	}
	
	if(sendTrue !== 1)
	{
		if(playerName20 !== playerName || score10 !== score || menu_status !== "game_over"){
			alert("Schwach!");
		}
		else{
			var string = "name=" + playerName20 + "&score=" + score10;
			var url = '/!script/php/score_handler/score_safer.script.php';
			ajaxRequest.open("post",url,true);
			ajaxRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			ajaxRequest.send(string);

			ajaxRequest.onreadystatechange = function() {
                if (ajaxRequest.readyState === 4) {
                    if (ajaxRequest.status !== 200)
                        console.log('ajaxErrorCode: ' + ajaxRequest.status);
                }
            };
			sendTrue = 1;
		}
	}
}

function media(media){
	
	bgaudio.volume = 0.1;
	
	if(media === 'bgsong')
	{
		if(play === true)
		{
			bgaudio.play();
			play = false;
		}
		else
		{
			bgaudio.pause();
			play = true;
		}
		bgaudio.loop = true;
	}

	if(media === 'mute')
	{
		if(ismute === false)
		{
			soundVol = 0;
			ismute = true;
		}
		else
		{
			soundVol = 0.1;
			ismute = false;
		}
	}
}

function setCookie(){
	var datum = new Date();
	var jahrPlus = datum.getFullYear()+1;
	datum.setFullYear(jahrPlus);
	playerName = prompt('Bitte geben Sie Ihren Namen ein, um Ihren Score zu speichern.');			
	if(playerName.length >= 12){
		playerName = playerName.substring(0, 12);
		playerName = playerName.replace(/<\/?[^>]+(>|$)/g, "");
	}
	document.cookie="username="+playerName+";domain=unitgreen.com;expires="+datum+";path=/";
}

	Cookie = {
		get: function (name) {
			var data    = document.cookie.split(";");
			var cookies = {};
			for(var i = 0; i < data.length; ++i) {
				var tmp = data[i].split("=");
				cookies[tmp[0]] = tmp[1];
			}
			if (name) {
				return (cookies[name] || null);
			} else{
				return cookies;
			}
		},
		set: function (name, value) {
			document.cookie = name + "=" + value;
		}
};