sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(Controller,JSONModel, MessageToast, Filter, FilterOperator) {
	"use strict";

	return Controller.extend("bn.league-api.controller.Detail", {
		
		onInit: function(){
			var viewModel = new JSONModel({
				selectedChampion: {
					name: null,
					details: null
				}
			});
			
			this.getView().setModel(viewModel,"viewModel");
			
			var router = sap.ui.core.UIComponent.getRouterFor(this);
			router.getRoute("detail").attachPatternMatched(this._onObjectMatched, this);
		},
		
		getChampionByName: function(name){
			var url = "/ddragon/7.21.1/data/en_US/champion/";
			var that = this;
			return new Promise(function(resolve,reject){
				$.get(url + name + ".json",function(champion){
					that.getView().getModel("viewModel").setProperty("/selectedChampion/details",champion.data[name]);
					that.getView().getModel("viewModel").setProperty("/selectedChampion/name",name);
				});
			});
		},
		
		_onObjectMatched: function(e){
			var name = decodeURI(e.getParameter("arguments").championName);
			this.getView().getModel("viewModel").setProperty("/imageBusy",true);
			
			this.getChampionByName(name).then(function(data){
				
			});
			
		},
		
		changeSkin: function(e){
			var skinId = e.getSource().getBindingContext("viewModel").getObject().num;
			var headerPic = this.getView().byId("header");
			var champName = this.getView().getModel("viewModel").getProperty("/selectedChampion/name");
			var url = "/ddragon/img/champion/splash/" + champName + "_" + skinId + ".jpg";
			
			headerPic.setSrc(url);
		},
		
		imageOnload: function(e){
			this.getView().getModel("viewModel").setProperty("/imageBusy",false);
			
		},
		
		onBeforeRendering: function(){
			
		},
		
		onAfterRendering: function(){
			
		},
		
		onExit: function(){
			
		},
		
		//events
		
		onPressListItem: function(e){
			
		}
	});
});