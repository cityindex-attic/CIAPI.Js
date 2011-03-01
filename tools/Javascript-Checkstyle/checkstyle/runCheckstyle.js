//Checkstyle script for Dojo
var buildTimerStart = (new Date()).getTime();
var checkstyleDir = java.lang.System.getProperty('JSCHECKSTYLE_HOME');
checkstyleDir = "./"

load(checkstyleDir + "jslib/logger.js");
load(checkstyleDir + "jslib/fileUtil.js");
load(checkstyleDir + "jslib/buildUtil.js");

load(checkstyleDir + "checkstyleUtil.js");
load(checkstyleDir + "dojo-ruleset.js");
load(checkstyleDir + "crockford-ruleset.js");


//*****************************************************************************
(function($, arguments) { 
	if(arguments[0] == "help"){
		print("Usage: \n\tTo generate a HTML report on dojo, dijit and dojox folders use:\n\t\t"
			+ "checkstyle \n\t"
			+ "To specify a single directory to check in, including all child folders, use:\n\t\t"
			+ "checkstyle dir={folderName}\n\t"
			+ "To specify a list of files to process, use the 'files' parameter, passing a list of space separated files, e.g.\n\t\t"
			+ "checkstyle files=\"dojo/_base/Color.js dojo/back.js\"\n\t"
			+ "To force the script to fail when a specified file has failed the check, use the 'failOnError' parameter, e.g.\n\t\t"
			+ "checkstyle failOnError=true files=\"dojo/_base/Color.js dojo/back.js\"\n\t"
			+ "To commit fixes made by the checkstyleReport.html tool, use\n\t\t"
			+ "checkstyle commit");
	} else{	
		//Convert arguments to keyword arguments.
		var kwArgs = buildUtil.makeBuildOptions(arguments);

		runCheckstyle();

		var buildTime = ((new Date().getTime() - buildTimerStart) / 1000);
		print("Build time: " + buildTime + " seconds");

	}
	//*****************************************************************************

	//********* Start checkstyle *********
	function runCheckstyle(){
	
		var dirs, i;
	
		var reportFile = kwArgs.reportFile || "checkstyleData.js";

		reportFile = "./" + reportFile;

		if(kwArgs.ruleSets && kwArgs.ruleSetConfig) throw Error("Only one of the two configuration options are allowed 'rulSets' or 'ruleSetConfig'");

		if(kwArgs.ruleSets){

			var ruleSetsToMerge = [];
			var ruleSetsParam = kwArgs.ruleSets.split(",");
		
			for (var i in ruleSetsParam) {
				var ruleSetName = ruleSetsParam[i];
			
				if (!$.rulesets[ruleSetName]) throw Error("Rulesets do not exist for '" + ruleSetName + "'");

				ruleSetsToMerge.push($.rulesets[ruleSetName]);				
			}
		
			$.setRulesets(ruleSetsToMerge);
		} else if (kwArgs.ruleSetConfig) {
			load(kwArgs.ruleSetConfig);
		} else {
			$.addRuleset([$.rulesets['dojo']]);
		}
	
		if(kwArgs.files){
			var files = kwArgs.files.split(" ");
		
			for(i = 0; i < files.length; i++){
				$.applyRules(files[i], fileUtil.readFile(files[i]));
			}
			if($.errors){
				var errors = $.serializeErrors();
				if(kwArgs.failOnError == "true"){
					throw Error("Checkstyle failed. \n" + errors);
				} else{
					print(errors);
				}
			}
			return;
		}
	
		if(kwArgs.dir){
			dirs = [kwArgs.dir];
		}

		for(i = 0; i < dirs.length; i++){
			var fileList = fileUtil.getFilteredFileList(dirs[i], /\.js$/, true);
			for(var j = 0; j < fileList.length; j++){
				if(fileList[j].indexOf("/test") < 0
					&& fileList[j].indexOf("/nls") < 0 
					&& fileList[j].indexOf("/demos") < 0){
					$.applyRules(fileList[j], fileUtil.readFile(fileList[j]));
				}
			}
		}
		
		var report = $.generateReport();
		fileUtil.saveUtf8File(reportFile, report);
	}
})(checkstyle, arguments);
//********* End checkstyle *********