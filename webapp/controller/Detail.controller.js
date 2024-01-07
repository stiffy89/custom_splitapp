sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/layout/form/SimpleForm"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        let detailController;
        let detailPageModel;
        let detailPage;

        return Controller.extend("ns.splitapp.controller.Detail", {
            onInit: function () {
                if (!detailController){
                    detailController = this;
                }
            },
            titleFormatter: function (sFirstName, sLastName){
                return sFirstName + " " + sLastName
            },
            heightFormatter: function (sHeight) {
                return sHeight + "cm";
            },
            editUser: function (e) {
                //get user data
                let oApp = sap.ui.getCore().byId('application-nssplitapp-display-component---App');
                let oAppData = oApp.getModel().getData();
                detailController.showDialog(oAppData.selectedData, 'Edit', function(e){
                    let oEditedData = e.getSource().getParent().getModel().getData();

                    //get the edited data and send it as a patch
                    console.log(oEditedData);
                })
            },
            createUser: function (e) {
                //create empty data
                let oData = {
                    EndDate: "",
                    EndDateDisp: "",
                    FirstName: "",
                    FullName: "",
                    HeightCm: "",
                    ImageBase64: "",
                    Initials: "",
                    LastName: "",
                    PersonId: "",
                    StartDate: "",
                    StartDateDisp: ""
                }

                detailController.showDialog(oData, 'Create', function(e){
                    let oDialog = e.getSource().getParent();
                    let oDialogData = oDialog.getModel().getData();
                    
                    //clean up data
                    let oFormattedData = {};
                    let dateFormatter = (sVal) => {
                        let oDate = new Date(sVal);
                        let year = oDate.getFullYear();
                        let month = oDate.getMonth() + 1;
                        let day = oDate.getDate();

                        if (month < 10){
                            month = "0" + month.toString();
                        }

                        if (day < 10){
                            day = "0" + day.toString();
                        }

                        return year + "-" + month + "-" + day;
                    }

                    oFormattedData.EndDate = dateFormatter(oDialogData.EndDateDisp);
                    oFormattedData.StartDate = dateFormatter(oDialogData.StartDateDisp);
                    oFormattedData.PersonId = "";
                    oFormattedData.FirstName = oDialogData.FirstName;
                    oFormattedData.LastName = oDialogData.LastName;
                    oFormattedData.HeightCm = parseInt(oDialogData.HeightCm);
                    oFormattedData.ImageBase64 = "";


                    let sUrl = "/odata/v4/peopleservice/PeopleSet";
                    let sMethod = 'POST';
                    let oHeaders = {'Content-Type' : 'application/json'};
                    detailController.externalCall(sUrl, sMethod, oFormattedData, oHeaders).then(function(result){
                        //if successfull, close dialog
                        oDialog.close();

                        const oApp = sap.ui.getCore().byId("application-nssplitapp-display-component---App");
                        const oAppController = oApp.getController();
                        oAppController.readData().then((results)=>{
                            oAppController.bindAppData(results);
                        })
                    }).catch(function(error){
                        console.log(error)
                    })
                });
            },
            deleteUser: function (e) {
                console.log(e);
            },
            showDialog: function (data, actionText, actionFn) {
                let oDataCopy = $.extend(true,{},data);
                let oDialogModel = new sap.ui.model.json.JSONModel(oDataCopy);
                let oSimpleForm = new sap.ui.layout.form.SimpleForm({
                    content:[
                        new sap.m.Label({
                            text: "First Name"
                        }),
                        new sap.m.Input({
                            value: "{FirstName}"
                        }),
                        new sap.m.Label({
                            text: "Last Name"
                        }),
                        new sap.m.Input({
                            value: "{LastName}"
                        }),
                        new sap.m.Label({
                            text: "Start Date"
                        }),
                        new sap.m.DatePicker({
                            value: "{StartDateDisp}"
                        }),
                        new sap.m.Label({
                            text: "End Date"
                        }),
                        new sap.m.DatePicker({
                            value: "{EndDateDisp}"
                        }),
                        new sap.m.Label({
                            text: "Height"
                        }),
                        new sap.m.Input({
                            value: "{HeightCm}"
                        })
                    ]
                });

                let oDialog = new sap.m.Dialog({
                    content:[
                        oSimpleForm
                    ],
                    buttons:[
                        new sap.m.Button({
                            text: "Close",
                            press: function(){
                                oDialog.close();
                            }
                        }),
                        new sap.m.Button({
                            text: actionText,
                            press: actionFn
                        })
                    ],
                    afterClose: function (){
                        oDialog.destroy();
                    }
                });

                oDialog.setModel(oDialogModel);
                oDialog.bindElement("/");

                oDialog.open();
            },
            externalCall: function (sUrl, sMethod, data, headers) {
                let oAjaxObj = {
                    url: sUrl,
                    method: sMethod,
                    dataType:'json',
                    async: false
                }

                if (data){
                    oAjaxObj.data = JSON.stringify(data);
                }

                if (headers){
                    oAjaxObj.headers = headers
                }

                return new Promise((resolve,reject) => {
                    oAjaxObj.success = function(result, status, xhr) {
                        resolve(result);
                    };

                    oAjaxObj.error = function(xhr, status, error) {
                        reject(error);
                    };

                    $.ajax(oAjaxObj);
                });
            }
        });
    });