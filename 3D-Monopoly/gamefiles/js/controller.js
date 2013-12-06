var players = new Array();
var tileBoard = new Array();
var currentPlayer = 0;

var renderer, container, camera, scene;
var line, test, geometry, chancecards, comcards, comtop, chancetop;
var mouseXOnMouseDown = mouseYOnMouseDown = 0;
var	targetXRotationOnMouseDown = targetXRotationOnMouseDown = 0;
var	mouseX = mouseY = targetX = targetY = 0;
this.currentWindowX = window.innerWidth ;
this.currentWindowY = window.innerHeight;
var that = this;
var material = new THREE.MeshLambertMaterial({color: 0xD9E8FF, map: THREE.ImageUtils.loadTexture('textures/lighttexture.png'), shininess: 200, reflectivity: .85});
var selMaterial = new THREE.MeshLambertMaterial( { color: 0x000000, emissive: 0x000000, ambient: 0x000000, shading: THREE.SmoothShading } );
var redmat = new THREE.MeshPhongMaterial( { ambient: 0xff5533, color: 0xff5533, specular: 0x111111, shininess: 200 } ) ;
var rectmesh, underMesh;
var size = 600;
var step = 150;
var objHeight = 0;
var houseloader, hotelloader;
var hotelmesh, housemesh;
var hatgeo;
var scalearray = [.5, .5, .5, .5];
var cameralock = false;

var main;
var playerPosition = board = turnCount = reRollCount = 0;
var gameOver = reRoll = false;
var firstDie;
var numberOfPlayers = 4; //TODO enable more players
var testCount = 1; //4 full turns

var community_chest_cards;
var chance_cards;
var community_chest_pos = 0;
var chance_pos = 0;

window.onload = function()
{
    initalConnect();
	houseloader = new THREE.STLLoader();
	hotelloader = new THREE.STLLoader();
	
	houseloader.addEventListener('load', function (event){
		var geometry = event.content;
		geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));
		var mesh = new THREE.Mesh( geometry,  new THREE.MeshPhongMaterial( { ambient: 0xff5533, color: 0xff5533, specular: 0x111111, shininess: 200 } ) );
		housemesh = mesh;
	});
	hotelloader.addEventListener('load', function (event){
		var geometry = event.content;
		geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));
		var mesh = new THREE.Mesh( geometry,  new THREE.MeshPhongMaterial( { ambient: 0xff5533, color: 0xff5533, specular: 0x111111, shininess: 200 } ) );
		hotelmesh = mesh;
	});
	houseloader.load('textures/house.stl');
	hotelloader.load('textures/hotel.stl');
	
	pieceLoader();

	init();
	animate();
	
    updateDisplay();
    
    initialize_community_chest_cards();
    initialize_chance_cards();
    
    initializeTileBoard();
    populateListing();
}
function initializeTileBoard()
{
    for(var x=0; x<40; x++)
    {
        tileBoard[x] = createTile(x);
		tileBoard[x].hotels = new Array();
    }
}

