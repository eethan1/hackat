console.log('Conetneqt Sckqpt');

browser.runtime.onMessage.addListener(handleMessage);




function handleMessage(request, sender, sendResponse) {
    console.log('content listen');
    switch(request.msg) {
        case 'retrieveForm':
            let formlist = document.querySelectorAll('form');
            let formEntries = [];
            formlist.forEach((e) => {
                let attr = e.attributes;
                let inputs = e.getElementsByTagName('input'); 
                let formStr = '';
                let ATTRS = ['id','action','method','name'];
                ATTRS.forEach(e=>{
                    formStr += `${attr[e]?e+'='+attr[e].value:''} ` 
                });
                formStr = '<form ' + formStr + '>' 
                let inputStr = [];
                for(ee of inputs) {
                    inputStr.push(`${ee.name}=${encodeURIComponent(ee.value)}`); 
                }
                inputStr = inputStr.join('&');
                formEntries.push({
                    formStr: formStr,
                    inputStr: inputStr,
                    action: e.action,
                    method: e.method
                });
            });
            return Promise.resolve({
                tabId: request.tabId,
                msg: 'responseRetrieveForm',
                data:formEntries
            });
        default:
            break
    }
}