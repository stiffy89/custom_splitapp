sap.ui.define(
    [
        "sap/ui/core/mvc/Controller"
    ],
    function(BaseController) {
      "use strict";

      let appController;
      let mainModel;
      let oMasterController;
      let oDetailController;

      return BaseController.extend("ns.splitapp.controller.App", {
        onInit: function() {
          if (!appController){
            appController = this;
            appController._baseUri = this.getOwnerComponent().getManifestObject()._oBaseUri._string;
          }
        },
        onBeforeRendering: function () {
          
          appController.readData().then(function(results){
            appController.bindAppData(results);
          })
        },

        bindAppData: function (results) {
          let data = results.value;
          data.forEach((x, index, arr) => {
            if (index == 0){
              x.selected = true;
            } else {
              x.selected = false;
            }
          });

          let oEmpData = {
            payload: data,
            selectedData: data[0]
          }

          if (mainModel){
            mainModel.setData(oEmpData);
          } else {
            mainModel = new sap.ui.model.json.JSONModel(oEmpData);
          }

          //bind splitapp to the model
          let oComponent = this.getOwnerComponent();
          let oApp = oComponent.byId('App');
          oApp.setModel(mainModel)
        },
        
        readData: function(){
          
          const sUrl = appController._baseUri + "odata/v4/peopleservice/PeopleSet?$format=json";
          const sMethod = 'GET';

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
        }
      });
    }
  );
  