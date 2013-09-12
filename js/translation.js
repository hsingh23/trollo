//constant: number of iterations before deciding to break the loop.
trolloSpace.BREAK_POINT = 1000;

function translate(command)
{
	//in the case of the command being "}", just return "}"
	if(command[0]==="}")
	{
	 	//Add in some extra script to help catch long/infinite loops
		return "iterations += 1;\nif(iterations > trolloSpace.BREAK_POINT) {\n\tthrow \"Inf\";\n}\n}";
	}

	//in the case of a for loop command, translate into a syntactically correct for loop header
	else if(command[0].substring(0,3)==="for")
	{

		var ret = "for(var ";

		//i is the itterator
		if(command[0][3]==="I")
		{
			ret+="i = " + command[1] + "; i<" + command[2] + "; i+=" + command[3] + "){";
			
			trolloSpace.maxI = command[2];
		}

		//j is the itterator
		else
		{
			ret+="j = " + command[1] + "; j<" + command[2] + "; j+=" + command[3] + "){";
			
			trolloSpace.maxJ = command[2];
		}

		return ret;
	}

	//otherwise, this is a generic command: translate by using the command name and the parameters
	var params = "(";

	for(var i = 1; i < command.length; i += 1)
	{
		//this is the last parameter, so it is a color, put quotations around it
		if(i === command.length - 1)
		{
			params = params + "\"" + command[i] + "\");";
		}

		//any other parameter needs a comma after it
		else
		{
			params = params + command[i] + ",";
		}
	}
	
	//Create lines that dynamically check for out of bounds
	var OoB = "";
	if(command[0] === "fillRow"){
		OoB += "if(eval(" + command[1] + ") < 0 || eval(" + command[1] + ") >= trolloSpace.levelData.height) {\n\tthrow \"OoB\";\n}\n";
	}
	else if(command[0] === "fillColumn"){
		OoB += "if(eval(" + command[1] + ") < 0 || eval(" + command[1] + ") >= trolloSpace.levelData.width) {\n\tthrow \"OoB\";\n}\n";
	}
	else if(command[0] === "setPixel"){
		OoB += "if(eval(" + command[1] + ") < 0 || eval(" + command[1] + ") >= trolloSpace.levelData.width || eval(" + command[2] + ") < 0 || eval(" + command[2] + ") >= trolloSpace.levelData.height) {\n\tthrow \"OoB\";\n}\n";
	}

	//Add up out of bounds checkng, command name, and the parameter list
	var result = OoB + "trolloSpace.resultImg." + command[0] + params;

	return result;
};