"use strict";function _readOnlyError(r){throw new TypeError('"'+r+'" is read-only');}function _inheritsLoose(t,o){t.prototype=Object.create(o.prototype),t.prototype.constructor=t,_setPrototypeOf(t,o);}function _setPrototypeOf(t,e){return _setPrototypeOf=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(t,e){return t.__proto__=e,t;},_setPrototypeOf(t,e);}/**
 * Teambuilder team panel
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 */var










TeamRoom=function(_PSRoom){















function TeamRoom(options){var _this$team;var _this;
_this=_PSRoom.call(this,options)||this;_this.team=void 0;_this.teamDeleted=false;_this.forceReload=false;_this.editor=void 0;_this.clientCommands=_this.parseClientCommands({'validate':function(target){if(this.team.format.length<=4){return this.errorReply("You must select a format first.");}this.send("/utm "+this.team.packedTeam);this.send("/vtm "+this.team.format);}});_this.






onParentKeyDown=function(e){var _this$editor;
return(_this$editor=_this.editor)==null||_this$editor.handleParentKeyDown==null?void 0:_this$editor.handleParentKeyDown(e);
};var team=PS.teams.byKey[_this.id.slice(5)]||null;_this.team=team;_this.title="[Team] "+(((_this$team=_this.team)==null?void 0:_this$team.name)||'Not found');if(team)_this.setFormat(team.format);_this.load();return _this;}_inheritsLoose(TeamRoom,_PSRoom);var _proto=TeamRoom.prototype;_proto.
getTeam=function getTeam(){var _this$team2;
var team=PS.teams.byKey[this.id.slice(5)]||null;
this.teamDeleted=!team&&(!!this.team||this.teamDeleted);
this.team=team;
this.title="[Team] "+(((_this$team2=this.team)==null?void 0:_this$team2.name)||(this.teamDeleted?'Team deleted':'Not found'));
return team;
};_proto.
setFormat=function setFormat(format){
var team=this.team;
team.format=toID(format);
};_proto.
load=function load(){var _PS$teams$loadTeam,_this2=this;
(_PS$teams$loadTeam=PS.teams.loadTeam(this.team,true))==null||_PS$teams$loadTeam.then(function(){
_this2.update(null);
});
};_proto.
upload=function upload(isPrivate){
var team=this.team;
var cmd=team.uploaded?'update':'save';

var buf=[];
if(team.uploaded){
buf.push(team.uploaded.teamid);
}else if(team.teamid){
return PS.alert("This team is for a different account. Please log into the correct account to update it.");
}
buf.push(team.name,team.format,isPrivate?1:0);
var exported=team.packedTeam;
if(!exported)return PS.alert("Add a Pokemon to your team before uploading it.");
buf.push(exported);
PS.teams.uploading=team;
PS.send("/teams "+cmd+" "+buf.join(', '));
team.uploadedPackedTeam=exported;
this.update(null);
};_proto.
cancelUpload=function cancelUpload(){
PS.teams.uploading=null;
this.team.uploadedPackedTeam=undefined;
this.update(null);
};_proto.
stripNicknames=function stripNicknames(packedTeam){
var team=Teams.unpack(packedTeam);for(var _i2=0;_i2<
team.length;_i2++){var pokemon=team[_i2];
pokemon.name='';
}
return Teams.pack(team);
};_proto.
save=function save(){var _this$team3;
PS.teams.save();
var title="[Team] "+(((_this$team3=this.team)==null?void 0:_this$team3.name)||'Team');
if(title!==this.title){
this.title=title;
PS.update();
}
};return TeamRoom;}(PSRoom);var



