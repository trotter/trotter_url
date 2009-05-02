/*extern Screw, CentralDispatch, describe, it,
         expect, equal, before, include, match */
Screw.Unit(function () {
    describe("Trotter.Url", function () {
        var url, input;

        describe("Parsing a Url", function () {
            before(function () {
                input = "http://localhost:3000/the/whole/path.js?firstname=bob&lastname=jones"
                url = new Trotter.Url(input);
            });

            it("should convert to a string", function () {
                expect(url.toString()).to(equal, input);
            });

            it("should have a scheme", function () {
                expect(url.scheme).to(equal, "http");
            });

            it("should have a host", function () {
                expect(url.host).to(equal, "localhost");
            });

            it("should have a port", function () {
                expect(url.port).to(equal, 3000);
            });

            it("should have a path", function () {
                expect(url.path).to(equal, "/the/whole/path.js");
            });

            it("should have a query string", function () {
                expect(url.queryString).to(equal, "firstname=bob&lastname=jones");
            });
        });
    });
});
