const { httpservTest } = require("./test_suites/unit_test/httpserv.test");
const { apiGatewayTests } = require("./test_suites/unit_test/api_gateway.test");
const { integrationTests } = require("./test_suites/integration_test/integrationTest.test");

describe("Unit tests", () => {
    describe("HTTP server tests", httpservTest);
    describe("API gateway tests", apiGatewayTests);
});

describe("Integration tests", integrationTests);