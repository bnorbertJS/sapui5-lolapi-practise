sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(Controller,JSONModel, MessageToast, Filter, FilterOperator) {
	"use strict";

	return Controller.extend("bn.league-api.controller.Landing", {

		onInit: function(){
			var viewModel = new JSONModel({
				showBusy: false
			});

			var token = "<Place your token here>";
			var that = this;
			var champModel = new JSONModel();
			var profileModel = new JSONModel();

			this.getChampionList(token).then(function(x){
				champModel.setData(x);
				that.getView().setModel(champModel,"champs");
			});

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

			this.getView().setModel(viewModel,"landingModel");
		},

		getChampionList: function(token){
			return new Promise(function(resolve,reject){
				$.get("/league/lol/static-data/v3/champions?tags=image&api_key=" + token, function( data ) {
					var iter = [];
					Object.keys(data.data).map(function(x){ iter.push(data.data[x]); });
					resolve(iter);
				});
			});
		},

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

		findChampionNameById: function(id){
			var champ = this.getView().getModel("champs").getData().filter(function(x){
				return id === x.id;	
			});

			return champ[0];
		},

		onBeforeRendering: function(){

		},

		onAfterRendering: function(){

		},

		onExit: function(){

		},

		//events

		onPressListItem: function(e){
			var router = sap.ui.core.UIComponent.getRouterFor(this);
			var champName = e.getSource().getBindingContext("champs").getObject().key;

			router.navTo("detail",{
				championName: encodeURI(champName)
			});
		}
	});
});
