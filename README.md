# sapui5 lol api
  *Sample application*
  
## Step by step guide
## 1. Creating views controllers, setting up manifest.json and routing.
  App.controller.js
  ```
  sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function(Controller,JSONModel ) {
	"use strict";

	return Controller.extend("<YourNameSpace>.<YourProjectName>.controller.App", {
		
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
  ```
  App.view.xml
  ```
  <mvc:View controllerName="<YourNameSpace>.<YourProjectName>.controller.App" xmlns:html="http://www.w3.org/1999/xhtml"       
    xmlns:mvc="sap.ui.core.mvc" displayBlock="true" xmlns="sap.m">

    <App id="app" />
	
  </mvc:View>
  ```
  Views are gonna be displayed in the App control by the Router.
  Next, create a blank "Landing" and "Details" page as well.
  
  manifest.json
  ```
  ,
		"routing": {
		  "config": {
			"routerClass": "sap.m.routing.Router",
			"viewType": "XML",
			"viewPath": "<YourNameSpace>.<YourProjectName>.view",
			"controlId": "app",
			"controlAggregation": "pages"
		  },
		 "routes": [
        {
          "pattern": "",
          "name": "landing",
          "target": "landing"
        },
        {
          "pattern": "Details/{championName}",
          "name": "detail",
          "target": "detail"
        }],
       "targets": {
          "landing": {
            "viewName": "Landing"
          },
          "detail": {
            "viewName": "Detail"
          }
		  }
		}
    
  ```
  ## 2. Champions list
  Landing.controller.js
  ```
   getChampionList: function(url,token){
			return new Promise(function(resolve,reject){
				$.get(url + token, function( data ) {
					var iter = [];
					Object.keys(data.data).map(function(x){ iter.push(data.data[x]); });
					resolve(iter);
				});
			});	
		},
  ```
   ```
   var champModel = new JSONModel();
			var profileModel = new JSONModel();
			
			this.getChampionList(url, token).then(function(x){
				champModel.setData(x);
				that.getView().setModel(champModel,"champs");
			});
  ```
   Landing.view.xml

   ```
   <ScrollContainer
		height="100%"
		width="100%"
		vertical="true">
      <l:BlockLayout >
      <l:BlockLayoutRow>
        <l:BlockLayoutCell backgroundColorSet="ColorSet5" backgroundColorShade="ShadeB">
          <Label text="Champion list" design="Bold"></Label>
          <List class="sapContrast sapContrastPlus" mode="None" items="{champs>/}" inset="true" growing="true" growingThreshold="10"
            growingScrollToLoad="false">
            <StandardListItem title="{champs>name}, {champs>title}" press="onPressListItem" 
              type="Navigation" description="{champs>lore}"
              icon="ddragonLin.leagueoflegends.com/cdn/7.21.1/img/champion/{champs>image/full}"
              iconDensityAware="false" iconInset="false"/>
          </List>
        </l:BlockLayoutCell>
      </l:BlockLayoutRow>
    </l:BlockLayout>
	</ScrollContainer>
   ```
