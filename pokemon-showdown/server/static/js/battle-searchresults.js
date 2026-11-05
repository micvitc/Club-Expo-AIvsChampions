"use strict";function _inheritsLoose(t,o){t.prototype=Object.create(o.prototype),t.prototype.constructor=t,_setPrototypeOf(t,o);}function _setPrototypeOf(t,e){return _setPrototypeOf=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(t,e){return t.__proto__=e,t;},_setPrototypeOf(t,e);}/**
 * Search Results
 *
 * Code for displaying sesrch results from battle-dex-search.ts
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 */






var RESULT_ROW_HEIGHT=33;
var RESULT_OVERSCAN_ROWS=12;
var RESULT_REFILL_THRESHOLD_ROWS=4;

function escapeHTML(text){
if(typeof text==='number')text=""+text;
if(typeof text!=='string')return'';
if(!/[&<>"]/.test(text))return text;
return text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function escapeCSSString(text){
return text.replace(/\\/g,'\\\\').replace(/"/g,'\\"').replace(/\n/g,'\\a ').replace(/\r/g,'\\d ');
}var

PSSearchResults=function(_preact$Component){function PSSearchResults(){var _this;for(var _len=arguments.length,args=new Array(_len),_key=0;_key<_len;_key++){args[_key]=arguments[_key];}_this=_preact$Component.call.apply(_preact$Component,[this].concat(args))||this;_this.







URL_ROOT="//"+Config.routes.dex+"/";_this.
speciesId='';_this.
itemId='';_this.
abilityId='';_this.
moveIds=[];_this.
scrollFrame=0;_this.
renderedStart=-1;_this.
renderedEnd=-1;_this.
renderedLength=-1;_this.












































































































































































































































































































































handleClick=function(ev){
var search=_this.props.search;
var target=ev.target;
while(target&&target.className!=='dexlist'){
if(target.tagName==='A'){
var entry=target.getAttribute('data-entry');
if(entry){
var _entry$split=entry.split('|'),type=_entry$split[0],name=_entry$split[1],slot=_entry$split[2];
if(search.addFilter([type,name])){
if(_this.props.onSelect){
_this.props.onSelect==null||_this.props.onSelect('','');
}else if(search.query){
search.find('');
_this.forceUpdate();
}
}else{
_this.props.onSelect==null||_this.props.onSelect(type,name,slot);
}
ev.preventDefault();
ev.stopImmediatePropagation();
break;
}
}
if(target.tagName==='BUTTON'){
var page=target.getAttribute('data-page');
if(page){
_this.pageResults(parseInt(page));
ev.preventDefault();
ev.stopPropagation();
break;
}

var filter=target.getAttribute('data-filter');
if(filter){
search.removeFilter(filter.split(':'));
search.find('');
ev.preventDefault();
ev.stopPropagation();
_this.props.onSelect==null||_this.props.onSelect(null,'');
break;
}


var sort=target.getAttribute('data-sort');
if(sort){
search.toggleSort(sort);
search.find('');
ev.preventDefault();
ev.stopPropagation();
_this.props.onSelect==null||_this.props.onSelect(null,'');
break;
}
}

target=target.parentElement;
}
};_this.

handleMouseDown=function(ev){


var target=ev.target;
while(target&&target.className!=='dexlist'){
if(target.tagName==='A'){
ev.preventDefault();
return;
}
if(target.tagName==='BUTTON'&&(target.hasAttribute('data-filter')||target.hasAttribute('data-sort'))){
ev.preventDefault();
return;
}
target=target.parentElement;
}
};_this.

handleScroll=function(){var _this$base;
if((_this$base=_this.base)!=null&&_this$base.scrollTop&&document.documentElement.clientWidth===document.documentElement.scrollWidth){
_this.base.scrollIntoViewIfNeeded==null||_this.base.scrollIntoViewIfNeeded();
}
if(_this.scrollFrame)return;
_this.scrollFrame=requestAnimationFrame(function(){
_this.scrollFrame=0;
_this.updateDOM(false);
});
};return _this;}_inheritsLoose(PSSearchResults,_preact$Component);var _proto=PSSearchResults.prototype;_proto.renderPokemonSortRowHTML=function renderPokemonSortRowHTML(index){var search=this.props.search;var sortCol=search.sortCol;return["<li class=\"result\" value=\""+index+"\"><div class=\"sortrow\">","<button class=\"sortcol numsortcol"+(!sortCol?' cur':'')+"\">",(!sortCol?'Sort: ':escapeHTML(search.firstPokemonColumn))+"</button>","<button class=\"sortcol pnamesortcol"+(sortCol==='name'?' cur':'')+"\" data-sort=\"name\">Name</button>","<button class=\"sortcol typesortcol"+(sortCol==='type'?' cur':'')+"\" data-sort=\"type\">Types</button>","<button class=\"sortcol abilitysortcol"+(sortCol==='ability'?' cur':'')+"\" data-sort=\"ability\">Abilities</button>","<button class=\"sortcol statsortcol"+(sortCol==='hp'?' cur':'')+"\" data-sort=\"hp\">HP</button>","<button class=\"sortcol statsortcol"+(sortCol==='atk'?' cur':'')+"\" data-sort=\"atk\">Atk</button>","<button class=\"sortcol statsortcol"+(sortCol==='def'?' cur':'')+"\" data-sort=\"def\">Def</button>","<button class=\"sortcol statsortcol"+(sortCol==='spa'?' cur':'')+"\" data-sort=\"spa\">SpA</button>","<button class=\"sortcol statsortcol"+(sortCol==='spd'?' cur':'')+"\" data-sort=\"spd\">SpD</button>","<button class=\"sortcol statsortcol"+(sortCol==='spe'?' cur':'')+"\" data-sort=\"spe\">Spe</button>","<button class=\"sortcol statsortcol"+(sortCol==='bst'?' cur':'')+"\" data-sort=\"bst\">BST</button>","</div></li>"].join('');};_proto.renderMoveSortRowHTML=function renderMoveSortRowHTML(index){var sortCol=this.props.search.sortCol;return"<li class=\"result\" value=\""+index+"\"><div class=\"sortrow\">"+("<button class=\"sortcol movenamesortcol"+(sortCol==='name'?' cur':'')+"\" data-sort=\"name\">Name</button>")+("<button class=\"sortcol movetypesortcol"+(sortCol==='type'?' cur':'')+"\" data-sort=\"type\">Type</button>")+("<button class=\"sortcol movetypesortcol"+(sortCol==='category'?' cur':'')+"\" data-sort=\"category\">Cat</button>")+("<button class=\"sortcol powersortcol"+(sortCol==='power'?' cur':'')+"\" data-sort=\"power\">Pow</button>")+("<button class=\"sortcol accuracysortcol"+(sortCol==='accuracy'?' cur':'')+"\" data-sort=\"accuracy\">Acc</button>")+("<button class=\"sortcol ppsortcol"+(sortCol==='pp'?' cur':'')+"\" data-sort=\"pp\">PP</button>")+"</div></li>";};_proto.renderPokemonRowHTML=function renderPokemonRowHTML(index,id,matchStart,matchEnd,errorMessage){var search=this.props.search;var pokemon=search.dex.species.get(id);if(!pokemon)return"<li class=\"result\" value=\""+index+"\">Unrecognized pokemon</li>";var tagStart=pokemon.forme?pokemon.name.length-pokemon.forme.length-1:0;var stats=pokemon.baseStats;var bst=0;for(var _i2=0,_Object$values2=Object.values(stats);_i2<_Object$values2.length;_i2++){var stat=_Object$values2[_i2];bst+=stat;}if(search.dex.gen<2)bst-=stats['spd'];var buf="<li class=\"result\" value=\""+index+"\"><a href=\""+this.URL_ROOT+"pokemon/"+id+"\" "+("class=\""+(id===this.speciesId?'cur':'')+"\" data-target=\"push\" ")+("data-entry=\"pokemon|"+escapeHTML(pokemon.name)+"\">")+("<span class=\"col numcol\">"+escapeHTML(search.getTier(pokemon))+"</span>")+("<span class=\"col iconcol\"><span class=\"pixelated\" style=\""+escapeHTML(Dex.getPokemonIcon(pokemon.id))+"\"></span></span>")+("<span class=\"col pokemonnamecol\">"+this.renderNameHTML(pokemon.name,matchStart,matchEnd,tagStart)+"</span>");if(errorMessage)return""+buf+errorMessage+"</a></li>";buf+="<span class=\"col typecol\">"+pokemon.types.map(function(type){return"<img src=\""+Dex.resourcePrefix+"sprites/types/"+type+".png\" alt=\""+escapeHTML(type)+"\" height=\"14\" width=\"32\" class=\"pixelated\" />";}).join('')+"</span>";if(search.dex.gen>=3){buf+=pokemon.abilities['1']?"<span class=\"col twoabilitycol\">"+escapeHTML(pokemon.abilities['0'])+"<br />"+escapeHTML(pokemon.abilities['1'])+"</span>":"<span class=\"col abilitycol\">"+escapeHTML(pokemon.abilities['0'])+"</span>";}if(search.dex.gen>=5){if(pokemon.abilities['S']){buf+="<span class=\"col twoabilitycol"+(pokemon.unreleasedHidden?' unreleasedhacol':'')+"\">"+(escapeHTML(pokemon.abilities['H']||'')+"<br />"+escapeHTML(pokemon.abilities['S'])+"</span>");}else if(pokemon.abilities['H']){buf+="<span class=\"col abilitycol"+(pokemon.unreleasedHidden?' unreleasedhacol':'')+"\">"+(escapeHTML(pokemon.abilities['H'])+"</span>");}else{buf+="<span class=\"col abilitycol\"></span>";}}buf+="<span class=\"col statcol\"><em>HP</em><br />"+stats.hp+"</span>"+("<span class=\"col statcol\"><em>Atk</em><br />"+stats.atk+"</span>")+("<span class=\"col statcol\"><em>Def</em><br />"+stats.def+"</span>")+(search.dex.gen>=2?"<span class=\"col statcol\"><em>SpA</em><br />"+stats.spa+"</span>"+("<span class=\"col statcol\"><em>SpD</em><br />"+stats.spd+"</span>"):"<span class=\"col statcol\"><em>Spc</em><br />"+stats.spa+"</span>")+("<span class=\"col statcol\"><em>Spe</em><br />"+stats.spe+"</span>")+("<span class=\"col bstcol\"><em>BST<br />"+bst+"</em></span></a></li>");return buf;};_proto.renderNameHTML=function renderNameHTML(name,matchStart,matchEnd,tagStart){if(name==='No Ability')return"<i>(no ability)</i>";if(!matchEnd){if(!tagStart)return escapeHTML(name);return escapeHTML(name.slice(0,tagStart))+"<small>"+escapeHTML(name.slice(tagStart))+"</small>";}var output=escapeHTML(name.slice(0,matchStart))+("<b>"+escapeHTML(name.slice(matchStart,matchEnd))+"</b>")+escapeHTML(name.slice(matchEnd,tagStart||name.length));if(!tagStart)return output;if(matchEnd&&matchEnd>tagStart){output+="<small>"+escapeHTML(name.slice(matchEnd))+"</small>";}else{output+="<small>"+escapeHTML(name.slice(tagStart))+"</small>";}return output;};_proto.renderItemRowHTML=function renderItemRowHTML(index,id,matchStart,matchEnd,errorMessage){var search=this.props.search;var item=search.dex.items.get(id);if(!item)return"<li class=\"result\" value=\""+index+"\">Unrecognized item</li>";return"<li class=\"result\" value=\""+index+"\"><a href=\""+this.URL_ROOT+"items/"+id+"\" "+("class=\""+(id===this.itemId?'cur':'')+"\" data-target=\"push\" data-entry=\"item|"+escapeHTML(item.name)+"\">")+("<span class=\"col itemiconcol\"><span class=\"pixelated\" style=\""+escapeHTML(Dex.getItemIcon(item))+"\"></span></span>")+("<span class=\"col namecol\">"+(id?this.renderNameHTML(item.name,matchStart,matchEnd):'<i>(no item)</i>')+"</span>")+(id?errorMessage||'':'')+(!errorMessage?"<span class=\"col itemdesccol\">"+escapeHTML(item.shortDesc)+"</span>":'')+"</a></li>";};_proto.renderAbilityRowHTML=function renderAbilityRowHTML(index,id,matchStart,matchEnd,errorMessage){var search=this.props.search;var ability=search.dex.abilities.get(id);if(!ability)return"<li class=\"result\" value=\""+index+"\">Unrecognized ability</li>";return"<li class=\"result\" value=\""+index+"\"><a href=\""+this.URL_ROOT+"abilities/"+id+"\" "+("class=\""+(id===this.abilityId?'cur':'')+"\" data-target=\"push\" data-entry=\"ability|"+escapeHTML(ability.name)+"\">")+("<span class=\"col namecol\">"+(id?this.renderNameHTML(ability.name,matchStart,matchEnd):'<i>(no ability)</i>')+"</span>")+(errorMessage||'')+(!errorMessage?"<span class=\"col abilitydesccol\">"+escapeHTML(ability.shortDesc)+"</span>":'')+"</a></li>";};_proto.renderMoveRowHTML=function renderMoveRowHTML(index,id,matchStart,matchEnd,errorMessage){var slot=null;if(id.startsWith('_')){var _ref=id.slice(1).split('_');slot=_ref[0];id=_ref[1];if(!id){return"<li class=\"result\" value=\""+index+"\"><a href=\""+this.URL_ROOT+"moves/\" class=\"cur\" "+("data-target=\"push\" data-entry=\"move||"+escapeHTML(slot)+"\">")+("<span class=\"col movenamecol\"><i>(slot "+escapeHTML(slot)+" empty)</i></span></a></li>");}}var search=this.props.search;var move=search.dex.moves.get(id);if(!move)return"<li class=\"result\" value=\""+index+"\">Unrecognized move</li>";var entry=slot?"move|"+move.name+"|"+slot:"move|"+move.name;var tagStart=move.name.startsWith('Hidden Power')?12:0;var buf="<li class=\"result\" value=\""+index+"\"><a href=\""+this.URL_ROOT+"moves/"+id+"\" "+("class=\""+(this.moveIds.includes(id)?'cur':'')+"\" data-target=\"push\" data-entry=\""+escapeHTML(entry)+"\">")+("<span class=\"col movenamecol\">"+this.renderNameHTML(move.name,matchStart,matchEnd,tagStart)+"</span>");if(errorMessage)return""+buf+errorMessage+"</a></li>";var pp=move.pp===1||move.noPPBoosts?move.pp:move.pp*8/5;if(search.dex.gen<3)pp=Math.min(61,pp);if(search.dex.modid==='champions'){pp=move.pp>20?20:move.pp;if(!move.noPPBoosts)pp=(pp/5+1)*4;}buf+="<span class=\"col typecol\">"+("<img src=\""+Dex.resourcePrefix+"sprites/types/"+encodeURIComponent(move.type)+".png\" ")+("alt=\""+escapeHTML(move.type)+"\" height=\"14\" width=\"32\" class=\"pixelated\" />")+("<img src=\""+Dex.resourcePrefix+"sprites/categories/"+escapeHTML(move.category)+".png\" ")+("alt=\""+escapeHTML(move.category)+"\" height=\"14\" width=\"32\" class=\"pixelated\" />")+"</span>"+("<span class=\"col labelcol\">"+(move.category!=='Status'?"<em>Power</em><br />"+(move.basePower||'&mdash;'):'')+"</span>")+"<span class=\"col widelabelcol\"><em>Accuracy</em><br />"+((move.accuracy&&move.accuracy!==true?move.accuracy+"%":'&mdash;')+"</span>")+("<span class=\"col pplabelcol\"><em>PP</em><br />"+pp+"</span>")+("<span class=\"col movedesccol\">"+escapeHTML(move.shortDesc)+"</span></a></li>");return buf;};_proto.renderTypeRowHTML=function renderTypeRowHTML(index,id,matchStart,matchEnd,errorMessage){var name=id.charAt(0).toUpperCase()+id.slice(1);return"<li class=\"result\" value=\""+index+"\"><a href=\""+this.URL_ROOT+"types/"+id+"\" "+("data-target=\"push\" data-entry=\"type|"+escapeHTML(name)+"\">")+("<span class=\"col namecol\">"+this.renderNameHTML(name,matchStart,matchEnd)+"</span>")+("<span class=\"col typecol\"><img src=\""+Dex.resourcePrefix+"sprites/types/"+encodeURIComponent(name)+".png\" ")+("alt=\""+escapeHTML(name)+"\" height=\"14\" width=\"32\" class=\"pixelated\" /></span>")+(errorMessage||'')+"</a></li>";};_proto.renderCategoryRowHTML=function renderCategoryRowHTML(index,id,matchStart,matchEnd,errorMessage){var name=id.charAt(0).toUpperCase()+id.slice(1);return"<li class=\"result\" value=\""+index+"\"><a href=\""+this.URL_ROOT+"categories/"+id+"\" "+("data-target=\"push\" data-entry=\"category|"+escapeHTML(name)+"\">")+("<span class=\"col namecol\">"+this.renderNameHTML(name,matchStart,matchEnd)+"</span>")+("<span class=\"col typecol\"><img src=\""+Dex.resourcePrefix+"sprites/categories/"+escapeHTML(name)+".png\" ")+("alt=\""+escapeHTML(name)+"\" height=\"14\" width=\"32\" class=\"pixelated\" /></span>")+(errorMessage||'')+"</a></li>";};_proto.renderArticleRowHTML=function renderArticleRowHTML(index,id,matchStart,matchEnd,errorMessage){var _window$BattleArticle;var isSearchType=id==='pokemon'||id==='moves';var name=((_window$BattleArticle=window.BattleArticleTitles)==null?void 0:_window$BattleArticle[id])||id.charAt(0).toUpperCase()+id.substr(1);return"<li class=\"result\" value=\""+index+"\"><a href=\""+this.URL_ROOT+"articles/"+id+"\" "+("data-target=\"push\" data-entry=\"article|"+escapeHTML(name)+"\">")+("<span class=\"col namecol\">"+this.renderNameHTML(name,matchStart,matchEnd)+"</span>")+("<span class=\"col movedesccol\">"+(isSearchType?"(search type)":"(article)")+"</span>")+(errorMessage||'')+"</a></li>";};_proto.renderEggGroupRowHTML=function renderEggGroupRowHTML(index,id,matchStart,matchEnd,errorMessage){var name;if(id==='humanlike')name='Human-Like';else if(id==='water1')name='Water 1';else if(id==='water2')name='Water 2';else if(id==='water3')name='Water 3';if(name){if(matchEnd>5)matchEnd++;}else{name=id.charAt(0).toUpperCase()+id.slice(1);}return"<li class=\"result\" value=\""+index+"\"><a href=\""+this.URL_ROOT+"egggroups/"+id+"\" "+("data-target=\"push\" data-entry=\"egggroup|"+escapeHTML(name)+"\">")+("<span class=\"col namecol\">"+this.renderNameHTML(name,matchStart,matchEnd)+"</span>")+"<span class=\"col movedesccol\">(egg group)</span>"+(errorMessage||'')+"</a></li>";};_proto.renderTierRowHTML=function renderTierRowHTML(index,id,matchStart,matchEnd,errorMessage){var tierTable={uber:"Uber",caplc:"CAP LC",capnfe:"CAP NFE"};var name=tierTable[id]||id.toUpperCase();return"<li class=\"result\" value=\""+index+"\"><a href=\""+this.URL_ROOT+"tiers/"+id+"\" "+("data-target=\"push\" data-entry=\"tier|"+escapeHTML(name)+"\">")+("<span class=\"col namecol\">"+this.renderNameHTML(name,matchStart,matchEnd)+"</span>")+"<span class=\"col movedesccol\">(tier)</span>"+(errorMessage||'')+"</a></li>";};_proto.renderRowHTML=function renderRowHTML(row,index){var search=this.props.search;var type=row[0],id=row[1];var matchStart=0;var matchEnd=0;if(row.length>3){matchStart=row[2];matchEnd=row[3];}var errorMessage='';var label;if(label=search.filterLabel(type)){errorMessage="<span class=\"col filtercol\"><em>"+escapeHTML(label)+"</em></span>";}else if(label=search.illegalLabel(id)){errorMessage="<span class=\"col illegalcol\"><em>"+escapeHTML(label)+"</em></span>";}switch(type){case'html':var sanitizedHTML=escapeHTML(id).replace(/&lt;em&gt;/g,'<em>').replace(/&lt;\/em&gt;/g,'</em>').replace(/&lt;strong&gt;/g,'<strong>').replace(/&lt;\/strong&gt;/g,'</strong>');return"<li class=\"result\" value=\""+index+"\"><p>"+sanitizedHTML+"</p></li>";case'header':return"<li class=\"result\" value=\""+index+"\"><h3>"+escapeHTML(id)+"</h3></li>";case'sortpokemon':return this.renderPokemonSortRowHTML(index);case'sortmove':return this.renderMoveSortRowHTML(index);case'pokemon':return this.renderPokemonRowHTML(index,id,matchStart,matchEnd,errorMessage);case'move':return this.renderMoveRowHTML(index,id,matchStart,matchEnd,errorMessage);case'item':return this.renderItemRowHTML(index,id,matchStart,matchEnd,errorMessage);case'ability':return this.renderAbilityRowHTML(index,id,matchStart,matchEnd,errorMessage);case'type':return this.renderTypeRowHTML(index,id,matchStart,matchEnd,errorMessage);case'egggroup':return this.renderEggGroupRowHTML(index,id,matchStart,matchEnd,errorMessage);case'tier':return this.renderTierRowHTML(index,id,matchStart,matchEnd,errorMessage);case'category':return this.renderCategoryRowHTML(index,id,matchStart,matchEnd,errorMessage);case'article':return this.renderArticleRowHTML(index,id,matchStart,matchEnd,errorMessage);}return"<li>Error: not found</li>";};PSSearchResults.renderFilters=function renderFilters(search,showHints){return search.filters&&preact.h("li",{"class":"dexlist-filters"},showHints&&"Filters: ",search.filters.map(function(_ref2){var type=_ref2[0],name=_ref2[1];return preact.h("button",{"class":"filter","data-filter":type+":"+name},name," ",preact.h("i",{"class":"fa fa-times-circle","aria-hidden":true}));}),!search.query&&showHints&&preact.h("small",{style:"color: #888"},"(backspace = delete filter)"));};PSSearchResults.renderFiltersHTML=function renderFiltersHTML(search,showHints){if(!search.filters)return'';return"<li class=\"dexlist-filters\">"+(showHints?"Filters: ":"")+search.filters.map(function(_ref3){var type=_ref3[0],name=_ref3[1];return"<button class=\"filter\" data-filter=\""+escapeHTML(type)+":"+escapeHTML(name)+"\">"+(escapeHTML(name)+" <i class=\"fa fa-times-circle\" aria-hidden></i></button>");}).join('')+(!search.query&&showHints?"<small style=\"color: #888\">(backspace = delete filter)</small>":"")+"</li>";};_proto.renderPagerHTML=function renderPagerHTML(direction){var label=direction<0?'Show previous search results':'Show next search results';return"<li class=\"result resultpage\"><button class=\"button\" data-page=\""+direction+"\">"+label+"</button></li>";};_proto.
