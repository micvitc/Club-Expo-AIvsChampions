"use strict";function _inheritsLoose(t,o){t.prototype=Object.create(o.prototype),t.prototype.constructor=t,_setPrototypeOf(t,o);}function _setPrototypeOf(t,e){return _setPrototypeOf=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(t,e){return t.__proto__=e,t;},_setPrototypeOf(t,e);}














var WARNING_SECONDS=5;
var BATTLE_LAYOUT_LABELS={
'side-by-side':'Side-by-side, controls below',
'side-by-side-overlay':'Side-by-side, overlay controls',
'top-and-bottom':'Top-and-bottom, controls below',
'top-and-bottom-overlay':'Top-and-bottom, overlay controls',
'scrolling':'Scrolling, controls below',
'scrolling-overlay':'Scrolling, overlay controls'
};var





UserRoom=function(_PSRoom){




function UserRoom(options){var _options$args;var _this;
_this=_PSRoom.call(this,options)||this;_this.classType='user';_this.userid=void 0;_this.name=void 0;_this.isSelf=void 0;
var userid=_this.id.split('-')[1]||'';
_this.setName(((_options$args=options.args)==null?void 0:_options$args.username)||userid);return _this;
}_inheritsLoose(UserRoom,_PSRoom);var _proto=UserRoom.prototype;_proto.
setName=function setName(name){
this.name=name;
this.userid=toID(name);
this.isSelf=this.userid===PS.user.userid;
if(/[a-zA-Z0-9]/.test(this.name.charAt(0)))this.name=' '+this.name;
this.update(null);
if(this.userid)PS.send("/cmd userdetails "+this.userid);
};return UserRoom;}(PSRoom);var


StatusEditor=function(_preact$Component){function StatusEditor(){var _this2;for(var _len=arguments.length,args=new Array(_len),_key=0;_key<_len;_key++){args[_key]=arguments[_key];}_this2=_preact$Component.call.apply(_preact$Component,[this].concat(args))||this;_this2.




















addStatus=function(ev){
ev.preventDefault();
ev.stopImmediatePropagation();
_this2.setState({addingStatus:true},function(){return _this2.focusStatus();});
};_this2.
focusStatus=function(ev){
ev==null||ev.preventDefault();
ev==null||ev.stopImmediatePropagation();
var input=_this2.statusInput();
input==null||input.focus();
input==null||input.select();
};_this2.
handleStatusInput=function(ev){
var changed=ev.currentTarget.value!==_this2.currentStatus();
if(changed!==!!_this2.state.statusChanged)_this2.setState({statusChanged:changed});
};_this2.
handleStatusKeyDown=function(ev){
if(ev.key==='Escape'){
ev.preventDefault();
ev.stopImmediatePropagation();
_this2.revertStatus();
}
};_this2.
revertStatus=function(ev){
ev==null||ev.preventDefault();
ev==null||ev.stopImmediatePropagation();
var input=_this2.statusInput();
if(input){
input.value=input.defaultValue;
input.dispatchEvent(new Event('input'));
}
_this2.setState({addingStatus:false,statusChanged:false});
};_this2.
submitStatus=function(ev){var _this2$statusInput;
ev.preventDefault();
ev.stopImmediatePropagation();
var status=(((_this2$statusInput=_this2.statusInput())==null?void 0:_this2$statusInput.value)||'').trim();
PS.send(status?"/noreply /status "+status:"/noreply /clearstatus");

var details=PS.mainmenu.userdetailsCache[PS.user.userid];
if(details){
var awayMarkers=/^!?(?:\((?:Busy|Idle)\) ?)?/.exec(details.status||'')[0];
details.status=awayMarkers+status;
}
_this2.setState({addingStatus:false,statusChanged:false});
_this2.fetchStatus();
};return _this2;}_inheritsLoose(StatusEditor,_preact$Component);var _proto2=StatusEditor.prototype;_proto2.componentDidMount=function componentDidMount(){this.fetchStatus();};_proto2.fetchStatus=function fetchStatus(){var _this3=this;if(!PS.user.userid)return;PS.mainmenu.makeQuery('userdetails',PS.user.userid).then(function(){return _this3.forceUpdate();});};_proto2.currentStatus=function currentStatus(){var _PS$mainmenu$userdeta;var status=((_PS$mainmenu$userdeta=PS.mainmenu.userdetailsCache[PS.user.userid])==null?void 0:_PS$mainmenu$userdeta.status)||'';if(status.startsWith('!'))status=status.slice(1);return status.replace(/^\((?:Busy|Idle)\) ?/,'');};_proto2.statusLabel=function statusLabel(){var _PS$mainmenu$userdeta2,_exec;var status=((_PS$mainmenu$userdeta2=PS.mainmenu.userdetailsCache[PS.user.userid])==null?void 0:_PS$mainmenu$userdeta2.status)||'';return((_exec=/^!?(\((?:Busy|Idle)\))/.exec(status))==null?void 0:_exec[1])||'';};_proto2.statusInput=function statusInput(){return this.base.querySelector('textarea[name=statustext]');};_proto2.
render=function render(){
var curStatus=this.currentStatus();
var label=this.statusLabel();
if(!curStatus&&!this.state.addingStatus){
return preact.h("div",null,
label&&preact.h("span",{"class":"userstatus",style:"display:inline"},label)," ",
preact.h("button",{"class":"button small",onClick:this.addStatus},"Add status")
);
}
return preact.h("form",{onSubmit:this.submitStatus,"class":"statusform"},
label&&preact.h("span",{"class":"userstatus",style:"display:inline"},label)," ",
preact.h(PSTextarea,{
"class":"userstatus",
key:curStatus,singleLine:true,subtle:true,name:"statustext",defaultValue:curStatus,
onInput:this.handleStatusInput,onKeyDown:this.handleStatusKeyDown}
)," ",
this.state.statusChanged||this.state.addingStatus?
preact.h(preact.Fragment,null,
preact.h("button",{"class":"button",type:"submit"},
preact.h("strong",null,curStatus?'Change':'Add')
)," ",
preact.h("button",{"class":"button",type:"button",onClick:this.revertStatus},
curStatus?'Revert':'Cancel'
)
):

preact.h("button",{"class":"button small",type:"button",onClick:this.focusStatus,"aria-label":"Edit"},
preact.h("i",{"class":"fa fa-pencil","aria-hidden":true})
)

);
};return StatusEditor;}(preact.Component);var


