sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(Controller, JSONModel, MessageToast, Filter, FilterOperator) {
	"use strict";

	return Controller.extend("bn.test.controller.App", {
		onInit: function(){
			var that = this;
			var jokesModel = new JSONModel();
			var viewModel = new JSONModel({
				showBusy: false	
			});
			
			this.getView().setModel(viewModel,"appModel");
			
			fetch("https://api.icndb.com/jokes/random/15").then(function(data){
				return data.json();
			}).then(function(data){
				jokesModel.setData(data.value);
				that.getView().setModel(jokesModel,"jokes");
			}).catch(function(err){
				MessageToast.show("Something went wrong... " + err);
			});
		},
		
		onLiveChangeSearch: function(e){
			var list = this.getView().byId("joke_list");
			var viewModel = this.getView().getModel("appModel");
			var query = e.getSource().getValue();
			var aFilter = [];
			
			viewModel.setProperty("/showBusy",true);
			
			this.searchWithPromise(list,query).then(function(res){
				viewModel.setProperty("/showBusy",false);
				aFilter.push(new Filter("joke", FilterOperator.Contains, res));
				list.getBinding("items").filter(aFilter);
			});
		},
		
		searchWithPromise: function(list,query){
			return new Promise(function(resolve,reject){
				setTimeout(function(){
					resolve(query);
				},1000);
			});
		}
	});
});