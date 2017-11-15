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
  neo-app.json
  
  Destination usage:
  ```
  , {
		"path": "/league",
		"target": {
			"type": "destination",
			"name": "lol-rest",
			"entryPath": "/"
		},
		"description": "lol rest api"
	},{
		"path": "/ddragon",
		"target": {
			"type": "destination",
			"name": "lol-ddragon",
			"entryPath": "/"
		}
	}
  ```
  
  ## 2. Champions list
  Landing.controller.js
  ```
   getChampionList: function(token){
			return new Promise(function(resolve,reject){
				$.get("/league/lol/static-data/v3/champions?tags=image&api_key=" + token, function( data ) {
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
			
			this.getChampionList(token).then(function(x){
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
              icon="/ddragon/7.21.1/img/champion/{champs>image/full}"
              iconDensityAware="false" iconInset="false"/>
          </List>
        </l:BlockLayoutCell>
      </l:BlockLayoutRow>
    </l:BlockLayout>
	</ScrollContainer>
   ```
   ## 3. Profile header
   
   Landing.controller.js
   
   ```
   New functions:
   
   getProfileData: function(token){
			return new Promise(function(resolve,reject){
				$.get("/league/lol/summoner/v3/summoners/by-name/csitikaa?api_key=" + token,function(data){
					resolve(data);
				});
			});
		},
   
   getMatchListForPlayer: function(x,token){
			return new Promise(function(resolve,reject){
				$.get("/league/lol/match/v3/matchlists/by-account/" + x + "/recent?api_key=" + token,function(data){
					resolve(data);
				});	
			});
		},
  
  getGameDataByMatchId: function(x,token){
			var that = this;
			var obj = null;
		
			return new Promise(function(resolve,reject){
				$.get("/league/lol/match/v3/matches/" + x + "?api_key=" + token,function(data){
					data.participantIdentities.forEach(function(item,index){
						if(item.player.summonerName === "csitikaa"){
							var elem = data.participants.filter(function(participant){
								return participant.participantId === item.participantId; 
							});
							
							obj = elem[0];
							obj.championName = that.findChampionNameById(obj.championId).key;
							
							resolve(obj);
						}
					});
				});
			});	
		},
   
		
   Call it in onInit:
   
   this.getProfileData(token).then(function(Profile){
				profileModel.setData({
					basicData: Profile,
					recentMatches: null
				});
				that.getView().setModel(profileModel,"profileModel");
				
				return that.getMatchListForPlayer(Profile.accountId, token);
	
			}).then(function(matchList){
				var obj = [];
				matchList.matches.forEach(function(item,index){
					obj.push(that.getGameDataByMatchId(item.gameId,token));
				});
				return obj;
				
			}).then(function(gameDetails){
				Promise.all(gameDetails).then(function(data){
					that.getView().getModel("profileModel").setProperty("/recentMatches",data);
					
				});
			});
			
   ```
   
   Landing.view.xml
   
   ```
   <l:BlockLayoutRow>
			<l:BlockLayoutCell title="" width="40%" backgroundColorSet="ColorSet5" backgroundColorShade="ShadeA">
					<FlexBox class="sapUiLargeMarginEnd" alignItems="Center" justifyContent="Start">
						<items>
							<f:Avatar class="sapUiSmallMarginEnd"
								src="/ddragon/7.21.1/img/profileicon/{profileModel>/basicData/profileIconId}.png" displaySize="L"></f:Avatar>
							<Label design="Bold" text="{profileModel>/basicData/name} - Lvl {profileModel>/basicData/summonerLevel}"></Label>
						</items>
					</FlexBox>
			</l:BlockLayoutCell>
			<l:BlockLayoutCell width="60%" backgroundColorSet="ColorSet5" backgroundColorShade="ShadeA">
				<List headerText="" items="{profileModel>/recentMatches}" class="sapContrast sapContrastPlus" >
						<CustomListItem highlight="{= ${profileModel>stats/win} ? 'Success' : 'Error' }" class="sapUiLargeMarginEnd">
							<l:Grid defaultSpan="L2 M2 S2" vSpacing="0" hSpacing="0" >
								<l:content>
									<Image
										width="2rem"
										height="2rem"
										alt="playedChampion"
										src="/ddragon/7.21.1/img/champion/{profileModel>championName}.png"></Image>
							
									<HBox displayInline="true" alignItems="Center" height="2rem">
										<Text text="{profileModel>timeline/lane}"></Text>
									</HBox>
									
									<HBox displayInline="true" alignItems="Center" height="2rem">
										<ObjectNumber number="{profileModel>stats/kills}\" state="Success"></ObjectNumber>
										<ObjectNumber number="{profileModel>stats/deaths}\" state="Error"></ObjectNumber>
										<ObjectNumber number="{profileModel>stats/assists}" state="Warning"></ObjectNumber>
									</HBox>
								
									<HBox displayInline="true" alignItems="Center" height="2rem">
										<ObjectNumber number="{profileModel>stats/totalMinionsKilled}"></ObjectNumber>
										<Image alt="minions" src="/ddragon/5.5.1/img/ui/minion.png" ></Image>
									</HBox>
							
									<HBox displayInline="true" alignItems="Center" height="2rem">
										<ObjectNumber number="{profileModel>stats/goldEarned}"></ObjectNumber>
										<Image alt="gold" src="/ddragon/5.5.1/img/ui/gold.png" ></Image>
									</HBox>
								
								</l:content>
							</l:Grid>
						</CustomListItem>
					</List>
			</l:BlockLayoutCell>
		</l:BlockLayoutRow>
   ```
   ## 4. Navigation with parameters
 Landing.controller.js
 
 
    ```
    onPressListItem: function(e){
			var router = sap.ui.core.UIComponent.getRouterFor(this);
			var champName = e.getSource().getBindingContext("champs").getObject().key;
			
			router.navTo("detail",{
				championName: encodeURI(champName)
			});
		}
    ```
    
