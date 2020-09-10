var loadBtn = document.querySelector('#loadBtn');
var splitBtn = document.querySelector('#splitBtn');
var executeBtn = document.querySelector('#executeBtn');
var urlArea = document.querySelector('#urlArea');
var enablePostBtn = document.querySelector('#enablePostBtn');
var showFormsBtn = document.querySelector('#showFormsBtn');
var postDataArea = document.querySelector('#postDataArea');
var formListDiv = document.querySelector('#formListDiv');
var DEFALUT_SETTING = {
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
        'user-agent': 'Hackat Mozilla/5.0',
        'content-type': 'application/x-www-form-urlencoded'
    },
    method: 'GET',
    mode: 'cors',
    redirect: 'manual',
    referrer: 'no-referrer'
}

loadBtn.addEventListener('click', e => {
    browser.runtime.sendMessage({
        tabId: browser.devtools.inspectedWindow.tabId,
        msg:'loadUrl',
    }, function(response) {
        console.log(response);
        setPostData(response.postData);
        setURL(response.url);
    });
});

executeBtn.addEventListener('click', e => {
    let url = urlArea.value.trim();
    let method = enablePostBtn.checked?'POST':'GET';

    switch(method) {
        case 'GET':
            executeGet(url);
            break;
        case 'POST':
            executePost(url, postDataArea.value);            
            break;  
    }
});    




function exec(code) {
    browser.devtools.inspectedWindow.eval(code);
}



function postDataStr2Obj(str) {
    let fields = str.split('&');
    let obj = {};
    for(e of fields) {
        let i = e.search('=');
        if(i != -1) {
            let name = e.substr(0,i), value = e.substr(i+1);
            obj[name] = value;
        }
    }
    return obj;
}

function executeGet(url) {
    let uri = new URL(url);
    code = `
        let url = '${encodeURIComponent(url)}';
        window.location.href = decodeURIComponent(url);
        ${uri.hash !== ''?'window.location.reload(true);':''} 
    `;
    console.log(code);
    exec(code);
}
function executePost(url, data, headers) {
    let formObjStr = encodeURIComponent(JSON.stringify(postDataStr2Obj(data)));
    let encodedUrl = encodeURIComponent(url);
    let code = `
    var hackat_fields = JSON.parse(decodeURIComponent("${formObjStr}"));
    var hackat_url = decodeURIComponent("${encodedUrl}");
    var hackat_form = document.createElement("form");
    hackat_form.setAttribute("method", "POST");
    hackat_form.setAttribute("action", hackat_url);
    for(const [k,v] of Object.entries(hackat_fields)) {
        let input = document.createElement("input");
        input.setAttribute("name", k);
        input.setAttribute("value", decodeURIComponent(v));
        input.setAttribute("type", "hidden");
        hackat_form.appendChild(input);
    }
    document.body.appendChild(hackat_form);
    console.log(hackat_form);
    hackat_form.submit();
    `
    console.log(code);
    exec(code);
}

function setPostData(data) {
    postDataArea.value = data;
}

function setURL(url) {
    urlArea.value = url;
}



class FormListHandler{

    constructor(){
        this.formListEles = [];
        formListDiv.addEventListener('click',this.formListClickEventHandler);
    }
    select(id) {
        let i = parseInt(id.substr(11));     
        let e = this.formListEles[i];
        console.log(i);
        if(e.method === 'get') {
            enablePostBtn.checked = false;
            setURL(`${e.action}${e.inputStr?'?'+e.inputStr:''}`);
        }else if(e.method === 'post'){
            enablePostBtn.checked = true;
            setPostData(e.inputStr);
            setURL(e.action);
        }

    }
    formListClickEventHandler(e) {
        let id = e.target.id;
        if(typeof id  === 'string' && id.search('formListEle') == 0) {
            formListHandler.select(id);
        }
        console.log(e.target.id);
    }
    makeresponseRetrieveFormHandler(instance) {
        return ()=>{}
    }
    responseRetrieveFormHandler(response){
        console.log('hack-panel', response);
        console.log(formListHandler);
        this.formListEles = [];
        let formListHTML = '';
        for(let i in response.data) {
            let e = response.data[i];
            let tmpformstr = e.formStr.replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
                return '&#' + i.charCodeAt(0) + ';';
              });
            formListHTML += `
        <div class="row">
            <button id="formListEle${i}" type="button" class=""btn btn-light" >
                load
            </button>
            <label>
                ${tmpformstr}
            </label>
            </div>
        </div>            
            `
            this.formListEles.push(e);
        }
       formListDiv.innerHTML = formListHTML;
       console.log(this.formListEles);
    }
}

var formListHandler = new FormListHandler();

if(showFormsBtn.checked){
    console.log('Send retrieveForm');
    browser.runtime.sendMessage({
        tabId: browser.devtools.inspectedWindow.tabId,
        msg: 'retrieveForm'
        }
    ).then(response=>{
        console.log(response);
        formListHandler.responseRetrieveFormHandler(response); 
    });
}
showFormsBtn.addEventListener('click', e => {
    if(showFormsBtn.checked){
        console.log('Send retrieveForm');
        browser.runtime.sendMessage({
            tabId: browser.devtools.inspectedWindow.tabId,
            msg: 'retrieveForm'
            }
        ).then(response=>{
            console.log(response);
            formListHandler.responseRetrieveFormHandler(response); 
        });
    }
});