function init()
{
    container = document.getElementById("container");
    
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(0, 1250, 1000);
    
    scene = new THREE.Scene();
    
    var ambientLight = new THREE.AmbientLight(0x202020);
    scene.add( ambientLight );

    var directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(0, 1, 0);
    scene.add(directionalLight);
    
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(this.currentWindowX, this.currentWindowY);
    renderer.setFaceCulling( THREE.CullFaceNone );
    renderer.autoClear = false;	
    container.appendChild(renderer.domElement);
    
    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener( 'mousewheel', onMouseWheel, false);
    window.addEventListener( 'DOMMouseScroll', onMouseWheel, false);
    document.addEventListener( 'mousedown', onMouseDown, false );
    
    initializePlayers();
    
    var recttest = new THREE.CubeGeometry(1200, .0001, 1200);
    angelTexture = THREE.ImageUtils.loadTexture("textures/board.jpg");
    var rm = new THREE.MeshBasicMaterial( { map: angelTexture, wireframe: false } )
    rectmesh = new THREE.Mesh(recttest, rm);
    scene.add(rectmesh);
	
    var newgeo = new THREE.CubeGeometry(1210, 10, 1210);
    newgeo.applyMatrix(new THREE.Matrix4().makeTranslation(0, -5.5, 0));
    underMesh = new THREE.Mesh(newgeo, selMaterial);
    scene.add(underMesh);
    
    var comcard = new THREE.CubeGeometry(140, 40, 210);
    comcard.applyMatrix(new THREE.Matrix4().makeRotationY(2.355));
    comcard.applyMatrix(new THREE.Matrix4().makeTranslation(270, 20, 270));
    var cardTexture = THREE.ImageUtils.loadTexture("textures/cards2.png");
    var rm = new THREE.MeshBasicMaterial( { map: cardTexture, wireframe: false } );
    comcards = new THREE.Mesh(comcard, rm);
    scene.add(comcards);
    
    var comtopgeo = new THREE.CubeGeometry(140, 2, 210);
    comtopgeo.applyMatrix(new THREE.Matrix4().makeRotationY(2.355));
    comtopgeo.applyMatrix(new THREE.Matrix4().makeTranslation(270, 42, 270));
    var comtext = THREE.ImageUtils.loadTexture("textures/chance2.png");
    var rm = new THREE.MeshBasicMaterial( { map: comtext, wireframe: false } );
    comtop = new THREE.Mesh(comtopgeo, rm);
    scene.add(comtop);
    
    var comtopgeo = new THREE.CubeGeometry(140, 2, 210);
    comtopgeo.applyMatrix(new THREE.Matrix4().makeRotationY(2.355));
    comtopgeo.applyMatrix(new THREE.Matrix4().makeTranslation(-270, 42, -270));
    var comtext = THREE.ImageUtils.loadTexture("textures/comchest2.png");
    var rm = new THREE.MeshBasicMaterial( { map: comtext, wireframe: false } );
    chancetop = new THREE.Mesh(comtopgeo, rm);
    scene.add(chancetop);
    
    var comcard = new THREE.CubeGeometry(140, 40, 210);
    comcard.applyMatrix(new THREE.Matrix4().makeRotationY(2.355));
    comcard.applyMatrix(new THREE.Matrix4().makeTranslation(-270, 20, -270));
    var cardTexture = THREE.ImageUtils.loadTexture("textures/cards3.png");
    var rm = new THREE.MeshBasicMaterial( { map: cardTexture, wireframe: false } );
    chancecards = new THREE.Mesh(comcard, rm);
    scene.add(chancecards);
    
    document.getElementById('rolldice').onclick = function()
    {
        rollDice();
        sync();
    }
    
    document.getElementById('doubles').onclick = function()
    {
        rollDice(true);
        sync();
    }
    
    document.getElementById('switchplayer').onclick = function()
    {
        currentPlayer = (currentPlayer + 1) % numberOfPlayers;
        $('#money')[0].value = players[currentPlayer].money;
        updateDisplay();
        
        if (currentPlayer != finalPlayerID)
            updateStatus("Pretending to be Player "+currentPlayer);
        else
            updateStatus("Connected as Player "+currentPlayer);
    }
    
    document.getElementById('realmove').onclick = function()
    {
        move(players[currentPlayer].piece, players[currentPlayer].playerPosition, parseInt(document.getElementById('move').value));
        sync();
    }
    
    document.getElementById('go').onclick = function()
    {
        players[currentPlayer].money = document.getElementById("money").value;
        updateDisplay();
    }
    
    document.getElementById('addDeed').onclick = function()
    {
        players[currentPlayer].addPropertyIndex(parseInt(document.getElementById("deedValue").value));
        updateDisplay();
    }
    
    document.getElementById('jail').onclick = function()
    {
        getJailed();
    }
    
    document.getElementById('moveToGo').onclick = function()
    {
        moveToGo();
    }
    
    document.getElementById('passgo').onclick = function()
    {
        moveToGo();
        passedGo();
    }
    document.getElementById('comchest').onclick = function(){
        
        //drawCard("comchest");
        move(players[currentPlayer].piece,0,2);
        
    }
    document.getElementById('chance').onclick = function(){
        //drawCard("chance");
        //players[2].addPropertyIndex(lookUps[12]);
        move(players[currentPlayer].piece,0,7);
    }
	document.getElementById('camera').onclick = function()
	{
		if (cameralock)
			unlockCamera();
		else
			lockCamera();
	}
}