Details.controller.js
    
    ```
    onInit:
    
    var router = sap.ui.core.UIComponent.getRouterFor(this);
			router.getRoute("detail").attachPatternMatched(this._onObjectMatched, this);
    
    new function:
    
    _onObjectMatched: function(e){
			var name = decodeURI(e.getParameter("arguments").championName);
			this.getView().getModel("viewModel").setProperty("/imageBusy",true);
			
			this.getChampionByName(name).then(function(data){
				
			});
			
		},
    ```
    
Init router:
 Component.js
 
    ```
    init:
    
    this.getRouter().initialize();
    ```
    
# 5. Get selected champion
  
  Details.controller.js
  
  ```
  onInit:
  
  	var viewModel = new JSONModel({
				imageBusy: false,
				selectedChampion: {
					name: null,
					details: null
				}
			});
			
			this.getView().setModel(viewModel,"viewModel");
  ```
  
  ```
  new function: 
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
  ```

  Details.view.xml
  
  ```
  <ScrollContainer
		height="100%"
		width="100%"
		vertical="true">
		
		<html:div class="fullsize-header">
			<Image id="header"
				alt="champ"
				mode="Background"
				height="100%"
				width="100%"
				backgroundSize="cover"
				backgroundRepeat="no-repeat"
				backgroundPosition="center top"
				src="/ddragon/img/champion/splash/{viewModel>/selectedChampion/name}_0.jpg">
			</Image>
		</html:div>
  </ScrollContainer>
  ```
  
  style.css
  
  
  ```
  .fullsize-header{
	height: 100vh;
}
  ```
  
  Details.view.xml
  
  Left-side panel with custom css
  
  ```
  <VBox class="stats customStyle">
				<FlexBox width="20rem" height="40%" alignItems="Start" direction="Column" class="sapUiSmallMarginTop sapContrast sapContrastPlus">
					<items>
					<chart:InteractiveDonutChart displayedSegments="4" selectionChanged="onSelectionChanged" press="press" >
						<chart:segments>
							<chart:InteractiveDonutChartSegment label="Attack" value="{viewModel>/selectedChampion/details/info/attack}"/>
							<chart:InteractiveDonutChartSegment label="Defense" value="{viewModel>/selectedChampion/details/info/defense}"/>
							<chart:InteractiveDonutChartSegment label="Difficulty" value="{viewModel>/selectedChampion/details/info/difficulty}"/>
							<chart:InteractiveDonutChartSegment label="Magic" value="{viewModel>/selectedChampion/details/info/magic}"/>
						</chart:segments>
					</chart:InteractiveDonutChart>
					
					<ScrollContainer vertical="true" width="20rem" height="350px">
						<List
							headerText="Skins" items="{viewModel>/selectedChampion/details/skins/}" class="sapContrast sapContrastPlus" >
							<ActionListItem text="{viewModel>name}" press="changeSkin"/>
						</List>
					</ScrollContainer>
					</items>
				</FlexBox>
			</VBox>
  ```
  
  style.css:
  
  ```
  .stats{
	position: absolute;
	height: 100%;
	left:0;
	top: 0;
}

.customStyle{
	background-color: black;
	opacity: .8;
}
  ```
  
Additional infos
Details.view.xml

```
<l:BlockLayout>
				<l:BlockLayoutRow class="sapContrast sapContrastPlus">
					<l:BlockLayoutCell title="Additional info" titleAlignment="Center">
						<VBox>
							<Text text="Feel free to add additional text here."></Text>
							
						</VBox>
					</l:BlockLayoutCell>
				</l:BlockLayoutRow>
				<l:BlockLayoutRow>
					<l:BlockLayoutCell title="Additional info2" titleAlignment="Center">
						<VBox>
							<Text text="Feel free to add additional text here."></Text>
							
						</VBox>
					</l:BlockLayoutCell>
				</l:BlockLayoutRow>
				<l:BlockLayoutRow class="sapContrast sapContrastPlus">
					<l:BlockLayoutCell title="Additional info3" titleAlignment="Center">
						<VBox>
							<Text text="Feel free to add additional text here."></Text>
							
						</VBox>
					</l:BlockLayoutCell>
				</l:BlockLayoutRow>
			</l:BlockLayout>
```
