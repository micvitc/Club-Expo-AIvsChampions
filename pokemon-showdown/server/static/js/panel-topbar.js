"use strict";function _inheritsLoose(t,o){t.prototype=Object.create(o.prototype),t.prototype.constructor=t,_setPrototypeOf(t,o);}function _setPrototypeOf(t,e){return _setPrototypeOf=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(t,e){return t.__proto__=e,t;},_setPrototypeOf(t,e);}/**
 * Topbar Panel
 *
 * Topbar view - handles the topbar and some generic popups.
 *
 * Also handles global drag-and-drop support.
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 */









window.addEventListener('dragover',function(e){

e.preventDefault();
});var

PSHeader=function(_preact$Component){function PSHeader(){var _this;for(var _len=arguments.length,args=new Array(_len),_key=0;_key<_len;_key++){args[_key]=arguments[_key];}_this=_preact$Component.call.apply(_preact$Component,[this].concat(args))||this;_this.






































































































































handleResize=function(){var _this$base$querySelec,_this$base$querySelec2;
if(!_this.base)return;

if(PS.leftPanelWidth===null){
var width=document.documentElement.clientWidth;
var oldNarrowMode=PSView.narrowMode;
PSView.narrowMode=width<=700;
PSView.verticalHeaderWidth=PSView.narrowMode?NARROW_MODE_HEADER_WIDTH:VERTICAL_HEADER_WIDTH;
document.documentElement.style.width=PSView.useCSSScrollSnap()?
width+NARROW_MODE_HEADER_WIDTH+"px":'auto';
if(oldNarrowMode!==PSView.narrowMode){
PSView.updateScrollSnap();
PS.update();
}
return;
}
if(PSView.narrowMode){
document.documentElement.style.width='auto';
PSView.narrowMode=false;
PSView.updateScrollSnap();
}

var userbarLeft=(_this$base$querySelec=_this.base.querySelector('div.userbar .icon.button'))==null||(_this$base$querySelec=_this$base$querySelec.getBoundingClientRect())==null?void 0:_this$base$querySelec.left;
if(userbarLeft)userbarLeft-=5;
var plusTabRight=(_this$base$querySelec2=_this.base.querySelector('a.roomtab[aria-label="Join chat"]'))==null||(_this$base$querySelec2=_this$base$querySelec2.getBoundingClientRect())==null?void 0:_this$base$querySelec2.right;
var overflow=_this.base.querySelector('.overflow');

if(!overflow||!userbarLeft||!plusTabRight)return;

var maintabbar=_this.base.querySelector('div.maintabbar');
if(maintabbar){
var userbarRight=window.innerWidth-userbarLeft;
maintabbar.style.marginRight=userbarRight+"px";
overflow.style.right=userbarRight+"px";
}

if(plusTabRight>userbarLeft-3){
overflow.style.display='block';
}else{
overflow.style.display='none';
}
};return _this;}_inheritsLoose(PSHeader,_preact$Component);PSHeader.roomInfo=function roomInfo(room){var RoomType=PS.roomTypes[room.type];var icon=(RoomType==null?void 0:RoomType.icon)||preact.h("i",{"class":"fa fa-file-text-o","aria-hidden":true});var title=room.title;switch(room.type){case'battle':var idChunks=room.id.split('-');var formatName;if(idChunks.length<=2){if(idChunks[1]==='uploadedreplay')formatName='Uploaded Replay';}else{formatName=window.BattleLog?BattleLog.formatName(idChunks[1]):idChunks[1];}if(!title){var _battle$p,_battle$p2;var battle=room.battle;var p1=(battle==null||(_battle$p=battle.p1)==null?void 0:_battle$p.name)||'';var p2=(battle==null||(_battle$p2=battle.p2)==null?void 0:_battle$p2.name)||'';if(p1&&p2){title=p1+" v. "+p2;}else if(p1||p2){title=""+p1+p2;}else{title="(empty room)";}}icon=preact.h("i",{"class":"text"},formatName);break;case'html':default:if(title.startsWith('[')){var closeBracketIndex=title.indexOf(']');if(closeBracketIndex>0){icon=preact.h("i",{"class":"text"},title.slice(1,closeBracketIndex));title=title.slice(closeBracketIndex+1);break;}}break;}return{icon:icon,title:title};};PSHeader.renderRoomTab=function renderRoomTab(id,noAria){var includeMiniNotifications=arguments.length>2&&arguments[2]!==undefined?arguments[2]:true;var room=PS.rooms[id];if(!room)return null;var closable=id===''||id==='rooms'?'':' closable';var cur=PS.isVisiblePanel(room)?' cur':'';var notifying=room.isSubtleNotifying?' subtle-notifying':'';var hoverTitle='';var notifications=room.notifications;if(id===''&&includeMiniNotifications){for(var _i2=0,_PS$miniRoomList2=PS.miniRoomList;_i2<_PS$miniRoomList2.length;_i2++){var _PS$rooms$roomid;var roomid=_PS$miniRoomList2[_i2];var miniNotifications=(_PS$rooms$roomid=PS.rooms[roomid])==null?void 0:_PS$rooms$roomid.notifications;if(miniNotifications!=null&&miniNotifications.length)notifications=[].concat(notifications,miniNotifications);}}if(notifications.length){notifying=' notifying';for(var _i4=0,_notifications2=notifications;_i4<_notifications2.length;_i4++){var notif=_notifications2[_i4];if(!notif.body)continue;hoverTitle+=notif.title+"\n"+notif.body+"\n";}}var className="roomtab button"+notifying+closable+cur;var _PSHeader$roomInfo=PSHeader.roomInfo(room),icon=_PSHeader$roomInfo.icon,roomTitle=_PSHeader$roomInfo.title;if(room.type==='rooms'&&PS.leftPanelWidth!==null)roomTitle='';if(room.type==='battle')className+=' roomtab-battle';var closeButton=null;if(closable){closeButton=preact.h("button",{"class":"closebutton",name:"closeRoom",value:id,"aria-label":"Close"},preact.h("i",{"class":"fa fa-times-circle","aria-hidden":true}));}var aria=noAria?{}:{"role":"tab","id":"roomtab-"+id,"aria-selected":cur?"true":"false"};if(id==='rooms')aria['aria-label']="Join chat";return preact.h("li",{"class":id===''?'home-li':'',key:id},preact.h("a",Object.assign({"class":className,href:"/"+id,draggable:true,title:hoverTitle||undefined,onDragEnter:this.handleDragEnter,onDragStart:this.handleDragStart},aria),icon," ",roomTitle),closeButton);};PSHeader.notifyingMiniRoomTabs=function notifyingMiniRoomTabs(){return PS.miniRoomList.filter(function(roomid){var _PS$rooms$roomid2;return(_PS$rooms$roomid2=PS.rooms[roomid])==null?void 0:_PS$rooms$roomid2.notifications.length;});};var _proto=PSHeader.prototype;_proto.
