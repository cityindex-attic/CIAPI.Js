(function ($) {
	$.rulesets['dojo'] = {
		"dojo-elseFollowedBySpace": function(fileName, contents, comments){
			var idx = contents.indexOf("else ");
			while(idx > -1){

				if(!comments[idx] && contents.substring(idx + 5, idx + 7) != "if"){
					$.addError("\" else \" cannot be followed by a space", fileName, contents, idx);
				}
				idx = contents.indexOf("else {", idx + 1);
			}
		},
	
		"dojo-trailingComma" : function(fileName, contents, comments){
		
			var s = ",";
			var idx = contents.indexOf(s);
			var nextChar;
		
			while(idx > -1){
				if(!comments[idx]){
					nextChar = $.getNextChar(contents, idx + 1, comments, true);
					if(nextChar && nextChar.value == "}"){
						$.addError("Trailing commas are not permitted", fileName, contents, idx);
					}
				}
				idx = contents.indexOf(s, idx + 1);
			}
		},
	
		"dojo-switchCaseNewLine" : function(fileName, contents, comments){
			var s = "\tcase ";
			var idx = contents.indexOf(s);
			var nextColonIdx;
			var eolIdx;
		
			while(idx > -1){
			
				if(!comments[idx]){
					eolIdx = contents.indexOf("\n", idx + 4);
				
					if(eolIdx > idx){
						// Count backwards from the end of the line.
						// The first character, that is not a comment,
						// Should be a ':'
					
						for(var i = eolIdx; i > idx + 4; i--){
							var c = contents.charAt(i);
							if(!comments[i] 
								&& c != ' '
								&& c != '\t'
								&& c != ':'
								&& !$.isEOL(contents, i)){
								$.addError(
									"A CASE statement should be followed by a new line", 
									fileName, contents, idx);
								break;
							}
							if(c == ':'){
								break;
							}
						}
					}
				}
				idx = contents.indexOf(s, idx + 4);
			}
		},
	
		"dojo-curlyBraceAtStartOfLine": function(fileName, contents, comments){
		
			var idx = contents.indexOf("\n");
		
			while(idx > -1){
				var nextChar = $.getNextChar(contents, idx + 1);
			
				if(nextChar && !comments[nextChar.pos] && nextChar.value == "{"){
					// Go back three lines, and look for "dojo.declare".  If it exists in the last three lines,
					// then it is ok to have  { at the start of this line.
				
					var nlCount = 0;
					var i;
					for(i = idx - 1; i > -1 && nlCount < 3; i--){
						if(contents[i] == "\n"){
							nlCount++;
						}
					}
					var declarePos = contents.indexOf("dojo.declare", Math.max(0, i));
					if(declarePos < 0 || declarePos > idx){
						$.addError("An opening curly brace should not be the first on a line", fileName, contents, idx);
					}
				}
				idx = contents.indexOf("\n", idx + 1);
			}
		},
	
		"dojo-parenthesisSpaceCurlyBrace": $.createSimpleSearch(") {", "A space is not permitted between a closing parenthesis and a curly brace"),
	
		"dojo-useTabs": function(fileName, contents, comments){
		
			var idx = contents.indexOf("  ");
		
			while(idx > -1){
				var nextChar = $.getNextChar(contents, idx + 1);
				if(!comments[idx] && nextChar && nextChar.value.charCodeAt(0) != 13){
					$.addError("Tabs should be used instead of spaces", fileName, contents, idx);
					var nextLine = $.findNextCharPos(contents, idx + 1, "\n");
					if(nextLine < 0){
						break;
					}
					idx = contents.indexOf("  ", nextLine + 1);
				} else{
					idx = contents.indexOf("  ", idx + 2);
				}
			}
		},
	
		"dojo-commentFormatting": function(fileName, contents, comments){
		
			var commentNames = $.commentNames;
			var invalidPrefixes = ["//", "//\t"];
			var idx;
		
			for(var i = 0; i < commentNames.length; i++){
				var comment = commentNames[i];

				for(var j = 0; j < invalidPrefixes.length; j++){
					idx = contents.indexOf(invalidPrefixes[j] + comment + ":");

					// Make sure that there is a space before the comment.
					while(idx > -1){
						$.addError("Must be just a space in a comment before \"" + comment + "\"" , fileName, contents, idx);
						var nextLine = $.findNextCharPos(contents, idx + 1, "\n");
						if(nextLine < 0){
							break;
						}
						idx = contents.indexOf(invalidPrefixes[j] + comment + ":", nextLine);
					}
				}
			
				idx = contents.indexOf(comment + ":");
			
				// Make sure that the comment name is on a line by itself. The body of the comment
				// must be on the next line.
				while(idx > -1){
					if(comments[idx]){
						var search = idx + comment.length + 1;
				
						// Make sure that there is nothing after the comment name on the same line.
						while(!$.isEOL(contents, search)){
							if(contents[search] != " " && contents[search] != "\t"){
								$.addError("The comment \"" + comment + "\" must be followed by a new line" , 
											fileName, contents, idx);
								break;
							}
							search++;
						}
					}
					idx = contents.indexOf(comment + ":", idx + comment.length + 2);
				}
			}
		},
	
		"dojo-spacesAroundEquals": $.createSpaceWrappedSearch("==", "The equals sign should be preceded and followed by a space"),
		"dojo-spacesAroundOr": $.createSpaceWrappedSearch("||", "The || sign should be preceded and followed by a space"),
		"dojo-spacesAroundAnd": $.createSpaceWrappedSearch("&&", "The && sign should be preceded and followed by a space"),
	};
	
	var noSpaceAfter = ["catch","do","finally","for","if","switch","try","while","with"];

	// Add checks for all the elements that are not allowed to have a space after them.
	$.createNoSpaceAfterFunction = function(name){
		$.rulesets['dojo']["dojo-noSpaceAfter" + noSpaceAfter[i] + "1"] = checkstyleUtil.createSimpleSearch(" " + name +" ", "\" " + name + " \" cannot be followed by a space");
		$.rulesets['dojo']["dojo-noSpaceAfter" + noSpaceAfter[i] + "2"] = checkstyleUtil.createSimpleSearch("\t" + name +" ", "\" " + name + " \" cannot be followed by a space");
	}
	
	for(var i = 0; i < noSpaceAfter.length; i++){
		$.createNoSpaceAfterFunction(noSpaceAfter[i]);
	}
})(checkstyle);