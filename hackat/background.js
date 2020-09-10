console.log('asdf')


var PostDatas = {}
browser.webRequest.onBeforeRequest.addListener(
    setCurrentPostData,
    {urls:['<all_urls>'], types:['main_frame']},
    ['requestBody']
);

function setCurrentPostData(details){
    console.log('details', details);
    let postData = '';
    let formData = details.requestBody?.formData;
    let raw = details.requestBody.raw;
    if(formData) {
        for(let k in formData) {
            if(Array.isArray(formData[k])) {
                for(e in formData[k]){
                    postData += `${k}[]=${e}&`
                }
            }else{
                postData += `${k}=${e}&`
            }
        }
        PostDatas[details.tabId] = postData.slice(0,-1);
    }else if(raw){
        PostDatas[details.tabId] = raw;
    }else{
        PostDatas[details.tabId] = undefined;
    }
}





browser.runtime.onMessage.addListener(handleMessage);

function handleMessage(request, sender, sendResponse) {
    console.log('request', request);
    if(request.msg == 'retrieveForm' && browser.runtime.getURL('/theme/hackat-panel.html') == sender.url) {
        return  browser.tabs.sendMessage(
            request.tabId,
            request
        );
    }else if(request.msg == 'loadUrl' && browser.runtime.getURL('/theme/hackat-panel.html') == sender.url) {
        let url = '';
        browser.tabs.get(request.tabId, tab => {
            console.log(tab);
            url = tab.url;
            sendResponse({
                postData: PostDatas[request.tabId],
                url: url
            });
        });
        return true;
    }
}