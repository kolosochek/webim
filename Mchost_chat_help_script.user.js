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

var textarea = document.getElementById("msgwnd");
var defaultExtension = 'jpg';
var defaultQASearchAnchor = '!найди';
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
  // TODO: wrong query picking f.e. ишак!найди кишлак!ишак
  var qa_search_regexp = new RegExp(defaultQASearchAnchor+" [а-яА-Яa-zA-Z0-9 ]*!");
  if (this.value.search(qa_search_regexp)+1){
    var query = this.value.match(qa_search_regexp)[0];
    query = query.replace(defaultQASearchAnchor, '').replace('!', '');
    //debug
    console.log(query);
    GM_xmlhttpRequest({
        method:     "POST",
        url:        "https://qa.mchost.ru/pantera/"+query,
        data:       "",
        headers:    {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        onload: function (response) {
            var regexp = new RegExp('<div class="q-line"><a class="q-title" style="" href="[a-zA-Z0-9-\/ ]*">[а-яА-Я ?]*</a>', 'g');//</a><br>', 'g');
            var content = "";
            var links_arr = response.responseText.match(regexp);
            for(i=0;i<links_arr.length;i++){
                var data = links_arr[i].replace('<div class="q-line"><a class="q-title" style="" href="', '<a class="q-title" href="https://qa.mchost.ru');
                data = data.replace("q-title", "b-link");
                content+= data;//links_arr[i];            
            }
            // debug
            //console.log(content);
            if(content){
				toggle_modal_window(content);
			} else {
				console.log('Found nothing');
			}
        }
    });
  }
});
function create_modal_window(content){
	var modal_window_wrapper = document.createElement("div");
	modal_window_wrapper.id = "modal_window_wrapper";
	var raw_html = '<div class="b-modal-wrapper" id="modal_wrapper"><div id="modal_window_background" class="b-modal-window-background"></div><div id="modal_window" class="b-modal-window"><a id="close_button" class="action__close" href="javascript:void(0)">X</a>'+
	content+
	'</div></div>'+
	'<style>#modal_window_wrapper {position:absolute; width: 100%; height: 100%;} .b-modal-wrapper {height: 100%; width: 100%;} #modal-wrapper {position:relative; height: 100%;} .b-modal-window-background {position:absolute; height: 100%; width: 100%; z-index: 10;  background: #000000; opacity: .2} .b-modal-window {position:absolute; z-index: 100; background:#FFF; border-radius: 8px; padding: 100px; margin: 50px auto} .b-modal-window a.b-link {display:block; text-decoration:none; margin: 10px 0;} .b-modal {} #close_button {text-decoration:none; position: absolute; right: 20px; top: 20px;}</style>';
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
		// debug
		//console.log('button_close_click!');
		hide_modal_window();
	});
}
function show_modal_window(content){
	var modal_window = document.querySelector('#modal_window_wrapper');
	modal_window.style.display = "block";
}
function hide_modal_window(){
	var modal_window = document.querySelector('#modal_window_wrapper');
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

