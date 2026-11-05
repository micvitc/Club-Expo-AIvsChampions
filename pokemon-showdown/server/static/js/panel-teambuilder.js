"use strict";function _inheritsLoose(t,o){t.prototype=Object.create(o.prototype),t.prototype.constructor=t,_setPrototypeOf(t,o);}function _setPrototypeOf(t,e){return _setPrototypeOf=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(t,e){return t.__proto__=e,t;},_setPrototypeOf(t,e);}/**
 * Teambuilder panel
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 */










var ADD_FORMAT_FOLDER_VALUE='+';
var ADD_FOLDER_VALUE='++';var

TeambuilderRoom=function(_PSRoom){function TeambuilderRoom(){var _this;for(var _len=arguments.length,args=new Array(_len),_key=0;_key<_len;_key++){args[_key]=arguments[_key];}_this=_PSRoom.call.apply(_PSRoom,[this].concat(args))||this;_this.
DEFAULT_FORMAT=Dex.modid;_this.








curFolder='';_this.
curFolderKeep='';_this.
searchTerms=[];_this.
exportMode=false;_this.
exportCode=null;_this.
pendingTeamScrollRestore=null;_this.









clientCommands=_this.parseClientCommands({
'newteam':function(target){
var isBox=(" "+target+" ").includes(' box ');
if((" "+target+" ").includes(' bottom ')){
PS.teams.push(this.createTeam(null,isBox));
}else{
PS.teams.unshift(this.createTeam(null,isBox));
}
PS.teams.save();
this.update(null);
},
'deleteteam':function(target){
var team=PS.teams.byKey[target];
if(!team)return this.errorReply("Team not found: "+target);

PS.teams["delete"](team);
PS.teams.save();
this.update(null);
},
'copyteam':function(target,cmd,elem){var _elem$closest;
var team=PS.teams.byKey[target];
if(!team)return this.errorReply("Team not found: "+target);

var teamElem=elem==null||(_elem$closest=elem.closest('li'))==null?void 0:_elem$closest.querySelector('a.team');
this.preserveTeamScroll(team,teamElem);
TeamEditorState.copyTeam(team);

PS.update();
this.update(null);
},
'pasteteamabove,moveteamabove':function(target,cmd,elem){var _this$curFolder;
var team=PS.teams.byKey[target];
if(target!=='-'&&!team)return this.errorReply("Team not found: "+target);

var index=team?PS.teams.list.indexOf(team):PS.teams.list.length;
var folder=(_this$curFolder=this.curFolder)!=null&&_this$curFolder.endsWith('/')?this.curFolder.slice(0,-1):'';
var teams=TeamEditorState.pasteTeam(index,cmd==='moveteamabove',folder);
this.preserveTeamScroll(teams==null?void 0:teams[0],elem);
PS.teams.save();

PS.update();
this.update(null);
},
'undeleteteam':function(){
PS.teams.undelete();
PS.teams.save();
this.update(null);
},
'backup':function(){
this.setExportMode(!this.exportMode);
this.update(null);
},
'createfolder':function(name,cmd,elem){var _this2=this;
if(!name){
PS.prompt("Folder name?",{parentElem:elem,okButton:"Create"}).then(function(newName){
newName=(newName||'').trim();
if(!newName)return;

_this2.send("/createfolder "+newName,elem);
});
return;
}

if(name.includes('/')||name.includes('\\')){
this.errorReply("Names can't contain slashes, since they're used as a folder separator.");
name=name.replace(/[\\/]/g,'');
}
if(name.includes('|')){
this.errorReply("Names can't contain the character |, since they're used for storing teams.");
name=name.replace(/\|/g,'');
}

this.curFolderKeep=name+"/";
this.curFolder=name+"/";
this.update(null);
},
'renamefolder':function(name){
if(!name)return this.errorReply('New name required');
if(!this.curFolder.endsWith('/'))return this.errorReply('Not in a folder');

if(name.includes('/')||name.includes('\\')){
PS.alert("Names can't contain slashes, since they're used as a folder separator.");
name=name.replace(/[\\/]/g,'');
}
if(name.includes('|')){
PS.alert("Names can't contain the character |, since they're used for storing teams.");
name=name.replace(/\|/g,'');
}

var oldFolder=this.curFolder.slice(0,-1);for(var _i2=0,_PS$teams$list2=
PS.teams.list;_i2<_PS$teams$list2.length;_i2++){var team=_PS$teams$list2[_i2];
if(team.folder!==oldFolder)continue;
team.folder=name;
}
if(this.curFolderKeep===this.curFolder)this.curFolderKeep=name+"/";
this.curFolder=name+"/";
PS.teams.save();
this.update(null);
},
'deletefolder':function(){
if(!this.curFolder.endsWith('/'))return this.errorReply('Not in a folder');

var oldFolder=this.curFolder.slice(0,-1);for(var _i4=0,_PS$teams$list4=
PS.teams.list;_i4<_PS$teams$list4.length;_i4++){var team=_PS$teams$list4[_i4];
if(team.folder!==oldFolder)continue;
team.folder='';
}
if(this.curFolderKeep===this.curFolder)this.curFolderKeep='';
this.curFolder='';
PS.teams.save();
this.update(null);
},
'convertfoldertoprefix':function(){
if(!this.curFolder.endsWith('/'))return this.errorReply('Not in a folder');

var oldFolder=this.curFolder.slice(0,-1);for(var _i6=0,_PS$teams$list6=
PS.teams.list;_i6<_PS$teams$list6.length;_i6++){var team=_PS$teams$list6[_i6];
if(team.folder!==oldFolder)continue;
team.folder='';
team.name=oldFolder+" "+team.name;
}
if(this.curFolderKeep===this.curFolder)this.curFolderKeep='';
this.curFolder='';
PS.teams.save();
this.update(null);
}
});_this.





































updateSearch=function(value){
if(!value){
_this.searchTerms=[];
}else{
_this.searchTerms=value.split(",").map(function(q){return q.trim().toLowerCase();});
}
};_this.
matchesSearch=function(team){
if(_this.searchTerms.length===0)return true;
var normalized=team.packedTeam.toLowerCase();
return _this.searchTerms.every(function(term){return normalized.includes(term);});
};return _this;}_inheritsLoose(TeambuilderRoom,_PSRoom);var _proto=TeambuilderRoom.prototype;_proto.preserveTeamScroll=function preserveTeamScroll(team,elem){if(!(team!=null&&team.key)||!elem)return;this.pendingTeamScrollRestore={key:team.key,top:elem.getBoundingClientRect().top};};_proto.sendDirect=function sendDirect(msg){PS.alert("Unrecognized command: "+msg);};_proto.setExportMode=function setExportMode(exportMode){var partial=this.searchTerms.length||this.curFolder?'partial':true;var newExportMode=exportMode?partial:false;if(newExportMode===this.exportMode)return;this.exportMode=newExportMode;this.exportCode=null;};_proto.createTeam=function createTeam(copyFrom){var isBox=arguments.length>1&&arguments[1]!==undefined?arguments[1]:false;if(copyFrom){return{name:"Copy of "+copyFrom.name,format:copyFrom.format,folder:copyFrom.folder,packedTeam:copyFrom.packedTeam,iconCache:null,isBox:copyFrom.isBox,key:''};}else{var format=this.curFolder&&!this.curFolder.endsWith('/')?this.curFolder:this.DEFAULT_FORMAT;var folder=this.curFolder.endsWith('/')?this.curFolder.slice(0,-1):'';return{name:(isBox?"Box":"Untitled")+" "+(PS.teams.list.length+1),format:format,folder:folder,packedTeam:'',iconCache:null,isBox:isBox,key:''};}};return TeambuilderRoom;}(PSRoom);var


