rulesets = {};

checkstyleUtil = {
	errors: [],
    rulesets: [],
	rules: {},
	commentNames: ["summary", "description", "example", "tags", "this"]
};

checkstyleUtil.setRulesets = function(rulesets){
	this.rules = {};
	
	for (var i in rulesets) {
		var ruleset = rulesets[i];
		for (key in ruleset) { this.rules[key] = ruleset[key]; }	
	}
}

checkstyleUtil.addRuleset = function(ruleset){
	for (key in ruleset) { 
		this.rules[key] = ruleset[key]; 
	}	
}

checkstyleUtil.disableRule = function(){
	if (arguments.length == 1) {
		this.rules[arguments[0]] = function(filename, contents, comments){
			return;
		};
	}
}

checkstyleUtil.applyRules = function(fileName, contents){
	// Do not process JSON files
	if(contents.charAt(0) == "{"){
		return;
	}
	
	// Mark all the characters that are in comments.
	var comments = this.getComments(contents);
	// Apply all the rules to the file
	for(var ruleName in this.rules){
		this.rules[ruleName](fileName, contents, comments);
	}
};

// Calculate the characters in a file that are in comment fields
// These will be ignored by the checkstyle rules.
checkstyleUtil.getComments = function(contents){
	var comments = [];
	
	var i;
	
	// Initialize the array to false values.
	for(i = 0; i < contents.length; i++){
		comments[i] = 0;
	}
	
	var sep = "\n";
	
	function markRange(start, stop){
		for(var i = start; i < stop; i++){
			comments[i] = 1;
		}
	}


	function markRegexs() {
		var idx = contents.indexOf("/g");
		var i;
		while(idx > -1) {
			if(!comments[idx] && contents.charAt(idx - 1) != "*"){
				// Look back until either a forward slash
				// or a new line is found
				var prevChar = contents.charAt(idx - 1);
				i = idx;
				while(prevChar != "\n" && prevChar != "/" && i > 0){
					prevChar = contents.charAt(--i);
				}
				if(prevChar == "/" && i < idx - 1){
					markRange(i, idx);
				}
			}
			idx = contents.indexOf("/g", idx + 2)
		}
		
		// Now mark all .match and .replace function calls
		// They generally contain regular expressions, and are just too bloody difficult.
		var fnNames = ["match", "replace"];
		var name;
		
		for (i = 0; i < fnNames.length; i++){
			name = fnNames[i];
			
			idx = contents.indexOf(name + "(");
			
			while(idx > -1){
				// Find the end parenthesis
				if(comments[idx]){
					idx = contents.indexOf(name + "(", idx + name.length);
				} else {
					var fnEnd = contents.indexOf(")", idx);
					markRange(idx, fnEnd + 1);
				}
			}
		}
		
		// Now look for all the lines that declare a regex variable, e.g.
		// var begRegExp = /^,|^NOT |^AND |^OR |^\(|^\)|^!|^&&|^\|\|/i; 
		
		idx = contents.indexOf(" = /");
		
		while(idx > -1){
			if(!comments[idx] && contents.charAt(idx + 4) != "*"){
				var eol = contents.indexOf("\n", idx + 1);
				markRange(idx + 3, Math.max(eol, idx + 4));
			}
		
			idx = contents.indexOf(" = /", idx + 3);
		}
	}

	markRegexs();
	
	
	var marker = null;
	var ch;
	
	var DOUBLE_QUOTE = 1;
	var SINGLE_QUOTE = 2;
	var LINE_COMMENT = 3;
	var MULTI_COMMENT = 4;
	var UNMARK = 5;
	
	var pos;
	
	for (i = 0; i < contents.length; i++) {
		var skip = false;
		
		if(comments[i]){
			continue;
		}
		
		ch = contents[i];
		
		switch(ch){
			case "\"":
				if(marker == DOUBLE_QUOTE) {
					marker = UNMARK;
				} else if (marker == null) {
					marker = DOUBLE_QUOTE;
					pos = i;
				}
				
				break;
			case "'":
				if(marker == SINGLE_QUOTE) {
					marker = UNMARK;
				} else if (marker == null) {
					marker = SINGLE_QUOTE;
					pos = i;
				}
			
				break;
			case "/":
				if(marker == null){
					if(contents[i + 1] == "/"){
						marker = LINE_COMMENT;
						pos = i;
						skip = true;
					} else if(contents[i + 1] == "*"){
						marker = MULTI_COMMENT;
						pos = i;
						skip = true;
					}
				}
				
				break;
			case "*":
				if (marker == MULTI_COMMENT){
					if(contents[i + 1] == "/"){
						marker = UNMARK;
						skip = true;
					}
				}
			
				break;
			case "\n":
				if(marker == LINE_COMMENT){
					marker = UNMARK;
				}
				break;
			case "\\":
			    if(marker == DOUBLE_QUOTE) {
					if(contents[i + 1] == '"'){
						skip = true;
					} else if(contents[i + 1] == '\\') {
    					skip = true;
					}
    				
		        } else if(marker == SINGLE_QUOTE) {
					if(contents[i + 1] == "'"){
						skip = true;
					} else if(contents[i + 1] == '\\') {
    					skip = true;
					}
	            } else
			    break;
		
		}
		if (marker != null) {	
			comments[i] = 1;
		}
		if (marker == UNMARK){
			marker = null;
		}
		if  (skip) {
			i++;
			comments[i] = 1;
		}
	}
	
	
	return comments;
}

