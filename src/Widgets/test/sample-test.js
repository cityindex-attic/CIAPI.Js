var sampleTest = TestCase("Sample Test", {
	testAssertWorks: function() {
		var greeter = new myapp.Greeter();
		assertEquals("Hello World!", greeter.greet("World"));
	}
});
