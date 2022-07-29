sap.ui.define(
  ["sap/ui/core/util/MockServer", "sap/base/util/UriParameters"],
  function (MockServer, UriParameters) {
    "use strict";

    return {
      init: function () {
        // create
        var oMockServer = new MockServer({
          rootUri:
            "http://localhost:8080/sap/opu/odata/sap/ZSTUDENT02_DINING_SRV",
        });

        var oUriParameters = new UriParameters(window.location.href);

        // configure mock server with a delay
        MockServer.config({
          autoRespond: true,
          autoRespondAfter: oUriParameters.get("serverDelay") || 500,
        });

        // simulate
        var sPath = sap.ui.require.toUrl("sap/ui/food/localService");
        oMockServer.simulate(sPath + "/metadata.xml", sPath + "/mockdata");

        // start
        oMockServer.start();
      },
    };
  }
);
