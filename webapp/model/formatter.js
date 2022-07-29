sap.ui.define([], function () {
  "use strict";
  return {
    inputId: function (sId, sCategory) {
      return sId + "_" + sCategory;
    },
  };
});
