sap.ui.define(
    [
        "sap/ui/core/mvc/Controller"
    ],
    function(BaseController) {
      "use strict";

      let oAppController;
      let oMasterController;
      let oDetailController;

      return BaseController.extend("ns.splitapp.controller.App", {
        onInit: function() {
          if (!oAppController){
            oAppController = this;
            
          }
        },
        readData: function(){

        }
      });
    }
  );
  