sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        let mainController;

        return Controller.extend("ns.splitapp.controller.Detail", {
            onInit: function () {
                /* if (!mainController){
                    mainController = this;
                    const sUrl = "/odata/v4/peopleservice/PeopleSet";
                    const sMethod = 'GET';
                    mainController.readData(sUrl, sMethod).then(function(result){
                        mainController._oModel = new sap.ui.model.json.JSONModel(result.value);
                    }).catch(function(error){
                        console.log(error);
                    })
                } */

                console.log(this);
            }
        });
    });
