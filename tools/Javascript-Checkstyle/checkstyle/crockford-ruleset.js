(function ($) {
	$.rulesets['crockford'] = {
		"crockford-indentation": function(fileName, contents, comments) {
			var idx = contents.indexOf("\t");
		
			while (idx > -1){
				var nextChar = $.getNextChar(contents, idx + 1);
				if(!comments[idx] && nextChar && nextChar.value.charCodeAt(0) != 13){
					$.addError("Spaces should be used instead of tabs", fileName, contents, idx);
					var nextLine = $.findNextCharPos(contents, idx + 1, "\n");
					if(nextLine < 0){
						break;
					}
					idx = contents.indexOf("\t", nextLine + 1);
				} else{
					idx = contents.indexOf("\t", idx + 2);
				}
			}
		},
		
		"crockford-linelength": function(fileName, contents, comments) {
			var pIdx = 0;
			var idx = contents.indexOf("\n");
			
			do {
				var lineLength = idx - pIdx;

				if (lineLength > 80 && !comments[idx-1]) {
					$.addError("Line Length Should be Less Than 80", fileName, contents, idx - 1);
				}

				pIdx = idx;
				idx = contents.indexOf("\n", idx + 1);
			} while (idx > -1);
		},
		
		"crockford-noSpaceAfterFunctionName": function(fileName, contents, comments){
            var string = "function ";

			var idx = contents.indexOf(string);
			while(idx > -1){
			    var endOfFunctionIndex = idx + string.length;
				var nextChar = $.getNextChar(contents, endOfFunctionIndex);
				
                if (!comments[idx] && (nextChar.value != "(") && (contents.indexOf(" ", endOfFunctionIndex) < contents.indexOf("(", endOfFunctionIndex))) {
                    $.addError("There should be no space between the name of a function and the ( (left parenthesis) of its parameter list.", fileName, contents, idx);
                }

				idx = contents.indexOf(string, idx + 1);
			}
		},
		
		"crockford-singleSpaceAfterAnonymousFunction": function(fileName, contents, comments){
            var string = "function(";

			var idx = contents.indexOf(string);
			while(idx > -1){
                if (!comments[idx]) {
                    $.addError("If a function literal is anonymous, there should be one space between the word function and the ( (left parenthesis).", fileName, contents, idx);
                }

				idx = contents.indexOf(string, idx + 1);
			}
		},
		
        "crockford-singleSpaceAfterAnonymousFunctionParameters": $.createRegexSearch(/function[^(]*\([^)]*\)\{/, "There should be one space between the ) (right parenthesis) and the { (left curly brace) that begins the statement body."),
		
		"crockford-noParenthesisAroundReturnValue" : $.createRegexSearch(/return[ ]*\(/, "A return statement with a value should not use ( ) (parentheses) around the value. The return value expression must start on the same line as the return keyword in order to avoid semicolon insertion."),
		
		"crockford-spaceBetweenIfandCondtions" : $.createSimpleSearch("if(", "A space is required between an if statement and it's conditionsals"),
		
		"crockford-spaceBetweenConditionsAndCurlyBrace" : $.createSimpleSearch("){", "A space is required between an parenthesis and curly brace"),
		
		"crockford-spaceBetweenCurlyBranceAndElse" : $.createSimpleSearch("}else", "A space is required between an else statement and the closing curly brace"),
		
		"crockford-spaceBetweenElseAndCurlyBrace" : $.createSimpleSearch("else{", "A space is required between an else statement and the opening curly brace"),
		
		"crockford-spaceBetweenForandCriteria" : $.createSimpleSearch("for(", "A space is required between an for statement and it's criteria"),
		
        "crockford-forCriteriaSpacing": function(fileName, contents, comments){
            var globalRegex = /for \(([^;]*);([^;]*);([^)]*)\) \{/g;
            var regex = /for \(([^;]*);([^;]*);([^)]*)\) \{/;
                
            var results = contents.match(globalRegex);
            
            if (!results) return;

            for (var i = 0; i < results.length; i++) {
                var result = results[i];
                var pieces = result.match(regex);

                if (pieces[1][0] == " " || pieces[2][0] != " " || pieces[3][0] != " ") {
        			var idx = contents.indexOf(result);
        			while(idx > -1){
                        if (!comments[idx]) {
                            $.addError("The for statement criteria should be of the following form 'for (initialization; condition; update) {'", fileName, contents, idx);
                        }

        				idx = contents.indexOf(result, idx + 1);
        			}                    
                }
            }
        },
        
        "crockford-forInCriteriaSpacing": function(fileName, contents, comments){
            var globalRegex = /for \((.*)in(.*)\) \{/g;
            var regex = /for \((.*)in(.*)\) \{/;
                
            var results = contents.match(globalRegex);

            print(results);
            
            if (!results) return;

            for (var i = 0; i < results.length; i++) {
                var result = results[i];
                var pieces = result.match(regex);

                if (pieces[1][0] == " " || pieces[1][pieces[1].length-1] != " " || pieces[2][0] != " " || pieces[2][pieces[2].length-1] == " ") {
        			var idx = contents.indexOf(result);
        			while(idx > -1){
                        if (!comments[idx]) {
                            $.addError("The for in statement criteria should be of the following form 'for (variable in object) {'", fileName, contents, idx);
                        }

        				idx = contents.indexOf(result, idx + 1);
        			}                    
                }
            }
        },
		
		"crockford-spaceBetweenWhileandCriteria" : $.createSimpleSearch("while(", "A space is required between an while statement and it's criteria"),
		
	};
})(checkstyle);