function getPiece(playerNumber)
{
    if (playerNumber === 0)
        var geometry = new THREE.SphereGeometry(22.5, 15, 13.5);
    else if (playerNumber === 1)
        var geometry = new THREE.CubeGeometry(30, 30, 30);
    else if (playerNumber === 2)
        var geometry = new THREE.IcosahedronGeometry(22.5);
    else if (playerNumber === 3)
        var geometry = new THREE.TorusGeometry(17.5, 7.5, 100, 100)
    return geometry;
}

function getRealPiece(playerNumber)
{
	  if (playerNumber === 0)
        var geometry = hatgeo.clone();
    else if (playerNumber === 1)
        var geometry = thimblegeo.clone();
    else if (playerNumber === 2)
        var geometry = shipgeo.clone();
    else if (playerNumber === 3)
        var geometry = flatirongeo.clone();
    return geometry;
}

function initializePlayers()
{
    for (var i = 0; i < numberOfPlayers; i++)
        players.push(new Player(0, test, 1500));
}

function createHotels(square, hotelNumber)
{
	for (var i = 0; i < tileBoard[square].hotels.length; i++)
		scene.remove(tileBoard[square].hotels[i]);
	tileBoard[square].hotels = new Array();
		
	if (hotelNumber < 5)
	{
		for (var i = 1; i <= hotelNumber; i++)
			drawHotels(square, i);
	}
	else
		drawHotels(square, 5);
}

function drawHotels(square, hotelNumber)
{
    var sidePush = 390;
	var subt = 97;
	var objHeight = 0;
	var xoffset = 0;
	var offset = 0;
	
	if (hotelNumber === 5)
	{
		var geometry = hotelmesh.geometry.clone();
		var scale = .75;
		var offSide = 463 - 3 * Math.floor(square/10);
		xoffset = -15 + 5 * (Math.floor(square/10));
	}
	else
	{
		var geometry = housemesh.geometry.clone();
		var scale = 1.75;
		
		var offSide = 475 - 10 * Math.floor(square/10);
		xoffset = 47 - 22 * hotelNumber;
		if (square > 19)
			xoffset += 5 * Math.floor(square/10);
	}
	var invscale = 1/scale;
	
	if (square < 10)
		geometry.applyMatrix(new THREE.Matrix4().makeTranslation((sidePush-(((square)%10)-1)*subt + xoffset) * invscale, objHeight, (offSide + offset) * invscale));
	else if (square < 20)
	{
		geometry.applyMatrix(new THREE.Matrix4().makeRotationY(-Math.PI/2));
		geometry.applyMatrix(new THREE.Matrix4().makeTranslation((-offSide - offset) * invscale, objHeight, (sidePush-(((square)%10)-1)*subt + xoffset) * invscale));
	}
	else if (square < 30)
		geometry.applyMatrix(new THREE.Matrix4().makeTranslation((-sidePush+(((square)%10)-1)*subt - xoffset) * invscale, objHeight, (-offSide - offset) * invscale));
	else if (square < 40)
	{
		geometry.applyMatrix(new THREE.Matrix4().makeRotationY(-Math.PI/2));
		geometry.applyMatrix(new THREE.Matrix4().makeTranslation((offSide + offset) * invscale, objHeight, (-sidePush+(((square)%10)-1)*subt - xoffset) * invscale));
	}
	var mesh = new THREE.Mesh (geometry, hotelmesh.material);
	mesh.rotation.x = targetX;
	mesh.rotation.y = targetY;
	mesh.scale.set(scale, scale, scale);
	scene.add(mesh);
	tileBoard[square].hotels.push(mesh);
}

