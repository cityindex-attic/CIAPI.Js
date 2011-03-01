/*(function($) { 
	$.setRulesets([
		$.rulesets["dojo"],
		{
	//		"useSpaces": checkstyleUtil.createSimpleSearch("\t", "Spaces should be used in place of tabs"),
			"dojo-useTabs": $.disableRule
		}
	]);	
})(checkstyle);
*/

(function($) {
	$.addRuleset($.rulesets["crockford"]);

	$.disableRule('dojo-useTabs');

	$.addRuleset({
			//"useSpaces": checkstyleUtil.createSimpleSearch("\t", "Spaces should be used in place of tabs"),
			"dojo-useTabs": $.disableRule
	});
})(checkstyle);