TeambuilderPanel=function(_PSRoomPanel){function TeambuilderPanel(){var _this3;for(var _len2=arguments.length,args=new Array(_len2),_key2=0;_key2<_len2;_key2++){args[_key2]=arguments[_key2];}_this3=_PSRoomPanel.call.apply(_PSRoomPanel,[this].concat(args))||this;_this3.





mobileFormatFolderButton=null;_this3.


















clickFolder=function(e){
var room=_this3.props.room;
var elem=e.target;
var folder=null;
while(elem){
if(elem.getAttribute('data-href')){
return;
}
if(elem.className==='selectFolder'){
folder=elem.getAttribute('data-value')||'';
break;
}
if(elem.className==='folderlist'){
return;
}
elem=elem.parentElement;
}
if(folder===null)return;
e.preventDefault();
e.stopImmediatePropagation();
if(folder===ADD_FOLDER_VALUE){
room.send("/createfolder",elem);
return;
}
room.curFolder=folder;
_this3.forceUpdate();
};_this3.
addFormatFolder=function(ev){
var room=_this3.props.room;
var button=ev.currentTarget;
var folder=toID(button.value);
if(!folder)return;
room.curFolderKeep=folder;
room.curFolder=folder;
button.value='';
_this3.forceUpdate();
};_this3.
changeMobileFolder=function(ev){
var room=_this3.props.room;
var select=ev.currentTarget;
var value=select.value;
if(value===ADD_FOLDER_VALUE){
select.value=room.curFolder;
setTimeout(function(){
room.send("/createfolder",select);
});
return;
}
if(value===ADD_FORMAT_FOLDER_VALUE){
select.value=room.curFolder;
var button=_this3.mobileFormatFolderButton;
if(!button)return;
setTimeout(function(){
PS.join('formatdropdown',{parentElem:button});
});
return;
}
room.curFolder=value;
_this3.forceUpdate();
};_this3.






















dragEnterTeam=function(ev){var _ev$currentTarget;
var draggedTeam=_this3.getDraggedTeam(ev);
if(draggedTeam===null)return;

var value=(_ev$currentTarget=ev.currentTarget)==null?void 0:_ev$currentTarget.getAttribute('data-teamkey');
var team=value?PS.teams.byKey[value]:null;
if(!team||team===draggedTeam)return;

var iOver=PS.teams.list.indexOf(team);
if(typeof draggedTeam==='number'){
if(iOver>=draggedTeam)PS.dragging.team=iOver+1;
PS.dragging.team=iOver;
_this3.forceUpdate();
return;
}

var iDragged=PS.teams.list.indexOf(draggedTeam);
if(iDragged<0||iOver<0)return;

PS.teams.list.splice(iDragged,1);



PS.teams.list.splice(iOver,0,draggedTeam);
_this3.forceUpdate();
};_this3.
dragEnterFolder=function(ev){var _ev$currentTarget2,_PS$dragging;
var value=((_ev$currentTarget2=ev.currentTarget)==null?void 0:_ev$currentTarget2.getAttribute('data-value'))||null;
if(value===null||((_PS$dragging=PS.dragging)==null?void 0:_PS$dragging.type)!=='team')return;
if(value==='++'||value==='')return;

PS.dragging.folder=value;
_this3.forceUpdate();
};_this3.
dragLeaveFolder=function(ev){var _ev$currentTarget3,_PS$dragging2;
var value=((_ev$currentTarget3=ev.currentTarget)==null?void 0:_ev$currentTarget3.getAttribute('data-value'))||null;
if(value===null||((_PS$dragging2=PS.dragging)==null?void 0:_PS$dragging2.type)!=='team')return;
if(value==='++'||value==='')return;

if(PS.dragging.folder===value)PS.dragging.folder=null;
_this3.forceUpdate();
};_this3.






























































dropFolder=function(ev){var _ev$currentTarget4,_PS$dragging3;
var value=((_ev$currentTarget4=ev.currentTarget)==null?void 0:_ev$currentTarget4.getAttribute('data-value'))||null;
if(value===null||((_PS$dragging3=PS.dragging)==null?void 0:_PS$dragging3.type)!=='team')return;
if(value==='++'||value==='')return;

PS.dragging.folder=null;
var team=PS.dragging.team;

if(typeof team==='number'){
TeambuilderPanel.addDraggedTeam(ev,value);
return;
}

if(value.endsWith('/')){
team.folder=value.slice(0,-1);
}else{
team.format=value;
}
PS.teams.save();
ev.stopImmediatePropagation();
_this3.forceUpdate();
};_this3.








updateSearch=function(ev){
var target=ev.currentTarget;
_this3.props.room.updateSearch(target.value);
_this3.forceUpdate();
};_this3.
clearSearch=function(){
var target=_this3.base.querySelector('input[type="search"]');
if(!target)return;
target.value='';
_this3.props.room.updateSearch('');
};_this3.


















































saveExport=function(e){var _querySelector;
var value=(_querySelector=_this3.base.querySelector('textarea[name="import"]'))==null?void 0:_querySelector.value;
if(!value)return alert('Textarea not found');
if(_this3.props.room.exportMode!==true)return alert('Wrong export mode');

var teams=PSTeambuilder.importTeamBackup(value);
var uploadedTeams={};for(var _i8=0,_PS$teams$list8=
PS.teams.list;_i8<_PS$teams$list8.length;_i8++){var team=_PS$teams$list8[_i8];
if(team.teamid)uploadedTeams[team.teamid]=team;
}
var notLoadedTeamRegex=/^[^|]*\|\|\|\|\|\|\|\|\|\|\|(?:\][^|]*\|\|\|\|\|\|\|\|\|\|\|)*$/;


PS.teams.list=[];
PS.teams.byKey={};for(var _i10=0;_i10<
teams.length;_i10++){var _team=teams[_i10];
var uploadedTeam=_team.teamid?uploadedTeams[_team.teamid]:null;
if(uploadedTeam!=null&&uploadedTeam.uploaded){
_team.uploaded=uploadedTeam.uploaded;
_team.uploaded.notLoaded=notLoadedTeamRegex.test(_team.packedTeam);
}
if((uploadedTeam==null?void 0:uploadedTeam.uploadedPackedTeam)!==undefined){
_team.uploadedPackedTeam=uploadedTeam.uploadedPackedTeam;
}
PS.teams.push(_team);
}


var room=_this3.props.room;
room.exportMode=false;
PS.teams.save();
room.update(null);
};_this3.
renameFolder=function(ev){
var room=_this3.props.room;
var oldFolder=room.curFolder.slice(0,-1);
var elem=ev.currentTarget;
ev.stopImmediatePropagation();
ev.preventDefault();
PS.prompt("Rename ``"+oldFolder+"`` to?",{defaultValue:oldFolder,okButton:"Rename",parentElem:elem}).then(function(name){
name=(name||'').trim();
if(!name)return;
if(name===oldFolder)return;

room.send("/renamefolder "+name,elem);
});
};_this3.
promptDeleteFolder=function(ev){
var room=_this3.props.room;
var oldFolder=room.curFolder.slice(0,-1);
var elem=ev.currentTarget;
ev.stopImmediatePropagation();
ev.preventDefault();
PS.confirm("Delete ``"+oldFolder+"``? (doesn't delete teams)",{
okButton:"Delete",otherButtons:preact.h("button",{"class":"button","data-cmd":"/closeand /inopener /convertfoldertoprefix"},"Convert to prefix"),
parentElem:elem
}).then(function(result){
if(result)room.send("/deletefolder",elem);
});
};_this3.



























































































































































cancelClipboard=function(){
TeamEditorState.clipboard=null;
_this3.forceUpdate();
};return _this3;}_inheritsLoose(TeambuilderPanel,_PSRoomPanel);var _proto2=TeambuilderPanel.prototype;_proto2.componentDidUpdate=function componentDidUpdate(){_PSRoomPanel.prototype.componentDidUpdate.call(this);var room=this.props.room;var restore=room.pendingTeamScrollRestore;if(!restore)return;room.pendingTeamScrollRestore=null;var teamElem=this.base.querySelector("a.team[href=\"team-"+restore.key+"\"]");if(!teamElem)return;var dy=teamElem.getBoundingClientRect().top-restore.top;if(!dy)return;var teamPane=teamElem.closest('.teampane');if(teamPane){teamPane.scrollTop+=dy;}else{window.scrollBy(0,dy);}};_proto2.getDraggedTeam=function getDraggedTeam(ev){var _PS$dragging4,_ref;if(((_PS$dragging4=PS.dragging)==null?void 0:_PS$dragging4.type)==='team')return PS.dragging.team;var dataTransfer=ev.dataTransfer;if(!dataTransfer)return null;PS.dragging={type:'?'};console.log("dragging: "+dataTransfer.types+" | "+((_ref=[].concat(dataTransfer.files))==null?void 0:_ref.map(function(file){return file.name;})));if(!(dataTransfer.types.includes!=null&&dataTransfer.types.includes('Files')))return null;if(dataTransfer.files[0]&&!dataTransfer.files[0].name.endsWith('.txt'))return null;PS.dragging={type:'team',team:0,folder:null};return PS.dragging.team;};TeambuilderPanel.extractDraggedTeam=function extractDraggedTeam(ev){var _ev$dataTransfer,_file$text;var file=(_ev$dataTransfer=ev.dataTransfer)==null||(_ev$dataTransfer=_ev$dataTransfer.files)==null?void 0:_ev$dataTransfer[0];if(!file)return null;var name=file.name;if(name.slice(-4).toLowerCase()!=='.txt'){return null;}name=name.slice(0,-4);return file.text==null||(_file$text=file.text())==null?void 0:_file$text.then(function(result){var sets;try{sets=Teams["import"](result);}catch(_unused){PS.alert("Your file \""+file.name+"\" is not a valid team.");return null;}var format='';var bracketIndex=name.indexOf(']');var isBox=false;if(bracketIndex>=0){format=name.slice(1,bracketIndex);if(!format.startsWith('gen'))format='gen6'+format;if(format.endsWith('-box')){format=format.slice(0,-4);isBox=true;}name=name.slice(bracketIndex+1).trim();}return{name:name,format:format,folder:'',packedTeam:Teams.pack(sets),iconCache:null,key:'',isBox:isBox};});};TeambuilderPanel.addDraggedTeam=function addDraggedTeam(ev,folder){var _PS$dragging5,_this$extractDraggedT;var index=(_PS$dragging5=PS.dragging)==null?void 0:_PS$dragging5.team;if(typeof index!=='number')index=0;return(_this$extractDraggedT=this.extractDraggedTeam(ev))==null?void 0:_this$extractDraggedT.then(function(team){if(!team){return;}if(folder!=null&&folder.endsWith('/')){team.folder=folder.slice(0,-1);}else if(folder){team.format=folder;}PS.teams.push(team);PS.teams.list.pop();PS.teams.list.splice(index,0,team);PS.teams.save();PS.join('teambuilder');PS.update();});};TeambuilderPanel.handleDrop=function handleDrop(ev){var _PS$dragging6,_PS$dragging7,_PS$rooms$teambuilder;var draggingTeam=false;if(((_PS$dragging6=PS.dragging)==null?void 0:_PS$dragging6.type)==='team'&&typeof((_PS$dragging7=PS.dragging)==null?void 0:_PS$dragging7.team)==='object'){PS.teams.save();draggingTeam=true;}return!!this.addDraggedTeam(ev,(_PS$rooms$teambuilder=PS.rooms['teambuilder'])==null?void 0:_PS$rooms$teambuilder.curFolder)||draggingTeam;};_proto2.renderFolder=function renderFolder(value){var _PS$dragging8;var room=this.props.room;var cur=room.curFolder===value;var children;var folderOpenIcon=cur?'fa-folder-open':'fa-folder';if(value.endsWith('/')){children=[preact.h("i",{"class":"fa "+folderOpenIcon+(value==='/'?'-o':'')}),value.slice(0,-1)||'(uncategorized)'];}else if(value===''){children=[preact.h("em",null,"(all)")];}else if(value==='++'){children=[preact.h("i",{"class":"fa fa-plus","aria-hidden":true}),preact.h("em",null,"(add folder)")];}else{children=[preact.h("i",{"class":"fa "+folderOpenIcon+"-o"}),value.slice(4)||'(uncategorized)'];}var active=((_PS$dragging8=PS.dragging)==null?void 0:_PS$dragging8.folder)===value?' active':'';if(cur){return preact.h("div",{"class":"folder cur","data-value":value,onDragEnter:this.dragEnterFolder,onDragLeave:this.dragLeaveFolder,onDrop:this.dropFolder},preact.h("div",{"class":"folderhack3"},preact.h("div",{"class":"folderhack1"}),preact.h("div",{"class":"folderhack2"}),preact.h("button",{"class":"selectFolder"+active,"data-value":value},children)));}return preact.h("div",{"class":"folder","data-value":value,onDragEnter:this.dragEnterFolder,onDragLeave:this.dragLeaveFolder,onDrop:this.dropFolder},preact.h("button",{"class":"selectFolder"+active,"data-value":value},children));};_proto2.getFolderList=function getFolderList(){var room=this.props.room;var folderTable={'':1};var folders=[];for(var _i12=0,_PS$teams$list10=PS.teams.list;_i12<_PS$teams$list10.length;_i12++){var team=_PS$teams$list10[_i12];var folder=team.folder;if(folder&&!(folder+"/"in folderTable)){folders.push(folder+"/");folderTable[folder+"/"]=1;if(!('/'in folderTable)){folders.push('/');folderTable['/']=1;}}var format=team.format||room.DEFAULT_FORMAT;if(!(format in folderTable)){folders.push(format);folderTable[format]=1;}}if(room.curFolderKeep.endsWith('/')||room.curFolder.endsWith('/')){if(!('/'in folderTable)){folders.push('/');folderTable['/']=1;}}if(!(room.curFolderKeep in folderTable)){folderTable[room.curFolderKeep]=1;folders.push(room.curFolderKeep);}if(!(room.curFolder in folderTable)){folderTable[room.curFolder]=1;folders.push(room.curFolder);}PSUtils.sortBy(folders,function(folder){return[folder.endsWith('/')?10:-parseInt(folder.charAt(3),10),folder];});return folders;};_proto2.renderFolderList=function renderFolderList(){var folders=this.getFolderList();var renderedFormatFolders=[preact.h("div",{"class":"foldersep"}),preact.h("div",{"class":"folder"},preact.h("button",{name:"format",value:"","data-selecttype":"teambuilder","class":"selectFolder","data-href":"/formatdropdown",onChange:this.addFormatFolder},preact.h("i",{"class":"fa fa-plus","aria-hidden":true}),preact.h("em",null,"(add format folder)")))];var renderedFolders=[];var gen=-1;for(var _i14=0;_i14<folders.length;_i14++){var format=folders[_i14];var newGen=format.endsWith('/')?0:parseInt(format.charAt(3),10);if(gen!==newGen){gen=newGen;if(gen===0){renderedFolders.push.apply(renderedFolders,renderedFormatFolders);renderedFormatFolders=[];renderedFolders.push(preact.h("div",{"class":"foldersep"}));renderedFolders.push(preact.h("div",{"class":"folder"},preact.h("h3",null,"Folders")));}else{renderedFolders.push(preact.h("div",{"class":"folder"},preact.h("h3",null,"Gen ",gen)));}}renderedFolders.push(this.renderFolder(format));}renderedFolders.push.apply(renderedFolders,renderedFormatFolders);return preact.h("div",{"class":"folderlist",onClick:this.clickFolder},preact.h("div",{"class":"folderlistbefore"}),this.renderFolder(''),renderedFolders,preact.h("div",{"class":"foldersep"}),this.renderFolder('++'),preact.h("div",{"class":"folderlistafter"}));};_proto2.renderMobileFolderSelect=function renderMobileFolderSelect(){var _this4=this;var room=this.props.room;var renderedFolders=[];var formatGroups={};var gens=[];for(var _i16=0,_this$getFolderList2=this.getFolderList();_i16<_this$getFolderList2.length;_i16++){var folder=_this$getFolderList2[_i16];if(folder.endsWith('/')){renderedFolders.push(preact.h("option",{value:folder},folder.slice(0,-1)||'Teams not in any folders'));}else{var gen=parseInt(folder.charAt(3),10);var group=formatGroups[gen]||(formatGroups[gen]=[]);if(!group.length)gens.push(gen);group.push(preact.h("option",{value:folder},BattleLog.formatName(folder),folder.length<=4?' (uncategorized)':''));}}return preact.h(preact.Fragment,null,preact.h("select",{"class":"select teambuilder-folder-select",value:room.curFolder,onChange:this.changeMobileFolder},preact.h("option",{value:""},"All teams"),gens.map(function(gen){return preact.h("optgroup",{label:"Gen "+gen},formatGroups[gen]);}),preact.h("option",{value:ADD_FORMAT_FOLDER_VALUE},"(add format folder)"),renderedFolders.length?preact.h("optgroup",{label:"Folders"},renderedFolders):null,preact.h("option",{value:ADD_FOLDER_VALUE},"(add folder)")),preact.h("button",{name:"format",value:"","data-selecttype":"teambuilder","class":"teambuilder-format-folder-source","data-href":"/formatdropdown",onChange:this.addFormatFolder,tabIndex:-1,"aria-hidden":true,ref:function(el){_this4.mobileFormatFolderButton=el;}}));};_proto2.visibleTeams=function visibleTeams(){var teams=arguments.length>0&&arguments[0]!==undefined?arguments[0]:PS.teams.list;var room=this.props.room;if(room.curFolder){if(room.curFolder.endsWith('/')){var filterFolder=room.curFolder.slice(0,-1);teams=teams.filter(function(team){return!team||team.folder===filterFolder;});}else{var filterFormat=room.curFolder;teams=teams.filter(function(team){return!team||team.format===filterFormat;});}}if(!room.searchTerms.length)return teams;var filteredTeams=teams.filter(function(team){return!team||room.matchesSearch(team);});return filteredTeams;};_proto2.
