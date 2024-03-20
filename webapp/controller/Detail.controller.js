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
        let ownerComponent;
        let appController;
        let detailPageModel;
        let detailPage;

        return Controller.extend("ns.splitapp.controller.Detail", {
            onInit: function () {
                if (!detailController){
                    detailController = this;
                    ownerComponent = this.getOwnerComponent();
                    appController = ownerComponent.byId('App').getController();
                    detailController._busyDialog = new sap.m.BusyDialog({
                        text: "Please wait"
                    });
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
                let oApp = appController.getView();
                let oAppData = oApp.getModel().getData();
                detailController.showDialog(oAppData.selectedData, 'Edit', function(e){

                    detailController._busyDialog.open();

                    let oDialog = e.getSource().getParent();
                    let oEditedData = e.getSource().getParent().getModel().getData();
                    oDialog.close();

                    //get the edited data and send it as a patch
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

                    let oData = {
                        "PersonId" : oEditedData.PersonId,
                        "FirstName": oEditedData.FirstName,
                        "LastName": oEditedData.LastName,
                        "StartDate": dateFormatter(oEditedData.StartDate),
                        "EndDate": dateFormatter(oEditedData.EndDate),
                        "HeightCm":  parseInt(oEditedData.HeightCm),
                        "ImageBase64": ""
                    }

                    let sUrl = appController._baseUri + "odata/v4/peopleservice/PeopleSet('" + oEditedData.PersonId + "')";
                    let sMethod = 'PUT';
                    let oHeaders = {
                        'Content-Type' : 'application/json',
                        'externalcaller' : 'true'
                    };

                    $.ajax({
                        url : sUrl,
                        method: sMethod,
                        dataType: 'text',
                        data: JSON.stringify(oData),
                        headers: oHeaders,
                        success:function(){
                            appController.readData().then((results)=>{
                                appController.bindAppData(results);
                                setTimeout(function(){
                                    detailController._busyDialog.close();
                                }, 1000)
                            })
                        },
                        error:function(e){
                            console.log(e);
                            setTimeout(function(){
                                detailController._busyDialog.close();
                            }, 1000)
                        }
                    })
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
                    detailController._busyDialog.open();

                    let oDialog = e.getSource().getParent();
                    let oDialogData = oDialog.getModel().getData();
                    oDialog.close();
                    
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


                    let sUrl = appController._baseUri + "odata/v4/peopleservice/PeopleSet";
                    let sMethod = 'POST';
                    let oHeaders = {'Content-Type' : 'application/json'};
                    detailController.externalCall(sUrl, sMethod, oFormattedData, oHeaders).then(function(result){
                        appController.readData().then((results)=>{
                            appController.bindAppData(results);
                            setTimeout(function(){
                                detailController._busyDialog.close();
                            }, 1000)
                            
                        })
                    }).catch(function(error){
                        setTimeout(function(){
                            detailController._busyDialog.close();
                        }, 1000)
                        console.log(error);
                    })
                });
            },
            deleteUser: function (e) {
                detailController._busyDialog.open();

                let oApp = appController.getView();
                let oAppData = oApp.getModel().getData();
                let oSelectedData = oAppData.selectedData;
                let sUrl = appController._baseUri + "odata/v4/peopleservice/PeopleSet('" + oSelectedData.PersonId + "')";
                let sMethod = 'DELETE';
                let oHeaders = {'externalcaller' : 'true'};

                detailController.externalCall(sUrl, sMethod, null, oHeaders).then(function(result){
                    appController.readData().then((results)=>{
                        appController.bindAppData(results);
                        setTimeout(function(){
                            detailController._busyDialog.close();
                        }, 1000)
                    })
                }).catch(function(error){
                    setTimeout(function(){
                        detailController._busyDialog.close();
                    }, 1000)
                    console.log(error)
                })
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
            },

            renderDemoTable : function () {
                console.log('rendering demo tabulator table');
                
                let oTable = new Tabulator('#demoTable', {
                  
                  pagination: 'local',
                  paginationSize: 20,
                  data: [],
                  layout: "fitColumns",
                  columns: [ //Define Table Columns
                    { title: "Carrier ID", field: "carrid" },
                    { title: "Price", field: "PRICE" },
                    { title: "Currency", field: "CURRENCY" },
                    { title: "Plane", field: "PLANETYPE" },
                    { title: "Distance", field: "flightDetails.distance" }
                  ]
                });
            }
        });
    });
