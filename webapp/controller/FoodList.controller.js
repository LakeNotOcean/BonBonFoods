sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  function (Controller) {
    "use strict";

    return Controller.extend("sap.ui.food.controller.FoodList", {
      onInit: function () {
        // var oViewModel = new JSONModel({
        //   currency: "EUR",
        // });
        // this.getView().setModel(oViewModel, "view");
      },
      // onFilterInvoices: function (oEvent) {
      //   // build filter array
      //   var aFilter = [];
      //   var sQuery = oEvent.getParameter("query");
      //   if (sQuery) {
      //     aFilter.push(
      //       new Filter("ProductName", FilterOperator.Contains, sQuery)
      //     );
      //   }

      //   // filter binding
      //   var oList = this.byId("invoiceList");
      //   var oBinding = oList.getBinding("items");
      //   const aDefaultFilter = oList.getBindingInfo("items").filters;
      //   oBinding.filter(aFilter.concat(aDefaultFilter));
      // },
    });
  }
);
