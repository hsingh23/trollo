/**
* Run this code when first loading the page
*
* The main reason this function is set off by itself
* is to create the paper for the canvases.
* Level 1 is loaded.
**/
function init() {

	//adds event listener so that pressing "Enter" is equivalent to pressing "Run"
	window.addEventListener('keydown', function(event) {
		switch (event.keyCode) {
		case 13: // Enter
			run();
		break;
		}
	}, false);

	//sound effects are initially on
	trolloSpace.soundEffects = true;

	//create the Raphael papers to draw the images on
	trolloSpace.goalPaper = Raphael("goal", 200, 200);
	trolloSpace.goalPaper.identity = "Goal";
	trolloSpace.resultPaper = Raphael("result", 200, 200);
	trolloSpace.resultPaper.identity = "Result";

	//load the first level
	loadLevel(1);
};

/**
* Starts a new level.
*
* Updates the lists and the images to prperly match the level data
**/
function loadLevel(lvNum) {
	//TODO: Check to see if other levels are completed against server if user is logged in.
	
	//set level
	trolloSpace.currLevel = lvNum;

	//Display level number
	$("#level").empty().append("Level: " + lvNum);

	//clear papers
	trolloSpace.goalPaper.clear();
	trolloSpace.resultPaper.clear();

	//load the level data from levels.js
	trolloSpace.levelData = trolloSpace.levelArray[lvNum - 1];

	$("#output").empty().append(trolloSpace.levelData.levelText);

	//Create the images
	trolloSpace.goalImg = new Image(trolloSpace.levelData.height, trolloSpace.levelData.width, trolloSpace.levelData.pixels, false);
	trolloSpace.resultImg = new Image(trolloSpace.levelData.height, trolloSpace.levelData.width, [], true);

	//Draw goal
	trolloSpace.goalImg.draw(trolloSpace.goalPaper);

	//Draw (blank) result
	trolloSpace.resultImg.draw(trolloSpace.resultPaper);

	//Clear the command list then populate the new one
    $("#choices").empty().append("<br/>");
    $("#decision").empty().append("<br/>");
    var items = [];
    $.each(trolloSpace.levelData.commands, function(key, val) {
//<i class="icon-resize-vertical"></i>
        items.push('<a class="btn btn-large btn-block btn-info" href="#">'+trolloSpace.allCommands[val]+'</a>');
    });
    $("#choices").append(items.join('\n'));

};

/**
* Runs upon pressing the run button
*
* Translates, checks, and runs user's input on a blank image and displays it
* Checks if output is correct, moves on to the next level if it is
**/
function run() {

	//clear the result paper
	trolloSpace.resultPaper.clear();

	//reset resultImg
	trolloSpace.resultImg = new Image(trolloSpace.levelData.height, trolloSpace.levelData.width, [], true);

	//populates trolloSpace.userCommand, an array containing the raw commands from the user -
	//an array of strings in the order: function name, list of parameters in order.
	//The parameters are checked to make sure they only contain legal characters and expressions.
	trolloSpace.userCommand = [];
	var dontExecute = false;

	$("#decision li").each(function(k,v){
		//temp will hold this command's name and parameters
		var temp = [];
		v = $(v);

		//Add the name of the function to the list
		temp.push(v.attr("name"));

		//Add the numerical expression parameters to the list
		v.children("input").each(function(a,b){
			var res = $(b).val();
			var patt=/[^0-9+*\/%-^ ij(Math.pow)(Math.floor)]+/g;
			if (!patt.test(res)){
				//Add the parameter to the list
				temp.push(res);
			}
			else{
				alert("Invalid Input! Characters can only be numbers, spaces, \none these symbols: ()*^-+/%\nthese letters: i j\nor Math.pow or Math.floor");
				//This code will not be run because it may contain malicious script
				dontExecute = true;
			}			
		});

		//Add the color parameter to the list
		v.children("select").each(function(a,b){
			var res = $(b).val();
			var patt=/(red)|(green)|(blue)|(yellow)|(black)|(white)|(purple)|(orange)/g;
			if (patt.test(res)){
				//Add the parameter to the list
				temp.push(res);
			}
			else{
				alert("Invalid Input! Must be one of the predefined colors! (It's for your own good =P)");
				//This code will not be run because it may contain malicious script
				dontExecute = true;
			}	
		});

		//Add this command to the list of commands
		trolloSpace.userCommand.push(temp);
	});

	//This is a useful log to make sure that the command list holds the correct data based on the input
	//Commented out for now because there have been no errors here.
	//console.log(trolloSpace.userCommand); 

	//If the parameters are all acceptable, run the user's input
	if (!dontExecute){

		//translate the raw input into javascript, storing the script to comm
		var comm = "var iterations = 0;\n";

		for(var i = 0; i <trolloSpace.userCommand.length;i+=1)
		{
			//uses translate.js to translate this particular command
			comm = comm + translate(trolloSpace.userCommand[i]) + "\n";	
		}

		//This is a useful log becuase it shows exactly what is being run throw eval.
		//Commented out for now because there have been no errors here.
		//console.log(comm);

		//try to evaluate comm. If any errors occur, give the user a discription of the error
		var shouldTest = true;

		try{
			eval(comm);
		}
		catch(err)
		{
			shouldTest = false;

			//Give an appropriate error message
			if(err === "OoB"){
				alert("One or more of your functions attempted to write to pixels outside the bounds of the image.");
			}
			else if(err === "Inf"){
				alert("Timeout. You may have created an infinite loop.");
			}
			else{
				alert(err.message);
			}
		}

		//If there were no errors, draw the result, and check if it is correct
		if(shouldTest)
		{
			//draw the result
	 		trolloSpace.resultImg.draw(trolloSpace.resultPaper);

			//If the images are equal, alert a victory, play a tune, and load the next level
	 		if(trolloSpace.resultImg.equals(trolloSpace.goalImg)) {
	 			
	 			//play music 
	 			if(trolloSpace.soundEffects===true){
                    document.getElementById('player').play();

                    //TODO: do we still need this line of code?
					//document.getElementById("soundSpan").innerHTML="<embed src='sounds/victory_fanfare.mp3' hidden=true autostart=true loop=false>";
				}

				//alert the success
	 			alert("Congrats, you completed level " + trolloSpace.currLevel + "!");

	 			//load next level
	 			trolloSpace.currLevel += 1;
	 			loadLevel(trolloSpace.currLevel);
	 		}

	 		//alert that the player was inccorect
	 		else
	 		{
	 			alert("Your result does not match the goal. Please try again.");
	 		}
	 	}

	 	//the user's code contained errors. Clear out the result image.
	 	else
	 	{
	 		trolloSpace.resultImg = new Image(trolloSpace.levelData.height, trolloSpace.levelData.width, [], true);
	 		trolloSpace.resultImg.draw(trolloSpace.resultPaper);
	 	}
	}
};

//toggles whether sound effects are played or not. Run when "sounds" is clicked
function setEffects()
{

	var soundText = document.getElementById("sounds");
	if(soundText.innerHTML === "Turn Sound Effects Off"){
		soundText.innerHTML = "Turn Sound Effects On";
	}
	else{
		soundText.innerHTML = "Turn Sound Effects Off";
	}
	trolloSpace.soundEffects = !trolloSpace.soundEffects;
}

function customLevelCreator(){
	/*We need to make all commands availible an infinite number of times
	(simply check to see all commands are in start position
		*/
};
