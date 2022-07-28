sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  function (Controller, JSONModel) {
    "use strict";
    return Controller.extend("sap.ui.food.controller.getFood", {
      onInit: function () {
        this._wizard = this.byId("getFoodWizard");

        this.model = new JSONModel();
        this.model.setData({
          idValueState: "Error",
          passwordValueState: "Error",
        });
        this.getView().setModel(this.model);
      },

      additionalInfoValidation: function () {
        // TODO
      },

      onAuthorization: function () {
        this._wizard.invalidateStep(this.byId("Authorization"));
      },
      onScanCard: function () {
        this._wizard.validateStep(this.byId("Authorization"));
        this._wizard.nextStep();
      },
    });
  }
);
