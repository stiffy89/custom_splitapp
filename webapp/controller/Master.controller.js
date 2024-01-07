sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        let masterController;
        let detailController;

        let masterPageModel;
        let bFirstRender = false;

        return Controller.extend("ns.splitapp.controller.Master", {
            onInit: function () {
                 if (!masterController){
                    masterController = this;
                }
            },
            onBeforeRendering: function(){
            
            },
            onAfterRendering: function () {
                
            },
            listTitleFormatter: function (sFirstName, sLastName) {
                return sFirstName + " " + sLastName;
            },
            listItemSelection: function (oEvent){
                //bind the detail page from here
                let oSource = oEvent.getParameters().listItem;
                let oBindingContext = oSource.getBindingContext();
                let oSelectedData = oBindingContext.getObject(oBindingContext.getPath())
                
                let oModel = oBindingContext.getModel();
                oModel.setProperty("/selectedData", oSelectedData);

            },

        });
    });