TeamPanel=function(_PSRoomPanel){





function TeamPanel(props){var _this3;
_this3=_PSRoomPanel.call(this,props)||this;_this3.







































































































handleRename=function(ev){
var textbox=ev.currentTarget;
var room=_this3.props.room;

room.team.name=textbox.value.trim();
room.save();
};_this3.

uploadTeam=function(ev){
var room=_this3.props.room;
room.upload(room.team.uploaded?!!room.team.uploaded["private"]:PS.prefs.uploadprivacy);
};_this3.
restore=function(ev){
var room=_this3.props.room;
var team=room.team;
if(!team.uploadedPackedTeam){

PS.alert("Must use on an uploaded team.");
return;
}
team.packedTeam=team.uploadedPackedTeam;
room.forceReload=true;
room.save();
_this3.forceUpdate();
};_this3.
compare=function(ev){
var team=_this3.props.room.team;
if(!team.uploadedPackedTeam){

PS.alert("Must use on an uploaded team.");
return;
}
var uploadedTeam=Teams["export"](Teams.unpack(team.uploadedPackedTeam),undefined);
var localTeam=Teams["export"](Teams.unpack(team.packedTeam),undefined);
PS.alert(TeamPanel.renderTeamDiff(localTeam,uploadedTeam),{width:720});
ev.preventDefault();
ev.stopImmediatePropagation();
};_this3.

changePrivacyPref=function(ev){
PS.prefs.uploadprivacy=!ev.currentTarget.checked;
PS.prefs.save();
_this3.forceUpdate();
};_this3.
handleChangeFormat=function(ev){
var dropdown=ev.currentTarget;
var room=_this3.props.room;

room.setFormat(dropdown.value);
room.save();
_this3.forceUpdate();
TeamPanel.getFormatResources(room.team.format).then(function(){
_this3.forceUpdate();
});
};_this3.
save=function(){
_this3.props.room.save();
_this3.forceUpdate();
};var _room=_this3.props.room;if(_room.team){TeamPanel.getFormatResources(_room.team.format).then(function(){_this3.forceUpdate();});}return _this3;}_inheritsLoose(TeamPanel,_PSRoomPanel);TeamPanel.getFormatResources=function getFormatResources(format){var _this4=this;if(format in this.formatResources)return Promise.resolve(this.formatResources[format]);return Net('https://www.smogon.com/dex/api/formats/by-ps-name/'+format).get().then(function(result){_this4.formatResources[format]=JSON.parse(result);return _this4.formatResources[format];})["catch"](function(err){_this4.formatResources[format]=null;return _this4.formatResources[format];});};TeamPanel.diffLines=function diffLines(localLines,uploadedLines){var lcs=[];for(var _i3=0;_i3<=localLines.length;_i3++){lcs[_i3]=[];for(var _j=0;_j<=uploadedLines.length;_j++)lcs[_i3][_j]=0;}for(var _i4=localLines.length-1;_i4>=0;_i4--){for(var _j2=uploadedLines.length-1;_j2>=0;_j2--){lcs[_i4][_j2]=localLines[_i4]===uploadedLines[_j2]?lcs[_i4+1][_j2+1]+1:Math.max(lcs[_i4+1][_j2],lcs[_i4][_j2+1]);}}var rows=[];var addChangedRows=function(fromI,toI,fromJ,toJ){var count=Math.max(toI-fromI,toJ-fromJ);for(var k=0;k<count;k++)rows.push({local:k<toI-fromI?localLines[fromI+k]:undefined,uploaded:k<toJ-fromJ?uploadedLines[fromJ+k]:undefined,changed:true});};var anchors=[];var i=0;var j=0;while(i<localLines.length&&j<uploadedLines.length){if(localLines[i]===uploadedLines[j]){anchors.push([i,j]);i++;j++;}else if(lcs[i+1][j]>=lcs[i][j+1]){i++;}else{j++;}}var lastI=0;var lastJ=0;for(var _i6=0;_i6<anchors.length;_i6++){var _ref=anchors[_i6];var nextI=_ref[0];var nextJ=_ref[1];addChangedRows(lastI,nextI,lastJ,nextJ);rows.push({local:localLines[nextI],uploaded:uploadedLines[nextJ],changed:false});lastI=nextI+1;lastJ=nextJ+1;}addChangedRows(lastI,localLines.length,lastJ,uploadedLines.length);return rows;};TeamPanel.renderDiffLine=function renderDiffLine(line){return line?BattleLog.escapeHTML(line):'&nbsp;';};TeamPanel.renderTeamDiff=function renderTeamDiff(localTeam,uploadedTeam){var trimmedLocalTeam=localTeam.replace(/\n+$/,'');var trimmedUploadedTeam=uploadedTeam.replace(/\n+$/,'');var localSets=trimmedLocalTeam?trimmedLocalTeam.split(/\n\n+/):[];var uploadedSets=trimmedUploadedTeam?trimmedUploadedTeam.split(/\n\n+/):[];var setCount=Math.max(localSets.length,uploadedSets.length);var buf="|html|<table class=\"table\" style=\"width:100%;font-size:14px\">"+"<tr><th>Local</th>"+"<th>Uploaded</th></tr>";for(var i=0;i<setCount;i++){var _localSets$i,_uploadedSets$i;if(i){buf+="<tr><td style=\"border-top:0;border-bottom:0;padding:0 5px\">&nbsp;</td>"+"<td style=\"border-top:0;border-bottom:0;padding:0 5px\">&nbsp;</td></tr>";}var rows=this.diffLines(((_localSets$i=localSets[i])==null?void 0:_localSets$i.split('\n'))||[],((_uploadedSets$i=uploadedSets[i])==null?void 0:_uploadedSets$i.split('\n'))||[]);for(var _i8=0;_i8<rows.length;_i8++){var row=rows[_i8];var className=row.changed?" class=\"highlighted\"":"";buf+="<tr><td"+className+" style=\"border-top:0;border-bottom:0;padding:0 5px\">"+(this.renderDiffLine(row.local)+"</td>")+("<td"+className+" style=\"border-top:0;border-bottom:0;padding:0 5px\">")+(this.renderDiffLine(row.uploaded)+"</td></tr>");}}return buf+"</table>";};var _proto2=TeamPanel.prototype;_proto2.
