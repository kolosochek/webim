// ==UserScript==
// @name        Mchost chat help script
// @namespace   https://im.mchost.ru
// @description This script provides additional functionality to ascetic-style MCHOST WEBIM chat. The script enables following features: autocomplete and even more. Enjoy!
// @include		https://im.mchost.ru/webim/operator/agent.php*
// @version     1
// @grant GM_xmlhttpRequest
// ==/UserScript==

// begin
// inject custom scripts to page
// taht shit is necessary coz greasemonkey @grant GM_ function breaks global scope
// GM_xmlhttpRequest required for doing cross-domain ajax requests, which are, by the way, prohibited.
// that's a dirty hack and MUST be refactored
var script = document.createElement('script');
script.src = "https://raw.githubusercontent.com/kolosochek/webim/master/complete.js";
script.type = "text/javascript"
document.body.appendChild(script);

// extend base classes
Element.prototype.remove = function() {
    this.parentElement.removeChild(this);
}
NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
    for(var i = this.length - 1; i >= 0; i--) {
        if(this[i] && this[i].parentElement) {
            this[i].parentElement.removeChild(this[i]);
        }
    }
}

var textarea = document.getElementById("msgwnd");
var defaultExtension = 'jpg';
var defaultQASearchAnchor = '!найди';
var defaultMchelpSearchAnchor = "!помощь";
var defaultWhoisSearchAnchor = "!whois";
// type text in textarea
textarea.addEventListener('input', function(){
  // autocomplete feature(.jpg by default) for joxi screenshots
  var pattern = "http://joxi.ru/";
  var hash = 14;
  var extension = ".jpg";
  var whitespace = ' ';
  var joxiRegexp = new RegExp("http://joxi.ru/[a-zA-Z0-9]{14}", "g");
  var joxiRegexpWithExtension = new RegExp("http://joxi.ru/[a-zA-Z0-9.]{17}", "g")
  // joxi
  if ((this.value.search(joxiRegexp)+1) && !(this.value.search(joxiRegexpWithExtension)+1)){
    var patternIndex = this.value.indexOf(pattern)+pattern.length + hash
    var stringBegining = this.value.substring(0, patternIndex);
    var stringEnding = this.value.substring(patternIndex);
    this.value = stringBegining + extension + stringEnding + whitespace;
  }
  // qa search
  var qa_search_regexp = new RegExp(defaultQASearchAnchor+" [а-яА-Яa-zA-Z0-9 ]*!");
  if (this.value.search(qa_search_regexp)+1){
    var query = this.value.match(qa_search_regexp)[0];
    query = query.replace(defaultQASearchAnchor, '').replace('!', '').trim();
    //debug
    //console.log(query);
    GM_xmlhttpRequest({
        method:     "GET",
        url:        "https://qa.mchost.ru/pantera/"+query,
        data:       "",
        headers:    {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        onload: function (response) {
        	// debug
        	//console.log(response.responseText);
            var qa_links_regexp = new RegExp('<div class="q-line"><a class="q-title" style="" href="[a-zA-Z0-9-\/ ]*">[а-яА-Я ?]*</a>', 'g');//</a><br>', 'g');
            var content = '';
            var links_arr = response.responseText.match(qa_links_regexp);
			if (links_arr == null) {
				console.log('Found nothing');
				textarea.value = defaultQASearchAnchor + ' ';
			} else {
	            if (links_arr.length){
		            for(i=0;i<links_arr.length;i++){
		                var data = links_arr[i].replace('<div class="q-line"><a class="q-title" style="" href="', '<a class="q-title" href="https://qa.mchost.ru');
		                data = data.replace("q-title", "b-link");
		                content+= data;//links_arr[i];            
		            } 
		            if(content.length){
						toggle_modal_window(content);
					} else {
						console.log('Found nothing');
						var content = '<p>Found nothing</p>';
	        			toggle_modal_window(content);
					}
				} 
			}
        },
        ontimeout: function(){
        	console.log('Timeout');
        	var content = "<p>Timeout</p>";
        	toggle_modal_window(content);
        },
        // request timeout, 4s for best perfomance
        timeout: 4000,
    });
  }
  /*
  // mchost help search
  var mc_search_regexp = new RegExp(defaultMchelpSearchAnchor+" [а-яА-Яa-zA-Z0-9 ]*!");
  if (this.value.search(mc_search_regexp)+1){
    var query = this.value.match(mc_search_regexp)[0];
    query = query.replace(defaultMchelpSearchAnchor, '').replace('!', '').trim();
    //debug
    console.log('query:');
    console.log(query);
    GM_xmlhttpRequest({
        method:     "GET",
        url:        "http://mchost.ru/search/index.php?bxajaxid=b3d99dd29e4e0053b568d46975f24860&AJAX_CALL=Y&spell=1&q=" + encodeURIComponent(query),//"http://mchost.ru/search/index.php?spell=1&q="+encodeURIComponent(query),
        data:       "",
        headers:    {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        onload: function (response) {
        	// debug
        	console.log('response text:');
        	console.log(response.responseText);
        	// new RegExp('<a href="\/help\/[a-zA-Z0-9-\/ _#=?]*">[a-zA-Zа-яА-Я0-9 _#?]*</a>', '');
            var mc_links_regexp = new RegExp('<p><a href="\/help\/[a-zA-Z0-9-\/ _#=?]*">[a-zA-Zа-яА-Я0-9 _#?]*</a>', '');//</a>', 'g');//</a><br>', 'g');
            var content = '';
            var links_arr = response.responseText.match(mc_links_regexp);
            //debug
            console.log('links array:');
			console.log(links_arr);
			//console.log(links_arr == null);
			//console.log(flag);
			if (links_arr == null) {
				console.log('Found nothing');
				textarea.value = defaultMchelpSearchAnchor + ' ';
				//var content = "<p>Found nothing</p>";
	        	//toggle_modal_window(content);
			} else {
	            if (links_arr.length){
		            for(i=0;i<links_arr.length;i++){
		                var data = links_arr[i].replace('<div class="q-line"><a class="q-title" style="" href="', '<a class="q-title" href="https://qa.mchost.ru');
		                data = data.replace("q-title", "b-link");
		                content+= data;//links_arr[i];            
		            } 
		            // debug
		            //console.log(content);
		            //console.log(content == true);
		            if(content.length){
						toggle_modal_window(content);
					} else {
						console.log('Found nothing');
						var content = '<p>Found nothing</p>';
	        			toggle_modal_window(content);
					}
				} 
			}
        },
        ontimeout: function(){
        	console.log('Timeout');
        	var content = "<p>Timeout</p>";
        	toggle_modal_window(content);
        },
        // request timeout, 4s for best perfomance
        timeout: 4000,
    });
  }*/
  // whois
  var whois_search_regexp = new RegExp(defaultWhoisSearchAnchor+" [а-яА-Яa-zA-Z0-9 .]*!");
  if (this.value.search(whois_search_regexp)+1){
    var query = this.value.match(whois_search_regexp)[0];
    query = query.replace(defaultWhoisSearchAnchor, '').replace('!', '').trim();
    //debug
    console.log('query:');
    console.log(query);
    GM_xmlhttpRequest({
        method:     "GET",
        url:        "http://api.domaintools.com/v1/domaintools.com/whois/" + encodeURIComponent(query),
        data:       "",
        headers:    {
            "Content-Type": "application/json"
        },
        onload: function (response) {
        	// debug
        	//console.log('response text:');
        	//console.log(response.responseText);
        	var jsonWhois = JSON.parse(response.responseText);
            var content = '';
            var separator = "\n";
            var ns = jsonWhois.response.name_servers;
            var registrant = jsonWhois.response.registrant;
            var registration = jsonWhois.response.registration;
            // debug
        	console.log(jsonWhois);
        	console.log(ns);
        	console.log(registrant);
        	console.log(registration);
        	//registrant
        	content+= "Registrar: " + registration['registrar'] + separator;
        	//created+expiries+updated
        	content+= "Created: " + registration['created'] + separator;
        	content+= "Expires: " + registration['expires'] + separator;
        	content+= "Updated: " + registration['updated'] + separator;
        	//ns 
        	for(i=0;i<ns.length;i++){
        		content+="NS: " + ns[i] + separator;
        	}
        	console.log(content);
        	textarea.value = content;
        	// new RegExp('<a href="\/help\/[a-zA-Z0-9-\/ _#=?]*">[a-zA-Zа-яА-Я0-9 _#?]*</a>', '');
            //var mc_links_regexp = new RegExp('<p><a href="\/help\/[a-zA-Z0-9-\/ _#=?]*">[a-zA-Zа-яА-Я0-9 _#?]*</a>', '');//</a>', 'g');//</a><br>', 'g');
            //var links_arr = response.responseText.match(mc_links_regexp);
            //debug
            //console.log('links array:');
			//console.log(links_arr);
			//console.log(links_arr == null);
			//console.log(flag);
			/*if (links_arr == null) {
				console.log('Found nothing');
				textarea.value = defaultMchelpSearchAnchor + ' ';
				//var content = "<p>Found nothing</p>";
	        	//toggle_modal_window(content);
			} else {
	            if (links_arr.length){
		            for(i=0;i<links_arr.length;i++){
		                var data = links_arr[i].replace('<div class="q-line"><a class="q-title" style="" href="', '<a class="q-title" href="https://qa.mchost.ru');
		                data = data.replace("q-title", "b-link");
		                content+= data;//links_arr[i];            
		            } 
		            // debug
		            //console.log(content);
		            //console.log(content == true);
		            if(content.length){
						toggle_modal_window(content);
					} else {
						console.log('Found nothing');
						var content = '<p>Found nothing</p>';
	        			toggle_modal_window(content);
					}
				} 
			}
			*/
        },
        ontimeout: function(){
        	console.log('Timeout');
        	var content = "<p>Timeout</p>";
        	toggle_modal_window(content);
        },
        // request timeout, 4s for best perfomance
        timeout: 4000,
    });
  }
});
function create_modal_window(content){
	var modal_window_wrapper = document.createElement("div");
	modal_window_wrapper.id = "modal_window_wrapper";
	var raw_html = '<div class="b-modal-wrapper" id="modal_wrapper"><div id="modal_window_background" class="b-modal-window-background"></div><div id="modal_window" class="b-modal-window"><a id="close_button" class="action__close" href="javascript:void(0)">X</a><div id="modal_window_content">'+
	content+
	'</div></div></div>'+
	'<style>#modal_window_wrapper {position:absolute; width: 100%; height: 100%;} .b-modal-wrapper {height: 100%; width: 100%;} #modal-wrapper {position:relative; height: 100%;} .b-modal-window-background {position:absolute; height: 100%; width: 100%; z-index: 10;  background: #000000; opacity: .2} .b-modal-window {position:absolute; z-index: 100; background:#FFF; border-radius: 8px; padding: 35px 20px; margin: 50px 0px 50px -220px; width: 400px; left: 50%} .b-modal-window a.b-link {display:block; text-decoration:none; margin: 10px 0;} .b-modal {} #close_button {text-decoration:none; position: absolute; right: 20px; top: 20px;}</style>';
	document.body.insertBefore(modal_window_wrapper, document.body.firstChild);
	modal_window_wrapper.innerHTML = raw_html;

	var links_node_list = document.querySelectorAll("#modal_window .b-link");
	// iterate trough each pasted link and add custom event listener
	if (links_node_list.length) {
		for(i=0;i<links_node_list.length;i++){
			links_node_list[i].addEventListener('click', function(event){
				// first of all we must prevent standard browser behavior
				event = event || window.event;
				event.preventDefault();
				event.defaultPrevented;
				// then just grab href attr and paste it to msgwnd
				// debug
				console.log(this);
				textarea.value = this.href;
				hide_modal_window();
				return false;
			});
		};
	}
	var close_button = document.getElementById("close_button");
	close_button.addEventListener('click', function(){
		hide_modal_window();
	});
	var modal_wrapper = document.getElementById("modal_window_background");
	modal_wrapper.addEventListener('click', function(){
		hide_modal_window();
	});
}
function show_modal_window(content){
	var modal_window = document.querySelector('#modal_window_wrapper');
	if (document.querySelectorAll('#modal_window_content').length){
		document.querySelector('#modal_window_content').innerHTML = content;
		var links_node_list = document.querySelectorAll("#modal_window .b-link");
		//console.log(links_node_list);
		// iterate trough each pasted link and add custom event listener
		if (links_node_list.length) {
			for(i=0;i<links_node_list.length;i++){
				links_node_list[i].addEventListener('click', function(event){
					// first of all we must prevent standard browser behavior
					event = event || window.event;
					event.preventDefault();
					event.defaultPrevented;
					// then just grab href attr and paste it to msgwnd
					// debug
					//console.log(this);
					textarea.value = this.href;
					hide_modal_window();
					return false;
				});
			};
		}
	}
	modal_window.style.display = "block";
}
function hide_modal_window(){
	var modal_window = document.querySelector('#modal_window_wrapper');
	if (document.querySelectorAll("#modal_window .b-link").length){
		var content = document.querySelectorAll("#modal_window .b-link");
		content.remove();
	}
	modal_window.style.display = "none";

}
function toggle_modal_window(content){
	if(document.querySelectorAll('#modal_window_wrapper').length){
		if(document.getElementById("modal_window_wrapper").style.display == "none"){
			show_modal_window(content);
		} else {
			hide_modal_window();
		}
	} else {
		create_modal_window(content);
	}
}

