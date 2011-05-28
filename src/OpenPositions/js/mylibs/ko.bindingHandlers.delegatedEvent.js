//binding to do event delegation for any event
ko.bindingHandlers.delegatedEvent = {
    init: function(element, valueAccessor, allBindings, viewModel) {
        var eventsToHandle = valueAccessor() || {};
        //if a single event was passed, then convert it to an array
        if (!$.isArray(eventsToHandle)) {
            eventsToHandle = [eventsToHandle];
        }
        ko.utils.arrayForEach(eventsToHandle, function(eventOptions) {
            var realCallback = function(event) {
                var element = event.target;
                var options = eventOptions;
                //verify that the element matches our selector
                if ($(element).is(options.selector)) {
                    //get real context
                    var context = $(event.target).tmplItem().data;
                    //if a string was passed for the function, then assume it is a function of the real context
                    if (typeof options.callback === "string" && typeof context[options.callback] === "function") {
                        return context[options.callback].call(context, event);
                    }
                    //if a function was passed, then give it the real context as a param
                    return options.callback.call(viewModel, context, event);
                }
            }
 
            var realValueAccessor = function() {
                var result = {};
                result[eventOptions.event] = realCallback;
                return result;
            }
 
            ko.bindingHandlers.event.init(element, realValueAccessor, allBindings, viewModel);
        });
    }
};