// Calculate the line number of the character at index 'pos'
checkstyleUtil.getLineNumber = function(contents, pos){
	var counter = 0;
	var sep = "\n";
		
	for(var i = pos; i > -1; i--){
		if(contents.charAt(i) == "\n"){
			counter ++;
		}
	}
	return counter + 1;
};

// Store the information for a single error.
checkstyleUtil.addError = function(msg, fileName, contents, pos){
	while(fileName.indexOf("../") == 0){
		fileName = fileName.substring(3);
	}
	checkstyleUtil.errors.push({
		file: fileName,
		line: checkstyleUtil.getLineNumber(contents, pos),
		message: msg
	});
};

// Find the next character in 'contents' after the index 'start'
// Spaces and tabs are ignored.
checkstyleUtil.getNextChar = function(contents, start, comments, ignoreNewLine){
	for(var i = start; i < contents.length; i++){
		if(comments && comments[i]){
			continue;
		}
		if(contents.charAt(i) != " " 
			&& contents.charAt(i) != "\t" 
			&& (!ignoreNewLine || contents.charCodeAt(i) != 13)){
			return {
				value: contents[i],
				pos: i
			};
		}
	}
	return null;
};

// Find the next occurrence of the character in the 
// 'contents' array after the index 'start'
checkstyleUtil.findNextCharPos = function(contents, start, character){
	for(var i = start; i < contents.length; i++){
		if(contents.charAt(i) == character){
			return i;
		}
	}
	return -1;
};

// Creates a simple function that searches for the token, and 
// adds an error if it is found
checkstyleUtil.createSimpleSearch = function(token, message){
	return function(fileName, contents, comments){
		var idx = contents.indexOf(token);
		
		while(idx > -1){
			
			if(!comments[idx]){
				checkstyleUtil.addError(message, fileName, contents, idx);
			}
			idx = contents.indexOf(token, idx + 1);
		}
	};
};

// Creates a regex function that searches for the token, and 
// adds an error if it is found
checkstyleUtil.createRegexSearch = function(regex, message){
	return function(fileName, contents, comments){
		var idx = contents.search(regex);

		while(idx > -1){
			if(!comments[idx]){
				checkstyleUtil.addError(message, fileName, contents, idx);
			}
    		contents = contents.substr(idx+1);
    		
    		idx = contents.search(regex);
		}
	};
};

// Creates a function that fails a test if the given token
// does not have a space to the left and right.
checkstyleUtil.createSpaceWrappedSearch = function(token, message){
	return function(fileName, contents, comments){
		
		var idx = contents.indexOf(token);
		var before, after;
		var tokenLength = token.length;

		while(idx > -1){
			before = contents.charAt(idx - 1);
			after = contents.charAt(idx + tokenLength);
			if(!comments[idx] && 
				((before != " " && before != "\t" && (token != "==" || before != "!")) || 
				(
					(after != " " && contents.charCodeAt(idx + tokenLength) != 13 
						&& contents.charCodeAt(idx + tokenLength) != 10)
				&& 	(token != "==" || after != "=")
				))){
				checkstyleUtil.addError(message, fileName, contents, idx);
			}
			idx = contents.indexOf(token, idx + token.length);
		}
	};
};



checkstyleUtil.isEOL = function(contents, pos){
	var c = contents.charCodeAt(pos);
	return c == 10 || c == 13 || contents.charAt(pos) == "\n";
};

// All the rules that will be applied to each file.
checkstyleUtil.rules = {

};

checkstyleUtil.clear = function(){
	checkstyleUtil.errors = [];
}

checkstyleUtil.serializeErrors = function(){
	var buf = [];
	var errs = checkstyleUtil.errors;
	for(var i = 0; i < errs.length; i++){
		buf.push(errs[i].file + ":" + errs[i].line + " - " + errs[i].message);
	}
	return buf.join("\n");
}

