sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "../model/formatter",
  ],
  function (Controller, JSONModel, Filter, FilterOperator, formatter) {
    "use strict";
    return Controller.extend("sap.ui.food.controller.getFood", {
      formatter: formatter,
      onInit: function () {
        this._wizard = this.byId("getFoodWizard");

        this.model = new JSONModel();
        this.model.setData({
          idValueState: "Error",
          passwordValueState: "Error",
        });

        this.orderModel = new JSONModel();

        this.getView().setModel(this.model);
        this.getView().setModel(null, "OrderDataModel");
      },

      errorsObjects: new Set(),
      successObjects: new Map(),
      orderObjects: new Array(),

      additionalInfoValidation: function (oEvent) {
        const sInputName = oEvent.getSource().getName();
        const sInputId = oEvent.getSource().getId();
        const oInput = sap.ui.getCore().byId(sInputId);
        const nValue = parseInt(oEvent.getSource().getValue());

        const [nId, nCat] = sInputName.split("_");

        const nAmount = this.getView()
          .getModel("food")
          .getProperty(`/FoodSet(Id='${nId}',Category='${nCat}')`).Amount;
        if (
          nValue === NaN ||
          nValue < 0 ||
          nValue > nAmount ||
          !Number.isInteger(nValue)
        ) {
          oInput.setValueState("Error");
          return;
        }
        if (nValue === 0) {
          oInput.setValueState("");
          return;
        }
        oInput.setValueState("Success");
      },

      addSuccessObject: function (sKey, nValue) {
        this.successObjects.set(sKey, nValue);
        this.errorsObjects.delete(sKey);
      },

      addErrorObject: function (sKey) {
        this.successObjects.delete(sKey);
        this.errorsObjects.add(sKey);
      },

      addInputInfo: function (oEvent) {
        const sInputName = oEvent.getSource().getName();
        const nValue = parseInt(oEvent.getSource().getValue());

        const [nId, nCat] = sInputName.split("_");

        const nAmount = this.getView()
          .getModel("food")
          .getProperty(`/FoodSet(Id='${nId}',Category='${nCat}')`).Amount;
        if (
          nValue === NaN ||
          nValue < 0 ||
          nValue > nAmount ||
          !Number.isInteger(nValue)
        ) {
          this.addErrorObject(sInputName);
          this.validateOrder();
        }
        if (nValue === 0) {
          this.successObjects.delete(sInputName);
          this.errorsObjects.delete(sInputName);
          this.validateOrder();
          return;
        }
        this.addSuccessObject(sInputName, nValue);
        this.validateOrder();
      },

      validateOrder: function () {
        if (this.errorsObjects.size === 0 && this.successObjects.size !== 0) {
          this._wizard.validateStep(this.byId("foodSelection"));
          return;
        }
        this._wizard.invalidateStep(this.byId("foodSelection"));
      },

      onauthorization: function () {
        this._wizard.invalidateStep(this.byId("foodSelection"));
      },
      onScanCard: function () {
        this._wizard.validateStep(this.byId("authorization"));
        this._wizard.setCurrentStep(this.byId("foodSelection"));
        this._wizard.goToStep(this.byId("foodSelection"));
      },

      authorizationHanlder: function () {},

      orderHandler: function () {
        this.successObjects.forEach((nValue, sFoodIdCat) => {
          const [nId, nCat] = sFoodIdCat.split("_");
          const oFood = this.getView()
            .getModel("food")
            .getProperty(`/FoodSet(Id='${nId}',Category='${nCat}')`);
          oFood.Amount = nValue;
          delete oFood.FoodToTags;
          this.orderObjects.push(oFood);
        });
        this.createFinalStepView();
      },

      confirmOrderHandler: function () {
        console.log("orderConfirmed");
      },

      createFinalStepView: function () {
        const oStep = this.getView().byId("orderConfirmation");
        const oOrderDataModel = { food: [] };
        oOrderDataModel.food = this.orderObjects;
        oStep.setModel(new JSONModel(oOrderDataModel), "OrderDataModel");
        oStep.getModel("OrderDataModel").refresh();

        // const oGridList = new sap.f.GridList({
        //   items: { path: "OrderDataModel", template: oTemp },
        // }).bindAggregation("GridListItem", {
        //   template: new sap.m.ListItemBase({
        //     content: new sap.m.HBox({
        //       height: "100%",
        //       width: "100%",
        //       justifyContent: "SpaceBetween",
        //       content: [
        //         new sap.m.Image({
        //           src: "foodImages/{OrderDataModel>ImageName}",
        //           width: "3rem",
        //         }),
        //       ],
        //     }),
        //   }),
        // });
      },
    });
  }
);
