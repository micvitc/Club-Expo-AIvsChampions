"use strict";var _templateObject;function _taggedTemplateLiteralLoose(e,t){return t||(t=e.slice(0)),e.raw=t,e;}function _inheritsLoose(t,o){t.prototype=Object.create(o.prototype),t.prototype.constructor=t,_setPrototypeOf(t,o);}function _setPrototypeOf(t,e){return _setPrototypeOf=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(t,e){return t.__proto__=e,t;},_setPrototypeOf(t,e);}/**
 * Chat panel
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 */var


























ChatRoom=function(_PSRoom){





























function ChatRoom(options){var _options$args,_options$args2,_options$args3;var _this;
_this=_PSRoom.call(this,options)||this;_this.classType='chat';_this.users={};_this.userCount=0;_this.onlineUsers=[];_this.connectMode='normal';_this.pmTarget=null;_this.challengeMenuOpen=false;_this.initialSlash=false;_this.challenging=null;_this.teamSent=null;_this.challenged=null;_this.battle=null;_this.log=null;_this.tour=null;_this.lastMessage=null;_this.lastViewedTime=null;_this.joinLeave=null;_this.userActivity=[];_this.timeOffset=0;_this.































































































































































































































































handleHighlight=function(args){var _PS$prefs$ignore;
var name;
var message;
var serverTime=0;
if(args[0]==='c:'){
serverTime=parseInt(args[1]);
name=args[2];
message=args[3];
}else{
name=args[1];
message=args[2];
}
var userid=toID(name);
if(!message)return false;
if(userid===PS.user.userid)return false;

var highlightType=ChatRoom.isHighlightableChatMessage(message);
var isIgnored=(_PS$prefs$ignore=PS.prefs.ignore)==null?void 0:_PS$prefs$ignore[userid];
if(isIgnored||!highlightType)return false;
if(highlightType==='subtle'){
_this.subtleNotify();
return false;
}

if(_this.id.startsWith("dm-")){
_this.notify({
title:""+_this.title,
body:_this.getChatNotificationBody(message)
});
return false;
}

var isBeforeLastSeenMessage=_this.isBeforeLastSeenMessage(serverTime);

if(ChatRoom.getHighlight(message,_this.id)){
if(!isBeforeLastSeenMessage){
_this.notify({
title:"Mentioned by "+name+" in "+_this.id,
body:_this.getChatNotificationBody(message),
id:'highlight'
});
}
return true;
}
if(!isBeforeLastSeenMessage)_this.subtleNotify();
return false;
};_this.
clientCommands=_this.parseClientCommands({
'chall,challenge':function(target){var _this2=this;
if(target){
var _target$split=target.split(','),targetUser=_target$split[0],format=_target$split[1];
if(this.pmTarget&&(format===undefined||targetUser.includes('@@@'))){
format=target;
targetUser=this.pmTarget;
}
format=BattleLog.formatId(format||'');
PS.mainmenu.makeQuery('userdetails',targetUser).then(function(data){
if(data.rooms===false)return _this2.errorReply('This player does not exist or is not online.');
PS.join("challenge-"+toID(targetUser),{args:{format:format}});
});
return;
}
if(this.challengeMenuOpen){
this.cancelChallenge();
return;
}
this.openChallenge();
},
'cchall,cancelchallenge':function(target){
this.cancelChallenge();
},
'reject':function(target){
this.challenged=null;
this.teamSent=null;
this.update(null);
this.sendDirect("/reject "+target);
},
'clear':function(){var _this$log;
(_this$log=this.log)==null||_this$log.reset();
this.update(null);
},
'debug':function(target){var _PSView$debugMenu;
var targetID=toID(target);
if(targetID==='off'){
PSView.setDebug(null);
this.add('||Debug menu: OFF');
this.handleSend('/hidedebug');
return;
}else if(targetID==='snap'){
PSView.setDebug('snap');
this.add('||Debug menu: SCROLL-SNAP');
return;
}else if(targetID==='panels'){
PSView.setDebug('panels');
this.add('||Debug menu: PANELS');
return;
}else if(targetID==='battles'){
this.handleSend('/showdebug');
return;
}
this.add("||Debug menu: "+(((_PSView$debugMenu=PSView.debugMenu)==null?void 0:_PSView$debugMenu.toUpperCase())||'OFF')+".");
this.add("||Debug battle messages: "+(PS.prefs.showdebug?'ON':'OFF'));
this.add('||Usage: /debug [off|snap|panels|battles]');
},
'togglemessages':function(target){
if(this.pmTarget||
this.type!=='chat')return this.errorReply('This command can only be used in proper chat rooms.');
if(this.log){
var userid=toID(target);
var classStart='revealed chat chatmessage-'+userid;
var nodes=[];
var isHidden=true;for(var _i2=0,_this$log$innerElem$c2=
this.log.innerElem.childNodes;_i2<_this$log$innerElem$c2.length;_i2++){var node=_this$log$innerElem$c2[_i2];
if(node.className&&(node.className+' ').startsWith(classStart)){
nodes.push(node);
}
}
if(this.log.preemptElem){for(var _i4=0,_this$log$preemptElem2=
this.log.preemptElem.childNodes;_i4<_this$log$preemptElem2.length;_i4++){var _node=_this$log$preemptElem2[_i4];
if(_node.className&&(_node.className+' ').startsWith(classStart)){
nodes.push(_node);
}
}
}
isHidden=nodes[0].style.display==='none';
nodes.every(function(node){
node.style.display=isHidden?'':'none';
return true;
});
isHidden=!isHidden;
var toggleButtons=this.log.innerElem.querySelectorAll("button[name=\"toggleMessages\"][value=\""+userid+"\"]");for(var _i6=0;_i6<
toggleButtons.length;_i6++){var button=toggleButtons[_i6];
button.innerHTML=isHidden?"<small>("+
nodes.length+" line"+(nodes.length>1?'s':'')+" from "+userid+" hidden)</small>":"<small>(Hide "+
nodes.length+" line"+(nodes.length>1?'s':'')+" from "+userid+")</small>";
}
}
},
'rank,ranking,rating,ladder':function(target){var _this3=this;
if(PS.teams.usesLocalLadder)return"/rank "+target;

var arg=target;
if(!arg){
arg=PS.user.userid;
}
if(this.battle&&!arg.includes(',')){
arg+=", "+this.id.split('-')[1];
}

var targets=arg.split(',');
var formatTargeting=false;
var formats={};
var gens={};
for(var i=1,len=targets.length;i<len;i++){
targets[i]=$.trim(targets[i]);
if(targets[i].length===4&&targets[i].startsWith('gen')){
gens[targets[i]]=1;
}else{
formats[toID(targets[i])]=1;
}
formatTargeting=true;
}

PSLoginServer.query("ladderget",{
user:targets[0]
}).then(function(data){
if(!data||!Array.isArray(data))return _this3.add("|error|Error: corrupted ranking data");
var buffer="<div class=\"ladder\"><table><tr><td colspan=\"9\">User: <strong>"+toID(targets[0])+"</strong></td></tr>";
if(!data.length){
buffer+='<tr><td colspan="9"><em>This user has not played any ladder games yet.</em></td></tr>';
buffer+='</table></div>';
return _this3.add("|html|"+buffer);
}
buffer+='<tr><th>Format</th><th><abbr title="Elo rating">Elo</abbr></th><th><abbr title="user\'s percentage chance of winning a random battle (aka GLIXARE)">GXE</abbr></th><th><abbr title="Glicko-1 rating: rating &#177; deviation">Glicko-1</abbr></th><th>COIL</th><th>W</th><th>L</th><th>Total</th>';
var suspect=false;for(var _i8=0;_i8<
data.length;_i8++){var item=data[_i8];
if('suspect'in item)suspect=true;
}
if(suspect)buffer+='<th>Suspect reqs possible?</th>';
buffer+='</tr>';
var hiddenFormats=[];for(var _i10=0;_i10<
data.length;_i10++){var row=data[_i10];
if(!row)return _this3.add("|error|Error: corrupted ranking data");
var formatId=toID(row.formatid);
var matchesTarget=
formats[formatId]||
gens[formatId.slice(0,4)]||
gens['gen6']&&!formatId.startsWith('gen');

if(matchesTarget||!formatTargeting&&row.elo>=1001&&row.w+row.l+row.t>0){
buffer+='<tr>';
}else{
buffer+='<tr class="hidden">';
hiddenFormats.push(window.BattleLog.escapeFormat(formatId,true));
}for(var _i12=0,_ref2=


[row.elo,row.rpr,row.rprd,row.gxe,row.w,row.l,row.t];_i12<_ref2.length;_i12++){var value=_ref2[_i12];
if(typeof value!=='number'&&typeof value!=='string'){
return _this3.add("|error|Error: corrupted ranking data");
}
}

buffer+="<td> "+BattleLog.escapeHTML(BattleLog.formatName(formatId,true))+" </td><td><strong>"+Math.round(row.elo)+"</strong></td>";
if(row.rprd>100){

buffer+="<td>&ndash;</td>";
buffer+="<td><span style=\"color:#888\"><em>"+Math.round(row.rpr)+" <small> &#177; "+Math.round(row.rprd)+" </small></em> <small>(provisional)</small></span></td>";
}else{
buffer+="<td>"+Math.trunc(row.gxe)+"<small>."+row.gxe.toFixed(1).slice(-1)+"%</small></td>";
buffer+="<td><em>"+Math.round(row.rpr)+" <small> &#177; "+Math.round(row.rprd)+"</small></em></td>";
}
var N=parseInt(row.w,10)+parseInt(row.l,10)+parseInt(row.t,10);
var COIL_B=undefined;




if(COIL_B){
buffer+="<td>"+Math.round(40.0*parseFloat(row.gxe)*Math.pow(2.0,-COIL_B/N))+"</td>";
}else{
buffer+='<td>&mdash;</td>';
}
buffer+="<td> "+row.w+" </td><td> "+row.l+" </td><td> "+N+" </td>";
if(suspect){
if(typeof row.suspect==='undefined'){
buffer+='<td>&mdash;</td>';
}else{
buffer+='<td>';
buffer+=row.suspect?"Yes":"No";
buffer+='</td>';
}
}
buffer+='</tr>';
}
if(hiddenFormats.length){
if(hiddenFormats.length===data.length){
if(formatTargeting){
var formatsText=Object.keys(gens).concat(Object.keys(formats)).join(', ');
buffer+="<tr class=\"no-matches\"><td colspan=\"8\">"+
BattleLog.html(_templateObject||(_templateObject=_taggedTemplateLiteralLoose(["<em>This user has not played any ladder games that match ",".</em></td></tr>"])),formatsText);
}else{
buffer+="<tr class=\"no-matches\"><td colspan=\"8\"><em>This user has no notable ladder activity.</em></td></tr>";
}
}
buffer+="<tr><td colspan=\"8\"><button class=\"button\" name=\"showOtherFormats\">"+("Show "+
hiddenFormats.length+" hidden format"+(hiddenFormats.length===1?'':'s')+"</button></td></tr>");
}
var userid=toID(targets[0]);
var registered=PS.user.registered;
if(registered&&PS.user.userid===userid){
buffer+="<tr><td colspan=\"8\" style=\"text-align:right\"><a href=\"//"+Config.routes.users+"/"+userid+"\">Reset W/L</a></tr></td>";
}
buffer+='</table></div>';
_this3.add("|html|"+buffer);
});
},



'play':function(){
if(!this.battle)return this.add('|error|You are not in a battle');
if(this.battle.atQueueEnd){
if(this.battle.ended)this.battle.isReplay=true;
this.battle.reset();
}
this.battle.play();
this.update(null);
},
'pause':function(){
if(!this.battle)return this.add('|error|You are not in a battle');
this.battle.pause();
this.update(null);
},
'ffto,fastfowardto':function(target,cmd,parentElem){var _this4=this;
if(!this.battle)return this.add('|error|You are not in a battle');
if(!target){
PS.prompt("Turn number?",{
defaultValue:""+this.battle.turn,
type:'numeric',
okButton:'Go',
parentElem:parentElem
}).then(function(turnNum){
if(turnNum!=null&&turnNum.trim())_this4.send("/ffto "+turnNum,parentElem);
});
return;
}

var turnNum=Number(target);
if(target.startsWith('+')||turnNum<0){var _this$battle$seeking;
turnNum+=(_this$battle$seeking=this.battle.seeking)!=null?_this$battle$seeking:this.battle.turn;
if(turnNum<0)turnNum=0;
}else if(target==='end'){
turnNum=Infinity;
}
if(isNaN(turnNum)){
this.errorReply("Invalid turn number: "+target);
return;
}
if(this.battle.hardcoreMode){
this.errorReply("Turn navigation is disabled in hardcore mode.");
return;
}
this.battle.seekTurn(turnNum);
this.update(null);
},
'switchsides':function(){
if(!this.battle)return this.add('|error|You are not in a battle');
this.battle.switchViewpoint();
},
'cancel,undo':function(){
if(!this.battle)return this.send('/cancelchallenge');

var room=this;
if(!room.choices||!room.request){
this.receiveLine(["error","/choose - You are not a player in this battle"]);
return;
}
if(room.choices.isDone()||room.choices.isEmpty()){

this.sendDirect('/undo');
}
room.choices=new BattleChoiceBuilder(room.request);
this.update(null);
},
'move,switch,team,pass,shift,choose':function(target,cmd){
if(!this.battle)return this.errorReply('You are not in a battle');
var room=this;
if(!room.choices){
this.receiveLine(["error","/choose - You are not a player in this battle"]);
return;
}
if(cmd!=='choose')target=cmd+" "+target;
if(target==='choose auto'||target==='choose default'){
this.sendDirect('/choose default');
room.overlayActive=null;
this.update(null);
return;
}
var possibleError=room.choices.addChoice(target);
if(possibleError){
this.errorReply(possibleError);
return;
}
if(room.choices.isDone()){
this.sendDirect("/choose "+room.choices.toString());
}
room.overlayActive=null;
this.update(null);
},
'movemenu,switchmenu':function(target,cmd){
if(!this.battle)return this.errorReply('You are not in a battle');
var room=this;
if(!target&&cmd==='movemenu'){
room.overlayActive=room.overlayActive==='move'?null:'move';
this.update(null);
return;
}
if(!target&&cmd==='switchmenu'){
room.overlayActive=room.overlayActive==='switch'?null:'switch';
this.update(null);
return;
}
this.errorReply('???');
}
});if(options.connectMode!==undefined)_this.connectMode=options.connectMode;if((_options$args=options.args)!=null&&_options$args.pmTarget)_this.pmTarget=options.args.pmTarget;if((_options$args2=options.args)!=null&&_options$args2.challengeMenuOpen)_this.challengeMenuOpen=true;if((_options$args3=options.args)!=null&&_options$args3.initialSlash)_this.initialSlash=true;_this.updateTarget(_this.pmTarget);_this.connect();return _this;}_inheritsLoose(ChatRoom,_PSRoom);var _proto=ChatRoom.prototype;_proto.connect=function connect(){if(!this.connected&&(this.connectMode==='normal'||this.connectMode==='pending-reconnect'||this.connectMode==='pending-login')){if(this.pmTarget===null){PS.send("/join "+this.id);this.connected='pending';}else{this.connectMode=null;}}};_proto.interruptClose=function interruptClose(explicit,elem){if(this.type==='chat'&&this.connected===true&&PS.prefs.leavePopupRoom&&!explicit){PS.join('confirmleaveroom',{parentElem:elem});return true;}if(this.challenging){this.cancelChallenge();}return false;};_proto.receiveLine=function receiveLine(args){switch(args[0]){case'users':var usernames=args[1].split(',');var count=parseInt(usernames.shift(),10);this.setUsers(count,usernames);return;case'join':case'j':case'J':this.addUser(args[1]);if(this.battle)break;this.showJoinLeave("join",args[1],args[0]==="J");return true;case'leave':case'l':case'L':this.removeUser(args[1]);if(this.battle)break;this.showJoinLeave("leave",args[1],args[0]==="L");return true;case'name':case'n':case'N':this.renameUser(args[1],args[2]);break;case'tournament':case'tournaments':this.tour||(this.tour=new ChatTournament(this));this.tour.receiveLine(args);return;case'noinit':if(this.battle&&args[1]==='joinfailed'){this.receiveLine(['bigerror',args[2]]);this.receiveLine(['html',"<div class=\"broadcast-red pad\"><p class=\"buttonbar\"><button class=\"button\" data-cmd=\"/close\"><strong>Close</strong></button></p></div>"]);}else if(this.battle){this.loadReplay();}else{var message=args[2]?BattleLog.escapeHTML(args[2]):"Chatroom \""+BattleLog.escapeHTML(this.title)+"\" not found";this.receiveLine(['html',"<div class=\"broadcast-red pad\"><h3>"+message+"</h3><p class=\"buttonbar\"><button class=\"button\" data-cmd=\"/close\"><strong>Close</strong></button></p></div>"]);}return;case'expire':this.connected=false;this.connectMode='expired';this.receiveLine(['',"This room has expired (you can't chat in it anymore)"]);return;case'chat':case'c':if((args[2]+" ").startsWith('/challenge ')){this.updateChallenge(args[1],args[2].slice(11));return;}else if(args[2].startsWith('/warn ')){var reason=args[2].replace('/warn ','');PS.join("rules-warn",{args:{type:'warn',message:(reason==null?void 0:reason.trim())||undefined},parentElem:null});return;}case'c:':if(args[0]==='c:')PS.lastMessageTime=args[1];this.lastMessage=args;this.joinLeave=null;var name=args[args[0]==='c:'?2:1];this.markUserActive(name);if(this.tour)this.tour.joinLeave=null;break;case':':this.timeOffset=Math.trunc(Date.now()/1000)-(parseInt(args[1],10)||0);PS.lastMessageTime=args[1];break;}_PSRoom.prototype.receiveLine.call(this,args);};_proto.handleReconnect=function handleReconnect(msg){var _PS$connection,_this$lastMessage,_lines$;var lines=msg.split('\n');var cutOffStart=0;var cutOffEnd=lines.length;var cutOffTime=((_PS$connection=PS.connection)==null?void 0:_PS$connection.lastMessageTimeBeforeReconnect)||0;var cutOffExactLine=this.lastMessage?'|'+((_this$lastMessage=this.lastMessage)==null?void 0:_this$lastMessage.join('|')):null;var reconnectMessage='|raw|<div class="infobox">You reconnected.</div>';for(var i=0;i<lines.length;i++){if(lines[i].startsWith('|users|')){this.add(lines[i]);}if(lines[i]===cutOffExactLine){cutOffStart=i+1;}else if(lines[i].startsWith("|c:|")){var time=parseInt(lines[i].split('|')[2]||'');if(time<cutOffTime)cutOffStart=i;}if(lines[i].startsWith('|raw|<div class="infobox"> You joined ')){var _PS$prefs$timestamps;var timestamp=BattleLog.renderTimestamp(Date.now()/1000,(_PS$prefs$timestamps=PS.prefs.timestamps)==null?void 0:_PS$prefs$timestamps.chatrooms);reconnectMessage="|raw|<div class=\"infobox\">"+timestamp+"You reconnected to "+lines[i].slice(38);cutOffEnd=i;if(!lines[i-1])cutOffEnd=i-1;}}lines=lines.slice(cutOffStart,cutOffEnd);if((_lines$=lines[0])!=null&&_lines$.startsWith('|init|')){lines[0]="||Note: Scrollback doesn't go all the way back to when you disconnected.";}if(lines.length){var _PS$prefs$timestamps2;var _timestamp=BattleLog.renderTimestamp(cutOffTime,(_PS$prefs$timestamps2=PS.prefs.timestamps)==null?void 0:_PS$prefs$timestamps2.chatrooms);this.receiveLine(["raw","<div class=\"infobox\">"+_timestamp+"You disconnected.</div>"]);for(var _i14=0,_lines2=lines;_i14<_lines2.length;_i14++){var line=_lines2[_i14];this.receiveLine(BattleTextParser.parseLine(line));}this.receiveLine(BattleTextParser.parseLine(reconnectMessage));}this.update(null);return true;};_proto.updateTarget=function updateTarget(name){var selfWithGroup=""+(PS.user.group||' ')+PS.user.name;if(this.id==='dm-'){this.pmTarget=selfWithGroup;this.setUsers(1,[selfWithGroup]);this.title="Console";}else if(this.id.startsWith('dm-')){var id=this.id.slice(3);if(toID(name)!==id)name=null;name||(name=this.pmTarget||id);if(/[A-Za-z0-9]/.test(name.charAt(0)))name=" "+name;var nameWithGroup=name;name=name.slice(1);this.pmTarget=name;if(!PS.user.userid){this.setUsers(1,[nameWithGroup]);}else{this.setUsers(2,[nameWithGroup,selfWithGroup]);}this.title="[DM] "+nameWithGroup.trim();}};ChatRoom.getHighlight=function getHighlight(message,roomid){var _this$highlightRegExp,_this$highlightRegExp2;var highlights=PS.prefs.highlights||{};if(Array.isArray(highlights)){highlights={global:highlights};PS.prefs.set('highlights',highlights);}if(!PS.prefs.noselfhighlight&&PS.user.nameRegExp){var _PS$user$nameRegExp;if((_PS$user$nameRegExp=PS.user.nameRegExp)!=null&&_PS$user$nameRegExp.test(message))return true;}if(!this.highlightRegExp){try{this.updateHighlightRegExp(highlights);}catch(_unused){return false;}}var id=PS.server.id+'#'+roomid;var globalHighlightsRegExp=(_this$highlightRegExp=this.highlightRegExp)==null?void 0:_this$highlightRegExp['global'];var roomHighlightsRegExp=(_this$highlightRegExp2=this.highlightRegExp)==null?void 0:_this$highlightRegExp2[id];return(globalHighlightsRegExp==null?void 0:globalHighlightsRegExp.test(message))||(roomHighlightsRegExp==null?void 0:roomHighlightsRegExp.test(message));};ChatRoom.updateHighlightRegExp=function updateHighlightRegExp(highlights){this.highlightRegExp={};for(var i in highlights){if(!highlights[i].length){this.highlightRegExp[i]=null;continue;}this.highlightRegExp[i]=new RegExp('(?:\\b|(?!\\w))(?:'+highlights[i].join('|')+')(?:\\b|(?!\\w))','i');}};ChatRoom.isHighlightableChatMessage=function isHighlightableChatMessage(message){if(!message.startsWith('/'))return true;var _PSUtils$splitFirst=PSUtils.splitFirst(message.slice(1),' '),cmd=_PSUtils$splitFirst[0];if(['raw','nonotify','text','error'].includes(cmd)){return false;}if(cmd==='subtlenotify'){return'subtle';}return true;};_proto.isBeforeLastSeenMessage=function isBeforeLastSeenMessage(serverTime){var lastMessageDates=Dex.prefs('logtimes')||(PS.prefs.set('logtimes',{}),Dex.prefs('logtimes'));if(!lastMessageDates[PS.server.id])lastMessageDates[PS.server.id]={};var lastMessageDate=lastMessageDates[PS.server.id][this.id]||0;var time=serverTime-(this.timeOffset||0);if(PS.isVisiblePanel(this)){this.lastViewedTime=null;lastMessageDates[PS.server.id][this.id]=time;PS.prefs.set('logtimes',lastMessageDates);}else{var lastViewedTime=this.lastViewedTime||0;if(lastViewedTime<time)this.lastViewedTime=time;}return time<=lastMessageDate;};_proto.getChatNotificationBody=function getChatNotificationBody(message){if(/^\/(log|raw|html|uhtml|uhtmlchange) /.test(message)){return'"'+message.split(' ').slice(1).join(' ').replace(/<[^>]*?>/g,'')+'"';}return'"'+message+'"';};_proto.
