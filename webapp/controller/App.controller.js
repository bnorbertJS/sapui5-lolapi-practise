sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function(Controller,JSONModel ) {
	"use strict";

	return Controller.extend("bn.league-api.controller.App", {
		
		onInit: function(){
			var appModel = new JSONModel({
				showBusy: false	
			});
			
			this.getView().setModel(appModel,"appModel");
		},
		
		onBeforeRendering: function(){
			
		},
		
		onAfterRendering: function(){
			
		},
		
		onExit: function(){
			
		}
	});
});