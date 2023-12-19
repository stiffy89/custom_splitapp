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

        return Controller.extend("ns.splitapp.controller.Master", {
            onInit: function () {
                 if (!masterController){
                    masterController = this;
                    const sUrl = "/odata/v4/peopleservice/PeopleSet";
                    const sMethod = 'GET';
                    masterController.readData(sUrl, sMethod).then(function(result){
                        masterPageModel = new sap.ui.model.json.JSONModel(result.value);
                    }).catch(function(error){
                        console.log(error);
                    })
                }
            },
            onBeforeRendering: function(){
               if (!detailController){
                    detailController = sap.ui.getCore().byId('application-nssplitapp-display-component---Detail').getController();
               }

               const masterPage = masterController.byId('masterPage');
               masterPage.setModel(masterModel);
            },
            readData: function (sUrl, sMethod) {
                return new Promise((resolve, reject) => {
                    $.ajax({
                        url: sUrl,
                        method: sMethod,
                        async: false,
                        success: function(result, status, xhr) {
                            resolve(result);
                        },
                        error: function(xhr, status, error) {
                            reject(error);
                        }
                    })
                })
            },
            titleFormatter: function (e) {
                console.log(e);

            }
        });
    });
