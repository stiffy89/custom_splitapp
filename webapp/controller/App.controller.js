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
          let oApp = sap.ui.getCore().byId('application-nssplitapp-display-component---App');
          oApp.setModel(mainModel)
        },
        
        readData: function(){
          
          const sUrl = "/odata/v4/peopleservice/PeopleSet?$format=json";
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
  