UserPanel=function(_PSRoomPanel){function UserPanel(){var _this4;for(var _len2=arguments.length,args=new Array(_len2),_key2=0;_key2<_len2;_key2++){args[_key2]=arguments[_key2];}_this4=_PSRoomPanel.call.apply(_PSRoomPanel,[this].concat(args))||this;_this4.




















































































































































lookup=function(ev){var _querySelector;
ev.preventDefault();
ev.stopImmediatePropagation();
var room=_this4.props.room;
var username=(_querySelector=_this4.base.querySelector('input[name=username]'))==null?void 0:_querySelector.value;
room.setName(username||'');
};_this4.
maybeReset=function(ev){var _querySelector2;
var room=_this4.props.room;
var username=(_querySelector2=_this4.base.querySelector('input[name=username]'))==null?void 0:_querySelector2.value;
if(toID(username)!==room.userid){
room.setName('');
}
};return _this4;}_inheritsLoose(UserPanel,_PSRoomPanel);var _proto3=UserPanel.prototype;_proto3.renderUser=function renderUser(){var room=this.props.room;if(!room.userid)return null;var user=PS.mainmenu.userdetailsCache[room.userid]||{userid:room.userid,name:room.name.slice(1),avatar:'[loading]'};if(!user.avatar){user.name=room.name;}var hideInteraction=room.id.startsWith('viewuser-');var group=PS.server.getGroup(room.name);var groupName=group.name||null;var globalGroup=PS.server.getGroup(user.group);var globalGroupName=globalGroup.name&&"Global "+globalGroup.name||null;if(globalGroup.name===groupName)groupName=null;var customGroup=toID(user.customgroup)!==toID(globalGroupName||groupName)?user.customgroup:'';if(group.type==='punishment'){groupName=preact.h("span",{style:"color:#777777"},groupName);}if(globalGroup.type==='punishment'){globalGroupName=preact.h("span",{style:"color:#777777"},globalGroupName);}var roomsList=null;if(user.rooms){var battlebuf=[];var chatbuf=[];var privatebuf=[];for(var roomid in user.rooms){if(roomid==='global')continue;var curRoom=user.rooms[roomid];var roomrank=null;if(!/[A-Za-z0-9]/.test(roomid.charAt(0))){roomrank=preact.h("small",{style:"color: #888; font-size: 100%"},roomid.charAt(0));}roomid=toRoomid(roomid);if(roomid.substr(0,7)==='battle-'){var p1=curRoom.p1.substr(1);var p2=curRoom.p2.substr(1);var ownBattle=PS.user.userid===toUserid(p1)||PS.user.userid===toUserid(p2);var roomLink=preact.h("a",{href:"/"+roomid,"class":'ilink'+(ownBattle||roomid in PS.rooms?' yours':''),title:(p1||'?')+" v. "+(p2||'?')},roomrank,roomid.substr(7));if(curRoom.isPrivate){if(privatebuf.length)privatebuf.push(', ');privatebuf.push(roomLink);}else{if(battlebuf.length)battlebuf.push(', ');battlebuf.push(roomLink);}}else{var _roomLink=preact.h("a",{href:"/"+roomid,"class":'ilink'+(roomid in PS.rooms?' yours':'')},roomrank,roomid);if(curRoom.isPrivate){if(privatebuf.length)privatebuf.push(", ");privatebuf.push(_roomLink);}else{if(chatbuf.length)chatbuf.push(', ');chatbuf.push(_roomLink);}}}if(battlebuf.length)battlebuf.unshift(preact.h("br",null),preact.h("em",null,"Battles:")," ");if(chatbuf.length)chatbuf.unshift(preact.h("br",null),preact.h("em",null,"Chatrooms:")," ");if(privatebuf.length)privatebuf.unshift(preact.h("br",null),preact.h("em",null,"Private rooms:")," ");if(battlebuf.length||chatbuf.length||privatebuf.length){roomsList=preact.h("small",{"class":"rooms"},battlebuf,chatbuf,privatebuf);}}else if(user.rooms===false){roomsList=preact.h("strong",{"class":"offline"},"OFFLINE");}var isSelf=user.userid===PS.user.userid;var away=false;var status=null;if(user.status){away=user.status.startsWith('!');status=away?user.status.slice(1):user.status;}var buttonbar=[];if(!hideInteraction){buttonbar.push(isSelf?preact.h("p",{"class":"buttonbar"},preact.h("button",{"class":"button",disabled:true},"Challenge")," ",preact.h("button",{"class":"button","data-href":"dm-"},"Chat Self")):!PS.user.named?preact.h("p",{"class":"buttonbar"},preact.h("button",{"class":"button",disabled:true},"Challenge")," ",preact.h("button",{"class":"button",disabled:true},"Chat")," ",preact.h("button",{"class":"button",disabled:true},"\u2026")):preact.h("p",{"class":"buttonbar"},preact.h("button",{"class":"button","data-href":"challenge-"+user.userid},"Challenge")," ",preact.h("button",{"class":"button","data-href":"dm-"+user.userid},"Chat")," ",preact.h("button",{"class":"button","data-href":"useroptions-"+user.userid+"-"+(room.parentRoomid||'')},"\u2026")));if(isSelf){buttonbar.push(preact.h("hr",null),preact.h("p",{"class":"buttonbar",style:"text-align: right"},preact.h("button",{"class":"button","data-href":"login"},preact.h("i",{"class":"fa fa-pencil","aria-hidden":true})," Change name")," ",preact.h("button",{"class":"button","data-cmd":"/logout"},preact.h("i",{"class":"fa fa-power-off","aria-hidden":true})," Log out")));}}var avatar=user.avatar!=='[loading]'?Dex.resolveAvatar(""+(user.avatar||'unknown')):null;return[preact.h("div",{"class":"userdetails"},avatar&&(room.isSelf?preact.h("img",{src:avatar,"class":"trainersprite yours","data-href":"avatars"}):preact.h("img",{src:avatar,"class":"trainersprite"})),preact.h("strong",null,preact.h("a",{href:"//"+Config.routes.users+"/"+user.userid,target:"_blank",style:"color: "+(away?'#888888':BattleLog.usernameColor(user.userid))},user.name)),preact.h("br",null),isSelf&&!hideInteraction?preact.h(StatusEditor,null):status?preact.h("div",{"class":"userstatus"},status):null,groupName&&preact.h("div",{"class":"usergroup roomgroup"},groupName),globalGroupName&&preact.h("div",{"class":"usergroup globalgroup"},globalGroupName),customGroup&&preact.h("div",{"class":"usergroup globalgroup"},customGroup),!hideInteraction&&roomsList),buttonbar];};_proto3.
