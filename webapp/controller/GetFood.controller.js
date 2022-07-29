sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/Label",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "../model/formatter",
    "sap/m/MessageToast",
  ],
  function (
    Controller,
    JSONModel,
    Label,
    Filter,
    FilterOperator,
    formatter,
    MessageToast
  ) {
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

        this.model.setProperty("/Filter/text", "Filtered by None");

        this.aKeys = ["Category", "Tag"];
        this.oSelectCategory = this.byId("slCategory");
        this.oSelectTag = this.byId("slTag");

        const oFB = this.getView().byId("filterbar");
        if (oFB) {
          oFB.variantsInitialized();
        }
      },

      onExit: function () {
        this.aKeys = [];
        this.aFilters = [];
        this.oModel = null;
      },

      onSelectChange: function () {
        var aCurrentFilterValues = [];

        aCurrentFilterValues.push(
          this.getSelectedItemText(this.oSelectCategory)
        );
        aCurrentFilterValues.push(this.getSelectedItemText(this.oSelectTag));

        this.filterItems(aCurrentFilterValues);
      },

      filterItems: function (aCurrentFilterValues) {
        const oItems = this.getGridItems();
        const aFilters = this.getFilters(aCurrentFilterValues);
        oItems.filter(aFilters);
      },

      getFilters: function (aCurrentFilterValues) {
        this.aFilters = [];

        this.aFilters.push(
          new Filter("Category", FilterOperator.EQ, aCurrentFilterValues[0])
        );
        // this.aFilters.push(
        //   new Filter(
        //     "FoodToTags/TagsId",
        //     FilterOperator.EQ,
        //     aCurrentFilterValues[1]
        //   )
        // );
        return this.aFilters;
      },

      getGridItems: function () {
        return this.getView().byId("foodListGrid").getBinding("items");
      },

      getSelectedItemText: function (oSelect) {
        return oSelect.getSelectedItem()
          ? oSelect.getSelectedItem().getKey()
          : "";
      },

      errorsObjects: new Set(),
      successObjects: new Map(),
      aOrderObjects: new Array(),

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
          oInput.setValueState("None");
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
          this.aOrderObjects.push(oFood);
        });
        this.createFinalStepView();
      },

      confirmOrderHandler: function () {
        this.aOrderObjects.forEach((el) => {
          const oModel = this.getView("getFoodWizard").getModel("food");
          const sKey = oModel.createKey("/FoodSet", {
            Id: el.Id,
            Category: el.Category,
          });
          oModel.update(sKey, {
            Id: el.Id,
            Category: el.Category,
            Descr: el.Descr,
            Amount: -el.Amount,
          });
        });
        MessageToast.show("success");

        this.returnToFood(this.getView("getFoodWizard"));
      },

      returnToFood: function (oView) {
        this._wizard.discardProgress("foodListGrid", false);
        this._wizard.previousStep();

        oView.getModel("food").refresh();
        oView.setModel(null, "OrderDataModel");

        this.errorsObjects = new Set();
        this.successObjects = new Map();
        this.aOrderObjects = Array();

        oView
          .getControlsByFieldGroupId("foodInput")
          .filter((c) => c.isA("sap.m.Input"))
          .forEach((el) => {
            el.setValueState("None");
            el.setValue("");
          });
      },

      createFinalStepView: function () {
        const oStep = this.getView().byId("orderConfirmation");
        const oOrderDataModel = { food: [] };
        oOrderDataModel.food = this.aOrderObjects;
        oStep.setModel(new JSONModel(oOrderDataModel), "OrderDataModel");
        oStep.getModel("OrderDataModel").refresh();
      },
    });
  }
);
