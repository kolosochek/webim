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
var defaultQASearchAnchor = '!найти';
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
  var qa_search_regexp = new RegExp(defaultQASearchAnchor+" [а-яА-Я ]*!");
  if (this.value.search(qa_search_regexp)+1){
    var query = this.value.replace(defaultQASearchAnchor, '');
    query = query.substring(0, query.length-1);
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
            //console.log(response.responseText);
            // backup var regexp = new RegExp('<div class="q-line"><a class="q-title" style="" href="[a-zA-Z0-9-\/ ]*">', 'g');//</a><br>', 'g');
            var regexp = new RegExp('<div class="q-line"><a class="q-title" style="" href="[a-zA-Z0-9-\/ ]*">[а-яА-Я ?]*</a>', 'g');//</a><br>', 'g');
            //console.log(response.responseText.match(regexp));
            //console.log(response.responseText);
            var container = "";
            var links_arr = response.responseText.match(regexp);
            for(i=0;i<links_arr.length;i++){
                var data = links_arr[i].replace('<div class="q-line"><a class="q-title" style="" href="', '<a class="q-title" href="https://qa.mchost.ru');
                container+= data;//links_arr[i];            
            }
            // debug
            console.log(container);
            var autocomplete_wrapper = document.getElementById("autocomplete_wrapper");
            console.log(autocomplete_wrapper);
            autocomplete_wrapper.appendChild(container);
        }
    });
  }
});


