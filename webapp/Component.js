sap.ui.define(
  [
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/resource/ResourceModel",
  ],
  function (UIComponent, JSONModel, ResourceModel) {
    "use strict";
    return UIComponent.extend("sap.ui.food.Component", {
      metadata: {
        interfaces: ["sap.ui.core.IAsyncContentCreation"],
        manifest: "json",
      },
      init: function () {
        // call the init function of the parent
        UIComponent.prototype.init.apply(this, arguments);
        // set data model
        // set i18n model on view
        const i18nModel = new ResourceModel({
          bundleName: "sap.ui.food.i18n.i18n",
        });
        this.setModel(i18nModel, "i18n");
      },
    });
  }
);