function moveToGo()
{
    move(players[currentPlayer].piece, 0, 0);
}

function passedGo()
{
    players[currentPlayer].money = parseInt(players[currentPlayer].money)+200;
    updateDisplay();
}

function alreadyOwned(destSquare)
{
    var alreadyOwned = false;
    
    for(var x=0; x<players.length; x++)
    {
        for(var y=0; y<players[x].properties.length; y++){
            
            if(players[x].properties[y] == lookUps[destSquare])
                alreadyOwned = true;
        }
    }
    
    return alreadyOwned;
}

function onWindowResize() 
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}


function onMouseWheel()
{
    var fovMAX = 160;
    var fovMIN = 5;
    
    if ( event.target.id == 'chatbox')
        return;
    
    camera.fov -= event.wheelDeltaY * 0.05;
    camera.fov = Math.max(Math.min(camera.fov, fovMAX), fovMIN);
    camera.projectionMatrix = new THREE.Matrix4().makePerspective(camera.fov, window.innerWidth / window.innerHeight, camera.near, camera.far);
}

function onMouseDown(event)
{

    if ( event.target.tagName == 'DIV')
        event.preventDefault();

    document.addEventListener( 'mousemove', onMouseMoveCam, false );
    document.addEventListener( 'mouseup', onMouseUpCam, false );
    document.addEventListener( 'mouseout', onMouseUpCam, false );

    mouseXOnMouseDown = event.clientX - that.currentWindowX;
    mouseYOnMouseDown = event.clientY - that.currentWindowY;
    targetYRotationOnMouseDown = that.targetY;
    targetXRotationOnMouseDown = that.targetX;
}

function onMouseMoveCam(event)
{
    mouseX = event.clientX - that.currentWindowX;
    mouseY = event.clientY - that.currentWindowY;

    that.targetY = targetYRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.015;
    that.targetX = targetXRotationOnMouseDown + ( mouseY - mouseYOnMouseDown ) * 0.015;
}

function onMouseUpCam(event)
{
    document.removeEventListener( 'mousemove', onMouseMoveCam, false );
    document.removeEventListener( 'mouseup', onMouseUpCam, false );
    document.removeEventListener( 'mouseout', onMouseUpCam, false );
}

function animate()
{
    requestAnimationFrame(animate);
    render();
}

function render()
{
    for (var i = 0; i < numberOfPlayers; i++)
    {
        var piece = players[i].piece;
        piece.rotation.x += ( targetX - piece.rotation.x ) * 0.05;
        piece.rotation.y += ( targetY - piece.rotation.y ) * 0.05;
    }
    
    rectmesh.rotation.x += ( targetX - rectmesh.rotation.x ) * 0.05;
    rectmesh.rotation.y += ( targetY - rectmesh.rotation.y ) * 0.05;
    
    underMesh.rotation.x += ( targetX - underMesh.rotation.x ) * 0.05;
    underMesh.rotation.y += ( targetY - underMesh.rotation.y ) * 0.05;
    
    chancecards.rotation.x += ( targetX - chancecards.rotation.x ) * 0.05;
    chancecards.rotation.y += ( targetY - chancecards.rotation.y ) * 0.05;
    
    comcards.rotation.x += ( targetX - comcards.rotation.x ) * 0.05;
    comcards.rotation.y += ( targetY - comcards.rotation.y ) * 0.05;
    
    comtop.rotation.x += ( targetX - comtop.rotation.x ) * 0.05;
    comtop.rotation.y += ( targetY - comtop.rotation.y ) * 0.05;
    
    chancetop.rotation.x += ( targetX - chancetop.rotation.x ) * 0.05;
    chancetop.rotation.y += ( targetY - chancetop.rotation.y ) * 0.05;
        
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
}

function updateDisplay()
{
    expandMoneys(players[currentPlayer].money);
    updateDeedCards(players[currentPlayer].properties);
    
    // update debug stuff
    document.getElementById("money").value = players[currentPlayer].money;
}
