<?php
	require_once __DIR__ . '/../!script/php/client_handler/check_blocked_client.script.php';
?>
<!DOCTYPE HTML>
<html>
<head>
	<title>ROBOTS::123 - UNITGREEN.COM - SPIEL DER KÖNIGE</title>
	<meta name="description" content="Robots::123 play the Game now on UNITGREEN.COM"/>
	<meta name="robots" content="index,follow"/>
	<link rel="icon" href="/favicon.png" type="image/png" />
	<link href='http://fonts.googleapis.com/css?family=Fjalla+One' rel='stylesheet' type='text/css'>
	<link rel="stylesheet" href="//pool.unitgreen.com/layout_games/layout.css">
	<meta charset="utf-8">
	<?php require_once __DIR__.'/../../!class/php/google/analytics.php';?>
	<script src="/!script/js/ajax/ajax_loader.class.js" type="text/javascript"></script>
	<script type="text/javascript">
		var Obj1 = new AJAXLOADER_CLASS;
		Obj1.loadInLoop(10000,'/!script/php/score_handler/score_loader.script.js.php','table=robots123_highScore','ajaxReturnRob');
	</script>
</head>
<body>
<div id="header">
	<div class="inside">
		<h1>ROBOTS::123</h1>
	</div>
</div>
<div id="main">
	<div id="container">
		<div class="inside">
			<div id="game_object">
				<canvas width="800" height="600px" id="background_canvas"></canvas>
				<canvas width="800" height="600px" id="main_canvas" onmousemove='mouse("move",event)' onclick='mouse("click", event)'>Leider kann das Spiel nicht in Ihrem Brwser aufgerufen werden</canvas>
				<script type="text/javascript" src="files/js/robots123.js"></script>
			</div>
            <div id="SCRORE">
                <div class="score_box">
                    <h2>Score:</h2>
                    <div id="ajaxReturnRob"></div>
                </div>
            </div>
		</div>
	</div>
</div>
</body>
</html>