checkstyleUtil.insertChar = function(contents, ch, pos){
	return contents.substring(0, pos) + ch + contents.substring(pos);
}
checkstyleUtil.deleteChar = function(contents, pos){
	return contents.substring(0, pos) + contents.substring(pos + 1);
}

checkstyleUtil.fixTrailingWhitespace = function(contents) {
	var idx = contents.indexOf("\n");
	
	// Find each new line character, then iterate backwards until a non-whitespace character is found
	// then remove the whitespace.
	while(idx > -1){
		var search = idx - 1;
		
		while(search > -1 && (contents.charAt(search) == " " || contents.charAt(search) == "\t")){
			search--;
		}
		
		if(search < idx -1){
			contents = contents.substring(0, search + 1)
					+ contents.substring(idx, contents.length);
			
			idx = contents.indexOf("\n", search + 2);
		}else{
			idx = contents.indexOf("\n", idx + 1);
		}
	}

	return contents;
}

checkstyleUtil.fixSpaceAfter = function(contents, token, comments){
	var idx = contents.indexOf(token + " ");
	
	while(idx > -1){
		if(!comments[idx]){
			contents = checkstyleUtil.deleteChar(contents, idx + token.length);
		}
		
		idx = contents.indexOf(token + " ", idx + token.length);
	}
	return contents;
}

checkstyleUtil.fixSpaceBeforeAndAfter = function(contents, token, comments){
	var idx = contents.indexOf(token);
	var before, after;
	var len = token.length;

	while(idx > -1){
		before = contents.charAt(idx - 1);
		after = contents.charAt(idx + len);
		if(!comments[idx]){
			// Only insert a space before the token if:
			// - char before is not a space or a tab
			// - token is "==" and the char before is neither "!" or "="
		
			if(before != " " && before != "\t" && (token != "==" || (before != "!" && before != "="))){
				contents = checkstyleUtil.insertChar(contents, " ", idx);
				idx ++;
			}
			
			// Only insert a space after the token if:
			// - char after is not a space
			// - char after is not a new line
			// - char after is not "="
			if((after != " " && contents.charCodeAt(idx + len) != 13 
					&& contents.charCodeAt(idx + len) != 10)
					&& (token != "==" || after != "=")){
				contents = contents = checkstyleUtil.insertChar(contents, " ", idx + token.length);
				idx++;
			}
		}
		idx = contents.indexOf(token, idx + token.length);
	}
	return contents;
}

// Creates the data file suitable to be loaded into a dojo.data.ItemFileReadStore
checkstyleUtil.generateReport = function(skipPrint){
	
	var ids = 1;
	var json = ["{id:'" +(ids++) + "', file: 'All', isFolder:true}"];

	// A map of folders that have already been found.
	var allFolders = {};
	
	var messageIds = {};
	var messageCounter = 1;
	var i, err;
	
	function getFolderName(fileName){
		// Extract the folder name from a file name
		var idx = fileName.lastIndexOf("/");
		return fileName.substring(0, idx);
	}
	
	// Add a folder to the list of folders.
	function pushFolder(folderName){
		if(!allFolders[folderName]){
			allFolders[folderName] = true;
			json.push("{id: '" +(ids++) + "', file: '" + folderName + "', folder: 1}");
		}
	}
	
	for(i = 0; i < checkstyleUtil.errors.length; i++){
		err = checkstyleUtil.errors[i];
		var message = err.message;
		var messageId = messageIds[message];
		if(!messageId){
			messageId = "m" + messageCounter++;
			messageIds[message] = messageId;
			
			json.push("{id:'" + messageId + 
					"',msg:'" + message + 
					"'}");
		}
	}
	
	pushFolder("All");
	
	// Create the JSON records for each error.
	for(i = 0; i < checkstyleUtil.errors.length; i++){
		err = checkstyleUtil.errors[i];
		var folderName = getFolderName(err.file);
		pushFolder(folderName);
		
		json.push("{id:'" +(ids++) + 
					"', file:'" + err.file + 
					"',line:" + err.line + 
					",msg:{'_reference':'" + messageIds[err.message] + 
					//"'},folder:'" + folderName +
					"'},folder: 0" +
					"}");
		
	}

	// Add the date that the check was run to the store.
	json.push("{id:'" +(ids++) + "', date: " +(new Date()).getTime() + "}");
	
	// Save the file.

	if(!skipPrint){
		print("Found " + checkstyleUtil.errors.length + " checkstyle errors. " +
		"Open the file checkstyleReport.html to view the results.");
	}
					
	return "{ identifier: 'id', label:'file', items: [" + json.join(",\n") + "]}";
};

checkstyle = checkstyleUtil;
$ = checkstyle;